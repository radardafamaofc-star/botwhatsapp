import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;

// Global client instance
let whatsappClient: Client | null = null;
const SESSION_ID = 'default-session';

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Ensure default session exists in DB
  let dbSession = await storage.getSession(SESSION_ID);
  if (!dbSession) {
    dbSession = await storage.createSession({ sessionId: SESSION_ID, status: 'disconnected' });
  } else {
    // Reset status on restart to avoid getting stuck in 'starting'
    await storage.updateSession(SESSION_ID, { status: 'disconnected', qrCode: null });
  }

  app.get(api.session.status.path, async (req, res) => {
    const session = await storage.getSession(SESSION_ID);
    res.json({
      status: session?.status || 'disconnected',
      qrCode: session?.qrCode
    });
  });

  app.post(api.session.connect.path, async (req, res) => {
    console.log("POST /api/session/connect received");
    
    if (whatsappClient) {
      const current = await storage.getSession(SESSION_ID);
      console.log("WhatsApp client already exists, current status:", current?.status);
      return res.json({ message: "Already connecting or connected." });
    }

    console.log("Initializing WhatsApp connection...");
    try {
      await storage.updateSession(SESSION_ID, { status: 'starting', qrCode: null });
      
      whatsappClient = new Client({
        authStrategy: new LocalAuth({ clientId: SESSION_ID }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-zygote',
            '--single-process'
          ],
          executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium-browser'
        }
      });

      const initTimeout = setTimeout(async () => {
        const currentSession = await storage.getSession(SESSION_ID);
        if (currentSession?.status === 'starting') {
           console.log("Initialization timed out after 45s, resetting status.");
           await storage.updateSession(SESSION_ID, { status: 'disconnected', qrCode: null });
           if (whatsappClient) {
             try { await whatsappClient.destroy(); } catch (e) {}
             whatsappClient = null;
           }
        }
      }, 45000);

      whatsappClient.on('qr', async (qr) => {
        clearTimeout(initTimeout);
        console.log('QR RECEIVED:', qr);
        try {
          await storage.updateSession(SESSION_ID, { status: 'qr_ready', qrCode: qr });
        } catch (err) {
          console.error('Error updating session with QR:', err);
        }
      });

      whatsappClient.on('ready', async () => {
        console.log('CLIENT IS READY');
        try {
          await storage.updateSession(SESSION_ID, { status: 'connected', qrCode: null });
        } catch (err) {
          console.error('Error updating session to connected:', err);
        }
      });

      whatsappClient.on('auth_failure', async (msg) => {
        console.error('AUTHENTICATION FAILURE', msg);
        await storage.updateSession(SESSION_ID, { status: 'disconnected', qrCode: null });
        whatsappClient = null;
      });

      whatsappClient.on('disconnected', async () => {
        console.log('CLIENT DISCONNECTED');
        await storage.updateSession(SESSION_ID, { status: 'disconnected', qrCode: null });
        whatsappClient = null;
      });

      whatsappClient.initialize().catch(async (err) => {
        console.error("Initialization error:", err);
        await storage.updateSession(SESSION_ID, { status: 'disconnected', qrCode: null });
        whatsappClient = null;
      });

      res.json({ message: "Initialization started." });
    } catch (err) {
      console.error("Connect route error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.session.disconnect.path, async (req, res) => {
    if (whatsappClient) {
      try {
        await whatsappClient.logout();
        await whatsappClient.destroy();
      } catch (err) {
        console.error("Logout error", err);
      }
      whatsappClient = null;
    }
    await storage.updateSession(SESSION_ID, { status: 'disconnected', qrCode: null });
    res.json({ message: "Disconnected." });
  });

  app.get(api.groups.list.path, async (req, res) => {
    if (!whatsappClient) {
      return res.status(500).json({ message: "WhatsApp client not connected." });
    }
    try {
      const chats = await whatsappClient.getChats();
      const groups = chats
        .filter(chat => chat.isGroup)
        .map(chat => ({
          id: chat.id._serialized,
          name: chat.name
        }));
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch groups." });
    }
  });

  app.post(api.groups.moveMembers.path, async (req, res) => {
    try {
      const parsed = api.groups.moveMembers.input.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid payload." });
      }
      const { sourceGroupId, targetGroupId } = parsed.data;
      
      if (!whatsappClient) {
        return res.status(500).json({ message: "WhatsApp client not connected." });
      }

      const sourceChat = await whatsappClient.getChatById(sourceGroupId) as any;
      const targetChat = await whatsappClient.getChatById(targetGroupId) as any;

      if (!sourceChat || !sourceChat.isGroup) {
        return res.status(400).json({ message: "Invalid source group." });
      }
      if (!targetChat || !targetChat.isGroup) {
        return res.status(400).json({ message: "Invalid target group." });
      }

      const sourceParticipants = sourceChat.participants;
      const targetParticipants = targetChat.participants;

      const targetMemberIds = new Set(targetParticipants.map((p: any) => p.id._serialized));
      const membersToAdd = sourceParticipants
        .filter((p: any) => !targetMemberIds.has(p.id._serialized))
        .map((p: any) => p.id._serialized);

      if (membersToAdd.length === 0) {
        return res.json({ message: "No new members to add.", added: 0, failed: 0, details: [] });
      }

      const response = await targetChat.addParticipants(membersToAdd);
      
      let added = 0;
      let failed = 0;
      let details: string[] = [];
      
      if (response && typeof response === 'object') {
        for (const [id, result] of Object.entries(response)) {
          if (result === 200) {
            added++;
          } else {
            failed++;
            details.push(`Failed to add ${id}: Error code ${result}`);
          }
        }
      } else {
        added = membersToAdd.length;
      }

      res.json({
        message: `Processed member transfer.`,
        added,
        failed,
        details
      });
    } catch (error: any) {
      console.error("Error moving members:", error);
      res.status(500).json({ message: error?.message || "Internal error during move." });
    }
  });

  return httpServer;
}

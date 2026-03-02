import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import pkg from "whatsapp-web.js";
import fs from "fs";
import path from "path";
const { Client, LocalAuth } = pkg;

// Global client instance
let whatsappClient: InstanceType<typeof Client> | null = null;
const SESSION_ID = 'default-session';

function clearChromiumLocks() {
  const authDir = path.join(process.cwd(), '.wwebjs_auth');
  try {
    const sessionDirs = fs.readdirSync(authDir);
    for (const dir of sessionDirs) {
      const sessionPath = path.join(authDir, dir);
      for (const lockFile of ['SingletonLock', 'SingletonSocket', 'SingletonCookie']) {
        const lockPath = path.join(sessionPath, lockFile);
        if (fs.existsSync(lockPath)) {
          fs.unlinkSync(lockPath);
          console.log(`Removed stale lock: ${lockPath}`);
        }
      }
    }
  } catch (e) {
    // Auth dir may not exist yet, that's fine
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  clearChromiumLocks();

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
      
      // If status is disconnected or stuck, destroy old client and allow reconnect
      if (current?.status === 'disconnected' || current?.status === 'starting') {
        console.log("Destroying stale client to allow fresh connection...");
        try { await whatsappClient.destroy(); } catch (e) {}
        whatsappClient = null;
      } else {
        return res.json({ message: "Already connecting or connected." });
      }
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

      whatsappClient.on('qr', async (qr: any) => {
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

      whatsappClient.on('auth_failure', async (msg: any) => {
        console.error('AUTHENTICATION FAILURE', msg);
        await storage.updateSession(SESSION_ID, { status: 'disconnected', qrCode: null });
        whatsappClient = null;
      });

      whatsappClient.on('disconnected', async () => {
        console.log('CLIENT DISCONNECTED');
        await storage.updateSession(SESSION_ID, { status: 'disconnected', qrCode: null });
        whatsappClient = null;
      });

      whatsappClient.initialize().catch(async (err: any) => {
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
    
    // Check if client is really ready
    const state = await whatsappClient.getState().catch(() => null);
    if (state !== 'CONNECTED') {
      console.log(`[Groups] Client state is "${state}", not CONNECTED`);
      return res.status(503).json({ message: `WhatsApp não está conectado (estado: ${state}). Reconecte e tente novamente.` });
    }

    // Retry logic: try up to 3 times with small delays
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`[Groups] Fetching chats (attempt ${attempt}/3)...`);
        const chats = await Promise.race([
          whatsappClient.getChats(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("getChats timeout")), 10000))
        ]);
        
        const groups = chats
          .filter((chat: any) => chat.isGroup)
          .map((chat: any) => ({
            id: chat.id._serialized,
            name: chat.name
          }));
        
        console.log(`[Groups] Found ${groups.length} groups on attempt ${attempt}`);
        
        if (groups.length > 0 || attempt === 3) {
          return res.json(groups);
        }
        
        // If 0 groups found and not last attempt, wait and retry
        console.log(`[Groups] No groups found, retrying in 2s...`);
        await new Promise(r => setTimeout(r, 2000));
      } catch (error: any) {
        console.error(`[Groups] Attempt ${attempt} failed:`, error.message);
        if (attempt === 3) {
          return res.status(500).json({ message: `Falha ao carregar grupos: ${error.message}` });
        }
        await new Promise(r => setTimeout(r, 1500));
      }
    }
  });

  app.post(api.groups.moveMembers.path, async (req, res) => {
    console.log("POST /api/groups/move received, body:", JSON.stringify(req.body));
    
    // Server-side timeout to prevent hanging forever
    const timeout = setTimeout(() => {
      console.error("MOVE MEMBERS: Operation timed out after 90s");
      if (!res.headersSent) {
        res.status(504).json({ message: "Operação expirou. O servidor demorou demais para processar." });
      }
    }, 90000);

    try {
      const parsed = api.groups.moveMembers.input.safeParse(req.body);
      if (!parsed.success) {
        clearTimeout(timeout);
        console.log("Invalid payload:", parsed.error);
        return res.status(400).json({ message: "Invalid payload." });
      }
      const { sourceGroupId, targetGroupId } = parsed.data;
      console.log(`Moving members from ${sourceGroupId} to ${targetGroupId}`);
      
      if (!whatsappClient) {
        clearTimeout(timeout);
        return res.status(500).json({ message: "WhatsApp client not connected." });
      }

      console.log("Fetching source chat...");
      const sourceChat = await whatsappClient.getChatById(sourceGroupId);
      console.log("Fetching target chat...");
      const targetChat = await whatsappClient.getChatById(targetGroupId);

      if (!sourceChat || !sourceChat.isGroup) {
        clearTimeout(timeout);
        return res.status(400).json({ message: "Invalid source group." });
      }
      if (!targetChat || !targetChat.isGroup) {
        clearTimeout(timeout);
        return res.status(400).json({ message: "Invalid target group." });
      }

      console.log("Re-fetching chats for fresh data...");
      let sourceChatFresh = await whatsappClient.getChatById(sourceGroupId);
      let targetChatFresh = await whatsappClient.getChatById(targetGroupId);

      // SAFE metadata refresh - skip Puppeteer evaluate to avoid crashing the client
      try {
        console.log(`Refreshing metadata for: ${sourceGroupId}`);
        await Promise.race([
          (sourceChatFresh as any).fetchMessages({ limit: 1 }).catch(() => {}),
          new Promise((resolve) => setTimeout(resolve, 2000))
        ]);
        sourceChatFresh = await whatsappClient.getChatById(sourceGroupId);
        console.log("Metadata refresh done");
      } catch (e: any) {
        console.log("Metadata refresh attempt error:", e.message);
      }

      let sourceParticipants = (sourceChatFresh as any).participants || [];
      
      if (sourceParticipants.length === 0 && (sourceChatFresh as any).groupMetadata) {
        sourceParticipants = (sourceChatFresh as any).groupMetadata.participants || [];
      }

      // If still no participants, try a safe re-fetch without Puppeteer evaluate
      if (sourceParticipants.length === 0) {
        try {
          console.log("Trying safe re-fetch for participants...");
          const reFetched = await whatsappClient.getChatById(sourceGroupId);
          sourceParticipants = (reFetched as any).participants || (reFetched as any).groupMetadata?.participants || [];
          if (sourceParticipants.length > 0) {
            console.log(`Found ${sourceParticipants.length} participants via re-fetch`);
          }
        } catch (e) {
          console.log("Safe re-fetch failed");
        }
      }

      const targetParticipants = (targetChatFresh as any).participants || [];

      console.log(`Source: ${(sourceChatFresh as any).name} (${sourceParticipants.length} members)`);
      console.log(`Target: ${(targetChatFresh as any).name} (${targetParticipants.length} members)`);

      const targetMemberIds = new Set(targetParticipants.map((p: any) => p.id._serialized));
      const membersToAdd = sourceParticipants
        .filter((p: any) => !targetMemberIds.has(p.id._serialized))
        .map((p: any) => p.id._serialized);

      console.log(`Members to add: ${membersToAdd.length}`);

      if (membersToAdd.length === 0) {
        clearTimeout(timeout);
        let msg = "Todos os membros já estão no grupo de destino.";
        if (sourceParticipants.length === 0) {
           msg = "O WhatsApp ainda não sincronizou os membros deste grupo. \n\nComo você não é administrador, siga estes passos: \n1. Abra o grupo de origem no seu celular.\n2. Envie qualquer mensagem lá (ex: '.').\n3. Aguarde 3 segundos e tente novamente aqui.";
        }
        return res.json({ 
          message: msg, 
          added: 0, 
          failed: 0, 
          details: [] 
        });
      }

      const batchSize = 3;
      let added = 0;
      let failed = 0;
      let details: string[] = [];

      for (let i = 0; i < membersToAdd.length; i += batchSize) {
        if (res.headersSent) break;
        
        const batch = membersToAdd.slice(i, i + batchSize);
        const batchNum = Math.floor(i/batchSize)+1;
        
        // Re-fetch target chat before each batch to keep internal references fresh
        let freshTarget: any;
        try {
          freshTarget = await whatsappClient!.getChatById(targetGroupId);
        } catch (e: any) {
          console.error(`[Batch ${batchNum}] Failed to re-fetch target chat:`, e.message);
          failed += batch.length;
          details.push(`Lote ${batchNum} falhou: não foi possível acessar grupo destino`);
          continue;
        }

        // Try adding one member at a time to avoid WidFactory crashes
        for (const memberId of batch) {
          if (res.headersSent) break;
          
          let success = false;
          for (let retry = 0; retry < 2 && !success; retry++) {
            try {
              if (retry > 0) {
                console.log(`[Retry ${retry}] Re-fetching target for ${memberId}...`);
                freshTarget = await whatsappClient!.getChatById(targetGroupId);
                await new Promise(r => setTimeout(r, 1000));
              }
              
              console.log(`[Batch ${batchNum}] Adding member ${memberId} (attempt ${retry+1})...`);
              const response = await Promise.race([
                freshTarget.addParticipants([memberId]),
                new Promise<never>((_, reject) => setTimeout(() => reject(new Error("addParticipants timeout")), 15000))
              ]);
              
              if (response && typeof response === 'object') {
                for (const [id, result] of Object.entries(response)) {
                  if (result === 200 || result === true) {
                    added++;
                    success = true;
                  } else if (result === 409) {
                    console.log(`Member ${id} already in group.`);
                    success = true;
                  } else {
                    // Check nested status object
                    const statusCode = (result as any)?.code || (result as any)?.status || result;
                    if (statusCode === 200 || statusCode === 409) {
                      added++;
                      success = true;
                    } else {
                      console.log(`Member ${id} result:`, JSON.stringify(result));
                    }
                  }
                }
                if (!success && retry === 1) {
                  failed++;
                  details.push(`Falha ao adicionar ${memberId}`);
                }
              } else {
                added++;
                success = true;
              }
            } catch (err: any) {
              console.error(`[Batch ${batchNum}] Error adding ${memberId} (attempt ${retry+1}):`, err.message);
              if (retry === 1) {
                failed++;
                details.push(`Falha: ${memberId} - ${err.message}`);
              }
            }
          }
          // Small delay between individual adds
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
        // Delay between batches
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      clearTimeout(timeout);
      if (!res.headersSent) {
        console.log(`Transfer complete: added=${added}, failed=${failed}`);
        res.json({
          message: `Transferência de membros processada.`,
          added,
          failed,
          details
        });
      }
    } catch (error: any) {
      clearTimeout(timeout);
      console.error("Error moving members:", error.message);
      if (!res.headersSent) {
        res.status(500).json({ message: error?.message || "Internal error during move." });
      }
    }
  });

  return httpServer;
}

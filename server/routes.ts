import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;

// Global client instance
let whatsappClient: InstanceType<typeof Client> | null = null;
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
    try {
      const chats = await whatsappClient.getChats();
      const groups = chats
        .filter((chat: any) => chat.isGroup)
        .map((chat: any) => ({
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

      const sourceChat = await whatsappClient.getChatById(sourceGroupId);
      const targetChat = await whatsappClient.getChatById(targetGroupId);

      if (!sourceChat || !sourceChat.isGroup) {
        return res.status(400).json({ message: "Invalid source group." });
      }
      if (!targetChat || !targetChat.isGroup) {
        return res.status(400).json({ message: "Invalid target group." });
      }

      // Re-fetch to ensure we have the latest state
      let sourceChatFresh = await whatsappClient.getChatById(sourceGroupId);
      let targetChatFresh = await whatsappClient.getChatById(targetGroupId);

      // FAST REFRESH: Optimized strategy with strict timeout
      try {
        console.log(`Refreshing metadata for: ${sourceGroupId}`);
        
        await Promise.race([
          (async () => {
            // 1. Force update via Puppeteer - usually the most effective
            if ((whatsappClient as any).pupPage) {
              await (whatsappClient as any).pupPage.evaluate(async (sId: string) => {
                try {
                  // @ts-ignore
                  if (window.Store && window.Store.GroupMetadata) {
                    // @ts-ignore
                    await window.Store.GroupMetadata.update(sId);
                  }
                } catch (e) {}
              }, sourceGroupId).catch(() => {});
            }
            
            // 2. Minimal fetch to trigger internal sync
            try {
              await (sourceChatFresh as any).fetchMessages({ limit: 1 });
            } catch (e) {}
          })(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2000))
        ]).catch(e => console.log("Metadata refresh timeout or error:", e.message));

        // Re-fetch chat object to pick up changes from Puppeteer injection
        sourceChatFresh = await whatsappClient.getChatById(sourceGroupId);
      } catch (e: any) {
        console.log("Metadata refresh attempt error:", e.message);
      }

      let sourceParticipants = (sourceChatFresh as any).participants || [];
      
      // Fallback: Check internal groupMetadata
      if (sourceParticipants.length === 0 && (sourceChatFresh as any).groupMetadata) {
        sourceParticipants = (sourceChatFresh as any).groupMetadata.participants || [];
      }

      // Deep fallback: If still empty, try one last direct read from Store via Puppeteer
      if (sourceParticipants.length === 0 && (whatsappClient as any).pupPage) {
        try {
          const remoteParticipants = await (whatsappClient as any).pupPage.evaluate(async (sId: string) => {
            try {
              // @ts-ignore
              const chat = window.Store.Chat.get(sId) || window.Store.Chat.models.find(c => (c.id._serialized || c.id) === sId);
              if (chat && chat.groupMetadata && chat.groupMetadata.participants) {
                return chat.groupMetadata.participants.map((p: any) => ({
                  id: { _serialized: p.id._serialized || p.id }
                }));
              }
              // @ts-ignore
              if (window.Store.GroupMetadata) {
                // @ts-ignore
                const gMeta = window.Store.GroupMetadata.get(sId);
                if (gMeta && gMeta.participants) {
                  return gMeta.participants.map((p: any) => ({
                    id: { _serialized: p.id._serialized || p.id }
                  }));
                }
              }
            } catch (e) {}
            return [];
          }, sourceGroupId);
          
          if (remoteParticipants && remoteParticipants.length > 0) {
            console.log(`Encontrados ${remoteParticipants.length} participantes via fallback profundo`);
            sourceParticipants = remoteParticipants;
          }
        } catch (e) {}
      }

      const targetParticipants = (targetChatFresh as any).participants || [];

      console.log(`Source group: ${(sourceChatFresh as any).name} (${sourceParticipants.length} participantes)`);
      console.log(`Target group: ${(targetChatFresh as any).name} (${targetParticipants.length} participantes)`);

      const targetMemberIds = new Set(targetParticipants.map((p: any) => p.id._serialized));
      const membersToAdd = sourceParticipants
        .filter((p: any) => !targetMemberIds.has(p.id._serialized))
        .map((p: any) => p.id._serialized);

      console.log(`Filtered members to add: ${membersToAdd.length}`);

      if (membersToAdd.length === 0) {
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

      // Add participants in small batches to avoid rate limits or errors
      const batchSize = 5;
      let added = 0;
      let failed = 0;
      let details: string[] = [];

      for (let i = 0; i < membersToAdd.length; i += batchSize) {
        const batch = membersToAdd.slice(i, i + batchSize);
        try {
          console.log(`Adding batch of ${batch.length} members to ${targetGroupId}...`);
          const response = await (targetChatFresh as any).addParticipants(batch);
          
          if (response && typeof response === 'object') {
            for (const [id, result] of Object.entries(response)) {
              // result 200: success, result 403: privacy, result 404: not found, result 409: already in group
              if (result === 200 || result === true) {
                added++;
              } else if (result === 409) {
                console.log(`Member ${id} already in group.`);
              } else {
                failed++;
                details.push(`Falha ao adicionar ${id}: Código de erro ${result}`);
              }
            }
          } else {
            // Fallback if response is not an object (some versions of wwebjs)
            added += batch.length;
          }
        } catch (err: any) {
          console.error("Batch add error:", err);
          failed += batch.length;
          details.push(`Lote falhou: ${err.message}`);
        }
        // Small delay between batches to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      res.json({
        message: `Transferência de membros processada.`,
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

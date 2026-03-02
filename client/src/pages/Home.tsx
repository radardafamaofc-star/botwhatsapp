import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Smartphone, 
  RefreshCcw, 
  ArrowRightLeft, 
  LogOut, 
  CheckCircle2, 
  AlertCircle,
  Users,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  useSessionStatus, 
  useConnectSession, 
  useDisconnectSession, 
  useGroups, 
  useMoveMembers 
} from "@/hooks/use-whatsapp";

export default function Home() {
  const { data: session, isLoading: isSessionLoading } = useSessionStatus();
  
  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 glass-card p-6 rounded-3xl">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
              <ArrowRightLeft className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">WhatsApp Sync</h1>
              <p className="text-sm text-muted-foreground font-medium">Group Member Migration Tool</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <StatusBadge status={session?.status || "disconnected"} />
          </div>
        </header>

        {/* Main Content Area with Transitions */}
        <main className="relative min-h-[400px]">
          {isSessionLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {session?.status === "disconnected" && (
                <ConnectionPrompt key="disconnected" />
              )}
              
              {session?.status === "qr_ready" && session.qrCode && (
                <QRCodeDisplay key="qr" qrCode={session.qrCode} />
              )}
              
              {session?.status === "connected" && (
                <TransferDashboard key="connected" />
              )}
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}

// --- Subcomponents ---

function StatusBadge({ status }: { status: string }) {
  const config = {
    connected: { color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2, text: "Conectado" },
    qr_ready: { color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: RefreshCcw, text: "Aguardando Scan" },
    starting: { color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Loader2, text: "Iniciando..." },
    disconnected: { color: "bg-slate-500/10 text-slate-600 border-slate-500/20", icon: Smartphone, text: "Desconectado" }
  };

  const currentConfig = (config as any)[status] || config.disconnected;
  const Icon = currentConfig.icon;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${currentConfig.color} font-semibold text-sm transition-colors`}>
      <Icon className={`h-4 w-4 ${status === 'starting' ? 'animate-spin' : ''}`} />
      {currentConfig.text}
    </div>
  );
}

function ConnectionPrompt() {
  const { mutate: connect, isPending } = useConnectSession();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass-card rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-6"
    >
      <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Smartphone className="h-10 w-10 text-primary" />
      </div>
      <h2 className="text-3xl font-bold text-gradient">Conecte sua Conta</h2>
      <p className="text-muted-foreground max-w-md text-lg">
        Vincule sua conta do WhatsApp para transferir membros entre grupos de forma simples. 
        Clique abaixo para gerar um código QR seguro.
      </p>
      
      <button
        onClick={() => connect()}
        disabled={isPending}
        className="mt-4 px-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-primary to-primary/80 text-white shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-3"
      >
        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Smartphone className="h-5 w-5" />}
        {isPending ? "Gerando QR..." : "Gerar Código de Vinculação"}
      </button>
    </motion.div>
  );
}

function QRCodeDisplay({ qrCode }: { qrCode: string }) {
  const { mutate: disconnect } = useDisconnectSession();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="glass-card rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-8"
    >
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Escaneie para Vincular</h2>
        <p className="text-muted-foreground">Abra o WhatsApp no seu celular e escaneie este código.</p>
      </div>

      <div className="p-6 bg-white rounded-3xl shadow-lg border border-slate-100">
        <QRCodeSVG 
          value={qrCode} 
          size={256}
          bgColor={"#ffffff"}
          fgColor={"#000000"}
          level={"L"}
          includeMargin={false}
        />
      </div>

      <button
        onClick={() => disconnect()}
        className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        Cancelar Conexão
      </button>
    </motion.div>
  );
}

function TransferDashboard() {
  const { toast } = useToast();
  const { data: groups, isLoading: isGroupsLoading, error: groupsError } = useGroups(true);
  const { mutate: disconnect } = useDisconnectSession();
  const { mutate: moveMembers, isPending: isMoving } = useMoveMembers();

  const [sourceId, setSourceId] = useState<string>("");
  const [targetId, setTargetId] = useState<string>("");

  if (groupsError) {
    return (
      <div className="glass-card rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-bold">Erro ao carregar grupos</h2>
        <p className="text-muted-foreground">Sua conexão pode ter caído. Tente reconectar.</p>
        <button onClick={() => disconnect()} className="px-6 py-2 bg-primary text-white rounded-xl">Reconectar</button>
      </div>
    );
  }

  const handleTransfer = () => {
    if (!sourceId || !targetId) return;
    
    moveMembers({ sourceGroupId: sourceId, targetGroupId: targetId }, {
      onSuccess: (res) => {
        toast({
          title: "Transferência",
          description: res.added > 0 
            ? `Sucesso! Foram adicionados ${res.added} membros.` 
            : res.message,
          variant: res.added > 0 ? "default" : "destructive",
        });
        setSourceId("");
        setTargetId("");
      },
      onError: (err) => {
        toast({
          title: "Transfer Failed",
          description: err.message,
          variant: "destructive",
        });
      }
    });
  };

  const isValid = sourceId && targetId && sourceId !== targetId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="glass-card rounded-3xl p-6 md:p-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Transferência de Grupo</h2>
            <p className="text-muted-foreground mt-1">Mova membros com segurança entre seus grupos administrados.</p>
          </div>
          <button
            onClick={() => disconnect()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-border text-muted-foreground font-semibold hover:bg-muted hover:text-foreground transition-all"
          >
            <LogOut className="h-4 w-4" />
            Desconectar
          </button>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 mb-8 text-sm text-blue-800 dark:text-blue-200 flex gap-3 shadow-sm">
          <div className="mt-0.5">
            <Info className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h3 className="font-bold mb-1">Dica de Sincronização</h3>
            <p>
              Se a lista de membros do <strong>Grupo de Origem</strong> estiver vazia, abra o grupo no seu celular, 
              envie uma mensagem qualquer (ex: ".") e aguarde 3 segundos antes de tentar novamente aqui. 
              Isso força o WhatsApp a atualizar a lista de participantes.
            </p>
          </div>
        </div>

        {isGroupsLoading ? (
          <div className="h-48 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6">
            
            {/* Source Group */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Grupo de Origem
              </label>
              <div className="relative">
                <select
                  value={sourceId}
                  onChange={(e) => setSourceId(e.target.value)}
                  disabled={isMoving}
                  className="w-full appearance-none bg-background border-2 border-border text-foreground rounded-2xl px-5 py-4 font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer disabled:opacity-50"
                >
                  <option value="" disabled>Selecione o grupo de origem...</option>
                  {groups?.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                  ▼
                </div>
              </div>
            </div>

            {/* Visual Separator */}
            <div className="hidden md:flex h-12 w-12 rounded-full bg-background border-2 border-border items-center justify-center text-muted-foreground shrink-0 mt-8">
              <ArrowRightLeft className="h-5 w-5" />
            </div>

            {/* Target Group */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-accent" />
                Grupo de Destino
              </label>
              <div className="relative">
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  disabled={isMoving}
                  className="w-full appearance-none bg-background border-2 border-border text-foreground rounded-2xl px-5 py-4 font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer disabled:opacity-50"
                >
                  <option value="" disabled>Selecione o grupo de destino...</option>
                  {groups?.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                  ▼
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Warning if same group selected */}
        {sourceId && targetId && sourceId === targetId && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive font-medium"
          >
            <AlertCircle className="h-5 w-5" />
            Os grupos de origem e destino não podem ser os mesmos.
          </motion.div>
        )}

        <div className="mt-10 pt-8 border-t border-border flex justify-end">
          <button
            onClick={handleTransfer}
            disabled={!isValid || isMoving}
            className="px-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300 flex items-center gap-3 w-full md:w-auto justify-center"
          >
            {isMoving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Transferindo...
              </>
            ) : (
              <>
                Mover Membros
                <ArrowRightLeft className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

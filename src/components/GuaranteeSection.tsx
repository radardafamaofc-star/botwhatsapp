import { ShieldCheck } from "lucide-react";

const GuaranteeSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-8 bg-card/50 border border-border rounded-2xl p-8 md:p-12">
          <div className="shrink-0">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary flex items-center justify-center relative">
              <ShieldCheck className="h-14 w-14 text-primary" />
              <span className="absolute -bottom-2 bg-primary text-primary-foreground text-[10px] font-black px-3 py-0.5 rounded-full uppercase">
                100% Garantia
              </span>
            </div>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
              GARANTIA <span className="text-gradient">INCONDICIONAL</span>
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              O código de defesa consumidor art. 49 garante 7 dias para solicitar reembolso em caso de insatisfação com o 
              serviço contratado. Fique despreocupado, sua compra está 100% garantida! 
              Nós garantimos 10 dias de garantia.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GuaranteeSection;

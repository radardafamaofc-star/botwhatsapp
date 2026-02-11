import { ShieldCheck } from "lucide-react";

const GuaranteeSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
            <ShieldCheck className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold">
            GARANTIA DE <span className="text-gradient">100%</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Teste nosso serviço sem compromisso. Se não ficar satisfeito dentro do período de teste, 
            devolvemos seu dinheiro integralmente. Sem perguntas, sem burocracia.
          </p>
        </div>
      </div>
    </section>
  );
};

export default GuaranteeSection;

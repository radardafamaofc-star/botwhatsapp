import { Shield, CreditCard, Headphones, MonitorPlay } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Shield,
    title: "PROTEÇÃO",
    description: "Servidor seguro com criptografia de ponta. Sua privacidade garantida em todas as conexões.",
  },
  {
    icon: CreditCard,
    title: "PAGAMENTO",
    description: "Diversas formas de pagamento com total segurança nas transações.",
  },
  {
    icon: Headphones,
    title: "SUPORTE TÉCNICO",
    description: "Equipe de suporte disponível para ajudar você a qualquer momento.",
  },
  {
    icon: MonitorPlay,
    title: "SERVIDOR 4K",
    description: "Conteúdo em altíssima qualidade com servidores otimizados para 4K.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 relative bg-gradient-to-b from-background via-card/50 to-background">
      {/* Orange accent lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      
      <div className="container mx-auto px-4 text-center">
        <p className="text-muted-foreground text-sm uppercase tracking-widest mb-2">
          A melhor solução está aqui no
        </p>
        <h2 className="text-3xl md:text-4xl font-black mb-12 uppercase">
          <span className="text-gradient">IPTV POWER</span>
        </h2>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-10">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-center gap-4 p-6 rounded-xl border border-border bg-card/50 hover:border-primary/40 hover:shadow-[0_0_25px_hsl(25_95%_53%_/_0.1)] transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">{feature.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        <Button
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm px-8 py-5 rounded-full shadow-[0_0_25px_hsl(25_95%_53%_/_0.4)] uppercase"
          asChild
        >
          <a href="#planos">Quero acessar os melhores canais</a>
        </Button>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </section>
  );
};

export default FeaturesSection;

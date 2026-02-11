import { Shield, CreditCard, Headphones, MonitorPlay } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "Proteção",
    description: "Servidor seguro com criptografia de ponta. Sua privacidade garantida.",
  },
  {
    icon: CreditCard,
    title: "Pagamento Seguro",
    description: "Diversas formas de pagamento com total segurança nas transações.",
  },
  {
    icon: Headphones,
    title: "Suporte Técnico",
    description: "Equipe de suporte disponível para ajudar você a qualquer momento.",
  },
  {
    icon: MonitorPlay,
    title: "Servidor 4K",
    description: "Conteúdo em altíssima qualidade com servidores otimizados para 4K.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4">
          IPTV POWER — <span className="text-gradient">DIFERENCIAIS</span>
        </h2>
        <p className="text-muted-foreground text-center text-lg max-w-2xl mx-auto mb-12">
          Conheça as vantagens exclusivas da nossa plataforma
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="bg-card border-border hover:border-primary/50 hover:shadow-[0_0_25px_hsl(25_95%_53%_/_0.15)] transition-all duration-300 text-center"
            >
              <CardContent className="pt-8 pb-6 px-6 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

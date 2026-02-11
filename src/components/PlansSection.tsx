import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Plano Mensal",
    price: "R$25,00",
    features: [
      "1 Tela",
      "+14.000 Canais",
      "Qualidade Full HD",
      "Acesso ao Replay/Catch-up",
      "Acesso ao OnDemand",
      "Canais Abertos e Fechados",
      "Filmes e Series",
      "Suporte 24/7 Via Whatsapp",
    ],
    highlight: false,
  },
  {
    name: "Plano Trimestral",
    price: "R$75,00",
    features: [
      "1 Tela",
      "+14.000 Canais",
      "Qualidade Full HD",
      "Acesso ao Replay/Catch-up",
      "Acesso ao OnDemand",
      "Canais Abertos e Fechados",
      "Filmes e Series",
      "Suporte 24/7 Via Whatsapp",
    ],
    highlight: true,
  },
  {
    name: "Plano Semestral",
    price: "R$197,00",
    features: [
      "1 Tela",
      "+14.000 Canais",
      "Qualidade Full HD",
      "Acesso ao Replay/Catch-up",
      "Acesso ao OnDemand",
      "Canais Abertos e Fechados",
      "Filmes e Series",
      "Suporte 24/7 Via Whatsapp",
    ],
    highlight: false,
  },
];

const PlansSection = () => {
  return (
    <section id="planos" className="py-20 relative bg-gradient-to-b from-background via-card/30 to-background">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-2 uppercase">
          CONHEÇA OS NOSSOS <span className="text-gradient">PLANOS</span>
        </h2>
        <p className="text-muted-foreground text-center text-sm max-w-2xl mx-auto mb-12">
          Escolha os planos, formas de pagamentos e condições de formas seguras, sem roubo de dados e informações pessoais
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
                plan.highlight
                  ? "border-2 border-primary shadow-[0_0_40px_hsl(25_95%_53%_/_0.3)] scale-[1.02]"
                  : "border border-border hover:border-primary/50"
              }`}
            >
              {/* Orange gradient header */}
              <div className="bg-gradient-to-r from-primary/90 to-primary p-4 text-center">
                <h3 className="text-lg font-bold text-primary-foreground">{plan.name}</h3>
                <p className="text-3xl font-black text-primary-foreground mt-1">{plan.price}</p>
              </div>
              
              <div className="bg-card p-6">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-foreground">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button
                  className="w-full font-bold rounded-full py-5 bg-primary hover:bg-primary/90 shadow-[0_0_15px_hsl(25_95%_53%_/_0.3)] uppercase text-sm"
                  asChild
                >
                  <a href="#contato">ASSINAR AGORA</a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </section>
  );
};

export default PlansSection;

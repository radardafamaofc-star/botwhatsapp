import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const plans = [
  {
    name: "PLANO MENSAL",
    price: "25,00",
    period: "/mês",
    features: [
      "+14.000 Canais",
      "+50.000 Filmes e Séries",
      "Qualidade Full HD e 4K",
      "Suporte 24h",
      "1 Tela Simultânea",
    ],
    highlight: false,
  },
  {
    name: "PLANO TRIMESTRAL",
    price: "75,00",
    period: "/trimestre",
    features: [
      "+14.000 Canais",
      "+50.000 Filmes e Séries",
      "Qualidade Full HD e 4K",
      "Suporte 24h",
      "2 Telas Simultâneas",
      "Guia de TV (EPG)",
    ],
    highlight: true,
  },
  {
    name: "PLANO SEMESTRAL",
    price: "197,00",
    period: "/semestre",
    features: [
      "+14.000 Canais",
      "+50.000 Filmes e Séries",
      "Qualidade Full HD e 4K",
      "Suporte 24h",
      "3 Telas Simultâneas",
      "Guia de TV (EPG)",
      "Conteúdo Adulto",
    ],
    highlight: false,
  },
];

const PlansSection = () => {
  return (
    <section id="planos" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4">
          PLANOS E <span className="text-gradient">PREÇOS</span>
        </h2>
        <p className="text-muted-foreground text-center text-lg max-w-2xl mx-auto mb-12">
          Escolha o plano ideal para você
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative bg-card border-border text-center transition-all duration-300 ${
                plan.highlight
                  ? "border-primary shadow-[0_0_30px_hsl(25_95%_53%_/_0.25)] scale-105"
                  : "hover:border-primary/50"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                  MAIS POPULAR
                </div>
              )}
              <CardHeader className="pb-2 pt-8">
                <CardTitle className="text-lg font-bold text-foreground">{plan.name}</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-8">
                <div className="my-6">
                  <span className="text-sm text-muted-foreground">R$</span>
                  <span className="text-5xl font-black text-primary">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                
                <ul className="space-y-3 mb-8 text-left">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-foreground">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button
                  className={`w-full font-bold rounded-full py-5 ${
                    plan.highlight
                      ? "bg-primary hover:bg-primary/90 shadow-[0_0_20px_hsl(25_95%_53%_/_0.3)]"
                      : "bg-primary/80 hover:bg-primary"
                  }`}
                  asChild
                >
                  <a href="#contato">ASSINAR AGORA</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlansSection;

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "O que é IPTV?",
    answer: "IPTV (Internet Protocol Television) é uma tecnologia que permite assistir TV pela internet. Com nossa plataforma, você tem acesso a canais ao vivo, filmes e séries sob demanda.",
  },
  {
    question: "Funciona em quais dispositivos?",
    answer: "Nossa plataforma é compatível com Smart TVs, celulares (Android e iOS), tablets, computadores, TV Box e Fire Stick.",
  },
  {
    question: "Preciso de internet rápida?",
    answer: "Recomendamos no mínimo 10 Mbps para conteúdo em HD e 25 Mbps para conteúdo em 4K. A qualidade se adapta automaticamente à sua conexão.",
  },
  {
    question: "Como funciona o suporte?",
    answer: "Oferecemos suporte técnico via WhatsApp disponível para ajudar com instalação, configuração e qualquer dúvida que você tenha.",
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer: "Sim! Você pode cancelar sua assinatura a qualquer momento, sem multas ou taxas adicionais.",
  },
  {
    question: "O pagamento é seguro?",
    answer: "Sim, utilizamos plataformas de pagamento seguras e criptografadas. Seus dados estão sempre protegidos.",
  },
];

const FAQSection = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4">
          DÚVIDAS <span className="text-gradient">FREQUENTES</span>
        </h2>
        <p className="text-muted-foreground text-center text-lg max-w-2xl mx-auto mb-12">
          Tire suas principais dúvidas sobre nosso serviço
        </p>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-lg px-6 data-[state=open]:border-primary/50"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "O que é e como funciona?",
    answer: "IPTV (Internet Protocol Television) é uma tecnologia que permite assistir TV pela internet. Com nossa plataforma, você tem acesso a canais ao vivo, filmes e séries sob demanda.",
  },
  {
    question: "Como eu vou conseguir esse app?",
    answer: "Após a assinatura, você receberá todas as instruções de instalação e configuração via WhatsApp, com suporte completo.",
  },
  {
    question: "E se no meu tempo vou ter resultado ou é o que vou aprender nesse programa?",
    answer: "Recomendamos no mínimo 10 Mbps para conteúdo em HD e 25 Mbps para conteúdo em 4K. A qualidade se adapta automaticamente à sua conexão.",
  },
  {
    question: "E como funciona a garantia?",
    answer: "Oferecemos 10 dias de garantia incondicional. Se não ficar satisfeito, devolvemos seu dinheiro integralmente.",
  },
  {
    question: "E se eu não tiver acesso a internet, como faço?",
    answer: "O serviço precisa de internet para funcionar. Recomendamos uma conexão estável de pelo menos 10 Mbps.",
  },
  {
    question: "Conteúdo algo me garantia que o programa funciona?",
    answer: "Sim! Temos milhares de clientes satisfeitos e oferecemos garantia de 10 dias para você testar sem compromisso.",
  },
];

const FAQSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12 uppercase">
          DÚVIDAS <span className="text-gradient">FREQUENTES</span>
        </h2>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-lg px-6 data-[state=open]:border-primary/50"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline text-sm">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
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

import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const WhatsAppCTA = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-primary/20 to-primary/5">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-6">
          AINDA TEM DÚVIDAS?
        </h2>
        <Button
          size="lg"
          className="bg-[hsl(142_70%_45%)] hover:bg-[hsl(142_70%_40%)] text-primary-foreground font-bold text-lg px-10 py-6 rounded-full shadow-[0_0_25px_hsl(142_70%_45%_/_0.3)] hover:shadow-[0_0_35px_hsl(142_70%_45%_/_0.5)] transition-all duration-300"
          asChild
        >
          <a href="https://wa.me/5500000000000" target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-6 w-6 mr-2" />
            TIRAR DÚVIDAS PELO WHATSAPP
          </a>
        </Button>
      </div>
    </section>
  );
};

export default WhatsAppCTA;

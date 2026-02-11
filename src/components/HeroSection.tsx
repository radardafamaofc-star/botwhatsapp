import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(25_95%_53%_/_0.15),_transparent_60%)]" />
      
      <div className="relative z-10 container mx-auto px-4 text-center py-20">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Zap className="h-8 w-8 text-primary fill-primary" />
          <span className="text-2xl font-extrabold tracking-wider text-primary">IPTV POWER</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight max-w-5xl mx-auto mb-6">
          A MELHOR LISTA DE CANAIS, FILMES E SÉRIES DISPONÍVEIS EM UMA{" "}
          <span className="text-gradient">ÚNICA PLATAFORMA</span>
        </h1>
        
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10">
          Tenha acesso a milhares de canais ao vivo, filmes e séries em alta qualidade. 
          Compatível com todos os dispositivos.
        </p>
        
        <Button
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-10 py-6 rounded-full shadow-[0_0_30px_hsl(25_95%_53%_/_0.4)] hover:shadow-[0_0_40px_hsl(25_95%_53%_/_0.6)] transition-all duration-300"
          asChild
        >
          <a href="#planos">ASSINE AGORA</a>
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;

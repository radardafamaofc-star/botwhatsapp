import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import devicesMockup from "@/assets/devices-mockup.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
      </div>
      {/* Dark overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
      
      <div className="relative z-10 container mx-auto px-4 text-center pt-16 pb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Zap className="h-6 w-6 text-primary fill-primary" />
          <span className="text-sm font-bold tracking-widest text-muted-foreground uppercase">
            Assista seus programas favoritos com facilidade
          </span>
        </div>
        
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight max-w-4xl mx-auto mb-4 uppercase">
          A MELHOR LISTA DE CANAIS, FILMES E SÉRIES DISPONÍVEIS{" "}
          <span className="text-gradient">EM UMA ÚNICA PLATAFORMA.</span>
        </h1>
        
        <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto mb-6">
          Com acesso a mais de +14.000 canais ao vivo e alta qualidade
        </p>
        
        <Button
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base px-10 py-5 rounded-full shadow-[0_0_30px_hsl(25_95%_53%_/_0.5)] hover:shadow-[0_0_40px_hsl(25_95%_53%_/_0.7)] transition-all duration-300 uppercase"
          asChild
        >
          <a href="#planos">Quero ter acesso aos melhores canais</a>
        </Button>
      </div>

      {/* Device mockup */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 mt-4">
        <div className="relative rounded-2xl overflow-hidden border border-primary/30 shadow-[0_0_60px_hsl(25_95%_53%_/_0.2)]">
          <img src={devicesMockup} alt="Dispositivos com IPTV Power" className="w-full h-auto" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

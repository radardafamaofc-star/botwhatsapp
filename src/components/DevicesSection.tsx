import devicesMockup from "@/assets/devices-mockup.jpg";

const DevicesSection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Orange gradient border top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-6 uppercase">
              ASSISTA <span className="text-gradient">ONDE QUISER</span>
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed mb-6">
              A Plataforma IPTV Power traz o melhor do entretenimento na palma da sua mão. 
              São mais de 14.000 canais ao vivo, filmes e séries disponíveis em alta qualidade, 
              compatível com Smart TVs, celulares, tablets, computadores e TV Box.
            </p>
            <p className="text-muted-foreground text-base leading-relaxed">
              Assista no conforto da sua casa ou onde estiver, sem travamentos e com a melhor experiência.
            </p>
          </div>
          
          <div className="order-1 lg:order-2 relative">
            <div className="rounded-2xl overflow-hidden border border-primary/20 shadow-[0_0_40px_hsl(25_95%_53%_/_0.15)]">
              <img src={devicesMockup} alt="Assista em qualquer dispositivo" className="w-full h-auto" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Orange gradient border bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </section>
  );
};

export default DevicesSection;

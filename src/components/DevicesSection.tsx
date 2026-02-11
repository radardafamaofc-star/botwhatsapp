import { Monitor, Smartphone, Tablet } from "lucide-react";

const devices = [
  { icon: Monitor, label: "Smart TV" },
  { icon: Smartphone, label: "Celular" },
  { icon: Tablet, label: "Tablet" },
];

const DevicesSection = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
          ASSISTA <span className="text-gradient">ONDE QUISER</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-12">
          Nossa plataforma é compatível com diversos dispositivos. Assista no conforto da sua casa ou onde estiver.
        </p>
        
        <div className="flex flex-wrap justify-center gap-10 md:gap-16">
          {devices.map((device) => (
            <div key={device.label} className="flex flex-col items-center gap-4 group">
              <div className="w-24 h-24 rounded-2xl bg-card border border-border flex items-center justify-center group-hover:border-primary/50 group-hover:shadow-[0_0_20px_hsl(25_95%_53%_/_0.2)] transition-all duration-300">
                <device.icon className="h-10 w-10 text-primary" />
              </div>
              <span className="font-semibold text-foreground">{device.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DevicesSection;

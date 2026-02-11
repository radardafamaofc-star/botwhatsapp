import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ContactSection = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Mensagem enviada!",
      description: "Entraremos em contato em breve.",
    });
    setFormData({ name: "", contact: "", message: "" });
  };

  return (
    <section id="contato" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4">
          ENTRE EM <span className="text-gradient">CONTATO</span>
        </h2>
        <p className="text-muted-foreground text-center text-lg max-w-2xl mx-auto mb-12">
          Preencha o formulário e retornaremos o mais breve possível
        </p>
        
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground font-semibold">Nome</Label>
            <Input
              id="name"
              placeholder="Seu nome completo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-card border-border focus:border-primary h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact" className="text-foreground font-semibold">E-mail ou Telefone</Label>
            <Input
              id="contact"
              placeholder="seu@email.com ou (11) 99999-9999"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              required
              className="bg-card border-border focus:border-primary h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message" className="text-foreground font-semibold">Mensagem</Label>
            <Textarea
              id="message"
              placeholder="Como podemos ajudar?"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              className="bg-card border-border focus:border-primary min-h-[120px]"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 font-bold text-lg py-6 rounded-full shadow-[0_0_20px_hsl(25_95%_53%_/_0.3)]"
          >
            <Send className="h-5 w-5 mr-2" />
            ENVIAR MENSAGEM
          </Button>
        </form>
      </div>
    </section>
  );
};

export default ContactSection;

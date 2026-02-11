import HeroSection from "@/components/HeroSection";
import DevicesSection from "@/components/DevicesSection";
import FeaturesSection from "@/components/FeaturesSection";
import PlansSection from "@/components/PlansSection";
import GuaranteeSection from "@/components/GuaranteeSection";
import FAQSection from "@/components/FAQSection";
import ContactSection from "@/components/ContactSection";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <DevicesSection />
      <FeaturesSection />
      <PlansSection />
      <GuaranteeSection />
      <FAQSection />
      <ContactSection />
      <WhatsAppCTA />
      <Footer />
    </div>
  );
};

export default Index;

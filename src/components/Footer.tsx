const Footer = () => {
  return (
    <footer className="py-8 border-t border-primary/20 bg-card/30">
      <div className="container mx-auto px-4 text-center space-y-4">
        <h3 className="text-primary font-black text-lg uppercase tracking-wider">
          PIRATARIA É CRIME
        </h3>
        <p className="text-muted-foreground text-xs max-w-3xl mx-auto leading-relaxed">
          Conforme LEI 9610/98 ATUALIZADA é proibido reproduzir, total ou parcialmente, sem a expressa 
          autorização do autor, qualquer tipo de cópia sem a devida autorização.
        </p>
        <p className="text-muted-foreground text-xs">
          © {new Date().getFullYear()} IPTV Power — Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

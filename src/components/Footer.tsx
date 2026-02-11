const Footer = () => {
  return (
    <footer className="py-8 border-t border-border">
      <div className="container mx-auto px-4 text-center">
        <p className="text-muted-foreground text-xs max-w-3xl mx-auto leading-relaxed">
          Aviso Legal: Não apoiamos, promovemos ou incentivamos a pirataria de conteúdo protegido por direitos autorais. 
          Todo o conteúdo disponibilizado é de responsabilidade do usuário final. 
          Este site não armazena nenhum conteúdo em seus servidores.
        </p>
        <p className="text-muted-foreground text-xs mt-4">
          © {new Date().getFullYear()} IPTV Power — Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-6 px-4">
      <div className="max-w-lg mx-auto flex flex-col items-center gap-4">
        <div className="flex items-center gap-5 text-sm">
          <a
            href="https://docs.inverse.finance/inverse-finance/inverse-finance/products/tokens/dola/sdola"
            target="_blank"
            rel="noopener noreferrer"
            className="w-28 text-right text-text-muted hover:text-foreground transition-colors duration-200"
          >
            Documentation
          </a>
          <span className="text-white/[0.08]">|</span>
          <a
            href="https://www.stableyields.info"
            target="_blank"
            rel="noopener noreferrer"
            className="w-28 text-left text-text-muted hover:text-foreground transition-colors duration-200"
          >
            Compare Yields
          </a>
        </div>
        <a
          href="https://www.inverse.finance"
          target="_blank"
          rel="noopener noreferrer"
          className="text-center text-text-muted/60 hover:text-text-muted transition-colors duration-200 text-xs"
        >
          Powered by Inverse Finance
        </a>
      </div>
    </footer>
  );
}

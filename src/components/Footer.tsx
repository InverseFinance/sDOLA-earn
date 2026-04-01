export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.04] py-7 px-4">
      <div className="max-w-lg mx-auto flex flex-col items-center gap-3">
        <div className="flex items-center gap-6 text-xs text-text-muted">
          <a
            href="https://docs.inverse.finance/inverse-finance/inverse-finance/products/tokens/dola/sdola"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text-secondary transition-colors duration-150"
          >
            Documentation
          </a>
          <span className="w-px h-3 bg-white/[0.08]" />
          <a
            href="https://www.stableyields.info"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text-secondary transition-colors duration-150"
          >
            Compare Yields
          </a>
        </div>
        <a
          href="https://www.inverse.finance"
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-muted/80 hover:text-text-muted/70 transition-colors duration-150 text-[11px] tracking-wide"
        >
          Powered by Inverse Finance
        </a>
      </div>
    </footer>
  );
}

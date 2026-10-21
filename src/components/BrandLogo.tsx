export function BrandLogo({ className = "h-8 w-auto", compact = false }: { className?: string; compact?: boolean }) {
  return <img src="/logo.svg" alt="SERATEGNA" width="420" height="96" className={`block shrink-0 object-contain ${className} ${compact ? "object-left" : ""}`} />;
}

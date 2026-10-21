export function BrandLogo({ className = "h-8 w-auto", compact = false }: { className?: string; compact?: boolean }) {
  return <img src="/logo.svg" alt="SERATEGNA" className={`${className} ${compact ? "object-contain object-left" : ""}`} />;
}

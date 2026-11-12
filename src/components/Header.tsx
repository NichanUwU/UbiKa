import { MapPin, ShoppingBasket, ShoppingCart, Store } from 'lucide-react'

interface HeaderProps {
  quoteCount: number
  onOpenQuote: () => void
  onOpenMerchant: () => void
}

export function Header({ quoteCount, onOpenQuote, onOpenMerchant }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-emerald-950/10 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <a href="#" className="flex min-w-0 items-center gap-3" aria-label="UbiKa, inicio">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-900 text-white">
            <ShoppingBasket size={22} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-extrabold tracking-tight text-emerald-950 sm:text-lg">
              UbiKa
            </span>
            <span className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-800/75 sm:text-xs">
              <MapPin size={12} />
              Villaflores, Chiapas
            </span>
          </span>
        </a>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onOpenMerchant}
            className="inline-flex items-center gap-2 rounded-xl px-2.5 py-2.5 text-sm font-bold text-emerald-900 transition hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 sm:px-3"
            aria-label="¿Eres comerciante? Registra tu negocio"
          >
            <Store size={18} />
            <span className="hidden lg:inline">¿Eres comerciante?</span>
          </button>
          <button
            type="button"
            onClick={onOpenQuote}
            className="relative inline-flex items-center gap-2 rounded-xl bg-emerald-900 px-3.5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 sm:px-4"
            aria-label={`Abrir cotizador, ${quoteCount} ${quoteCount === 1 ? 'artículo' : 'artículos'}`}
          >
            <ShoppingCart size={18} />
            <span className="hidden sm:inline">Mi lista</span>
            <span className="flex min-w-5 items-center justify-center rounded-full bg-lime-300 px-1.5 py-0.5 text-xs font-extrabold text-emerald-950">
              {quoteCount}
            </span>
          </button>
        </div>
      </nav>
    </header>
  )
}

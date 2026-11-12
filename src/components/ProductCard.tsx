import { MapPin, MessageCircle, Plus, ShoppingCart } from 'lucide-react'
import { trackWhatsappClick } from '../services/api'
import { buildWhatsappUrl } from '../utils/whatsapp'
import type { Product } from '../types'

interface ProductCardProps {
  product: Product
  onAddToQuote: (product: Product) => void
  isInQuote: boolean
}

const categoryLabels: Record<Product['category'], string> = {
  papeleria: 'Papelería',
  ferreteria: 'Ferretería',
  agroinsumos: 'Agroinsumos',
  servicios: 'Servicios',
}

export function ProductCard({ product, onAddToQuote, isInQuote }: ProductCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-950/5">
      <div className="relative aspect-[16/10] overflow-hidden bg-emerald-50">
        <img
          src={product.imageUrl}
          alt={`Imagen de ${product.name}`}
          loading="lazy"
          className="size-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-emerald-900 shadow-sm">
          {categoryLabels[product.category]}
        </span>
        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-sm ${
            product.inStock ? 'bg-lime-100 text-emerald-900' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {product.inStock ? 'Disponibilidad por confirmar' : 'Consultar disponibilidad'}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {product.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="text-base font-extrabold leading-snug text-slate-900 sm:text-lg">
          {product.name}
        </h3>
        <p className="mt-2 text-sm font-semibold text-slate-600">{product.businessName}</p>
        <p className="mt-1 flex items-start gap-1.5 text-xs leading-5 text-slate-500">
          <MapPin size={14} className="mt-0.5 shrink-0 text-emerald-700" />
          {product.zone} · {product.businessAddress}
        </p>
        <div className="mt-auto pt-4">
          <div className="mb-3 flex items-end justify-between gap-2">
            <span className="text-xs text-slate-500">Precio estimado</span>
            <span className="text-lg font-extrabold text-emerald-950">
              {product.price === undefined
                ? 'Consultar'
                : new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(product.price)}
            </span>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <a
              href={buildWhatsappUrl(product.businessWhatsapp, product.name, product.businessName)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                void trackWhatsappClick(product.businessId, product.id, 'direct_contact')
              }}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#15803d] px-3 text-sm font-bold text-white transition hover:bg-[#166534] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            >
              <MessageCircle size={17} />
              <span>Consultar</span>
            </a>
            <button
              type="button"
              onClick={() => onAddToQuote(product)}
              aria-label={isInQuote ? `Agregar otra unidad de ${product.name} a la lista` : `Agregar ${product.name} a la lista`}
              title={isInQuote ? 'Agregar otra unidad' : 'Agregar a mi lista'}
              className={`flex min-h-11 min-w-11 items-center justify-center rounded-xl border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${
                isInQuote
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-900'
              }`}
            >
              {isInQuote ? <ShoppingCart size={18} /> : <Plus size={19} />}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

import { useEffect, useState } from 'react'
import { Minus, Plus, Send, ShoppingCart, Trash2, X } from 'lucide-react'
import type { Business, Category, QuoteItem } from '../types'
import { buildListQuoteWhatsappUrl } from '../utils/whatsapp'

const categoryOptions: { value: Category; label: string }[] = [
  { value: 'todas', label: 'Cualquier categoría' },
  { value: 'papeleria', label: 'Papelería' },
  { value: 'ferreteria', label: 'Ferretería' },
  { value: 'agroinsumos', label: 'Agroinsumos' },
  { value: 'servicios', label: 'Servicios' },
]

interface QuoteModalProps {
  open: boolean
  items: QuoteItem[]
  businesses: Business[]
  onClose: () => void
  onRemove: (id: string) => void
  onQuantityChange: (id: string, quantity: number) => void
  onAddCustom: (name: string, category: Category) => void
  onSendQuote: (businessId: string) => void
}

export function QuoteModal({
  open,
  items,
  businesses,
  onClose,
  onRemove,
  onQuantityChange,
  onAddCustom,
  onSendQuote,
}: QuoteModalProps) {
  const [businessId, setBusinessId] = useState('')
  const [customName, setCustomName] = useState('')
  const [customCategory, setCustomCategory] = useState<Category>('todas')

  useEffect(() => {
    if (!businesses.length) {
      setBusinessId('')
      return
    }

    setBusinessId((current) =>
      businesses.some((business) => business.id === current) ? current : businesses[0].id,
    )
  }, [businesses])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, open])

  if (!open) return null

  const selectedBusiness = businesses.find((business) => business.id === businessId)
  const quoteUrl =
    selectedBusiness && items.length
      ? buildListQuoteWhatsappUrl(
          selectedBusiness.phoneWhatsapp,
          selectedBusiness.name,
          items.map((item) => `${item.quantity} × ${item.productName}`),
        )
      : undefined

  function handleAddCustom(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = customName.trim()
    if (!name) return
    onAddCustom(name, customCategory)
    setCustomName('')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-title"
        className="flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl bg-[#f8faf6] shadow-2xl sm:rounded-3xl"
      >
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Cotizador</p>
            <h2 id="quote-title" className="mt-1 text-xl font-extrabold text-slate-900">
              Mi lista de compras
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar cotizador"
            className="flex size-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={21} />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
          <form onSubmit={handleAddCustom} className="rounded-2xl border border-slate-200 bg-white p-4">
            <label htmlFor="custom-quote-item" className="text-sm font-bold text-slate-800">
              Agrega algo que no encontraste
            </label>
            <div className="mt-3 flex gap-2">
              <input
                id="custom-quote-item"
                value={customName}
                onChange={(event) => setCustomName(event.target.value)}
                placeholder="Ej. cartulina azul"
                maxLength={100}
                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
              <button
                type="submit"
                disabled={!customName.trim()}
                className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-900 text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Agregar artículo a la lista"
              >
                <Plus size={20} />
              </button>
            </div>
            <label htmlFor="custom-quote-category" className="sr-only">
              Categoría para el artículo
            </label>
            <select
              id="custom-quote-category"
              value={customCategory}
              onChange={(event) => setCustomCategory(event.target.value as Category)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-600"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </form>

          {items.length ? (
            <ul className="space-y-2" aria-label="Artículos en la lista de cotización">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                    <ShoppingCart size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900">{item.productName}</p>
                    <p className="text-xs text-slate-500">
                      {categoryOptions.find((option) => option.value === item.targetCategory)?.label}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                      aria-label={`Reducir cantidad de ${item.productName}`}
                      className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-7 text-center text-sm font-bold tabular-nums">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                      aria-label={`Aumentar cantidad de ${item.productName}`}
                      className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    aria-label={`Quitar ${item.productName} de la lista`}
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-8 text-center">
              <ShoppingCart className="mx-auto text-slate-300" size={30} />
              <p className="mt-3 text-sm font-bold text-slate-700">Tu lista está vacía</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Agrega productos desde el catálogo o escribe un artículo arriba.
              </p>
            </div>
          )}

          <div>
            <label htmlFor="quote-business" className="mb-2 block text-sm font-bold text-slate-800">
              ¿A qué negocio quieres enviar la lista?
            </label>
            <select
              id="quote-business"
              value={businessId}
              onChange={(event) => setBusinessId(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            >
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name} · {business.zone}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              La lista se enviará al negocio elegido para consultar disponibilidad y precios.
            </p>
          </div>
        </div>

        <footer className="border-t border-slate-200 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
          {quoteUrl ? (
            <a
              href={quoteUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                if (selectedBusiness) onSendQuote(selectedBusiness.id)
                onClose()
              }}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#15803d] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#166534] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            >
              <Send size={17} />
              Enviar lista por WhatsApp
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 py-3 text-sm font-bold text-slate-500"
            >
              <Send size={17} />
              Agrega artículos para cotizar
            </button>
          )}
        </footer>
      </section>
    </div>
  )
}

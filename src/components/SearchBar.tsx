import { Search, X } from 'lucide-react'
import type { Category } from '../types'

const categoryOptions: { value: Category; label: string }[] = [
  { value: 'todas', label: 'Todo' },
  { value: 'papeleria', label: 'Papelería' },
  { value: 'ferreteria', label: 'Ferretería' },
  { value: 'agroinsumos', label: 'Agroinsumos' },
  { value: 'servicios', label: 'Servicios' },
]

interface SearchBarProps {
  query: string
  category: Category
  onQueryChange: (query: string) => void
  onCategoryChange: (category: Category) => void
}

export function SearchBar({
  query,
  category,
  onQueryChange,
  onCategoryChange,
}: SearchBarProps) {
  return (
    <div className="w-full">
      <label htmlFor="catalog-search" className="sr-only">
        Buscar productos o palabras relacionadas
      </label>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100">
        <Search className="shrink-0 text-emerald-800" size={20} aria-hidden="true" />
        <input
          id="catalog-search"
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Busca cuadernos, machetes, abono..."
          className="min-w-0 flex-1 bg-transparent py-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 sm:text-base"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            aria-label="Limpiar búsqueda"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        )}
      </div>
      <div
        className="mt-4 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Filtrar por categoría"
      >
        {categoryOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={category === option.value}
            onClick={() => onCategoryChange(option.value)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              category === option.value
                ? 'border-emerald-900 bg-emerald-900 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-900'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

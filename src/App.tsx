import { useCallback, useState } from 'react'
import { MapPin, Search, ShoppingBag, Sparkles, Store } from 'lucide-react'
import { Header } from './components/Header'
import { InstallPwaBanner } from './components/InstallPwaBanner'
import { MerchantUploadModal } from './components/MerchantUploadModal'
import { OfflineNotice } from './components/OfflineNotice'
import { ProductCard } from './components/ProductCard'
import { QuoteModal } from './components/QuoteModal'
import { SearchBar } from './components/SearchBar'
import { useCatalog } from './hooks/useCatalog'
import { trackWhatsappClick } from './services/api'
import type { Category } from './types'

function App() {
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [merchantOpen, setMerchantOpen] = useState(false)
  const catalog = useCatalog()

  const closeQuote = useCallback(() => setQuoteOpen(false), [])
  const closeMerchant = useCallback(() => setMerchantOpen(false), [])

  function addProductToQuote(product: (typeof catalog.filteredProducts)[number]) {
    catalog.addQuoteItem({
      id: product.id,
      productName: product.name,
      targetCategory: product.category,
    })
    setQuoteOpen(true)
  }

  function addCustomQuoteItem(name: string, category: Category) {
    catalog.addCustomQuoteItem(name, category)
  }

  return (
    <div className="min-h-screen bg-[#f8faf6] text-slate-900">
      <Header
        quoteCount={catalog.quoteCount}
        onOpenQuote={() => setQuoteOpen(true)}
        onOpenMerchant={() => setMerchantOpen(true)}
      />

      <main>
        <section className="relative isolate overflow-hidden bg-emerald-950 text-white">
          <div className="absolute -right-24 -top-32 -z-10 size-96 rounded-full bg-emerald-700/40 blur-3xl" />
          <div className="absolute -bottom-48 left-1/4 -z-10 size-96 rounded-full bg-lime-700/20 blur-3xl" />
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-bold tracking-wide text-emerald-100">
                <MapPin size={14} />
                COMPRA CERCA, APOYA LO NUESTRO
              </span>
              <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                Encuentra lo que buscas
                <span className="block text-lime-300">en Villaflores.</span>
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-100/80 sm:text-lg">
                Explora productos de negocios locales y pregunta directamente por WhatsApp.
              </p>
            </div>
            <div className="mt-8 max-w-3xl">
              <SearchBar
                query={catalog.query}
                category={catalog.category}
                onQueryChange={catalog.setQuery}
                onCategoryChange={catalog.setCategory}
              />
              <p className="mt-3 flex items-center gap-1.5 text-xs text-emerald-100/70">
                <Sparkles size={14} />
                Prueba también con palabras relacionadas, como “libreta” o “fertilizante”.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700">
                Catálogo local
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                Productos cerca de ti
              </h2>
            </div>
            <p className="text-sm font-semibold text-slate-500" aria-live="polite">
              {catalog.filteredProducts.length}{' '}
              {catalog.filteredProducts.length === 1 ? 'resultado' : 'resultados'}
            </p>
          </div>

          {catalog.isLoading ? (
            <div className="rounded-3xl border border-slate-200 bg-white px-5 py-14 text-center" role="status">
              <p className="text-sm font-semibold text-slate-500">Cargando catálogo…</p>
            </div>
          ) : catalog.filteredProducts.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {catalog.filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToQuote={addProductToQuote}
                  isInQuote={catalog.quoteItems.some((item) => item.id === product.id)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
                <Search size={25} />
              </span>
              <h3 className="mt-4 text-lg font-extrabold text-slate-900">No encontramos productos</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Prueba otra palabra o cambia la categoría. También puedes agregar el artículo directamente a tu lista.
              </p>
              <button
                type="button"
                onClick={() => {
                  catalog.setQuery('')
                  catalog.setCategory('todas')
                }}
                className="mt-5 rounded-xl bg-emerald-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800"
              >
                Ver todos los productos
              </button>
            </div>
          )}

          <p className="mt-5 text-xs leading-5 text-slate-400">
            Productos, precios y teléfonos de demostración. Confirma existencias y precios directamente con cada negocio.
          </p>
        </section>

        <section className="border-t border-emerald-950/5 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <ShoppingBag size={19} />
                </span>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">Apoya a los negocios de Villaflores</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {catalog.source === 'supabase'
                      ? 'Explora el catálogo compartido y confirma existencias y precios con cada establecimiento.'
                      : 'El catálogo de demostración muestra ejemplos de la Zona Centro. Los datos comerciales aún deben verificarse.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMerchantOpen(true)}
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-900 px-4 py-2.5 text-sm font-bold text-emerald-900 transition hover:bg-emerald-50"
              >
                <Store size={17} />
                ¿Eres comerciante?
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-emerald-950/5 bg-[#f8faf6]">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <span>© 2026 UbiKa · Villaflores</span>
          <span>{catalog.businesses.length} negocios · {catalog.source === 'supabase' ? 'catálogo en línea' : 'modo local'}</span>
        </div>
      </footer>

      <QuoteModal
        open={quoteOpen}
        items={catalog.quoteItems}
        businesses={catalog.businesses}
        onClose={closeQuote}
        onRemove={catalog.removeQuoteItem}
        onQuantityChange={catalog.setQuoteItemQuantity}
        onAddCustom={addCustomQuoteItem}
        onSendQuote={(businessId) => {
          void trackWhatsappClick(businessId, undefined, 'quote_list')
        }}
      />
      <MerchantUploadModal open={merchantOpen} onClose={closeMerchant} />
      <OfflineNotice />
      <InstallPwaBanner />
    </div>
  )
}

export default App

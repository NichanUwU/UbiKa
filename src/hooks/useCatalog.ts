import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchCatalog, type CatalogData } from '../services/api'
import type { Category, QuoteItem } from '../types'
import { filterProducts } from '../utils/search'

const STORAGE_KEY = 'donde-lo-venden-catalog-v1'
const categories: Category[] = ['todas', 'papeleria', 'ferreteria', 'agroinsumos', 'servicios']

interface CatalogState {
  query: string
  category: Category
  quoteItems: QuoteItem[]
}

const initialState: CatalogState = { query: '', category: 'todas', quoteItems: [] }

function isQuoteItem(value: unknown): value is QuoteItem {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.productName === 'string' &&
    typeof item.quantity === 'number' &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    categories.includes(item.targetCategory as Category)
  )
}

function readSavedState(): CatalogState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return initialState

    const parsed: unknown = JSON.parse(saved)
    if (!parsed || typeof parsed !== 'object') return initialState
    const state = parsed as Record<string, unknown>

    return {
      query: typeof state.query === 'string' ? state.query : '',
      category: categories.includes(state.category as Category) ? (state.category as Category) : 'todas',
      quoteItems: Array.isArray(state.quoteItems) ? state.quoteItems.filter(isQuoteItem) : [],
    }
  } catch (error) {
    console.warn('No se pudo leer el catálogo guardado en este dispositivo.', error)
    return initialState
  }
}

function makeId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `quote-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function useCatalog() {
  const [state, setState] = useState<CatalogState>(readSavedState)
  const [catalog, setCatalog] = useState<CatalogData>({
    businesses: [],
    products: [],
    source: 'local',
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true

    void fetchCatalog()
      .then((data) => {
        if (active) setCatalog(data)
      })
      .catch((error: unknown) => {
        console.error('No se pudo iniciar el catálogo.', error)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
      console.warn('No se pudo guardar el catálogo en este dispositivo.', error)
    }
  }, [state])

  const filteredProducts = useMemo(
    () => filterProducts(catalog.products, state.query, state.category),
    [catalog.products, state.category, state.query],
  )

  const setQuery = useCallback((query: string) => {
    setState((current) => ({ ...current, query }))
  }, [])

  const setCategory = useCallback((category: Category) => {
    setState((current) => ({ ...current, category }))
  }, [])

  const addQuoteItem = useCallback((item: Omit<QuoteItem, 'quantity'>) => {
    setState((current) => {
      const existing = current.quoteItems.find((entry) => entry.id === item.id)
      if (existing) {
        return {
          ...current,
          quoteItems: current.quoteItems.map((entry) =>
            entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry,
          ),
        }
      }

      return { ...current, quoteItems: [...current.quoteItems, { ...item, quantity: 1 }] }
    })
  }, [])

  const removeQuoteItem = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      quoteItems: current.quoteItems.filter((item) => item.id !== id),
    }))
  }, [])

  const setQuoteItemQuantity = useCallback((id: string, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity < 1) return
    setState((current) => ({
      ...current,
      quoteItems: current.quoteItems.map((item) => (item.id === id ? { ...item, quantity } : item)),
    }))
  }, [])

  const addCustomQuoteItem = useCallback((productName: string, targetCategory: Category) => {
    const cleanedName = productName.trim()
    if (!cleanedName) return

    setState((current) => ({
      ...current,
      quoteItems: [
        ...current.quoteItems,
        { id: makeId(), productName: cleanedName, quantity: 1, targetCategory },
      ],
    }))
  }, [])

  const quoteCount = state.quoteItems.reduce((total, item) => total + item.quantity, 0)

  return {
    query: state.query,
    category: state.category,
    businesses: catalog.businesses,
    source: catalog.source,
    isLoading,
    filteredProducts,
    quoteItems: state.quoteItems,
    quoteCount,
    setQuery,
    setCategory,
    addQuoteItem,
    removeQuoteItem,
    setQuoteItemQuantity,
    addCustomQuoteItem,
  }
}

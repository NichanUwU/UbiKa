import type { Category, Product } from '../types'

const synonymGroups: string[][] = [
  ['cuaderno', 'libreta'],
  ['machete', 'herramienta'],
  ['abono', 'fertilizante'],
  ['pega', 'resistol', 'pegamento'],
  ['hoja', 'papel'],
]

const synonymsByTerm = new Map<string, string[]>()

for (const group of synonymGroups) {
  for (const term of group) {
    synonymsByTerm.set(term, group)
  }
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-MX')
    .trim()
}

function expandQuery(query: string): string[] {
  const normalizedQuery = normalizeText(query)
  const terms = normalizedQuery.split(/\s+/).filter(Boolean)
  const expandedTerms = new Set<string>([normalizedQuery, ...terms])

  for (const term of terms) {
    for (const synonym of synonymsByTerm.get(term) ?? []) {
      expandedTerms.add(synonym)
    }
  }

  return [...expandedTerms].filter(Boolean)
}

export function filterProducts(
  products: Product[],
  query: string,
  category: Category,
): Product[] {
  const searchTerms = expandQuery(query)

  return products.filter((product) => {
    const matchesCategory = category === 'todas' || product.category === category
    if (!matchesCategory) return false
    if (!searchTerms.length) return true

    const searchableText = normalizeText([product.name, ...product.tags].join(' '))
    return searchTerms.some((term) => searchableText.includes(term))
  })
}

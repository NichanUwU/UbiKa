function normalizeMexicanPhone(phone: string): string {
  let digits = phone.replace(/\D/g, '')

  if (digits.startsWith('00')) {
    digits = digits.slice(2)
  }

  if (digits.length === 10) {
    return `52${digits}`
  }

  if (digits.startsWith('521') && digits.length === 13) {
    return `52${digits.slice(3)}`
  }

  if (digits.startsWith('52') && digits.length === 12) {
    return digits
  }

  if (digits.length > 10) {
    digits = digits.slice(-10)
  }

  return `52${digits}`
}

function createWhatsappUrl(phone: string, message: string): string {
  const url = new URL(`https://wa.me/${normalizeMexicanPhone(phone)}`)
  url.searchParams.set('text', message)
  return url.toString()
}

export function buildWhatsappUrl(
  phone: string,
  productName: string,
  businessName: string,
): string {
  const message =
    `Hola ${businessName}, vi en UbiKa que tienen '${productName}'. ` +
    '¿Me podrían confirmar si tienen disponible y cuál es el precio actual? Muchas gracias.'

  return createWhatsappUrl(phone, message)
}

export function buildListQuoteWhatsappUrl(
  phone: string,
  businessName: string,
  items: string[],
): string {
  const itemList = items.map((item) => `• ${item}`).join('\n')
  const message =
    `Hola ${businessName}, vi su negocio en UbiKa y quisiera cotizar esta lista:\n\n` +
    `${itemList}\n\n¿Me podrían compartir disponibilidad y precios? Muchas gracias.`

  return createWhatsappUrl(phone, message)
}

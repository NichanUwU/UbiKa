import { useEffect, useState } from 'react'
import { ImagePlus, LoaderCircle, Store, X } from 'lucide-react'
import { submitMerchant } from '../services/api'
import type { ProductCategory } from '../types'

interface MerchantUploadModalProps {
  open: boolean
  onClose: () => void
}

const categories: { value: ProductCategory; label: string }[] = [
  { value: 'papeleria', label: 'Papelería' },
  { value: 'ferreteria', label: 'Ferretería' },
  { value: 'agroinsumos', label: 'Agroinsumos' },
  { value: 'servicios', label: 'Servicios' },
]

export function MerchantUploadModal({ open, onClose }: MerchantUploadModalProps) {
  const [name, setName] = useState('')
  const [requestType, setRequestType] = useState<'new_business' | 'update_business'>('new_business')
  const [category, setCategory] = useState<ProductCategory>('papeleria')
  const [phoneWhatsapp, setPhoneWhatsapp] = useState('')
  const [address, setAddress] = useState('')
  const [zone, setZone] = useState('Zona Centro')
  const [photoUrl, setPhotoUrl] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ message: string; tone: 'success' | 'error' } | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isSubmitting) onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSubmitting, onClose, open])

  useEffect(() => {
    if (!photoFile) {
      setPreviewUrl('')
      return
    }

    const objectUrl = URL.createObjectURL(photoFile)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [photoFile])

  if (!open) return null

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback(null)

    let shelfPhotos: string[] = []
    const cleanedPhotoUrl = photoUrl.trim()
    if (cleanedPhotoUrl) {
      try {
        const parsedUrl = new URL(cleanedPhotoUrl)
        if (parsedUrl.protocol !== 'https:') {
          setFeedback({ message: 'La liga de la foto debe usar HTTPS.', tone: 'error' })
          return
        }
        shelfPhotos = [parsedUrl.toString()]
      } catch {
        setFeedback({ message: 'Escribe una URL válida para la foto del catálogo.', tone: 'error' })
        return
      }
    }

    setIsSubmitting(true)
    try {
      const source = await submitMerchant({
        requestType,
        name,
        category,
        phoneWhatsapp,
        address,
        zone,
        shelfPhotos,
      })
      setFeedback({
        message:
          source === 'supabase'
            ? '¡Gracias! Recibimos tu solicitud y el equipo revisará los datos antes de publicarlos.'
            : 'Tu solicitud quedó guardada solo en este dispositivo; no se enviará automáticamente al servidor.',
        tone: 'success',
      })
      setName('')
      setRequestType('new_business')
      setPhoneWhatsapp('')
      setAddress('')
      setPhotoUrl('')
      setPhotoFile(null)
    } catch (error) {
      setFeedback({
        message: error instanceof Error ? error.message : 'No se pudo guardar el registro. Intenta de nuevo.',
        tone: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/50 sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="merchant-modal-title"
        className="flex max-h-[94dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl bg-[#f8faf6] shadow-2xl sm:rounded-3xl"
      >
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-900 text-white">
              <Store size={21} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Comercios locales</p>
              <h2 id="merchant-modal-title" className="mt-0.5 text-lg font-extrabold text-slate-900">
                {requestType === 'new_business' ? 'Registra tu negocio' : 'Actualiza tus datos'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Cerrar formulario de comercio"
            className="flex size-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={21} />
          </button>
        </header>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4 overflow-y-auto p-5 sm:p-6">
          <p className="text-sm leading-6 text-slate-600">
            Comparte tus datos para que las personas de Villaflores puedan encontrarte. Revisaremos la solicitud antes de publicarla.
          </p>

          <div>
            <label htmlFor="merchant-request-type" className="mb-1.5 block text-sm font-bold text-slate-800">
              Tipo de solicitud
            </label>
            <select
              id="merchant-request-type"
              value={requestType}
              onChange={(event) => setRequestType(event.target.value as 'new_business' | 'update_business')}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-emerald-600"
            >
              <option value="new_business">Registrar un negocio</option>
              <option value="update_business">Solicitar actualización de datos</option>
            </select>
          </div>

          <div>
            <label htmlFor="merchant-name" className="mb-1.5 block text-sm font-bold text-slate-800">
              Nombre del negocio
            </label>
            <input
              id="merchant-name"
              required
              minLength={2}
              maxLength={120}
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="organization"
              placeholder="Ej. Papelería del Centro"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="merchant-category" className="mb-1.5 block text-sm font-bold text-slate-800">
                Categoría
              </label>
              <select
                id="merchant-category"
                value={category}
                onChange={(event) => setCategory(event.target.value as ProductCategory)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-emerald-600"
              >
                {categories.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="merchant-whatsapp" className="mb-1.5 block text-sm font-bold text-slate-800">
                WhatsApp
              </label>
              <input
                id="merchant-whatsapp"
                type="tel"
                required
                minLength={10}
                maxLength={18}
                value={phoneWhatsapp}
                onChange={(event) => setPhoneWhatsapp(event.target.value)}
                autoComplete="tel"
                placeholder="965 123 4567"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="merchant-address" className="mb-1.5 block text-sm font-bold text-slate-800">
                Dirección
              </label>
              <input
                id="merchant-address"
                required
                minLength={2}
                maxLength={240}
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                autoComplete="street-address"
                placeholder="Calle, avenida o referencia"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div>
              <label htmlFor="merchant-zone" className="mb-1.5 block text-sm font-bold text-slate-800">
                Zona o colonia
              </label>
              <input
                id="merchant-zone"
                required
                minLength={2}
                maxLength={100}
                value={zone}
                onChange={(event) => setZone(event.target.value)}
                placeholder="Ej. Zona Centro"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div>
            <label htmlFor="merchant-photo-url" className="mb-1.5 block text-sm font-bold text-slate-800">
              Foto de estante o catálogo
            </label>
            <input
              id="merchant-photo-url"
              type="url"
              value={photoUrl}
              onChange={(event) => setPhotoUrl(event.target.value)}
              placeholder="Pega una liga HTTPS pública (opcional)"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
            <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-600 transition hover:border-emerald-400 hover:text-emerald-800">
              <ImagePlus size={18} />
              {photoFile ? 'Cambiar imagen para vista previa' : 'Seleccionar imagen para vista previa'}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file && !file.type.startsWith('image/')) {
                    setFeedback({ message: 'Selecciona un archivo de imagen válido.', tone: 'error' })
                    event.target.value = ''
                    return
                  }
                  if (file && file.size > 5 * 1024 * 1024) {
                    setFeedback({ message: 'La imagen de vista previa debe pesar menos de 5 MB.', tone: 'error' })
                    event.target.value = ''
                    return
                  }
                  setPhotoFile(file ?? null)
                }}
              />
            </label>
            {(previewUrl || photoUrl) && (
              <img
                src={previewUrl || photoUrl}
                alt="Vista previa del catálogo del negocio"
                className="mt-3 h-36 w-full rounded-xl bg-slate-100 object-cover"
                onError={(event) => {
                  event.currentTarget.hidden = true
                }}
              />
            )}
            <p className="mt-1.5 text-xs leading-5 text-slate-500">
              El archivo seleccionado solo se previsualiza en este dispositivo. Para adjuntar una foto al registro, pega una URL HTTPS pública.
            </p>
          </div>

          {feedback && (
            <p
              role={feedback.tone === 'error' ? 'alert' : 'status'}
              className={`rounded-xl px-3.5 py-3 text-sm leading-5 ${
                feedback.tone === 'success'
                  ? 'bg-emerald-50 text-emerald-900'
                  : 'bg-red-50 text-red-800'
              }`}
            >
              {feedback.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-900 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-70"
          >
            {isSubmitting && <LoaderCircle size={18} className="animate-spin" />}
            {isSubmitting ? 'Enviando solicitud…' : 'Enviar solicitud de registro'}
          </button>
        </form>
      </section>
    </div>
  )
}

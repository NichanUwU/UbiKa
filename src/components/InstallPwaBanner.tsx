import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const DISMISSED_KEY = 'donde-lo-venden-install-dismissed-v1'

function wasDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISSED_KEY) === 'true'
  } catch (error) {
    console.warn('No se pudo consultar la preferencia de instalación.', error)
    return false
  }
}

export function InstallPwaBanner() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(wasDismissed)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }

    function handleInstalled() {
      setInstallPrompt(null)
      setDismissed(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  async function handleInstall() {
    if (!installPrompt || installing) return
    setInstalling(true)

    try {
      await installPrompt.prompt()
      const choice = await installPrompt.userChoice
      if (choice.outcome === 'accepted') setDismissed(true)
      setInstallPrompt(null)
    } catch (error) {
      console.error('No se pudo mostrar el diálogo de instalación de la PWA.', error)
      setInstallPrompt(null)
    } finally {
      setInstalling(false)
    }
  }

  function handleDismiss() {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISSED_KEY, 'true')
    } catch (error) {
      console.warn('No se pudo guardar la preferencia para ocultar el aviso de instalación.', error)
    }
  }

  if (!installPrompt || dismissed) return null

  return (
    <aside
      role="region"
      aria-label="Instalar aplicación"
      className="fixed bottom-4 left-4 right-4 z-40 mx-auto flex max-w-lg items-center gap-3 rounded-2xl border border-emerald-100 bg-white p-3 shadow-xl sm:bottom-5 sm:p-4"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-900 text-white">
        <Download size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-extrabold text-slate-900">Llévanos en tu pantalla de inicio</p>
        <p className="mt-0.5 text-xs text-slate-500">Instala la app para encontrar lo local más rápido.</p>
      </div>
      <button
        type="button"
        onClick={() => void handleInstall()}
        disabled={installing}
        className="shrink-0 rounded-xl bg-emerald-900 px-3 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-60 sm:px-4 sm:text-sm"
      >
        {installing ? 'Abriendo…' : 'Instalar'}
      </button>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Descartar aviso de instalación"
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
      >
        <X size={17} />
      </button>
    </aside>
  )
}

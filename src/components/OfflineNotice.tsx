import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

export function OfflineNotice() {
  const [isOffline, setIsOffline] = useState(() =>
    typeof navigator !== 'undefined' ? !navigator.onLine : false,
  )

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div
      role="status"
      className="fixed bottom-24 left-4 right-4 z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-lg"
    >
      <WifiOff size={19} className="shrink-0 text-amber-700" />
      <span>
        Estás sin conexión. Puedes seguir explorando el catálogo guardado en este dispositivo.
      </span>
    </div>
  )
}

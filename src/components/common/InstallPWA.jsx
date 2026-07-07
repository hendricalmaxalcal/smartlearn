import { useState, useEffect } from 'react'

export default function InstallPWA() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [showBanner, setShowBanner] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
      setShowBanner(true)
    }

    const installed = () => {
      setInstalled(true)
      setShowBanner(false)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', installed)

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installed)
    }
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setInstalled(true)
      setShowBanner(false)
    }
    setInstallPrompt(null)
  }

  const handleDismiss = () => {
    setShowBanner(false)
    localStorage.setItem('pwa-dismissed', 'true')
  }

  useEffect(() => {
    if (localStorage.getItem('pwa-dismissed')) {
      setShowBanner(false)
    }
  }, [])

  if (!showBanner || installed) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 md:max-w-sm md:left-auto md:right-6 md:bottom-6">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-4">
        <div className="flex items-start gap-3">
          <img
            src="/smartlearn.png"
            alt="SmartLearn"
            className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 text-sm">
              Install SmartLearn
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              Add to your home screen for quick access and offline support
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0 text-lg leading-none"
          >
            ✕
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleDismiss}
            className="flex-1 btn-outline text-sm py-2"
          >
            Not now
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 btn-primary text-sm py-2"
          >
            Install app
          </button>
        </div>
      </div>
    </div>
  )
}
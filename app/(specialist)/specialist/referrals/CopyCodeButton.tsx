'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
    >
      {copied ? (
        <>
          <Check className="w-5 h-5" />
          ¡Copiado!
        </>
      ) : (
        <>
          <Copy className="w-5 h-5" />
          Copiar Código
        </>
      )}
    </button>
  )
}

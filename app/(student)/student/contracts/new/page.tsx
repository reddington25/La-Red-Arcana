import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ContractForm from './ContractForm'

export default function NewContractPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/student/dashboard"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al Dashboard
      </Link>

      <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-8">
        <h1 className="text-3xl font-bold text-white mb-2">Crear Nuevo Contrato</h1>
        <p className="text-gray-400 mb-8">
          Describe tu trabajo académico y recibe contraofertas de especialistas verificados
        </p>

        <ContractForm />
      </div>
    </div>
  )
}

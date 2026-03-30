'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { FileText, Clock, Filter, ArrowUpDown } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { FACULTIES } from '@/lib/constants/academic-hierarchy'

type Contract = {
  id: string
  title: string
  description: string
  tags: string[] // Deprecated
  department: string
  faculty: string
  career: string
  deadline: string | null
  service_type: 'full' | 'review'
  initial_price: number
  created_at: string
  student: any
}

type Props = {
  initialContracts: Contract[]
  specialistDepartment: string
  specialistFaculty: string
  specialistCareer: string
}

type SortOption = 'newest' | 'oldest' | 'price_high' | 'price_low' | 'relevance'
type ViewTab = 'local' | 'faculty' | 'global'

export default function OpportunitiesClient({
  initialContracts,
  specialistDepartment,
  specialistFaculty,
  specialistCareer
}: Props) {
  const [contracts] = useState<Contract[]>(initialContracts)
  const [viewTab, setViewTab] = useState<ViewTab>('local')
  const [globalFacultyFilter, setGlobalFacultyFilter] = useState<string>('all')
  const [serviceTypeFilter, setServiceTypeFilter] = useState<'all' | 'full' | 'review'>('all')
  const [sortBy, setSortBy] = useState<SortOption>('relevance')
  const [showFilters, setShowFilters] = useState(false)

  // Filter and sort contracts
  const filteredContracts = useMemo(() => {
    let filtered = [...contracts]

    // View Tab filtering
    if (viewTab === 'local') {
      filtered = filtered.filter(c => c.department === specialistDepartment && c.faculty === specialistFaculty)
    } else if (viewTab === 'faculty') {
      filtered = filtered.filter(c => c.faculty === specialistFaculty)
    } else if (viewTab === 'global') {
      if (globalFacultyFilter !== 'all') {
        filtered = filtered.filter(c => c.faculty === globalFacultyFilter)
      }
    }

    // Filter by service type
    if (serviceTypeFilter !== 'all') {
      filtered = filtered.filter(contract => contract.service_type === serviceTypeFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'price_high':
          return b.initial_price - a.initial_price
        case 'price_low':
          return a.initial_price - b.initial_price
        case 'relevance':
          // Exact career match = 2, same faculty = 1, other = 0
          const aScore = a.career === specialistCareer ? 2 : (a.faculty === specialistFaculty ? 1 : 0)
          const bScore = b.career === specialistCareer ? 2 : (b.faculty === specialistFaculty ? 1 : 0)
          return bScore - aScore
        default:
          return 0
      }
    })

    return filtered
  }, [contracts, viewTab, globalFacultyFilter, serviceTypeFilter, sortBy, specialistCareer, specialistFaculty, specialistDepartment])

  return (
    <div>
      {/* Tabs */}
      <div className="flex bg-black/50 backdrop-blur rounded-lg p-1 border border-red-500/30 mb-6 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setViewTab('local')}
          className={`flex-1 min-w-[200px] text-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
            viewTab === 'local' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          {specialistDepartment}
        </button>
        <button
          onClick={() => setViewTab('faculty')}
          className={`flex-1 min-w-[200px] text-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
            viewTab === 'faculty' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Toda tu Facultad
        </button>
        <button
          onClick={() => setViewTab('global')}
          className={`flex-1 min-w-[200px] text-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
            viewTab === 'global' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Global
        </button>
      </div>

      {/* Filters and Sort */}
      <div className="mb-6 bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filtros {serviceTypeFilter !== 'all' || (viewTab === 'global' && globalFacultyFilter !== 'all') ? '(Activos)' : ''}
          </button>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-black/50 border border-red-500/30 text-white rounded px-3 py-2 focus:outline-none focus:border-red-500"
            >
              <option value="newest">Más recientes</option>
              <option value="oldest">Más antiguos</option>
              <option value="price_high">Precio mayor</option>
              <option value="price_low">Precio menor</option>
              <option value="relevance">Más relevantes</option>
            </select>
          </div>
        </div>

        {showFilters && (
          <div className="space-y-4 pt-4 border-t border-red-500/30">
            {/* Global Faculty Filter */}
            {viewTab === 'global' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Filtrar por Facultad
                </label>
                <select
                  value={globalFacultyFilter}
                  onChange={(e) => setGlobalFacultyFilter(e.target.value)}
                  className="w-full max-w-sm px-4 py-2 bg-black/50 border border-red-500/30 text-white rounded focus:outline-none focus:border-red-500"
                >
                  <option value="all">Todas las Facultades</option>
                  {FACULTIES.map(fac => (
                    <option key={fac} value={fac}>{fac}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Service Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipo de Servicio
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setServiceTypeFilter('all')}
                  className={`px-4 py-2 rounded transition-colors ${serviceTypeFilter === 'all'
                    ? 'bg-red-500 text-white'
                    : 'bg-black/50 text-gray-400 hover:bg-red-500/20'
                    }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setServiceTypeFilter('full')}
                  className={`px-4 py-2 rounded transition-colors ${serviceTypeFilter === 'full'
                    ? 'bg-red-500 text-white'
                    : 'bg-black/50 text-gray-400 hover:bg-red-500/20'
                    }`}
                >
                  Desarrollo del Proyecto
                </button>
                <button
                  onClick={() => setServiceTypeFilter('review')}
                  className={`px-4 py-2 rounded transition-colors ${serviceTypeFilter === 'review'
                    ? 'bg-red-500 text-white'
                    : 'bg-black/50 text-gray-400 hover:bg-red-500/20'
                    }`}
                >
                  Revisión
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4 text-gray-400">
        {filteredContracts.length} {filteredContracts.length === 1 ? 'oportunidad' : 'oportunidades'}
      </div>

      {/* Contracts Grid */}
      {filteredContracts.length === 0 ? (
        <div className="text-center py-12 bg-black/50 backdrop-blur border border-red-500/30 rounded-lg">
          <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No hay oportunidades disponibles</p>
          <p className="text-gray-500 text-sm mt-2">
            Intenta ajustar los filtros o vuelve más tarde
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredContracts.map(contract => (
            <ContractCard
              key={contract.id}
              contract={contract}
              specialistCareer={specialistCareer}
              specialistFaculty={specialistFaculty}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ContractCard({ contract, specialistCareer, specialistFaculty }: {
  contract: Contract;
  specialistCareer: string;
  specialistFaculty: string;
}) {
  const isExactMatch = contract.career === specialistCareer
  const isFacultyMatch = contract.faculty === specialistFaculty && !isExactMatch

  return (
    <Link
      href={`/specialist/opportunities/${contract.id}`}
      className="block bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6 hover:border-red-500 transition-colors"
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-semibold text-white">{contract.title}</h3>
            {isExactMatch ? (
              <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full font-semibold">
                Tu Carrera
              </span>
            ) : isFacultyMatch ? (
              <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full font-semibold">
                Tu Facultad
              </span>
            ) : null}
          </div>

          <p className="text-gray-400 mb-4 line-clamp-2">
            {contract.description}
          </p>

          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Creado {formatDistanceToNow(new Date(contract.created_at), { addSuffix: true, locale: es })}
            </div>

            {contract.deadline && (
              <div className="flex items-center gap-1 text-red-400">
                <Clock className="w-4 h-4" />
                Límite: {new Date(contract.deadline).toLocaleDateString('es-BO', { 
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                })}
              </div>
            )}

            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              {contract.service_type === 'full' ? 'Desarrollo del Proyecto' : 'Revisión'}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <span className="px-3 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400 border border-purple-500/50">
              📍 {contract.department}
            </span>
            <span className="px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/50">
              🏛️ {contract.faculty}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs ${isExactMatch
                ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                : 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
              }`}>
              🎓 {contract.career}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <div className="text-sm text-gray-400">Precio inicial</div>
            <div className="text-2xl font-bold text-red-400">
              Bs. {contract.initial_price.toFixed(2)}
            </div>
          </div>

          <button className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
            Ver Detalles
          </button>
        </div>
      </div>
    </Link>
  )
}

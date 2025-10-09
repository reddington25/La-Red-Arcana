'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { FileText, Tag, DollarSign, Clock, Filter, ArrowUpDown } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

type Contract = {
  id: string
  title: string
  description: string
  tags: string[]
  service_type: 'full' | 'review'
  initial_price: number
  created_at: string
  student: any
}

type Props = {
  initialContracts: Contract[]
  specialistTags: string[]
}

type SortOption = 'newest' | 'oldest' | 'price_high' | 'price_low' | 'relevance'

export default function OpportunitiesClient({ initialContracts, specialistTags }: Props) {
  const [contracts] = useState<Contract[]>(initialContracts)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [serviceTypeFilter, setServiceTypeFilter] = useState<'all' | 'full' | 'review'>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [showFilters, setShowFilters] = useState(false)
  
  // Get all unique tags from contracts
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    contracts.forEach(contract => {
      contract.tags.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [contracts])
  
  // Filter and sort contracts
  const filteredContracts = useMemo(() => {
    let filtered = [...contracts]
    
    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(contract =>
        contract.tags.some(tag => selectedTags.includes(tag))
      )
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
          // Calculate relevance based on matching tags
          const aMatches = a.tags.filter(tag => specialistTags.includes(tag)).length
          const bMatches = b.tags.filter(tag => specialistTags.includes(tag)).length
          return bMatches - aMatches
        default:
          return 0
      }
    })
    
    return filtered
  }, [contracts, selectedTags, serviceTypeFilter, sortBy, specialistTags])
  
  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }
  
  return (
    <div>
      {/* Filters and Sort */}
      <div className="mb-6 bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filtros {selectedTags.length > 0 && `(${selectedTags.length})`}
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
            {/* Service Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipo de Servicio
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setServiceTypeFilter('all')}
                  className={`px-4 py-2 rounded transition-colors ${
                    serviceTypeFilter === 'all'
                      ? 'bg-red-500 text-white'
                      : 'bg-black/50 text-gray-400 hover:bg-red-500/20'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setServiceTypeFilter('full')}
                  className={`px-4 py-2 rounded transition-colors ${
                    serviceTypeFilter === 'full'
                      ? 'bg-red-500 text-white'
                      : 'bg-black/50 text-gray-400 hover:bg-red-500/20'
                  }`}
                >
                  Trabajo Completo
                </button>
                <button
                  onClick={() => setServiceTypeFilter('review')}
                  className={`px-4 py-2 rounded transition-colors ${
                    serviceTypeFilter === 'review'
                      ? 'bg-red-500 text-white'
                      : 'bg-black/50 text-gray-400 hover:bg-red-500/20'
                  }`}
                >
                  Revisión
                </button>
              </div>
            </div>
            
            {/* Tags Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Materias
              </label>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-red-500 text-white'
                        : 'bg-black/50 text-gray-400 hover:bg-red-500/20'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="text-sm text-red-400 hover:text-red-300"
              >
                Limpiar filtros
              </button>
            )}
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
              specialistTags={specialistTags}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ContractCard({ contract, specialistTags }: { contract: Contract; specialistTags: string[] }) {
  const matchingTags = contract.tags.filter(tag => specialistTags.includes(tag))
  const relevanceScore = (matchingTags.length / contract.tags.length) * 100
  
  return (
    <Link
      href={`/specialist/opportunities/${contract.id}`}
      className="block bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6 hover:border-red-500 transition-colors"
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-semibold text-white">{contract.title}</h3>
            {relevanceScore === 100 && (
              <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full font-semibold">
                100% Match
              </span>
            )}
          </div>
          
          <p className="text-gray-400 mb-4 line-clamp-2">
            {contract.description}
          </p>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDistanceToNow(new Date(contract.created_at), { 
                addSuffix: true,
                locale: es 
              })}
            </div>
            
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              {contract.service_type === 'full' ? 'Trabajo Completo' : 'Revisión'}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {contract.tags.map(tag => (
              <span
                key={tag}
                className={`px-2 py-1 rounded-full text-xs ${
                  matchingTags.includes(tag)
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {tag}
              </span>
            ))}
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

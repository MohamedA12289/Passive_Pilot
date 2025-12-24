'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, Loader2, X, Clock, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface AddressResult {
  formattedAddress: string
  streetAddress: string
  city: string
  state: string
  zipCode: string
  beds?: number
  baths?: number
  sqft?: number
  price?: number
  propertyType?: string
  yearBuilt?: number
  latitude?: number
  longitude?: number
}

interface AddressAutocompleteProps {
  onSelect: (address: AddressResult) => void
  onManualEntry?: () => void
  placeholder?: string
  initialValue?: string
}

const RECENT_SEARCHES_KEY = 'passivePilot_recentSearches'
const MAX_RECENT_SEARCHES = 8

export default function AddressAutocomplete({
  onSelect,
  onManualEntry,
  placeholder = "Enter property address...",
  initialValue = ""
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(initialValue)
  const [results, setResults] = useState<AddressResult[]>([])
  const [recentSearches, setRecentSearches] = useState<AddressResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Load recent searches on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setRecentSearches(parsed)
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error)
    }
  }, [])

  // Debounced search function
  useEffect(() => {
    if (query.length < 3) {
      setResults([])
      // Don't close dropdown if we have recent searches and input is focused
      if (query.length === 0 && recentSearches.length > 0 && document.activeElement === inputRef.current) {
        setShowDropdown(true)
      } else {
        setShowDropdown(false)
      }
      return
    }

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Set new timer for 300ms debounce
    debounceTimer.current = setTimeout(() => {
      searchAddresses(query)
    }, 300)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [query, recentSearches.length])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchAddresses = async (searchQuery: string) => {
    setIsSearching(true)
    try {
      const response = await fetch('/api/rentcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'searchAddresses',
          query: searchQuery
        })
      })

      const data = await response.json()

      if (data.success && data.results) {
        setResults(data.results)
        setShowDropdown(data.results.length > 0)
      } else {
        setResults([])
        setShowDropdown(false)
      }
    } catch (error) {
      console.error('Address search error:', error)
      toast.error('Failed to search addresses')
      setResults([])
      setShowDropdown(false)
    } finally {
      setIsSearching(false)
    }
  }

  const saveToRecentSearches = (address: AddressResult) => {
    try {
      // Remove duplicates and add to front
      const updated = [
        address,
        ...recentSearches.filter(r => r.formattedAddress !== address.formattedAddress)
      ].slice(0, MAX_RECENT_SEARCHES)
      
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
      setRecentSearches(updated)
    } catch (error) {
      console.error('Failed to save recent search:', error)
    }
  }

  const clearRecentSearches = () => {
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY)
      setRecentSearches([])
      toast.success('Recent searches cleared')
    } catch (error) {
      console.error('Failed to clear recent searches:', error)
    }
  }

  const handleSelectAddress = (address: AddressResult) => {
    setQuery(address.formattedAddress)
    setShowDropdown(false)
    setResults([])
    saveToRecentSearches(address)
    onSelect(address)
  }

  const clearInput = () => {
    setQuery('')
    setResults([])
    // Show recent searches when clearing
    if (recentSearches.length > 0) {
      setShowDropdown(true)
    } else {
      setShowDropdown(false)
    }
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const itemList = results.length > 0 ? results : recentSearches
    if (!showDropdown || itemList.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < itemList.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < itemList.length) {
          handleSelectAddress(itemList[selectedIndex])
        }
        break
      case 'Escape':
        setShowDropdown(false)
        break
    }
  }

  const handleFocus = () => {
    if (results.length > 0) {
      setShowDropdown(true)
    } else if (recentSearches.length > 0 && query.length === 0) {
      setShowDropdown(true)
    }
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative group">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
        
        <div className="relative flex items-center">
          <Search 
            size={20} 
            className="absolute left-4 text-amber-400 pointer-events-none"
          />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            placeholder={placeholder}
            className="w-full pl-12 pr-12 py-4 md:py-5 rounded-2xl bg-gradient-to-br from-black/60 to-gray-900/60 border-2 border-white/10 text-white text-base md:text-lg focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 focus:bg-black/80 transition-all font-poppins placeholder:text-gray-500 shadow-inner hover:border-white/20 touch-manipulation"
          />

          {/* Loading or Clear Icon */}
          <div className="absolute right-4">
            {isSearching ? (
              <Loader2 size={20} className="text-amber-400 animate-spin" />
            ) : query.length > 0 ? (
              <button
                onClick={clearInput}
                className="text-gray-400 hover:text-white transition-colors"
                type="button"
              >
                <X size={20} />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Recent Searches Dropdown (shown when no query and has recent searches) */}
      {showDropdown && query.length === 0 && recentSearches.length > 0 && (
        <div className="absolute z-50 w-full mt-2 rounded-2xl bg-black/95 backdrop-blur-xl border-2 border-amber-500/30 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-b border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-amber-400" />
              <p className="text-sm font-semibold text-amber-400 font-montserrat">Recent Searches</p>
            </div>
            <button
              onClick={clearRecentSearches}
              className="text-xs text-gray-400 hover:text-amber-400 transition-colors flex items-center gap-1 touch-manipulation"
              type="button"
            >
              <Trash2 size={14} />
              Clear
            </button>
          </div>

          <div className="max-h-[550px] overflow-y-auto">
            {recentSearches.map((address, index) => (
              <button
                key={index}
                onClick={() => handleSelectAddress(address)}
                className={`w-full px-5 py-5 md:py-6 text-left hover:bg-gradient-to-r hover:from-amber-500/20 hover:to-yellow-500/20 transition-all border-b border-white/5 last:border-0 touch-manipulation active:scale-[0.98] ${
                  index === selectedIndex ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20' : ''
                }`}
                type="button"
              >
                <div className="flex items-start gap-3 md:gap-4">
                  <Clock size={20} className="text-amber-400/70 flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-base md:text-lg font-montserrat truncate">
                      {address.streetAddress}
                    </p>
                    <p className="text-gray-400 text-sm md:text-base font-poppins mt-1">
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    {(address.beds || address.baths || address.sqft) && (
                      <div className="flex items-center gap-3 mt-2 text-xs md:text-sm text-gray-500">
                        {address.beds && <span>{address.beds} beds</span>}
                        {address.baths && <span>{address.baths} baths</span>}
                        {address.sqft && <span>{address.sqft.toLocaleString()} sqft</span>}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results Dropdown */}
      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 rounded-2xl bg-black/95 backdrop-blur-xl border-2 border-amber-500/30 shadow-2xl overflow-hidden">
          <div className="max-h-[550px] overflow-y-auto">
            {results.map((address, index) => (
              <button
                key={index}
                onClick={() => handleSelectAddress(address)}
                className={`w-full px-5 py-5 md:py-6 text-left hover:bg-gradient-to-r hover:from-amber-500/20 hover:to-yellow-500/20 transition-all border-b border-white/5 last:border-0 touch-manipulation active:scale-[0.98] ${
                  index === selectedIndex ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20' : ''
                }`}
                type="button"
              >
                <div className="flex items-start gap-3 md:gap-4">
                  <MapPin size={20} className="text-amber-400 flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-base md:text-lg font-montserrat truncate">
                      {address.streetAddress}
                    </p>
                    <p className="text-gray-400 text-sm md:text-base font-poppins mt-1">
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    {(address.beds || address.baths || address.sqft) && (
                      <div className="flex items-center gap-3 mt-2 text-xs md:text-sm text-gray-500">
                        {address.beds && <span>{address.beds} beds</span>}
                        {address.baths && <span>{address.baths} baths</span>}
                        {address.sqft && <span>{address.sqft.toLocaleString()} sqft</span>}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          {/* Footer */}
          <div className="px-5 py-3 md:py-4 bg-black/50 border-t border-amber-500/20">
            <p className="text-xs md:text-sm text-gray-500 font-poppins text-center">
              💡 <span className="text-amber-400 font-semibold">Powered by RentCast</span> • {results.length} {results.length === 1 ? 'result' : 'results'} found
            </p>
          </div>
        </div>
      )}

      {/* No Results Message - Enhanced for Land Deals */}
      {showDropdown && results.length === 0 && !isSearching && query.length >= 3 && (
        <div className="absolute z-50 w-full mt-2 rounded-2xl bg-black/95 backdrop-blur-xl border-2 border-amber-500/40 shadow-2xl overflow-hidden">
          <div className="px-5 py-5 md:px-6 md:py-6">
            <div className="flex items-start gap-3 mb-4">
              <MapPin className="w-6 h-6 md:w-7 md:h-7 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white text-base md:text-lg font-semibold font-montserrat mb-2">
                  No properties found for "{query}"
                </p>
                <p className="text-gray-400 text-sm md:text-base font-poppins leading-relaxed">
                  Property databases often have limited data for vacant land, rural properties, or newly subdivided lots.
                </p>
              </div>
            </div>
            
            <div className="p-4 md:p-5 rounded-xl bg-gradient-to-r from-amber-600/20 to-yellow-600/20 border-2 border-amber-500/30 mb-4">
              <p className="text-sm md:text-base text-gray-300 font-poppins leading-relaxed mb-3">
                <span className="text-amber-400 font-semibold">💡 Working with land or can't find your property?</span>
              </p>
              <ul className="text-sm md:text-base text-gray-400 space-y-2 ml-4 list-disc font-poppins">
                <li>Try searching with just the street name + city</li>
                <li>Verify the address format (some parcels use APN/PIN instead)</li>
                <li>Or proceed with manual entry below</li>
              </ul>
            </div>

            {onManualEntry && (
              <button
                onClick={() => {
                  setShowDropdown(false)
                  onManualEntry()
                }}
                className="w-full py-4 md:py-5 px-4 md:px-6 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 text-black font-bold text-base md:text-lg rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 touch-manipulation"
                type="button"
              >
                <MapPin className="w-5 h-5 md:w-6 md:h-6" />
                Enter Property Details Manually
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

import { createContext, useContext, useState, useEffect } from 'react'
import { getBrands, getAnalytics } from './api'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [brands, setBrands] = useState([])
  const [selectedBrand, setSelectedBrand] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshBrands = async () => {
    try {
      const data = await getBrands()
      setBrands(data)
      if (data.length > 0 && !selectedBrand) {
        const defaultBrand = data.find(b => b.is_default) || data[0]
        setSelectedBrand(defaultBrand)
      }
    } catch (e) {
      console.error('Failed to load brands:', e)
    }
  }

  const refreshAnalytics = async () => {
    try {
      const data = await getAnalytics()
      setAnalytics(data)
    } catch (e) {
      console.error('Failed to load analytics:', e)
    }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await refreshBrands()
      await refreshAnalytics()
      setLoading(false)
    }
    init()
  }, [])

  return (
    <AppContext.Provider value={{
      brands,
      selectedBrand,
      setSelectedBrand,
      analytics,
      loading,
      refreshBrands,
      refreshAnalytics,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)

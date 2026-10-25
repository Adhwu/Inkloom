import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AppProvider } from './context'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import BrandKnowledge from './pages/BrandKnowledge'
import ContentAuditor from './pages/ContentAuditor'
import CampaignStudio from './pages/CampaignStudio'
import ReviewQueue from './pages/ReviewQueue'
import AuditHistory from './pages/AuditHistory'

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
          <Sidebar />
          <main style={{ flex: 1, overflowY: 'auto' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/brand" element={<BrandKnowledge />} />
              <Route path="/audit" element={<ContentAuditor />} />
              <Route path="/campaign" element={<CampaignStudio />} />
              <Route path="/review" element={<ReviewQueue />} />
              <Route path="/history" element={<AuditHistory />} />
            </Routes>
          </main>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '10px',
              background: '#0f172a',
              color: '#f1f5f9',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
            },
            success: {
              style: { background: '#0f172a', color: '#86efac' }
            },
            error: {
              style: { background: '#0f172a', color: '#fca5a5' }
            },
          }}
        />
      </AppProvider>
    </BrowserRouter>
  )
}

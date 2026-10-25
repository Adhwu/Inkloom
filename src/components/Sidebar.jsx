import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, ShieldCheck, Globe2,
  ClipboardList, History, Settings, Sparkles, ChevronRight,
  Zap
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', section: 'main' },
  { to: '/brand', icon: BookOpen, label: 'Brand Knowledge', section: 'main' },
  { to: '/audit', icon: ShieldCheck, label: 'Content Auditor', section: 'main' },
  { to: '/campaign', icon: Globe2, label: 'Campaign Studio', section: 'main' },
  { to: '/review', icon: ClipboardList, label: 'Review Queue', section: 'workflow' },
  { to: '/history', icon: History, label: 'Audit History', section: 'workflow' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={18} color="white" />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 15, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Inkloom
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 500 }}>
              Sentinel AI
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">Core Modules</div>
        {navItems.filter(i => i.section === 'main').map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={17} />
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div className="nav-section-title" style={{ marginTop: 16 }}>Workflow</div>
        {navItems.filter(i => i.section === 'workflow').map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={17} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        margin: '0 0 8px',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))',
          borderRadius: 10,
          padding: '12px',
          border: '1px solid rgba(99,102,241,0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Zap size={14} color="#818cf8" />
            <span style={{ color: '#818cf8', fontSize: 12, fontWeight: 600 }}>Sentinel AI</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
            Create boldly. Stay on brand.
          </div>
        </div>
      </div>
    </aside>
  )
}

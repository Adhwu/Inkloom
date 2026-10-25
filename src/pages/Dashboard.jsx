import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context'
import { getAnalytics } from '../api'
import {
  ShieldCheck, Globe2, BookOpen, ClipboardList,
  TrendingUp, AlertTriangle, CheckCircle2, Clock,
  ArrowRight, Zap, FileText, BarChart3
} from 'lucide-react'
import { StatusBadge, AIModeTag, EmptyState } from '../components/shared'

function StatCard({ label, value, icon: Icon, color, bg, subtitle }) {
  return (
    <div className="stat-card" style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
          {value}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginTop: 2 }}>{label}</div>
        {subtitle && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{subtitle}</div>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { analytics, selectedBrand, loading, refreshAnalytics } = useApp()
  const navigate = useNavigate()
  const [localAnalytics, setLocalAnalytics] = useState(null)

  useEffect(() => {
    getAnalytics().then(setLocalAnalytics).catch(() => {})
  }, [])

  const data = localAnalytics || analytics

  return (
    <div className="main-content">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">
              Welcome to{' '}
              <span className="gradient-text">Inkloom Sentinel AI</span>
            </h1>
            <p className="page-subtitle">Create boldly. Stay on brand. — Brand governance and content intelligence platform.</p>
          </div>
          {data && <AIModeTag mode={data.ai_mode} />}
        </div>
      </div>

      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f2348 100%)',
        borderRadius: 20,
        padding: '32px 36px',
        marginBottom: 28,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 200, height: 200,
          background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: -30, left: '40%',
          width: 150, height: 150,
          background: 'radial-gradient(circle, rgba(20,184,166,0.2) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Zap size={16} color="#818cf8" />
            <span style={{ color: '#818cf8', fontSize: 12, fontWeight: 600 }}>HACKATHON ROUND 2</span>
          </div>
          <h2 style={{ color: 'white', fontSize: 22, fontWeight: 800, margin: '0 0 10px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Complete Brand Governance & Campaign Intelligence
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, margin: '0 0 20px', lineHeight: 1.6 }}>
            Audit content against brand rules, adapt campaigns for regional audiences, and maintain human approval workflows — all in one platform.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => navigate('/audit')}>
              <ShieldCheck size={16} />
              Audit Content
            </button>
            <button className="btn-secondary" onClick={() => navigate('/campaign')}
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
              <Globe2 size={16} />
              Campaign Studio
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16, marginBottom: 28,
      }}>
        <StatCard
          label="Total Audits"
          value={data?.total_audits ?? '—'}
          icon={ShieldCheck}
          color="#6366f1"
          bg="#f5f3ff"
          subtitle="Content reviews run"
        />
        <StatCard
          label="Pending Review"
          value={data?.pending_review ?? '—'}
          icon={Clock}
          color="#d97706"
          bg="#fffbeb"
          subtitle="Awaiting approval"
        />
        <StatCard
          label="Approved"
          value={data?.approved ?? '—'}
          icon={CheckCircle2}
          color="#16a34a"
          bg="#f0fdf4"
          subtitle="Content approved"
        />
        <StatCard
          label="Active Brands"
          value={data?.total_brands ?? '—'}
          icon={BookOpen}
          color="#14b8a6"
          bg="#f0fdfa"
          subtitle="Brand profiles"
        />
        <StatCard
          label="Campaigns"
          value={data?.total_campaigns ?? '—'}
          icon={Globe2}
          color="#8b5cf6"
          bg="#faf5ff"
          subtitle="Regional campaigns"
        />
        <StatCard
          label="Needs Changes"
          value={data?.needs_changes ?? '—'}
          icon={AlertTriangle}
          color="#dc2626"
          bg="#fef2f2"
          subtitle="Requires revision"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        {/* Top Violations */}
        <div className="content-card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 size={18} color="#6366f1" />
              <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>Top Rule Violations</span>
            </div>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>From stored audit history</span>
          </div>
          <div className="card-body" style={{ padding: '16px 24px' }}>
            {data?.top_violations?.length > 0 ? (
              data.top_violations.map((v, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 0', borderBottom: i < data.top_violations.length - 1 ? '1px solid #f1f5f9' : 'none',
                }}>
                  <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>
                    {v.rule?.replace(/_/g, ' ')}
                  </span>
                  <span style={{
                    background: '#f5f3ff', color: '#6366f1',
                    fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                  }}>
                    {v.count}
                  </span>
                </div>
              ))
            ) : (
              <EmptyState
                icon={BarChart3}
                title="No violations yet"
                description="Run content audits to see rule violation patterns here."
              />
            )}
          </div>
        </div>

        {/* Recent Audits */}
        <div className="content-card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={18} color="#6366f1" />
              <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>Recent Audits</span>
            </div>
            <button onClick={() => navigate('/history')}
              style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={14} />
            </button>
          </div>
          <div className="card-body" style={{ padding: '8px 24px' }}>
            {data?.recent_audits?.length > 0 ? (
              data.recent_audits.map((a, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 0', borderBottom: i < data.recent_audits.length - 1 ? '1px solid #f1f5f9' : 'none',
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Audit #{a.id}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                      {new Date(a.created_at).toLocaleDateString()} ·
                      H:{a.severity_counts?.HIGH || 0} M:{a.severity_counts?.MEDIUM || 0} L:{a.severity_counts?.LOW || 0}
                    </div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))
            ) : (
              <EmptyState
                icon={FileText}
                title="No audits yet"
                description="Run your first content audit to see history here."
              />
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="content-card">
        <div className="card-header">
          <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>Quick Start — Demo Workflow</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[
              {
                step: '1', title: 'Configure Brand', desc: 'Set up brand rules, prohibited phrases, and approved facts.',
                to: '/brand', color: '#6366f1', bg: '#f5f3ff', icon: BookOpen
              },
              {
                step: '2', title: 'Audit Content', desc: 'Paste marketing copy and detect rule violations instantly.',
                to: '/audit', color: '#8b5cf6', bg: '#faf5ff', icon: ShieldCheck
              },
              {
                step: '3', title: 'Adapt Campaign', desc: 'Generate region-specific campaign variants with brand safety.',
                to: '/campaign', color: '#14b8a6', bg: '#f0fdfa', icon: Globe2
              },
              {
                step: '4', title: 'Review & Approve', desc: 'Submit for human review and track approval status.',
                to: '/review', color: '#d97706', bg: '#fffbeb', icon: ClipboardList
              },
            ].map(item => (
              <div key={item.step}
                onClick={() => navigate(item.to)}
                style={{
                  padding: 20, borderRadius: 14, border: '1px solid #f1f5f9',
                  cursor: 'pointer', transition: 'all 0.2s',
                  background: 'white',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <item.icon size={18} color={item.color} />
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: item.color,
                    background: item.bg, padding: '2px 8px', borderRadius: 5,
                  }}>
                    Step {item.step}
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{item.desc}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 12, color: item.color, fontSize: 13, fontWeight: 600 }}>
                  Open <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

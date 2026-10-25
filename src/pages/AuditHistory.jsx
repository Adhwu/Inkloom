import { useState, useEffect } from 'react'
import { listAudits, listCampaigns, getBrands } from '../api'
import { History, Filter, FileText, Globe2, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { StatusBadge, LoadingSpinner, EmptyState, SeverityBadge, FindingCard } from '../components/shared'

function AuditHistoryCard({ item, type }) {
  const [expanded, setExpanded] = useState(false)

  const highCount = item.severity_counts?.HIGH ?? item.audit_findings?.filter(f => f.severity === 'HIGH').length ?? 0
  const medCount = item.severity_counts?.MEDIUM ?? item.audit_findings?.filter(f => f.severity === 'MEDIUM').length ?? 0
  const lowCount = item.severity_counts?.LOW ?? item.audit_findings?.filter(f => f.severity === 'LOW').length ?? 0
  const total = item.audit_findings?.length ?? 0

  return (
    <div className="content-card animate-fade-in-up" style={{ marginBottom: 12 }}>
      <div style={{
        padding: '14px 20px',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
              {type === 'audit' ? `Content Audit #${item.id}` : `Campaign: ${item.target_region} #${item.id}`}
            </span>
            <StatusBadge status={item.status} />
            <span style={{
              fontSize: 11, color: '#94a3b8', background: '#f1f5f9',
              borderRadius: 5, padding: '2px 7px',
            }}>
              {type === 'audit' ? '📄 Audit' : '🌍 Campaign'}
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#64748b', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span>{new Date(item.created_at).toLocaleString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}</span>
            <span>{total} finding(s)</span>
            {highCount > 0 && <span style={{ color: '#dc2626', fontWeight: 600 }}>H:{highCount}</span>}
            {medCount > 0 && <span style={{ color: '#d97706', fontWeight: 600 }}>M:{medCount}</span>}
            {lowCount > 0 && <span style={{ color: '#2563eb', fontWeight: 600 }}>L:{lowCount}</span>}
            {item.reviewer_name && (
              <span>Reviewed by: {item.reviewer_name}</span>
            )}
          </div>
          {/* Preview */}
          <div style={{
            marginTop: 8, fontSize: 12, color: '#475569',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            maxWidth: '90%',
          }}>
            {(item.content_original || item.original_copy || '')?.slice(0, 120)}...
          </div>
        </div>

        <button onClick={() => setExpanded(e => !e)} style={{
          background: 'none', border: '1px solid #e2e8f0', cursor: 'pointer', color: '#6366f1',
          display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600,
          padding: '6px 12px', borderRadius: 8, flexShrink: 0,
        }}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          Details
        </button>
      </div>

      {expanded && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid #f1f5f9' }}>
          {/* Summary */}
          {item.audit_summary && (
            <div style={{
              marginTop: 14, background: '#f8fafc', borderRadius: 10,
              padding: '12px 16px', fontSize: 13, color: '#374151', lineHeight: 1.6,
              marginBottom: 14, borderLeft: '3px solid #6366f1',
            }}>
              <strong>Summary: </strong>{item.audit_summary}
            </div>
          )}

          {/* Reviewer comments */}
          {item.reviewer_comments && (
            <div style={{
              marginBottom: 14, background: '#fffbeb', borderRadius: 10,
              padding: '12px 16px', fontSize: 13, color: '#92400e',
              borderLeft: '3px solid #f59e0b',
            }}>
              💬 <strong>Reviewer:</strong> {item.reviewer_comments}
            </div>
          )}

          {/* Findings */}
          {item.audit_findings?.length > 0 ? (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10 }}>
                Findings ({item.audit_findings.length})
              </div>
              {item.audit_findings.map((f, i) => (
                <FindingCard key={i} finding={f} index={i} />
              ))}
            </div>
          ) : (
            <div style={{
              background: '#f0fdf4', borderRadius: 10, padding: 14,
              color: '#16a34a', fontSize: 13, fontWeight: 600, textAlign: 'center',
            }}>
              ✅ No violations found in this audit
            </div>
          )}

          {/* Campaign extra info */}
          {type === 'campaign' && item.regional_adaptations && (
            <div style={{ marginTop: 14, background: '#f0fdfa', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0f766e', marginBottom: 6 }}>Regional Adaptations</div>
              <div style={{ fontSize: 12, color: '#134e4a', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {item.regional_adaptations}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function AuditHistory() {
  const [audits, setAudits] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [a, c] = await Promise.all([listAudits(), listCampaigns()])
        setAudits(a)
        setCampaigns(c)
      } catch (e) {
        toast.error('Failed to load audit history')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const allItems = [
    ...audits.map(a => ({ ...a, _type: 'audit' })),
    ...campaigns.map(c => ({ ...c, _type: 'campaign' })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  const displayItems = tab === 'all' ? allItems
    : tab === 'audits' ? audits.map(a => ({ ...a, _type: 'audit' }))
    : campaigns.map(c => ({ ...c, _type: 'campaign' }))

  // Summary stats from actual data
  const totalFindings = audits.reduce((sum, a) => sum + (a.audit_findings?.length || 0), 0)
  const highFindings = audits.reduce((sum, a) => sum + (a.severity_counts?.HIGH || 0), 0)
  const approvedCount = [...audits, ...campaigns].filter(i => i.status === 'approved').length

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Audit History</h1>
        <p className="page-subtitle">Complete record of all content reviews, campaign audits, and approval decisions.</p>
      </div>

      {/* Summary stats from actual data */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 14, marginBottom: 24,
      }}>
        {[
          { label: 'Total Reviews', value: audits.length + campaigns.length, color: '#6366f1', bg: '#f5f3ff' },
          { label: 'Total Findings', value: totalFindings, color: '#d97706', bg: '#fffbeb' },
          { label: 'High Severity', value: highFindings, color: '#dc2626', bg: '#fef2f2' },
          { label: 'Approved', value: approvedCount, color: '#16a34a', bg: '#f0fdf4' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: stat.bg, borderRadius: 14, padding: '16px 20px',
            border: `1px solid ${stat.color}22`,
          }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginTop: 2 }}>{stat.label}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>from stored records</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { key: 'all', label: `All (${allItems.length})` },
          { key: 'audits', label: `Content Audits (${audits.length})` },
          { key: 'campaigns', label: `Campaigns (${campaigns.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.15s',
            background: tab === t.key ? '#6366f1' : 'white',
            color: tab === t.key ? 'white' : '#475569',
            border: tab === t.key ? '1.5px solid #6366f1' : '1.5px solid #e2e8f0',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <LoadingSpinner size={32} dark />
        </div>
      ) : displayItems.length === 0 ? (
        <EmptyState
          icon={History}
          title="No audit history yet"
          description="Run content audits or generate campaigns to build your audit history."
        />
      ) : (
        displayItems.map(item => (
          <AuditHistoryCard key={`${item._type}-${item.id}`} item={item} type={item._type} />
        ))
      )}
    </div>
  )
}

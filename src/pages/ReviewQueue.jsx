import { useState, useEffect } from 'react'
import { listAudits, listCampaigns, updateAuditReview, updateCampaignReview, getBrands } from '../api'
import { ClipboardList, CheckCircle2, XCircle, RotateCcw, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { StatusBadge, LoadingSpinner, EmptyState, FindingCard } from '../components/shared'
import { useApp } from '../context'

function ReviewCard({ item, type, onUpdate }) {
  const [expanded, setExpanded] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [comment, setComment] = useState(item.reviewer_comments || '')
  const [reviewerName, setReviewerName] = useState(item.reviewer_name || 'Demo Reviewer')

  const handleAction = async (newStatus) => {
    setSubmitting(true)
    try {
      const data = { status: newStatus, reviewer_name: reviewerName, reviewer_comments: comment }
      if (type === 'audit') await updateAuditReview(item.id, data)
      else await updateCampaignReview(item.id, data)
      onUpdate()
      toast.success(`Status updated to: ${newStatus.replace(/_/g, ' ')}`)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const title = type === 'audit'
    ? `Content Audit #${item.id}`
    : `Campaign: ${item.target_region || 'Regional Campaign'} #${item.id}`

  const highCount = item.severity_counts?.HIGH || (item.audit_findings?.filter(f => f.severity === 'HIGH').length) || 0
  const medCount = item.severity_counts?.MEDIUM || (item.audit_findings?.filter(f => f.severity === 'MEDIUM').length) || 0

  return (
    <div className="content-card animate-fade-in-up" style={{ marginBottom: 14 }}>
      <div style={{
        padding: '16px 24px',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{title}</span>
            <StatusBadge status={item.status} />
            <span style={{ fontSize: 11, color: '#94a3b8', background: '#f1f5f9', borderRadius: 5, padding: '2px 7px' }}>
              {type === 'audit' ? '📄 Content' : '🌍 Campaign'}
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#64748b', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span>Created: {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            {highCount > 0 && <span style={{ color: '#dc2626', fontWeight: 600 }}>⚠ {highCount} High</span>}
            {medCount > 0 && <span style={{ color: '#d97706', fontWeight: 600 }}>• {medCount} Medium</span>}
            {item.reviewer_name && item.reviewer_name !== 'Demo Reviewer' && (
              <span>Reviewer: {item.reviewer_name}</span>
            )}
          </div>
          {/* Content preview */}
          <div style={{
            marginTop: 10, fontSize: 13, color: '#475569',
            background: '#f8fafc', borderRadius: 8, padding: '8px 12px',
            maxHeight: 60, overflow: 'hidden', lineHeight: 1.5,
            borderLeft: '3px solid #e2e8f0',
          }}>
            {(item.content_original || item.original_copy || 'No content preview')?.slice(0, 200)}...
          </div>
          {item.reviewer_comments && (
            <div style={{
              marginTop: 8, fontSize: 12, color: '#64748b',
              fontStyle: 'italic', padding: '6px 12px', background: '#fffbeb', borderRadius: 6,
            }}>
              💬 "{item.reviewer_comments}"
            </div>
          )}
        </div>
        <button onClick={() => setExpanded(e => !e)} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1',
          display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, flexShrink: 0,
        }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {expanded ? 'Collapse' : 'Review'}
        </button>
      </div>

      {expanded && (
        <div style={{ padding: '0 24px 20px', borderTop: '1px solid #f1f5f9', marginTop: 0 }}>
          {/* Findings */}
          {item.audit_findings?.length > 0 && (
            <div style={{ marginTop: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10 }}>
                Audit Findings ({item.audit_findings.length})
              </div>
              {item.audit_findings.slice(0, 3).map((f, i) => (
                <FindingCard key={i} finding={f} index={i} />
              ))}
              {item.audit_findings.length > 3 && (
                <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: '8px 0' }}>
                  +{item.audit_findings.length - 3} more findings
                </div>
              )}
            </div>
          )}

          {/* Review form */}
          <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, marginTop: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MessageSquare size={15} /> Reviewer Decision
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label className="form-label">Reviewer Name</label>
                <input className="form-input" value={reviewerName} onChange={e => setReviewerName(e.target.value)}
                  placeholder="Your name" />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Comments</label>
              <textarea className="form-textarea" value={comment} onChange={e => setComment(e.target.value)}
                placeholder="Add reviewer comments, change requests, or approval notes..." rows={3} />
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => handleAction('approved')}
                disabled={submitting || item.status === 'approved'}
                className="btn-success"
              >
                {submitting ? <LoadingSpinner size={14} /> : <CheckCircle2 size={15} />}
                Approve
              </button>
              <button
                onClick={() => handleAction('needs_changes')}
                disabled={submitting}
                style={{
                  background: '#fff7ed', color: '#ea580c', border: '1.5px solid #fed7aa',
                  borderRadius: 10, padding: '10px 18px', fontWeight: 600, fontSize: 14,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                <RotateCcw size={15} /> Request Changes
              </button>
              <button
                onClick={() => handleAction('rejected')}
                disabled={submitting}
                className="btn-danger"
              >
                <XCircle size={15} /> Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ReviewQueue() {
  const { brands, refreshAnalytics } = useApp()
  const [audits, setAudits] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending_review')
  const [tab, setTab] = useState('all')

  const load = async () => {
    setLoading(true)
    try {
      const [a, c] = await Promise.all([listAudits(), listCampaigns()])
      setAudits(a)
      setCampaigns(c)
    } catch (e) {
      toast.error('Failed to load review queue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleUpdate = () => {
    load()
    refreshAnalytics()
  }

  const filterItems = (items) => {
    if (filter === 'all') return items
    return items.filter(i => i.status === filter)
  }

  const allItems = [
    ...filterItems(audits).map(a => ({ ...a, _type: 'audit' })),
    ...filterItems(campaigns).map(c => ({ ...c, _type: 'campaign' })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  const displayItems = tab === 'all' ? allItems
    : tab === 'audits' ? filterItems(audits).map(a => ({ ...a, _type: 'audit' }))
    : filterItems(campaigns).map(c => ({ ...c, _type: 'campaign' }))

  const countsByStatus = (items) => ({
    all: items.length,
    pending_review: items.filter(i => i.status === 'pending_review').length,
    approved: items.filter(i => i.status === 'approved').length,
    needs_changes: items.filter(i => i.status === 'needs_changes').length,
    draft: items.filter(i => i.status === 'draft').length,
  })

  const counts = countsByStatus([...audits, ...campaigns])

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Review Queue</h1>
        <p className="page-subtitle">Human review and approval workflow for content audits and campaign variants.</p>
      </div>

      {/* Demo notice */}
      <div style={{
        background: '#eff6ff', border: '1px solid #bfdbfe',
        borderRadius: 12, padding: '12px 16px', marginBottom: 20,
        fontSize: 13, color: '#1e40af',
      }}>
        ℹ️ <strong>Demo Workflow:</strong> This review system demonstrates a human approval workflow. In production, this would integrate with enterprise identity and access management.
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: `All (${counts.all})` },
          { key: 'pending_review', label: `Pending (${counts.pending_review})` },
          { key: 'approved', label: `Approved (${counts.approved})` },
          { key: 'needs_changes', label: `Needs Changes (${counts.needs_changes})` },
          { key: 'draft', label: `Draft (${counts.draft})` },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.15s',
            background: filter === f.key ? '#6366f1' : 'white',
            color: filter === f.key ? 'white' : '#475569',
            border: filter === f.key ? '1.5px solid #6366f1' : '1.5px solid #e2e8f0',
          }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Type tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, border: '1.5px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', display: 'inline-flex' }}>
        {[
          { key: 'all', label: 'All Items' },
          { key: 'audits', label: '📄 Audits' },
          { key: 'campaigns', label: '🌍 Campaigns' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '8px 18px', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', background: tab === t.key ? '#f5f3ff' : 'white',
            color: tab === t.key ? '#6366f1' : '#64748b',
            border: 'none', borderRight: '1px solid #e2e8f0',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <LoadingSpinner size={32} dark />
          <div style={{ marginTop: 12, color: '#64748b' }}>Loading review queue...</div>
        </div>
      ) : displayItems.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No items in this queue"
          description="Submit content from the Content Auditor or Campaign Studio to see items here."
        />
      ) : (
        <div>
          {displayItems.map(item => (
            <ReviewCard key={`${item._type}-${item.id}`} item={item} type={item._type} onUpdate={handleUpdate} />
          ))}
        </div>
      )}
    </div>
  )
}

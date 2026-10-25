import { useState } from 'react'
import { useApp } from '../context'
import { runAudit, generateCorrection, updateAuditReview } from '../api'
import { ShieldCheck, AlertTriangle, CheckCircle2, RefreshCw, Copy, Send, ChevronRight, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { FindingCard, LoadingSpinner, StatusBadge, AIModeTag, EmptyState } from '../components/shared'
import { useNavigate } from 'react-router-dom'

const SAMPLE_VIOLATING = `Introducing PureNest UltraClean — the miracle formula that is 100% guaranteed to transform your home!

Our revolutionary product is completely safe for everyone, including babies and pets, with zero side effects. We use no chemicals — just pure goodness that kills 99.9% of all germs instantly.

Made with plant-based ingredients and thoroughly tested, PureNest UltraClean is the best cleaning solution in India. It's clinically proven to outperform every competitor on the market.

Try it today and experience the world's best home care solution. Act now — limited time offer!`

const SAMPLE_CLEAN = `Discover PureNest UltraClean — a powerful home care formula crafted with 98% plant-derived ingredients, dermatologist-tested for your family's peace of mind.

Free from parabens, sulfates, and artificial fragrances, PureNest UltraClean is designed for households that care about what goes into their home environment.

Trusted by households across 12 Indian states, PureNest brings transparency and real results — no hidden ingredients, just thoughtfully formulated care.

Available on leading e-commerce platforms. Explore our range today.`

export default function ContentAuditor() {
  const { brands, refreshAnalytics } = useApp()
  const navigate = useNavigate()
  const [selectedBrandId, setSelectedBrandId] = useState(brands[0]?.id || '')
  const [content, setContent] = useState('')
  const [auditing, setAuditing] = useState(false)
  const [auditResult, setAuditResult] = useState(null)
  const [correcting, setCorrecting] = useState(false)
  const [correctedContent, setCorrectedContent] = useState(null)
  const [showDiff, setShowDiff] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [reviewStatus, setReviewStatus] = useState('')

  const handleAudit = async () => {
    if (!content.trim()) { toast.error('Please enter content to audit'); return }
    if (!selectedBrandId) { toast.error('Please select a brand'); return }
    setAuditing(true)
    setCorrectedContent(null)
    setShowDiff(false)
    try {
      const result = await runAudit({ brand_id: parseInt(selectedBrandId), content })
      setAuditResult(result)
      refreshAnalytics()
      if (result.total_findings === 0) {
        toast.success('✅ Content passed all brand checks!')
      } else if (result.severity_counts?.HIGH > 0) {
        toast.error(`❌ ${result.severity_counts.HIGH} high-severity violation(s) detected`)
      } else {
        toast(`⚠️ ${result.total_findings} finding(s) require review`, { icon: '⚠️' })
      }
    } catch (e) {
      toast.error(e.message)
    } finally {
      setAuditing(false)
    }
  }

  const handleCorrect = async () => {
    if (!auditResult?.id) return
    setCorrecting(true)
    try {
      const result = await generateCorrection(auditResult.id)
      setCorrectedContent(result.corrected_content)
      setShowDiff(true)
      toast.success('Correction generated')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setCorrecting(false)
    }
  }

  const handleReaudit = async () => {
    if (!correctedContent) return
    setContent(correctedContent.split('\n\n[Automated')[0].split('\n\n[Note:')[0])
    setAuditResult(null)
    setCorrectedContent(null)
    setShowDiff(false)
  }

  const handleSubmitReview = async () => {
    if (!auditResult?.id) return
    setSubmitting(true)
    try {
      await updateAuditReview(auditResult.id, {
        status: 'pending_review',
        reviewer_name: 'Demo Reviewer',
        reviewer_comments: 'Submitted for human review from Content Auditor.',
      })
      setReviewStatus('pending_review')
      refreshAnalytics()
      toast.success('Submitted for review!')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const statusConfig = {
    PASS: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: CheckCircle2, label: 'All Checks Passed' },
    FAIL: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: AlertTriangle, label: 'Audit Failed' },
    NEEDS_REVIEW: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: AlertTriangle, label: 'Needs Review' },
    REVIEW_RECOMMENDED: { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: ShieldCheck, label: 'Review Recommended' },
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Content Auditor</h1>
        <p className="page-subtitle">Paste marketing content and run a brand compliance audit instantly.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Input Panel */}
        <div>
          <div className="content-card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>Content Input</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setContent(SAMPLE_VIOLATING)} className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: 12 }}>
                  Load Violating Sample
                </button>
                <button onClick={() => setContent(SAMPLE_CLEAN)} className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: 12 }}>
                  Load Clean Sample
                </button>
              </div>
            </div>
            <div className="card-body">
              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Select Brand</label>
                <select
                  className="form-select"
                  value={selectedBrandId}
                  onChange={e => setSelectedBrandId(e.target.value)}
                >
                  <option value="">-- Choose a brand --</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name}{b.is_default ? ' (Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Marketing Content</label>
                <textarea
                  className="form-textarea"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Paste your marketing copy here to audit against brand guidelines..."
                  rows={12}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>
                  {content.length} characters · {content.split(/\s+/).filter(Boolean).length} words
                </span>
                <button
                  className="btn-primary"
                  onClick={handleAudit}
                  disabled={auditing || !content.trim() || !selectedBrandId}
                >
                  {auditing ? <LoadingSpinner size={16} /> : <ShieldCheck size={16} />}
                  {auditing ? 'Auditing...' : 'Audit Content'}
                </button>
              </div>
            </div>
          </div>

          {/* Actions after audit */}
          {auditResult && (
            <div className="content-card animate-fade-in-up">
              <div className="card-header">
                <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>Actions</span>
                {reviewStatus && <StatusBadge status={reviewStatus} />}
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={handleCorrect} disabled={correcting} className="btn-secondary"
                  style={{ justifyContent: 'center' }}>
                  {correcting ? <LoadingSpinner size={16} dark /> : <RefreshCw size={16} />}
                  {correcting ? 'Generating...' : 'Generate Suggested Correction'}
                </button>
                {correctedContent && (
                  <button onClick={handleReaudit} className="btn-secondary" style={{ justifyContent: 'center' }}>
                    <ShieldCheck size={16} /> Re-Audit Corrected Content
                  </button>
                )}
                <button
                  onClick={handleSubmitReview}
                  disabled={submitting || reviewStatus === 'pending_review'}
                  className="btn-success"
                  style={{ justifyContent: 'center' }}
                >
                  {submitting ? <LoadingSpinner size={16} /> : <Send size={16} />}
                  {submitting ? 'Submitting...' : reviewStatus === 'pending_review' ? '✓ Submitted' : 'Submit for Human Review'}
                </button>
                <button
                  onClick={() => navigate('/review')}
                  style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '4px 0', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  View Review Queue <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div>
          {!auditResult && (
            <div className="content-card" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EmptyState
                icon={ShieldCheck}
                title="Audit results will appear here"
                description="Select a brand, paste your marketing content, and click Audit Content."
              />
            </div>
          )}

          {auditResult && (
            <div className="animate-fade-in-up">
              {/* Status banner */}
              {(() => {
                const cfg = statusConfig[auditResult.overall_status] || statusConfig.NEEDS_REVIEW
                const Icon = cfg.icon
                return (
                  <div style={{
                    background: cfg.bg, border: `1px solid ${cfg.border}`,
                    borderRadius: 14, padding: '16px 20px', marginBottom: 16,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Icon size={22} color={cfg.color} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: cfg.color }}>{cfg.label}</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                          {auditResult.total_findings} finding(s) ·{' '}
                          H:{auditResult.severity_counts?.HIGH || 0} M:{auditResult.severity_counts?.MEDIUM || 0} L:{auditResult.severity_counts?.LOW || 0}
                        </div>
                      </div>
                    </div>
                    <AIModeTag mode={auditResult.ai_mode} />
                  </div>
                )
              })()}

              {/* Summary */}
              <div className="content-card" style={{ marginBottom: 16 }}>
                <div className="card-header">
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>Audit Summary</span>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>Audit #{auditResult.id}</span>
                </div>
                <div className="card-body" style={{ fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
                  {auditResult.audit_summary}
                </div>
              </div>

              {/* Diff view */}
              {showDiff && correctedContent && (
                <div className="content-card" style={{ marginBottom: 16 }}>
                  <div className="card-header">
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>Compare: Original vs Corrected</span>
                  </div>
                  <div className="card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', marginBottom: 6 }}>🔴 Original</div>
                        <div className="diff-original" style={{ fontSize: 12, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                          {content}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', marginBottom: 6 }}>🟢 Corrected</div>
                        <div className="diff-revised" style={{ fontSize: 12, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                          {correctedContent}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Findings */}
              <div className="content-card">
                <div className="card-header">
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                    Detailed Findings ({auditResult.total_findings})
                  </span>
                </div>
                <div className="card-body">
                  {auditResult.audit_findings.length === 0 ? (
                    <div style={{
                      textAlign: 'center', padding: '24px', background: '#f0fdf4',
                      borderRadius: 12, color: '#16a34a',
                    }}>
                      <CheckCircle2 size={32} style={{ marginBottom: 8 }} />
                      <div style={{ fontWeight: 700, fontSize: 15 }}>No violations detected</div>
                      <div style={{ fontSize: 13, color: '#065f46', marginTop: 4 }}>
                        Content aligns with configured brand guidelines.
                      </div>
                    </div>
                  ) : (
                    auditResult.audit_findings.map((finding, i) => (
                      <FindingCard key={i} finding={finding} index={i} />
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

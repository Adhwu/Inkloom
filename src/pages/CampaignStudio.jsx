import { useState } from 'react'
import { useApp } from '../context'
import { createCampaign, updateCampaignReview } from '../api'
import { Globe2, Sparkles, ShieldCheck, Send, Copy, CheckCircle2, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { FindingCard, LoadingSpinner, StatusBadge, AIModeTag, EmptyState } from '../components/shared'

const REGIONS = [
  'Maharashtra', 'Tamil Nadu', 'Karnataka', 'Delhi', 'West Bengal',
  'Kerala', 'Gujarat', 'Punjab', 'Rajasthan', 'Uttar Pradesh',
  'Andhra Pradesh', 'Telangana', 'Odisha', 'Jharkhand', 'Default'
]

const LANGUAGES = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Gujarati', 'Punjabi']

const SAMPLE_BRIEF = `PureNest UltraClean is our flagship home cleaning product made with plant-derived ingredients. We are launching a festive season campaign to reach new customers in the target region. The product is dermatologist-tested and free from harsh chemicals. We want to highlight our eco-friendly packaging and our 8-year track record of trusted home care.`

export default function CampaignStudio() {
  const { brands, refreshAnalytics } = useApp()
  const [form, setForm] = useState({
    brand_id: brands[0]?.id || '',
    original_copy: '',
    target_region: 'Maharashtra',
    target_language: 'English',
    target_audience: '',
    campaign_objective: '',
  })
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [campaignStatus, setCampaignStatus] = useState('')

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleGenerate = async () => {
    if (!form.original_copy.trim()) { toast.error('Please enter a campaign brief or copy'); return }
    if (!form.brand_id) { toast.error('Please select a brand'); return }
    setGenerating(true)
    setResult(null)
    setCampaignStatus('')
    try {
      const data = await createCampaign({ ...form, brand_id: parseInt(form.brand_id) })
      setResult(data)
      refreshAnalytics()
      toast.success('Campaign generated and auto-audited!')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!result?.id) return
    setSubmitting(true)
    try {
      await updateCampaignReview(result.id, {
        status: 'pending_review',
        reviewer_name: 'Demo Reviewer',
        reviewer_comments: 'Campaign submitted for regional compliance review.',
      })
      setCampaignStatus('pending_review')
      refreshAnalytics()
      toast.success('Campaign submitted for review!')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const copyText = (text) => {
    navigator.clipboard.writeText(text).then(() => toast.success('Copied!'))
  }

  const hasHighSeverity = result?.audit_findings?.some(f => f.severity === 'HIGH')

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Regional Campaign Studio</h1>
        <p className="page-subtitle">Generate region-specific campaign variants with automatic brand compliance verification.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20 }}>
        {/* Input Panel */}
        <div>
          <div className="content-card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>Campaign Brief</span>
              <button onClick={() => set('original_copy', SAMPLE_BRIEF)} className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: 12 }}>
                Load Sample
              </button>
            </div>
            <div className="card-body">
              <div style={{ marginBottom: 14 }}>
                <label className="form-label">Brand</label>
                <select className="form-select" value={form.brand_id} onChange={e => set('brand_id', e.target.value)}>
                  <option value="">-- Select brand --</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label className="form-label">Target Region</label>
                  <select className="form-select" value={form.target_region} onChange={e => set('target_region', e.target.value)}>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Language</label>
                  <select className="form-select" value={form.target_language} onChange={e => set('target_language', e.target.value)}>
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label className="form-label">Target Audience</label>
                <input className="form-input" value={form.target_audience} onChange={e => set('target_audience', e.target.value)}
                  placeholder="e.g. Young urban families" />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label className="form-label">Campaign Objective</label>
                <input className="form-input" value={form.campaign_objective} onChange={e => set('campaign_objective', e.target.value)}
                  placeholder="e.g. Festive awareness campaign" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Original Campaign Copy / Brief</label>
                <textarea className="form-textarea" value={form.original_copy} onChange={e => set('original_copy', e.target.value)}
                  placeholder="Describe your product or paste original campaign copy..." rows={8} />
              </div>
              <button className="btn-primary" onClick={handleGenerate} disabled={generating}
                style={{ width: '100%', justifyContent: 'center' }}>
                {generating ? <LoadingSpinner size={16} /> : <Sparkles size={16} />}
                {generating ? 'Generating Campaign...' : 'Generate Campaign'}
              </button>
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div>
          {!result && (
            <div className="content-card" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EmptyState
                icon={Globe2}
                title="Campaign output will appear here"
                description="Fill in the brief and click Generate Campaign. Output is automatically audited against brand rules."
              />
            </div>
          )}

          {result && (
            <div className="animate-fade-in-up">
              {/* Mode and compliance banner */}
              <div style={{
                background: hasHighSeverity ? '#fef2f2' : '#f0fdf4',
                border: `1px solid ${hasHighSeverity ? '#fecaca' : '#bbf7d0'}`,
                borderRadius: 14, padding: '14px 20px', marginBottom: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {hasHighSeverity
                    ? <AlertTriangle size={20} color="#dc2626" />
                    : <CheckCircle2 size={20} color="#16a34a" />}
                  <div>
                    <div style={{ fontWeight: 700, color: hasHighSeverity ? '#dc2626' : '#16a34a', fontSize: 14 }}>
                      {hasHighSeverity ? 'Auto-Audit: Issues Detected' : 'Auto-Audit: Campaign Passed'}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      {result.audit_findings?.length || 0} finding(s) from auto-verification
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', align: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <AIModeTag mode={result.ai_mode || 'deterministic'} />
                  {campaignStatus && <StatusBadge status={campaignStatus} />}
                </div>
              </div>

              {/* Generated Content */}
              <div className="content-card" style={{ marginBottom: 16 }}>
                <div className="card-header">
                  <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>
                    Generated Campaign — {result.target_region}
                  </span>
                  <button onClick={handleSubmitReview} disabled={submitting || campaignStatus === 'pending_review'} className="btn-success" style={{ padding: '8px 16px' }}>
                    {submitting ? <LoadingSpinner size={14} /> : <Send size={14} />}
                    {campaignStatus === 'pending_review' ? '✓ Submitted' : 'Submit for Review'}
                  </button>
                </div>
                <div className="card-body">
                  {/* Headline */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      📰 HEADLINE
                      <button onClick={() => copyText(result.generated_headline)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                        <Copy size={14} />
                      </button>
                    </div>
                    <div style={{
                      fontSize: 20, fontWeight: 800, color: '#0f172a',
                      fontFamily: 'Plus Jakarta Sans, sans-serif', lineHeight: 1.3,
                    }}>
                      {result.generated_headline}
                    </div>
                  </div>

                  {/* Copy */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      📄 CAMPAIGN COPY
                      <button onClick={() => copyText(result.generated_copy)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                        <Copy size={14} />
                      </button>
                    </div>
                    <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                      {result.generated_copy}
                    </div>
                  </div>

                  {/* Social Caption */}
                  <div style={{ marginBottom: 20, background: '#f8fafc', borderRadius: 12, padding: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      📱 SOCIAL CAPTION
                      <button onClick={() => copyText(result.social_caption)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                        <Copy size={14} />
                      </button>
                    </div>
                    <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{result.social_caption}</div>
                  </div>

                  {/* CTA */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', marginBottom: 8 }}>🎯 CALL TO ACTION</div>
                    <div style={{
                      display: 'inline-block',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: 'white', borderRadius: 8,
                      padding: '8px 20px', fontSize: 14, fontWeight: 600,
                    }}>
                      {result.call_to_action}
                    </div>
                  </div>

                  {/* Regional Adaptations */}
                  <div style={{ background: '#f0fdfa', borderRadius: 10, padding: 14, border: '1px solid #99f6e4' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0f766e', marginBottom: 6 }}>🌏 Regional Adaptations Explained</div>
                    <div style={{ fontSize: 12, color: '#134e4a', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                      {result.regional_adaptations}
                    </div>
                  </div>
                </div>
              </div>

              {/* Auto-audit findings */}
              {result.audit_findings?.length > 0 && (
                <div className="content-card">
                  <div className="card-header">
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                      Auto-Audit Findings ({result.audit_findings.length})
                    </span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>Independent verification of generated content</span>
                  </div>
                  <div className="card-body">
                    {result.audit_findings.map((finding, i) => (
                      <FindingCard key={i} finding={finding} index={i} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function SeverityBadge({ severity }) {
  const map = {
    HIGH: { label: 'High', cls: 'badge-high' },
    MEDIUM: { label: 'Medium', cls: 'badge-medium' },
    LOW: { label: 'Low', cls: 'badge-low' },
    PASS: { label: 'Pass', cls: 'badge-pass' },
  }
  const s = map[severity?.toUpperCase()] || { label: severity, cls: 'badge-low' }
  return (
    <span className={s.cls} style={{
      fontSize: 11, fontWeight: 700, padding: '3px 8px',
      borderRadius: 6, display: 'inline-block',
    }}>
      {s.label}
    </span>
  )
}

export function StatusBadge({ status }) {
  const map = {
    draft: 'status-draft',
    pending_review: 'status-pending',
    approved: 'status-approved',
    rejected: 'status-rejected',
    needs_changes: 'status-needs_changes',
  }
  const label = {
    draft: 'Draft',
    pending_review: 'Pending Review',
    approved: 'Approved',
    rejected: 'Rejected',
    needs_changes: 'Needs Changes',
  }
  return (
    <span className={map[status] || 'status-draft'} style={{
      fontSize: 12, fontWeight: 600, padding: '4px 10px',
      borderRadius: 6, display: 'inline-block',
    }}>
      {label[status] || status}
    </span>
  )
}

export function LoadingSpinner({ size = 20, dark = false }) {
  return (
    <span className={`spinner ${dark ? 'spinner-dark' : ''}`} style={{ width: size, height: size }} />
  )
}

export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div style={{
      textAlign: 'center', padding: '60px 20px', color: '#94a3b8',
    }}>
      {Icon && (
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: '#f8fafc', display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 16px',
          border: '2px solid #e2e8f0',
        }}>
          <Icon size={28} color="#cbd5e1" />
        </div>
      )}
      <h3 style={{ color: '#64748b', fontWeight: 600, fontSize: 16, margin: '0 0 8px' }}>{title}</h3>
      <p style={{ fontSize: 14, margin: 0, maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>{description}</p>
    </div>
  )
}

export function AIModeTag({ mode }) {
  if (mode === 'llm') {
    return (
      <span style={{
        background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
        color: '#16a34a',
        border: '1px solid #bbf7d0',
        fontSize: 11, fontWeight: 700, padding: '3px 9px',
        borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4,
      }}>
        ✦ LLM Enhanced
      </span>
    )
  }
  return (
    <span style={{
      background: '#f1f5f9',
      color: '#64748b',
      border: '1px solid #e2e8f0',
      fontSize: 11, fontWeight: 600, padding: '3px 9px',
      borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4,
    }}>
      ⚙ Deterministic Mode
    </span>
  )
}

export function FindingCard({ finding, index }) {
  return (
    <div className={`finding-card ${finding.severity} animate-fade-in-up`}
      style={{ animationDelay: `${index * 0.05}s` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <SeverityBadge severity={finding.severity} />
            <span style={{
              fontSize: 11, fontWeight: 600, color: '#94a3b8',
              background: '#f8fafc', padding: '2px 8px', borderRadius: 5,
              border: '1px solid #e2e8f0',
            }}>
              {finding.finding_type?.replace(/_/g, ' ')}
            </span>
            {finding.source === 'llm' && (
              <span style={{ fontSize: 10, color: '#6366f1', fontWeight: 600 }}>AI ✦</span>
            )}
          </div>
          {finding.flagged_text && (
            <div style={{
              marginTop: 8,
              background: 'rgba(0,0,0,0.04)',
              borderRadius: 6,
              padding: '4px 10px',
              display: 'inline-block',
              fontSize: 13,
              fontFamily: 'monospace',
              color: '#374151',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              "{finding.flagged_text}"
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 3 }}>
          Rule Violated
        </div>
        <div style={{ fontSize: 13, color: '#475569' }}>{finding.rule_violated}</div>
      </div>

      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 3 }}>
          Why it matters
        </div>
        <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>{finding.explanation}</div>
      </div>

      {finding.evidence && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 3 }}>
            Supporting Evidence
          </div>
          <div style={{
            fontSize: 12, color: '#64748b', background: '#f8fafc',
            borderRadius: 6, padding: '6px 10px', lineHeight: 1.5,
            borderLeft: '3px solid #6366f1',
          }}>
            {finding.evidence}
          </div>
        </div>
      )}

      {finding.suggested_correction && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 3 }}>
            Suggested Correction
          </div>
          <div style={{
            fontSize: 13, color: '#059669',
            background: '#f0fdf4',
            borderRadius: 6, padding: '6px 10px',
            lineHeight: 1.5,
          }}>
            {finding.suggested_correction}
          </div>
        </div>
      )}
    </div>
  )
}

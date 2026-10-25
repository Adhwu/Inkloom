import { useState, useEffect } from 'react'
import { useApp } from '../context'
import { createBrand, updateBrand, deleteBrand } from '../api'
import { Plus, Save, Trash2, BookOpen, ChevronDown, ChevronUp, AlertCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { LoadingSpinner, EmptyState } from '../components/shared'

const EMPTY_BRAND = {
  name: '',
  description: '',
  tone: '',
  voice_guidelines: '',
  approved_facts: [],
  required_terminology: [],
  prohibited_claims: [],
  prohibited_phrases: [],
  messaging_guidelines: '',
  target_audience: '',
  content_channels: [],
  is_default: false,
}

function TagInput({ label, value = [], onChange, placeholder }) {
  const [input, setInput] = useState('')
  const add = () => {
    const v = input.trim()
    if (v && !value.includes(v)) {
      onChange([...value, v])
      setInput('')
    }
  }
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i))
  return (
    <div style={{ marginBottom: 16 }}>
      <label className="form-label">{label}</label>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input
          className="form-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder={placeholder}
          style={{ flex: 1 }}
        />
        <button type="button" onClick={add} className="btn-secondary" style={{ padding: '10px 14px', flexShrink: 0 }}>
          <Plus size={16} />
        </button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {value.map((tag, i) => (
          <span key={i} style={{
            background: '#f5f3ff', color: '#6366f1', border: '1px solid #e0e7ff',
            borderRadius: 6, fontSize: 12, fontWeight: 500,
            padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {tag}
            <button onClick={() => remove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#6366f1', display: 'flex' }}>
              <X size={12} />
            </button>
          </span>
        ))}
        {value.length === 0 && (
          <span style={{ fontSize: 12, color: '#94a3b8' }}>No items yet. Type and press Enter to add.</span>
        )}
      </div>
    </div>
  )
}

function BrandForm({ brand, onSave, onCancel, isNew }) {
  const [form, setForm] = useState(brand || EMPTY_BRAND)
  const [saving, setSaving] = useState(false)
  const [sections, setSections] = useState({ basic: true, rules: true, guidelines: false })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const toggleSection = (s) => setSections(prev => ({ ...prev, [s]: !prev[s] }))

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Brand name is required'); return }
    setSaving(true)
    try {
      await onSave(form)
      toast.success(`Brand "${form.name}" ${isNew ? 'created' : 'updated'} successfully!`)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const Section = ({ id, title, children }) => (
    <div style={{ marginBottom: 20 }}>
      <button
        type="button"
        onClick={() => toggleSection(id)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px',
          cursor: 'pointer', marginBottom: sections[id] ? 16 : 0,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{title}</span>
        {sections[id] ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
      </button>
      {sections[id] && <div>{children}</div>}
    </div>
  )

  return (
    <div className="content-card animate-fade-in-up">
      <div className="card-header">
        <span style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>
          {isNew ? 'Create New Brand' : `Edit: ${brand?.name}`}
        </span>
        <div style={{ display: 'flex', gap: 10 }}>
          {onCancel && <button onClick={onCancel} className="btn-secondary" style={{ padding: '8px 16px' }}>Cancel</button>}
          <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ padding: '8px 18px' }}>
            {saving ? <LoadingSpinner size={16} /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save Brand'}
          </button>
        </div>
      </div>
      <div className="card-body">
        <Section id="basic" title="📋 Basic Information">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label className="form-label">Brand Name *</label>
              <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. PureNest Home Care" />
            </div>
            <div>
              <label className="form-label">Tone & Voice</label>
              <input className="form-input" value={form.tone} onChange={e => set('tone', e.target.value)} placeholder="e.g. Warm, trustworthy, scientific" />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Brand Description</label>
            <textarea className="form-textarea" value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Describe your brand, its mission, and core values..." rows={3} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="form-label">Target Audience</label>
              <input className="form-input" value={form.target_audience} onChange={e => set('target_audience', e.target.value)} placeholder="e.g. Urban Indian households, 25-45" />
            </div>
            <div>
              <label className="form-label">Default Brand</label>
              <select className="form-select" value={form.is_default} onChange={e => set('is_default', e.target.value === 'true')}>
                <option value="false">No</option>
                <option value="true">Yes — use as default</option>
              </select>
            </div>
          </div>
        </Section>

        <Section id="rules" title="🚨 Brand Rules & Restrictions">
          <div style={{
            background: '#fffbeb', border: '1px solid #fde68a',
            borderRadius: 10, padding: '10px 14px', marginBottom: 16,
            display: 'flex', alignItems: 'flex-start', gap: 8,
          }}>
            <AlertCircle size={16} color="#d97706" style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 12, color: '#92400e', lineHeight: 1.5 }}>
              These rules power the deterministic audit engine. Every prohibited phrase and claim is checked exactly against content.
            </span>
          </div>
          <TagInput
            label="✅ Approved Product Facts"
            value={form.approved_facts}
            onChange={v => set('approved_facts', v)}
            placeholder="e.g. 98% plant-derived ingredients"
          />
          <TagInput
            label="📌 Required Terminology"
            value={form.required_terminology}
            onChange={v => set('required_terminology', v)}
            placeholder="e.g. dermatologist-tested"
          />
          <TagInput
            label="🚫 Prohibited Claims"
            value={form.prohibited_claims}
            onChange={v => set('prohibited_claims', v)}
            placeholder="e.g. kills 99.9% of all germs"
          />
          <TagInput
            label="⛔ Prohibited Phrases"
            value={form.prohibited_phrases}
            onChange={v => set('prohibited_phrases', v)}
            placeholder="e.g. 100% guaranteed"
          />
        </Section>

        <Section id="guidelines" title="📝 Voice & Messaging Guidelines">
          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Voice Guidelines</label>
            <textarea className="form-textarea" value={form.voice_guidelines} onChange={e => set('voice_guidelines', e.target.value)}
              placeholder="How should the brand speak? What personality should come through?" rows={3} />
          </div>
          <div>
            <label className="form-label">Messaging Guidelines</label>
            <textarea className="form-textarea" value={form.messaging_guidelines} onChange={e => set('messaging_guidelines', e.target.value)}
              placeholder="Key messaging principles, do's and don'ts..." rows={3} />
          </div>
          <div style={{ marginTop: 16 }}>
            <TagInput
              label="Content Channels"
              value={form.content_channels}
              onChange={v => set('content_channels', v)}
              placeholder="e.g. Instagram"
            />
          </div>
        </Section>
      </div>
    </div>
  )
}

export default function BrandKnowledge() {
  const { brands, selectedBrand, setSelectedBrand, refreshBrands } = useApp()
  const [editing, setEditing] = useState(null) // null | 'new' | brand object
  const [deleting, setDeleting] = useState(false)

  const handleSave = async (form) => {
    if (editing === 'new') {
      const created = await createBrand(form)
      await refreshBrands()
      setSelectedBrand(created)
      setEditing(null)
    } else {
      const updated = await updateBrand(editing.id, form)
      await refreshBrands()
      setSelectedBrand(updated)
      setEditing(null)
    }
  }

  const handleDelete = async (brand) => {
    if (!window.confirm(`Delete brand "${brand.name}"? This will also delete all associated audits.`)) return
    setDeleting(true)
    try {
      await deleteBrand(brand.id)
      await refreshBrands()
      setEditing(null)
      toast.success('Brand deleted')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">Brand Knowledge Base</h1>
            <p className="page-subtitle">Configure approved facts, prohibited phrases, tone, and brand rules.</p>
          </div>
          <button className="btn-primary" onClick={() => setEditing('new')}>
            <Plus size={16} />
            New Brand
          </button>
        </div>
      </div>

      {editing === 'new' && (
        <BrandForm
          brand={null}
          isNew={true}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}

      {editing && editing !== 'new' && (
        <BrandForm
          brand={editing}
          isNew={false}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}

      {!editing && (
        <div>
          {brands.length === 0 ? (
            <EmptyState icon={BookOpen} title="No brands configured" description="Create your first brand to start auditing content." />
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {brands.map(brand => (
                <div key={brand.id} className="content-card animate-fade-in-up">
                  <div className="card-header">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontWeight: 700, fontSize: 17, color: '#0f172a' }}>{brand.name}</span>
                        {brand.is_default && (
                          <span style={{
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white',
                            fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 5,
                          }}>DEFAULT</span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                        {brand.tone && <span>Tone: {brand.tone}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => setEditing(brand)} className="btn-secondary" style={{ padding: '8px 16px' }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(brand)} disabled={deleting} className="btn-danger" style={{ padding: '8px 12px' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    {brand.description && (
                      <p style={{ fontSize: 14, color: '#475569', marginTop: 0, marginBottom: 16, lineHeight: 1.6 }}>{brand.description}</p>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                      <RuleSection title="✅ Approved Facts" items={brand.approved_facts} color="#16a34a" bg="#f0fdf4" />
                      <RuleSection title="📌 Required Terms" items={brand.required_terminology} color="#2563eb" bg="#eff6ff" />
                      <RuleSection title="🚫 Prohibited Claims" items={brand.prohibited_claims} color="#dc2626" bg="#fef2f2" />
                      <RuleSection title="⛔ Prohibited Phrases" items={brand.prohibited_phrases} color="#7c3aed" bg="#faf5ff" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RuleSection({ title, items = [], color, bg }) {
  if (!items?.length) return null
  return (
    <div style={{ background: bg, borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {items.map((item, i) => (
          <div key={i} style={{
            fontSize: 12, color: '#374151',
            background: 'rgba(255,255,255,0.7)',
            borderRadius: 5, padding: '3px 8px',
          }}>
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}

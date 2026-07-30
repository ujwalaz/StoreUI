import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import MerchantLayout from '../../components/MerchantLayout'
import merchantApi from '../../api/merchantApi'
import { getMerchantProducts, createProduct, updateProduct, deleteProduct } from '../../api/products'
import { getCategories } from '../../api/categories'
import { useT } from '../../i18n/useT'

const EMPTY = { name: '', description: '', measurementUnit: '', unitSize: '', mrp: '', sellingPrice: '', imageUrl: '', imageUrlBack: '', quantity: '', categoryId: '' }

async function preprocessImage(file) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const MAX = 1600
      let { width: w, height: h } = img
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX }
        else { w = Math.round(w * MAX / h); h = MAX }
      }
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, w, h)
      const imgData = ctx.getImageData(0, 0, w, h)
      const d = imgData.data
      for (let i = 0; i < d.length; i += 4) {
        const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
        const c = Math.min(255, Math.max(0, (gray - 128) * 1.8 + 128))
        d[i] = d[i + 1] = d[i + 2] = c
      }
      ctx.putImageData(imgData, 0, 0)
      URL.revokeObjectURL(url)
      canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.92)
    }
    img.src = url
  })
}

function extractMRP(lines) {
  const patterns = [
    /M\.?R\.?P\.?\s*[:\-]?\s*(?:Rs\.?|INR|₹)?\s*(\d{1,6}(?:[.,]\d{1,2})?)/i,
    /M\.?R\.?P\.?[^\n]{0,50}(?:Rs\.?|INR|₹)\s*(\d{1,6}(?:[.,]\d{1,2})?)/i,
    /Maximum\s+Retail\s+Price\s*[:\-]?\s*(?:Rs\.?|INR|₹)?\s*(\d{1,6}(?:[.,]\d{1,2})?)/i,
    /(?:Rs\.?|₹|INR)\s*(\d{1,6}(?:[.,]\d{1,2})?)/,
    /\bRs\.?\s*(\d{1,6}(?:[.,]\d{1,2})?)/i,
    /\b(\d{1,6}(?:[.,]\d{2})?)\s*\/?\s*(?:Rs\.?|₹|INR)/i,
    /\b(\d{1,6}\.\d{2})\b/,
  ]
  const fullText = lines.map(l => l.text).join('\n')
  for (const pattern of patterns) {
    const match = fullText.match(pattern)
    if (match?.[1]) return match[1].replace(',', '.')
  }
  return null
}

const NAME_SKIP = [
  /M\.?R\.?P|Maximum\s+Retail/i,
  /(?:Rs\.?|₹|INR)\s*\d/,
  /net\s*(wt|weight|qty|content|vol)/i,
  /manufactured|marketed|imported|packed|distributed/i,
  /best\s*before|use\s*by|expiry|mfg|batch/i,
  /fssai|lic\.?\s*no|license|reg\.?\s*no/i,
  /gst|hsn|inclusive|incl\.|all\s*taxes/i,
  /customer\s*care|toll\s*free|www\.|\.com|@/i,
  /^\s*[\d.,\s%gGkKmMlL]+\s*$/,
]

function extractProductName(lines) {
  const candidates = lines.filter(l =>
    l.height > 0 &&
    l.text.length >= 2 &&
    /[a-zA-Z]{2,}/.test(l.text) &&
    !NAME_SKIP.some(p => p.test(l.text))
  )
  if (!candidates.length) return ''
  candidates.sort((a, b) => b.height - a.height)
  return candidates[0].text
}

function unitLabel(p) {
  if (!p.measurementUnit) return ''
  if (p.measurementUnit === 'gm') return p.unitSize ? `${p.unitSize} gm` : 'gm'
  if (p.measurementUnit === 'ltr') return p.unitSize ? `${p.unitSize} ml` : 'ltr'
  if (p.measurementUnit === 'kg') return 'per kg'
  if (p.measurementUnit === 'unit') return 'per unit'
  return p.measurementUnit
}

export default function Products() {
  const t = useT()
  const qc = useQueryClient()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(null)
  const [scanMsg, setScanMsg] = useState({ front: '', back: '' })
  const [search, setSearch] = useState('')
  const frontInputRef = useRef(null)
  const backInputRef = useRef(null)

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['mProducts'], queryFn: getMerchantProducts
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'], queryFn: getCategories
  })

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  )

  const save = useMutation({
    mutationFn: (data) => modal.mode === 'add' ? createProduct(data) : updateProduct(modal.data.id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mProducts'] }); closeModal() },
    onError: (err) => setError(err.response?.data?.message || t('products.errorSave'))
  })

  const remove = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mProducts'] })
  })

  const openAdd = () => { setForm(EMPTY); setError(''); setScanMsg({ front: '', back: '' }); setModal({ mode: 'add' }) }
  const openEdit = (p) => {
    setForm({
      name: p.name,
      description: p.description || '',
      measurementUnit: p.measurementUnit || '',
      unitSize: p.unitSize ?? '',
      mrp: p.mrp,
      sellingPrice: p.sellingPrice,
      imageUrl: p.imageUrl || '',
      imageUrlBack: p.imageUrlBack || '',
      quantity: p.quantity ?? '',
      categoryId: p.categoryId ?? '',
    })
    setError(''); setScanMsg({ front: '', back: '' }); setModal({ mode: 'edit', data: p })
  }
  const closeModal = () => setModal(null)

  const handleScan = (side) => async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setScanning(side)
    setScanMsg(m => ({ ...m, [side]: t('products.scanPreprocess') }))

    const imageField = side === 'front' ? 'imageUrl' : 'imageUrlBack'
    const reader = new FileReader()
    reader.onload = () => setForm(f => ({ ...f, [imageField]: reader.result }))
    reader.readAsDataURL(file)

    try {
      const processedBlob = await preprocessImage(file)
      setScanMsg(m => ({ ...m, [side]: t('products.scanAzure') }))

      const formData = new FormData()
      formData.append('image', processedBlob, 'scan.jpg')

      const { data } = await merchantApi.post('/api/merchant/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const lines = data.lines || []
      const mrp = extractMRP(lines)
      const name = extractProductName(lines)

      if (side === 'front') {
        setForm(f => ({
          ...f,
          ...(name ? { name } : {}),
          ...(mrp && !f.mrp ? { mrp } : {})
        }))
        setScanMsg(m => ({ ...m, front: name ? `✅ ${t('products.scanNameFound', { name })}` : `⚠️ ${t('products.scanNameNotFound')}` }))
      } else {
        setForm(f => ({
          ...f,
          ...(mrp ? { mrp } : {}),
          ...(name && !f.name ? { name } : {})
        }))
        setScanMsg(m => ({ ...m, back: mrp ? `✅ ${t('products.scanMrpFound', { mrp })}` : `⚠️ ${t('products.scanMrpNotFound')}` }))
      }
    } catch (err) {
      setScanMsg(m => ({ ...m, [side]: `⚠️ ${t('products.scanFailed')}` }))
      console.error(err)
    } finally {
      setScanning(null)
      e.target.value = ''
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      mrp: Number(form.mrp),
      sellingPrice: form.sellingPrice ? Number(form.sellingPrice) : Number(form.mrp),
      categoryId: form.categoryId !== '' ? Number(form.categoryId) : null,
      measurementUnit: form.measurementUnit || null,
      unitSize: (form.measurementUnit === 'gm' || form.measurementUnit === 'ltr') && form.unitSize !== ''
        ? Number(form.unitSize) : null,
    }
    if (modal.mode === 'add') payload.quantity = form.quantity !== '' ? Number(form.quantity) : 0
    else delete payload.quantity
    if (payload.sellingPrice > payload.mrp) { setError(t('products.errorPrice')); return }
    save.mutate(payload)
  }

  const handleImage = (field) => (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setForm(f => ({ ...f, [field]: reader.result }))
    reader.readAsDataURL(file)
  }

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  return (
    <MerchantLayout title={t('nav.products')}>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          placeholder={t('products.searchPlaceholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
        <button
          onClick={openAdd}
          className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-indigo-700 hover:to-purple-700"
        >
          {t('products.addBtn')}
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-gray-400">{t('products.loading')}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white py-20 text-center text-gray-400 shadow-sm">
          {search ? t('products.noMatch') : t('products.empty')}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(p => (
            <div key={p.id} className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md">
              {p.imageUrl || p.imageUrlBack ? (
                <div className="flex h-40 overflow-hidden bg-slate-50">
                  {p.imageUrl
                    ? <img src={p.imageUrl} alt="front" className={`object-cover ${p.imageUrlBack ? 'w-1/2' : 'w-full'}`} />
                    : p.imageUrlBack && <div className="w-1/2 bg-gray-100" />}
                  {p.imageUrlBack && (
                    <img src={p.imageUrlBack} alt="back" className={`object-cover ${p.imageUrl ? 'w-1/2 border-l border-white' : 'w-full'}`} />
                  )}
                </div>
              ) : (
                <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 text-xs text-gray-400">{t('products.noImage')}</div>
              )}

              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-gray-800">{p.name || '(Unnamed Product)'}</p>
                    {p.measurementUnit && (
                      <p className="mt-1 text-xs text-gray-400">{unitLabel(p)}</p>
                    )}
                  </div>
                  <StockBadge quantity={p.quantity ?? 0} t={t} />
                </div>

                <p className="mt-3 text-lg font-bold text-gray-900">
                  ₹{Number(p.sellingPrice).toFixed(2)}
                  <span className="ml-2 text-sm font-normal text-gray-400 line-through">₹{Number(p.mrp).toFixed(2)}</span>
                </p>
                <p className="mt-1 text-sm text-gray-500">{t('products.stockOnHand')} {p.quantity ?? 0}</p>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => openEdit(p)}
                    title={t('products.editTitle')}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-200 text-indigo-600 transition hover:bg-indigo-50"
                  >
                    <EditIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => { if (confirm(t('products.confirmDelete'))) remove.mutate(p.id) }}
                    title={t('products.deleteTitle')}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200 text-rose-500 transition hover:bg-rose-50"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{modal.mode === 'add' ? t('products.modalTitleAdd') : t('products.modalTitleEdit')}</h2>
                <p className="text-sm text-gray-500">{t('products.modalSubtitle')}</p>
              </div>
              <button onClick={closeModal} className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {modal.mode === 'add' && (
                <ModalSection title={t('products.sectionScan')}>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <input ref={frontInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleScan('front')} />
                      <button
                        type="button"
                        disabled={scanning !== null}
                        onClick={() => frontInputRef.current?.click()}
                        className="flex w-full flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-indigo-300 py-4 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 disabled:opacity-60"
                      >
                        <span className="text-xl">{scanning === 'front' ? '🔍' : '📷'}</span>
                        <span>{scanning === 'front' ? t('products.scanning') : t('products.frontSide')}</span>
                        <span className="text-xs font-normal text-gray-400">{t('products.frontHint')}</span>
                      </button>
                      {form.imageUrl && <img src={form.imageUrl} className="mt-2 h-24 w-full rounded-2xl object-cover" />}
                      {scanMsg.front && <p className="mt-1 text-xs text-gray-500">{scanMsg.front}</p>}
                    </div>

                    <div>
                      <input ref={backInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleScan('back')} />
                      <button
                        type="button"
                        disabled={scanning !== null}
                        onClick={() => backInputRef.current?.click()}
                        className="flex w-full flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-amber-300 py-4 text-sm font-medium text-amber-600 transition hover:bg-amber-50 disabled:opacity-60"
                      >
                        <span className="text-xl">{scanning === 'back' ? '🔍' : '📷'}</span>
                        <span>{scanning === 'back' ? t('products.scanning') : t('products.backSide')}</span>
                        <span className="text-xs font-normal text-gray-400">{t('products.backHint')}</span>
                      </button>
                      {form.imageUrlBack && <img src={form.imageUrlBack} className="mt-2 h-24 w-full rounded-2xl object-cover" />}
                      {scanMsg.back && <p className="mt-1 text-xs text-gray-500">{scanMsg.back}</p>}
                    </div>
                  </div>
                </ModalSection>
              )}

              <ModalSection title={t('products.sectionDetails')}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <FInput label={t('products.labelName')} value={form.name} onChange={set('name')} required />
                  </div>
                  <div className="sm:col-span-2">
                    <FInput label={t('products.labelDesc')} value={form.description} onChange={set('description')} />
                  </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-gray-700">{t('products.labelUnit')}</label>
                      <select
                        value={form.measurementUnit}
                        onChange={set('measurementUnit')}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      >
                        <option value="">{t('products.unitPlaceholder')}</option>
                        <option value="kg">kg — per kg (vegetables, fruits, fish)</option>
                        <option value="gm">gm — per gram pack (enter size)</option>
                        <option value="ltr">ltr — per ml bottle (enter size in ml)</option>
                        <option value="unit">unit — per piece (1 item)</option>
                      </select>
                    </div>
                    {(form.measurementUnit === 'gm' || form.measurementUnit === 'ltr') && (
                      <FInput
                        label={`${t('products.labelUnitSize')} (${form.measurementUnit === 'ltr' ? 'ml' : 'gm'})`}
                        type="number"
                        min="1"
                        step="1"
                        value={form.unitSize}
                        onChange={set('unitSize')}
                        placeholder={form.measurementUnit === 'ltr' ? 'e.g. 750' : 'e.g. 500'}
                      />
                    )}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">Category</label>
                    <select
                      value={form.categoryId}
                      onChange={set('categoryId')}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="">— No category —</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  {modal.mode === 'add' && (
                    <FInput label={t('products.labelInitialStock')} type="number" min="0" step="1" value={form.quantity} onChange={set('quantity')} />
                  )}
                </div>
              </ModalSection>

              <ModalSection title={t('products.sectionPricing')}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FInput label={t('products.labelMrp')} type="number" step="0.01" min="0" value={form.mrp} onChange={set('mrp')} required />
                  <FInput label={t('products.labelSellingPrice')} type="number" step="0.01" min="0" value={form.sellingPrice} onChange={set('sellingPrice')} />
                </div>
              </ModalSection>

              <ModalSection title={t('products.sectionImages')}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <UploadField label={t('products.labelFront')} onChange={handleImage('imageUrl')} preview={form.imageUrl} tone="file:bg-indigo-50 file:text-indigo-600" />
                  <UploadField label={t('products.labelBack')} onChange={handleImage('imageUrlBack')} preview={form.imageUrlBack} tone="file:bg-amber-50 file:text-amber-600" />
                </div>
              </ModalSection>

              {error && <p className="text-sm text-rose-500">{error}</p>}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button type="button" onClick={closeModal} className="flex-1 rounded-2xl border border-gray-200 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                  {t('products.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={save.isPending}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60"
                >
                  {save.isPending ? t('products.saving') : t('products.saveProduct')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MerchantLayout>
  )
}

function ModalSection({ title, children }) {
  return (
    <section className="rounded-3xl border border-gray-100 bg-slate-50 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">{title}</p>
      {children}
    </section>
  )
}

function UploadField({ label, onChange, preview, tone }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-gray-700">{label}</p>
      <input
        type="file"
        accept="image/*"
        onChange={onChange}
        className={`w-full text-xs text-gray-500 file:mr-2 file:rounded-xl file:border-0 file:px-3 file:py-2 ${tone}`}
      />
      {preview && <img src={preview} alt={label} className="mt-2 h-24 w-full rounded-2xl object-cover" />}
    </div>
  )
}

function FInput({ label, ...props }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</label>
      <input {...props} className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
    </div>
  )
}

function StockBadge({ quantity, t }) {
  if (quantity <= 0) return <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">{t('products.badgeOut')}</span>
  if (quantity <= 5) return <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{t('products.badgeLow')}</span>
  return <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{t('products.badgeIn')}</span>
}

function iconProps(className) {
  return { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', className }
}

function EditIcon({ className }) {
  return (
    <svg {...iconProps(className)}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m4 20 4.5-1 9-9a2.1 2.1 0 0 0-3-3l-9 9L4 20Zm0 0h4.5" />
    </svg>
  )
}

function TrashIcon({ className }) {
  return (
    <svg {...iconProps(className)}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 7h16M10 11v5m4-5v5M6 7l1 12h10l1-12M9 7V4h6v3" />
    </svg>
  )
}
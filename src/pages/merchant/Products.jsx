import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import MerchantLayout from '../../components/MerchantLayout'
import { getMerchantProducts, createProduct, updateProduct, deleteProduct } from '../../api/products'

const EMPTY = { name: '', description: '', sku: '', mrp: '', sellingPrice: '', imageUrl: '', imageUrlBack: '', quantity: '' }

function extractMRP(text) {
  const patterns = [
    /M\.?R\.?P\.?\s*[:\-]?\s*(?:Rs\.?|INR|₹)?\s*(\d{1,6}(?:[.,]\d{1,2})?)/i,
    /Maximum\s+Retail\s+Price\s*[:\-]?\s*(?:Rs\.?|INR|₹)?\s*(\d{1,6}(?:[.,]\d{1,2})?)/i,
    /(?:Rs\.?|₹|INR)\s*(\d{1,6}(?:[.,]\d{1,2})?)/
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match?.[1]) return match[1].replace(',', '.')
  }
  return null
}

function extractProductName(text) {
  const mrpPattern = /M\.?R\.?P|Maximum\s+Retail|(?:Rs\.?|₹|INR)\s*\d/i
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  for (const line of lines) {
    if (line.length < 3) continue
    if (mrpPattern.test(line)) continue
    if (/^[\d.,\s]+$/.test(line)) continue
    return line
  }
  return ''
}

export default function Products() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null) // null | { mode: 'add'|'edit', data }
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(null) // null | 'front' | 'back'
  const [scanMsg, setScanMsg] = useState({ front: '', back: '' })
  const frontInputRef = useRef(null)
  const backInputRef = useRef(null)

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['mProducts'], queryFn: getMerchantProducts
  })

  const save = useMutation({
    mutationFn: (data) => modal.mode === 'add' ? createProduct(data) : updateProduct(modal.data.id, data),
    onSuccess: () => { qc.invalidateQueries(['mProducts']); closeModal() },
    onError: (err) => setError(err.response?.data?.message || 'Failed to save product')
  })

  const remove = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => qc.invalidateQueries(['mProducts'])
  })

  const openAdd = () => { setForm(EMPTY); setError(''); setScanMsg({ front: '', back: '' }); setModal({ mode: 'add' }) }
  const openEdit = (p) => {
    setForm({ name: p.name, description: p.description || '', sku: p.sku || '',
      mrp: p.mrp, sellingPrice: p.sellingPrice, imageUrl: p.imageUrl || '',
      imageUrlBack: p.imageUrlBack || '' })
    setError(''); setScanMsg({ front: '', back: '' }); setModal({ mode: 'edit', data: p })
  }
  const closeModal = () => setModal(null)

  const handleScan = (side) => async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setScanning(side)
    setScanMsg(m => ({ ...m, [side]: 'Loading OCR engine…' }))

    const imageField = side === 'front' ? 'imageUrl' : 'imageUrlBack'
    const reader = new FileReader()
    reader.onload = () => setForm(f => ({ ...f, [imageField]: reader.result }))
    reader.readAsDataURL(file)

    try {
      const { createWorker } = await import('tesseract.js')
      const worker = await createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text')
            setScanMsg(msg => ({ ...msg, [side]: `Recognizing… ${Math.round(m.progress * 100)}%` }))
        }
      })
      const { data } = await worker.recognize(file)
      await worker.terminate()
      const text = data.text.trim()

      // Front: primary target = name, bonus = MRP
      // Back:  primary target = MRP,  bonus = name
      const mrp = extractMRP(text)
      const name = extractProductName(text)

      if (side === 'front') {
        setForm(f => ({
          ...f,
          ...(name && !f.name ? { name } : {}),
          ...(mrp && !f.mrp  ? { mrp }  : {})
        }))
        setScanMsg(m => ({ ...m, front: name ? '✅ Name detected' : '⚠️ Name not found — fill manually' }))
      } else {
        setForm(f => ({
          ...f,
          ...(mrp              ? { mrp }  : {}),
          ...(name && !f.name  ? { name } : {})
        }))
        setScanMsg(m => ({ ...m, back: mrp ? '✅ MRP detected' : '⚠️ MRP not found — fill manually' }))
      }
    } catch (err) {
      setScanMsg(m => ({ ...m, [side]: '⚠️ Scan failed — please fill manually' }))
      console.error(err)
    } finally {
      setScanning(null)
      e.target.value = ''
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = { ...form, mrp: Number(form.mrp), sellingPrice: form.sellingPrice ? Number(form.sellingPrice) : Number(form.mrp) }
    if (modal.mode === 'add') payload.quantity = form.quantity !== '' ? Number(form.quantity) : 0
    else delete payload.quantity
    if (payload.sellingPrice > payload.mrp) { setError('Selling price must be ≤ MRP'); return }
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
    <MerchantLayout title="Products">
      <div className="flex justify-end mb-4">
        <button onClick={openAdd}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition">
          + Add Product
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-400">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {p.imageUrl || p.imageUrlBack ? (
                <div className="flex h-36">
                  {p.imageUrl
                    ? <img src={p.imageUrl} alt="front" className={`object-cover ${p.imageUrlBack ? 'w-1/2' : 'w-full'}`} />
                    : p.imageUrlBack && <div className="w-1/2 bg-gray-100" />}
                  {p.imageUrlBack && (
                    <img src={p.imageUrlBack} alt="back" className={`object-cover ${p.imageUrl ? 'w-1/2 border-l border-white' : 'w-full'}`} />
                  )}
                </div>
              ) : (
                <div className="w-full h-36 bg-gray-100 flex items-center justify-center text-gray-300 text-xs">No Image</div>
              )}
              <div className="p-3">
                <p className="font-semibold text-sm text-gray-800 truncate">{p.name}</p>
                {p.sku && <p className="text-xs text-gray-400">SKU: {p.sku}</p>}
                <p className="text-sm font-bold mt-1">₹{Number(p.sellingPrice).toFixed(2)}
                  <span className="ml-2 text-xs text-gray-400 font-normal line-through">₹{Number(p.mrp).toFixed(2)}</span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Stock: {p.quantity ?? 0}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(p)}
                    className="flex-1 text-xs border border-indigo-300 text-indigo-600 py-1.5 rounded-lg hover:bg-indigo-50 transition">Edit</button>
                  <button onClick={() => { if (confirm('Delete this product?')) remove.mutate(p.id) }}
                    className="flex-1 text-xs border border-red-300 text-red-500 py-1.5 rounded-lg hover:bg-red-50 transition">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="font-bold text-lg mb-4">{modal.mode === 'add' ? 'Add Product' : 'Edit Product'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              {modal.mode === 'add' && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Scan Product Label</p>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Front side */}
                    <div>
                      <input ref={frontInputRef} type="file" accept="image/*" capture="environment"
                        className="hidden" onChange={handleScan('front')} />
                      <button type="button" disabled={scanning !== null}
                        onClick={() => frontInputRef.current?.click()}
                        className="w-full flex flex-col items-center gap-1 border-2 border-dashed border-indigo-300 text-indigo-600 py-3 rounded-xl text-xs font-medium hover:bg-indigo-50 transition disabled:opacity-60">
                        <span className="text-lg">{scanning === 'front' ? '🔍' : '📷'}</span>
                        <span>{scanning === 'front' ? 'Scanning…' : 'Front Side'}</span>
                        <span className="text-gray-400 font-normal">Product Name</span>
                      </button>
                      {form.imageUrl && <img src={form.imageUrl} className="mt-1 h-16 w-full object-cover rounded-lg" />}
                      {scanMsg.front && <p className="text-xs text-center text-gray-500 mt-0.5">{scanMsg.front}</p>}
                    </div>
                    {/* Back side */}
                    <div>
                      <input ref={backInputRef} type="file" accept="image/*" capture="environment"
                        className="hidden" onChange={handleScan('back')} />
                      <button type="button" disabled={scanning !== null}
                        onClick={() => backInputRef.current?.click()}
                        className="w-full flex flex-col items-center gap-1 border-2 border-dashed border-orange-300 text-orange-600 py-3 rounded-xl text-xs font-medium hover:bg-orange-50 transition disabled:opacity-60">
                        <span className="text-lg">{scanning === 'back' ? '🔍' : '📷'}</span>
                        <span>{scanning === 'back' ? 'Scanning…' : 'Back Side'}</span>
                        <span className="text-gray-400 font-normal">MRP Label</span>
                      </button>
                      {form.imageUrlBack && <img src={form.imageUrlBack} className="mt-1 h-16 w-full object-cover rounded-lg" />}
                      {scanMsg.back && <p className="text-xs text-center text-gray-500 mt-0.5">{scanMsg.back}</p>}
                    </div>
                  </div>
                </div>
              )}
              <FInput label="Name *" value={form.name} onChange={set('name')} required />
              <FInput label="Description" value={form.description} onChange={set('description')} />
              <FInput label="SKU" value={form.sku} onChange={set('sku')} />
              <div className="grid grid-cols-2 gap-3">
                <FInput label="MRP (₹) *" type="number" step="0.01" min="0" value={form.mrp} onChange={set('mrp')} required />
                <FInput label="Selling Price (₹)" type="number" step="0.01" min="0" value={form.sellingPrice} onChange={set('sellingPrice')} />
              </div>
              {modal.mode === 'add' && (
                <FInput label="Initial Stock" type="number" min="0" step="1" value={form.quantity} onChange={set('quantity')} />
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {modal.mode === 'add' ? 'Or upload images manually' : 'Product Images'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Front</p>
                    <input type="file" accept="image/*" onChange={handleImage('imageUrl')}
                      className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-600" />
                    {form.imageUrl && <img src={form.imageUrl} alt="front" className="mt-1 h-16 w-full object-cover rounded-lg" />}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Back</p>
                    <input type="file" accept="image/*" onChange={handleImage('imageUrlBack')}
                      className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-orange-50 file:text-orange-600" />
                    {form.imageUrlBack && <img src={form.imageUrlBack} alt="back" className="mt-1 h-16 w-full object-cover rounded-lg" />}
                  </div>
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="flex-1 border border-gray-300 py-2 rounded-xl text-sm hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={save.isPending}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-60">
                  {save.isPending ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MerchantLayout>
  )
}

function FInput({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input {...props} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
    </div>
  )
}

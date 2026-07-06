const STATUS_META = {
  pending: { icon: '⏳', cls: 'bg-amber-100 text-amber-800' },
  confirmed: { icon: '✓', cls: 'bg-blue-100 text-blue-800' },
  shipped: { icon: '🚚', cls: 'bg-purple-100 text-purple-800' },
  delivered: { icon: '✅', cls: 'bg-emerald-100 text-emerald-800' },
  cancelled: { icon: '✗', cls: 'bg-rose-100 text-rose-800' },
}

export default function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { icon: '•', cls: 'bg-gray-100 text-gray-800' }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize ${meta.cls}`}>
      <span>{meta.icon}</span>
      <span>{status}</span>
    </span>
  )
}
import React from 'react'
import { Badge } from '../ui.jsx'

export default function StockBadge({ status }) {
  const config = {
    ok: { variant: 'default', className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100', label: 'OK' },
    bas: { variant: 'secondary', className: 'bg-amber-100 text-amber-700 hover:bg-amber-100', label: 'Stock bas' },
    rupture: { variant: 'destructive', className: 'bg-red-100 text-red-700 hover:bg-red-100', label: 'Rupture' },
  }

  const cfg = config[status] || config.ok

  return (
    <Badge className={cfg.className}>
      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current" />
      {cfg.label}
    </Badge>
  )
}

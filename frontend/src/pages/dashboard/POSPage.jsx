import React from 'react'
import POSInterface from '../../components/pos/POSInterface.jsx'

export default function POSPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Point de Vente</h1>
        <p className="text-slate-500">Effectuez vos ventes rapidement</p>
      </div>
      <POSInterface />
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { BarChart3, Package, AlertTriangle, XCircle } from 'lucide-react'
import api from '../../api/axios.js'
import StatsChart from '../../components/dashboard/StatsChart.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui.jsx'

export default function StatsPage() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/orders/stats/dashboard/')
        setStats(res.data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchStats()
  }, [])

  if (!stats) return <div className="py-20 text-center">Chargement...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Statistiques detaillees</h1>
        <p className="text-slate-500">Analyse complete de votre activite</p>
      </div>

      <StatsChart data={stats.daily_sales} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Stock OK</p>
              <p className="text-2xl font-bold text-slate-900">{stats.stock_status.ok}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Stock bas</p>
              <p className="text-2xl font-bold text-slate-900">{stats.stock_status.low}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Rupture</p>
              <p className="text-2xl font-bold text-slate-900">{stats.stock_status.out}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

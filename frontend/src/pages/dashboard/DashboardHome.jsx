import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, ShoppingBag, Users, TrendingUp } from 'lucide-react'
import api from '../../api/axios.js'
import StatsChart from '../../components/dashboard/StatsChart.jsx'
import RecentOrders from '../../components/dashboard/RecentOrders.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui.jsx'

export default function DashboardHome() {
  const [stats, setStats] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          api.get('/orders/stats/dashboard/'),
          api.get('/orders/'),
        ])
        setStats(statsRes.data)
        setOrders(ordersRes.data.results || ordersRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const summaryCards = [
    { title: 'Revenus 30j', value: stats?.summary?.total_revenue || 0, icon: DollarSign, color: 'bg-emerald-50 text-emerald-600', prefix: '' },
    { title: 'Commandes', value: stats?.summary?.total_orders || 0, icon: ShoppingBag, color: 'bg-indigo-50 text-indigo-600', prefix: '' },
    { title: 'Taux conversion', value: stats?.summary?.conversion_rate || 0, icon: TrendingUp, color: 'bg-amber-50 text-amber-600', prefix: '%' },
    { title: 'Clients', value: stats?.summary?.completed_orders || 0, icon: Users, color: 'bg-rose-50 text-rose-600', prefix: '' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-slate-500">Vue d'ensemble de votre activite</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}>
                  <card.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{card.title}</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {card.prefix === '%' ? `${card.value}%` : `${card.value.toLocaleString()} ${card.prefix}`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {stats?.daily_sales && <StatsChart data={stats.daily_sales} />}
        </div>
        <div>
          <RecentOrders orders={orders} />
        </div>
      </div>
    </div>
  )
}

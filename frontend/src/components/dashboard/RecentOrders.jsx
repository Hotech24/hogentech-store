import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Badge } from '../ui.jsx'

export default function RecentOrders({ orders }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Commandes recentes</CardTitle>
        <Badge variant="outline">{orders.length} total</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {orders.slice(0, 5).map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between rounded-lg border border-slate-100 p-3 transition-colors hover:bg-slate-50"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">{order.order_number}</p>
                <p className="text-xs text-slate-500">{order.customer_name || 'Client'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{order.total.toLocaleString()} FCFA</p>
                <Badge
                  variant={order.status === 'completed' ? 'default' : order.status === 'pending' ? 'secondary' : 'destructive'}
                  className="mt-1 text-[10px]"
                >
                  {order.status_display}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

import React, { useState, useEffect } from 'react'
import { Eye } from 'lucide-react'
import api from '../../api/axios.js'
import {
  Card, CardContent, Badge,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Dialog, DialogHeader, DialogTitle
} from '../../components/ui.jsx'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/')
      setOrders(res.data.results || res.data)
    } catch (err) {
      console.error("Erreur lors de la récupération des commandes :", err)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Commandes</h1>
        <p className="text-slate-500">Historique des ventes</p>
      </div>

      <Card className="bg-white overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N°</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Paiement</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-semibold text-slate-900">{order.order_number}</TableCell>
                  <TableCell>{order.customer_name || 'Client comptant'}</TableCell>
                  <TableCell className="font-medium text-slate-900">
                    {Number(order.total || 0).toLocaleString()} FCFA
                  </TableCell>
                  <TableCell>{order.payment_method_display || order.payment_method || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === 'completed' ? 'default' : order.status === 'pending' ? 'secondary' : 'destructive'}>
                      {order.status_display || order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {order.created_at ? new Date(order.created_at).toLocaleDateString('fr-FR') : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      className="rounded-lg p-2 hover:bg-slate-100 transition-colors"
                      onClick={() => { setSelectedOrder(order); setShowDetail(true); }}
                    >
                      <Eye className="h-4 w-4 text-slate-600" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-500">
                    Aucune commande enregistrée dans l'historique.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showDetail && selectedOrder && (
        <Dialog open={showDetail} onOpenChange={setShowDetail}>
          <DialogHeader>
            <DialogTitle>Commande {selectedOrder.order_number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-6">
            <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div><span className="text-slate-500 font-medium">Client :</span> {selectedOrder.customer_name || 'Client Comptant'}</div>
              <div><span className="text-slate-500 font-medium">Téléphone :</span> {selectedOrder.customer_phone || '—'}</div>
              <div><span className="text-slate-500 font-medium">Paiement :</span> {selectedOrder.payment_method_display || selectedOrder.payment_method || '—'}</div>
              <div><span className="text-slate-500 font-medium">Total :</span> <span className="font-bold text-indigo-600">{Number(selectedOrder.total || 0).toLocaleString()} FCFA</span></div>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-700 font-medium">
                  <tr>
                    <th className="px-4 py-3 text-left">Produit</th>
                    <th className="px-4 py-3 text-center">Qté</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  {Array.isArray(selectedOrder.items) ? (
                    selectedOrder.items.map((item) => (
                      <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium text-slate-900">{item.product_name}</td>
                        <td className="px-4 py-3 text-center bg-slate-50/30">{item.quantity}</td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900">
                          {Number(item.subtotal || 0).toLocaleString()} FCFA
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-center text-slate-400 italic">
                        Aucun article associé ou détails indisponibles.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
}
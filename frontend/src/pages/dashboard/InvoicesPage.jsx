import React, { useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import api from '../../api/axios.js'
import {
  Card, CardContent,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Button
} from '../../components/ui.jsx'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const res = await api.get('/invoices/')
      setInvoices(res.data.results || res.data)
    } catch (err) {
      console.error("Erreur lors de la récupération des factures :", err)
    } finally {
      setLoading(false)
    }
  }

  // Fonction corrigée : utilise l'ID de la facture pour le téléchargement optimisé
  const handleDownload = async (invoiceId, invoiceNumber) => {
    try {
      // Appel vers le nouvel endpoint GET défini dans urls.py
      const res = await api.get(`/invoices/${invoiceId}/download/`, { 
        responseType: 'blob' 
      })
      
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${invoiceNumber}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Erreur téléchargement PDF :", err)
      alert('Erreur lors du téléchargement du PDF. Veuillez réessayer.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Factures</h1>
        <p className="text-slate-500">Gestion et téléchargement des factures PDF</p>
      </div>

      <Card className="rounded-2xl shadow-sm border-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>N° Facture</TableHead>
                <TableHead>Commande</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                    Chargement des factures...
                  </TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                    Aucune facture disponible.
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-slate-900">{invoice.invoice_number}</TableCell>
                    <TableCell className="text-slate-600">Commande #{invoice.order_id || invoice.order}</TableCell>
                    <TableCell className="text-slate-600">
                      {invoice.generated_at 
                        ? new Date(invoice.generated_at).toLocaleDateString('fr-FR')
                        : '—'
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
                        onClick={() => handleDownload(invoice.id, invoice.invoice_number)}
                      >
                        <Download className="mr-2 h-4 w-4" /> PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
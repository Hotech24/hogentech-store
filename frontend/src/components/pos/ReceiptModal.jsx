import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Printer, Download, Loader2, FileText } from 'lucide-react'
import { Button } from '../ui.jsx'
import api from '../../api/axios.js'  // ← Plus besoin de apiDownload

export default function ReceiptModal({ open, onClose, order }) {
  const [previewHtml, setPreviewHtml] = useState('')
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const iframeRef = useRef(null)

  useEffect(() => {
    if (open && order?.id) {
      fetchPreview()
    }
  }, [open, order])

  const fetchPreview = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/invoices/preview/${order.id}/`)
      setPreviewHtml(res.data?.html || res.data)
    } catch (err) {
      console.error("Erreur d'obtention de l'aperçu de facture :", err)
      setPreviewHtml("<div class='p-4 text-red-500'>Impossible de charger l'aperçu du reçu.</div>")
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPdf = async () => {
  setDownloading(true)
  try {
    // 1. POST : Génère et récupère l'URL /media/...
    const res = await api.post(`/invoices/generate/${order.id}/`, {})
    const { download_url, invoice_number } = res.data

    // 2. Ouvre l'URL directement — le serveur sert le fichier brut depuis le disque
    // Pas de vue Django, pas de blob, pas d'Axios, pas d'IDM possible
    window.open(download_url, '_blank')
    
  } catch (err) {
    console.error("Erreur lors de la génération PDF :", err)
    alert('Erreur lors de la génération du PDF.')
  } finally {
    setDownloading(false)
  }
}

  const handlePrint = () => {
    const iframe = iframeRef.current
    if (!iframe) return

    const doc = iframe.contentDocument || iframe.contentWindow.document
    doc.open()
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Facture ${order?.order_number || ''}</title>
          <style>
            body { margin: 0; padding: 10px; font-family: monospace; }
            @media print { @page { margin: 0; } body { padding: 0; } }
          </style>
        </head>
        <body>
          ${previewHtml}
          <script>
            window.onload = function() { window.focus(); window.print(); }
          </script>
        </body>
      </html>
    `)
    doc.close()
  }

  if (!order) return null

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative z-50 w-full max-w-3xl overflow-hidden rounded-3xl border border-white/40 bg-white/80 shadow-2xl backdrop-blur-xl flex flex-col max-h-[85vh]"
          >
            {/* Header du Modal */}
            <div className="flex flex-col gap-4 border-b border-slate-200/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between bg-white/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Aperçu du document</h2>
                  <p className="text-xs text-slate-500 font-medium">Commande : <span className="font-mono text-indigo-600 font-bold">{order.order_number || `#${order.id}`}</span></p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold h-9" onClick={handlePrint} disabled={loading}>
                  <Printer className="mr-2 h-3.5 w-3.5 text-slate-500" />
                  Imprimer ticket
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold h-9" onClick={handleDownloadPdf} disabled={loading || downloading}>
                  {downloading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-2 h-3.5 w-3.5 text-slate-500" />}
                  Livrable PDF
                </Button>
                <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 text-slate-400 hover:text-slate-600" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Contenu */}
            <div className="flex-1 overflow-y-auto bg-slate-100/60 p-6 shadow-inner min-h-[350px] flex items-start justify-center">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 w-full">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-2" />
                  <p className="text-xs font-medium">Interrogation du serveur Django...</p>
                </div>
              ) : (
                <div
                  className="w-full max-w-[210mm] rounded-2xl bg-white p-4 shadow-sm border border-slate-200/50 overflow-hidden prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              )}
            </div>
          </motion.div>

          <iframe
            ref={iframeRef}
            className="pointer-events-none absolute hidden h-0 w-0 border-0"
            title="Invoice Print Port"
          />
        </div>
      )}
    </AnimatePresence>
  )
}
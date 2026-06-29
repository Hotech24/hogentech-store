import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, Printer, Image } from 'lucide-react'
import api from '../../api/axios.js'
import { Button, Input, Badge } from '../ui.jsx'
import ReceiptModal from './ReceiptModal.jsx'

export default function POSInterface() {
  const [products, setProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState([])
  const [customer, setCustomer] = useState({ name: '', phone: '' })
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [loading, setLoading] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastOrder, setLastOrder] = useState(null)

  // URL de base pour reconstruire les liens d'images si l'API envoie des chemins relatifs
  const baseURL = api.defaults.baseURL?.replace('/api', '') || 'http://127.0.0.1:8000'

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products/')
      setProducts(res.data.results || res.data)
    } catch (err) {
      console.error("Erreur lors du chargement des produits POS :", err)
    }
  }

  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      
      if (existing) {
        // Bloquer l'ajout si on tente de dépasser le stock disponible
        if (existing.quantity >= product.stock_quantity) {
          alert(`Alerte Stock : Impossible d'ajouter plus de ${product.stock_quantity} unité(s).`)
          return prev
        }
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      
      // Si le produit n'est pas encore dans le panier, vérifier s'il reste du stock
      if (product.stock_quantity <= 0) {
        alert("Ce produit est en rupture de stock.")
        return prev
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const updateQty = (id, delta) => {
    // Retrouver le produit original dans le catalogue pour connaître la limite de stock
    const originalProduct = products.find((p) => p.id === id)
    const maxStock = originalProduct ? originalProduct.stock_quantity : 999

    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta
            if (nextQty > maxStock) {
              alert(`Action impossible : Le stock disponible est de ${maxStock} unité(s).`)
              return item
            }
            return { ...item, quantity: nextQty }
          }
          return item
        })
        .filter((item) => item.quantity > 0)
    )
  }

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const cartTotal = cart.reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0)

  const handleCheckout = async () => {
    if (cart.length === 0) return
    setLoading(true)
    try {
      const res = await api.post('/orders/', {
        customer_name: customer.name || 'Client Comptant',
        customer_phone: customer.phone,
        payment_method: paymentMethod,
        items: cart.map((item) => ({ product_id: item.id, quantity: item.quantity })),
      })
      setLastOrder(res.data)
      setShowReceipt(true)
      setCart([])
      setCustomer({ name: '', phone: '' })
      fetchProducts() // Recharger les produits pour mettre à jour les stocks dans l'UI du POS
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur lors de la validation de la vente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6 overflow-hidden">
      {/* Product Grid Container */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-sm">
        <div className="border-b border-slate-100 p-4 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Rechercher un produit au catalogue..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto p-4 sm:grid-cols-3 lg:grid-cols-4 content-start">
          {filteredProducts.map((product) => {
            const rawImage = product.image || product.image_url
            const productImgUrl = rawImage 
              ? (rawImage.startsWith('http') ? rawImage : `${baseURL}${rawImage}`)
              : null

            return (
              <motion.button
                key={product.id}
                whileHover={product.stock_quantity > 0 ? { scale: 1.02 } : {}}
                whileTap={product.stock_quantity > 0 ? { scale: 0.98 } : {}}
                onClick={() => addToCart(product)}
                disabled={product.stock_quantity === 0}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition-shadow hover:shadow-md disabled:opacity-40 disabled:bg-slate-50 cursor-pointer disabled:cursor-not-allowed h-fit"
              >
                {productImgUrl ? (
                  <img
                    src={productImgUrl}
                    alt={product.name}
                    className="mb-3 h-24 w-full rounded-lg object-cover bg-slate-50"
                  />
                ) : (
                  <div className="mb-3 flex h-24 w-full items-center justify-center rounded-lg bg-slate-100 text-slate-300">
                    <Image className="h-6 w-6" />
                  </div>
                )}
                <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">{product.name}</h3>
                <p className="text-xs font-bold text-indigo-600 mt-0.5">{Number(product.price || 0).toLocaleString()} FCFA</p>
                <Badge
                  variant={product.stock_quantity > 10 ? 'default' : product.stock_quantity > 0 ? 'secondary' : 'destructive'}
                  className="mt-2 w-fit text-[10px] tracking-wide"
                >
                  {product.stock_quantity > 0 ? `${product.stock_quantity} disponible(s)` : 'Rupture'}
                </Badge>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Right Column: Actions and Cart */}
      <div className="flex w-96 flex-col gap-4 h-full overflow-hidden">
        {/* Glassmorphism Cart Panel */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm backdrop-blur-xl">
          <h2 className="mb-3 text-base font-bold text-slate-900 flex items-center justify-between">
            <span>Panier en cours</span>
            <Badge variant="outline" className="bg-white">{cart.length} réf</Badge>
          </h2>
          
          <div className="flex-1 space-y-2 overflow-y-auto pr-1">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white p-2.5 shadow-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                    <p className="text-xs font-medium text-indigo-600">{Number(item.price || 0).toLocaleString()} FCFA</p>
                  </div>
                  <div className="flex items-center border border-slate-200 rounded-md p-0.5 bg-slate-50 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={() => updateQty(item.id, -1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={() => updateQty(item.id, 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 flex-shrink-0" onClick={() => removeFromCart(item.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {cart.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center py-12 text-slate-400">
                <p className="text-sm">Sélectionnez des articles à gauche pour remplir le ticket de caisse.</p>
              </div>
            )}
          </div>

          <div className="mt-3 border-t border-slate-200 pt-3">
            <div className="flex justify-between text-base font-bold text-slate-900">
              <span>Net à payer</span>
              <span className="text-indigo-600">{cartTotal.toLocaleString()} FCFA</span>
            </div>
          </div>
        </div>

        {/* Customer Info & Payment Actions Panel */}
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm backdrop-blur-xl space-y-3 flex-shrink-0">
          <div className="space-y-2">
            <Input
              placeholder="Nom du client (Optionnel)"
              value={customer.name}
              className="bg-white"
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            />
            <Input
              placeholder="N° de téléphone"
              value={customer.phone}
              className="bg-white"
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'cash', icon: Banknote, label: 'Espèce' },
              { id: 'card', icon: CreditCard, label: 'Carte' },
              { id: 'mobile', icon: Smartphone, label: 'Mobile' },
            ].map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id)}
                className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-xs font-medium transition-all cursor-pointer ${
                  paymentMethod === method.id
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <method.icon className="h-4 w-4" />
                {method.label}
              </button>
            ))}
          </div>

          <Button
            className="w-full font-semibold gap-2"
            size="lg"
            disabled={cart.length === 0 || loading}
            onClick={handleCheckout}
          >
            <Printer className="h-4 w-4" />
            {loading ? 'Traitement en cours...' : 'Valider & Imprimer'}
          </Button>
        </div>
      </div>

      {/* Modal du reçu d'achat */}
      <ReceiptModal open={showReceipt} onClose={() => setShowReceipt(false)} order={lastOrder} />
    </div>
  )
}
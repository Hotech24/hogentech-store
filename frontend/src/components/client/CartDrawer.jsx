import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import { useCart } from '../../context/CartContext.jsx'
import { Button, Badge, Separator } from '../ui.jsx'
import { useNavigate } from 'react-router-dom'

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, total, count, updateQuantity, removeItem } = useCart()
  const navigate = useNavigate()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-slate-600" />
                <h2 className="text-lg font-semibold text-slate-900">Votre panier</h2>
                <Badge variant="secondary">{count}</Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-slate-400">
                  <ShoppingBag className="mb-4 h-16 w-16 opacity-20" />
                  <p className="text-sm">Votre panier est vide</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="flex gap-4 rounded-xl border border-slate-100 p-3"
                      >
                        {item.image_url && (
                          <img src={item.image_url} alt={item.name} className="h-20 w-20 rounded-lg object-cover" />
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-900">{item.name}</h3>
                          <p className="text-sm text-slate-500">{item.price.toLocaleString()} FCFA</p>
                          <div className="mt-2 flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="ml-auto h-7 w-7 text-red-500" onClick={() => removeItem(item.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-slate-100 p-6">
                <div className="mb-4 flex justify-between text-lg font-bold text-slate-900">
                  <span>Total</span>
                  <span>{total.toLocaleString()} FCFA</span>
                </div>
                <Button className="w-full" size="lg" onClick={() => { setIsOpen(false); navigate('/checkout') }}>
                  Passer la commande
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

import React from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, ArrowRight, Trash2 } from 'lucide-react'
import api from '../../api/axios.js'
import { useCart } from '../../context/CartContext.jsx'
import { Button, Card, CardContent, Separator } from '../../components/ui.jsx'

export default function CartPage() {
  const { items, total, updateQuantity, removeItem } = useCart()
  const navigate = useNavigate()

  // URL de base pour reconstruire les liens d'images si l'API envoie des chemins relatifs
  const baseURL = api.defaults.baseURL?.replace('/api', '') || 'http://127.0.0.1:8000'

  // Fonction pour retourner à l'accueil et scroller vers les produits
  const handleContinueShopping = () => {
    navigate('/')
    setTimeout(() => {
      document.getElementById('produits-section')?.scrollIntoView({ behavior: 'smooth' })
    }, 300)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Votre panier</h1>

      {items.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-20 bg-white">
          <ShoppingBag className="h-16 w-16 text-slate-300" />
          <p className="mt-4 text-lg font-medium text-slate-500">Votre panier est vide</p>
          <Button className="mt-6" onClick={handleContinueShopping}>
            Continuer les achats
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Liste des articles */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, i) => {
              // Récupération et sécurisation de l'URL de l'image
              const rawImage = item.image || item.image_url
              const itemImageUrl = rawImage 
                ? (rawImage.startsWith('http') ? rawImage : `${baseURL}${rawImage}`)
                : null

              const itemPrice = Number(item.price || 0)

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="overflow-hidden bg-white">
                    <CardContent className="flex flex-col sm:flex-row gap-4 p-4 items-start sm:items-center">
                      {/* Image du produit */}
                      {itemImageUrl ? (
                        <img src={itemImageUrl} alt={item.name} className="h-24 w-24 rounded-lg object-cover bg-slate-50 flex-shrink-0" />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-slate-100 text-slate-300 flex-shrink-0">
                          <ShoppingBag className="h-8 w-8" />
                        </div>
                      )}

                      {/* Infos et contrôles */}
                      <div className="flex-1 w-full">
                        <h3 className="font-semibold text-slate-900 line-clamp-1">{item.name}</h3>
                        <p className="text-sm font-medium text-indigo-600 mt-0.5">{itemPrice.toLocaleString()} FCFA</p>
                        
                        <div className="mt-3 flex items-center gap-2">
                          <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="ml-auto text-red-500 hover:text-red-600 hover:bg-red-50 gap-1" 
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Supprimer</span>
                          </Button>
                        </div>
                      </div>

                      {/* Sous-total par article */}
                      <div className="text-right sm:pl-4 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 mt-2 sm:mt-0 flex sm:flex-col justify-between sm:justify-center items-center sm:items-end">
                        <span className="text-xs text-slate-400 sm:hidden">Sous-total :</span>
                        <p className="font-bold text-slate-900">{(itemPrice * item.quantity).toLocaleString()} FCFA</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Résumé de la commande */}
          <div>
            <Card className="sticky top-24 bg-white">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-slate-900">Résumé de la commande</h3>
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Sous-total</span>
                    <span className="font-medium text-slate-900">{Number(total || 0).toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Livraison</span>
                    <span className="text-green-600 font-medium">Gratuite</span>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex justify-between text-lg font-bold text-slate-900">
                  <span>Total</span>
                  <span className="text-indigo-600">{Number(total || 0).toLocaleString()} FCFA</span>
                </div>
                
                <Button className="mt-6 w-full gap-2" size="lg">
                  Passer la commande <ArrowRight className="h-4 w-4" />
                </Button>

                <button 
                  onClick={handleContinueShopping}
                  className="mt-4 w-full text-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  ou continuer vos achats
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
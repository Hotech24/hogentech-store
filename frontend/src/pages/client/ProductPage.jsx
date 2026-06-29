import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingCart, ArrowLeft, Minus, Plus, Check } from 'lucide-react'
import api from '../../api/axios.js'
import { useCart } from '../../context/CartContext.jsx'
import { Button, Badge, Separator } from '../../components/ui.jsx'

export default function ProductPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [activeImage, setActiveImage] = useState('')
  const { addItem } = useCart()
  const navigate = useNavigate()

  // URL de base pour reconstruire les liens d'images si l'API envoie des chemins relatifs
  const baseURL = api.defaults.baseURL?.replace('/api', '') || 'http://127.0.0.1:8000'

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${slug}/`)
        setProduct(res.data)
        
        // Initialiser l'image principale active
        if (res.data.image) {
          setActiveImage(res.data.image.startsWith('http') ? res.data.image : `${baseURL}${res.data.image}`)
        } else if (res.data.image_url) {
          setActiveImage(res.data.image_url.startsWith('http') ? res.data.image_url : `${baseURL}${res.data.image_url}`)
        }
      } catch (err) {
        console.error("Erreur lors de la récupération du produit :", err)
      }
    }
    fetchProduct()
  }, [slug, baseURL])

  const handleAddToCart = () => {
    if (!product) return
    addItem(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (!product) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  // Construction d'un tableau contenant l'image principale + les images de la galerie Django
  const allImages = []
  if (product.image) allImages.push(product.image.startsWith('http') ? product.image : `${baseURL}${product.image}`)
  else if (product.image_url) allImages.push(product.image_url.startsWith('http') ? product.image_url : `${baseURL}${product.image_url}`)

  if (Array.isArray(product.images)) {
    product.images.forEach((imgObj) => {
      const url = imgObj.image || imgObj.image_url
      if (url) {
        allImages.push(url.startsWith('http') ? url : `${baseURL}${url}`)
      }
    })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Button variant="ghost" className="mb-6 gap-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4" /> Retour
      </Button>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Colonne Gauche : Images */}
        <div className="flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="aspect-video w-full overflow-hidden rounded-2xl bg-slate-100 sm:aspect-square flex items-center justify-center"
          >
            {activeImage ? (
              <img src={activeImage} alt={product.name} className="h-full w-full object-cover transition-all duration-300" />
            ) : (
              <div className="flex h-96 items-center justify-center text-slate-300">
                <ShoppingCart className="h-24 w-24" />
              </div>
            )}
          </motion.div>

          {/* Miniatures de la galerie d'images */}
          {allImages.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {allImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`h-20 w-20 overflow-hidden rounded-lg border-2 bg-slate-50 transition-all ${
                    activeImage === imgUrl ? 'border-indigo-600 scale-95 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`Miniature ${idx}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Colonne Droite : Infos & Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Badge className="mb-4">{product.category?.name || 'Tech'}</Badge>
          <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>
          <p className="mt-4 text-2xl font-bold text-indigo-600">
            {Number(product.price || 0).toLocaleString()} FCFA
          </p>

          <Separator className="my-6" />

          <p className="text-slate-600 leading-relaxed whitespace-pre-line">{product.description}</p>

          <div className="mt-6 flex items-center gap-4">
            <Badge variant={product.stock_quantity > 0 ? 'default' : 'destructive'}>
              {product.stock_quantity > 0 ? 'En Stock' : 'Rupture'}
            </Badge>
            <span className="text-sm text-slate-500">{product.stock_quantity} disponible(s)</span>
          </div>

          <div className="mt-8 flex items-center gap-4">
            {/* Sélecteur de quantité */}
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-1 bg-white">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={product.stock_quantity === 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{product.stock_quantity === 0 ? 0 : quantity}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                disabled={quantity >= product.stock_quantity || product.stock_quantity === 0}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Bouton d'ajout au panier */}
            <motion.div className="flex-1" whileTap={{ scale: 0.98 }}>
              <Button
                className="w-full gap-2"
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0 || added}
              >
                {added ? (
                  <>
                    <Check className="h-5 w-5" /> Ajouté !
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" /> Ajouter au panier
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
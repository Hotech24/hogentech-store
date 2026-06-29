import React from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, Badge } from '../ui.jsx'
import { useCart } from '../../context/CartContext.jsx'

export default function ProductCard({ product, index }) {
  const { addItem } = useCart()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-xl"
    >
      <Link to={`/product/${product.slug}`} className="relative aspect-square overflow-hidden bg-slate-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <Eye className="h-12 w-12" />
          </div>
        )}
        {product.featured && (
          <Badge className="absolute left-3 top-3 bg-indigo-600 text-white">Populaire</Badge>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-indigo-600">{product.category?.name}</p>
            <h3 className="mt-1 text-base font-semibold text-slate-900 line-clamp-1">{product.name}</h3>
          </div>
        </div>

        <p className="mb-4 line-clamp-2 text-sm text-slate-500">{product.description}</p>

        <div className="mt-auto flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-slate-900">{product.price.toLocaleString()} FCFA</p>
            <Badge
              variant={product.stock_status === 'ok' ? 'default' : product.stock_status === 'bas' ? 'secondary' : 'destructive'}
              className="mt-1 text-[10px]"
            >
              {product.stock_status_display}
            </Badge>
          </div>
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={(e) => {
                e.preventDefault()
                addItem(product)
              }}
              disabled={product.stock_quantity === 0}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

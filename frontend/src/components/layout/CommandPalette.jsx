import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Package, User, Command } from 'lucide-react'
import api from '../../api/axios.js'

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ products: [], users: [] })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const search = useCallback(async (q) => {
    if (q.length < 2) {
      setResults({ products: [], users: [] })
      return
    }
    setLoading(true)
    try {
      const [productsRes, usersRes] = await Promise.all([
        api.get(`/products/search/global/?q=${q}`),
        api.get(`/accounts/search/?q=${q}`),
      ])
      setResults({
        products: productsRes.data,
        users: usersRes.data,
      })
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300)
    return () => clearTimeout(timer)
  }, [query, search])

  const handleSelect = (type, item) => {
    setOpen(false)
    setQuery('')
    if (type === 'product') {
      navigate(`/product/${item.id}`)
    } else {
      navigate(`/dashboard/users`)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center border-b border-slate-100 px-4">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un produit, un client..."
                className="flex-1 bg-transparent px-4 py-4 text-sm outline-none placeholder:text-slate-400"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-500">
                <Command className="h-3 w-3" />
                <span>K</span>
              </div>
            </div>

            <div className="max-h-[400px] overflow-auto p-2">
              {loading && (
                <div className="py-8 text-center text-sm text-slate-500">Recherche en cours...</div>
              )}

              {!loading && query.length < 2 && (
                <div className="py-8 text-center text-sm text-slate-400">
                  Tapez au moins 2 caracteres pour rechercher
                </div>
              )}

              {!loading && query.length >= 2 && results.products.length === 0 && results.users.length === 0 && (
                <div className="py-8 text-center text-sm text-slate-500">Aucun resultat trouve</div>
              )}

              {results.products.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Produits
                  </div>
                  {results.products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleSelect('product', product)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-slate-50"
                    >
                      <Package className="h-4 w-4 text-indigo-500" />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.price} FCFA</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.users.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Clients
                  </div>
                  {results.users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelect('user', user)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-slate-50"
                    >
                      <User className="h-4 w-4 text-emerald-500" />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{user.first_name} {user.last_name}</p>
                        <p className="text-xs text-slate-500">{user.email || user.phone}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

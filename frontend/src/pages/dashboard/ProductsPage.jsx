import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Pencil, Trash2, Image as ImageIcon } from 'lucide-react'
import api from '../../api/axios.js'
import StockBadge from '../../components/dashboard/StockBadge.jsx'

import { 
  Button, 
  Input, 
  Card, 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell,
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '../../components/ui.jsx'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '', description: '', price: '', stock_quantity: '', category_id: '', is_active: true, featured: false
  })
  const [imageFile, setImageFile] = useState(null)

  const baseURL = api.defaults.baseURL?.replace('/api', '') || 'http://127.0.0.1:8000'

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products/')
      setProducts(res.data.results || res.data)
    } catch (err) {
      console.error("Erreur de récupération des produits :", err)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await api.get('/products/categories/')
      setCategories(res.data.results || res.data)
    } catch (err) {
      console.error("Erreur de récupération des catégories :", err)
    }
  }

  const handleOpenCreateForm = () => {
    setEditing(null)
    setImageFile(null)
    setFormData({ 
      name: '', description: '', price: '', stock_quantity: '', category_id: '', is_active: true, featured: false 
    })
    setShowForm(true)
  }

  const handleOpenEditForm = (product) => {
    setEditing(product)
    setImageFile(null)
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      stock_quantity: product.stock_quantity || '',
      category_id: product.category?.id || '',
      is_active: product.is_active ?? true,
      featured: product.featured ?? false
    })
    setShowForm(true)
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const data = new FormData()
    data.append('name', formData.name)
    data.append('description', formData.description)
    data.append('price', parseFloat(formData.price))
    data.append('stock_quantity', parseInt(formData.stock_quantity, 10))
    
    // Format chaîne stricte lue par les BooleanFields de Django
    data.append('is_active', formData.is_active ? 'true' : 'false')
    data.append('featured', formData.featured ? 'true' : 'false')
    
    if (formData.category_id) {
      data.append('category_id', parseInt(formData.category_id, 10))
    }
    
    if (imageFile) {
      data.append('image', imageFile)
    }

    try {
      if (editing) {
        await api.patch(`/products/${editing.slug}/`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        await api.post('/products/', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }
      
      setShowForm(false)
      setEditing(null)
      setImageFile(null)
      fetchProducts()
    } catch (err) {
      console.error("Erreur complète du serveur :", err.response?.data)
      const errorMsg = err.response?.data 
        ? JSON.stringify(err.response.data) 
        : "Une erreur est survenue lors de l'enregistrement."
      alert(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (slug) => {
    if (!confirm("Voulez-vous vraiment supprimer ce produit ?")) return
    try {
      await api.delete(`/products/${slug}/`)
      fetchProducts()
    } catch (err) {
      alert('Erreur lors de la suppression du produit.')
    }
  }

  const filtered = products.filter((p) => 
    p.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Catalogue Produits</h1>
          <p className="text-sm text-slate-500">Gestion et suivi de l'inventaire de la boutique locale</p>
        </div>
        <Button onClick={handleOpenCreateForm} className="rounded-xl font-medium shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Ajouter un produit
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input placeholder="Rechercher un produit à la caisse ou en stock..." className="pl-10 bg-white rounded-xl border-slate-200" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card className="bg-white overflow-hidden rounded-2xl border-slate-200 shadow-sm">
        <div className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/70">
              <TableRow>
                <TableHead className="font-semibold text-slate-600">Produit</TableHead>
                <TableHead className="font-semibold text-slate-600">Catégorie</TableHead>
                <TableHead className="font-semibold text-slate-600">Prix</TableHead>
                <TableHead className="font-semibold text-slate-600">Stock restant</TableHead>
                <TableHead className="font-semibold text-slate-600">Statut</TableHead>
                <th className="px-4 text-right font-semibold text-slate-600 text-xs uppercase tracking-wider">Actions</th>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => {
                const rawImage = product.image || product.image_url
                const productImgUrl = rawImage 
                  ? (rawImage.startsWith('http') ? rawImage : `${baseURL}${rawImage}`)
                  : null

                return (
                  <TableRow key={product.id} className="hover:bg-slate-50/40 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {productImgUrl ? (
                          <img src={productImgUrl} alt={product.name} className="h-10 w-10 rounded-lg object-cover bg-slate-50 border border-slate-100 flex-shrink-0" />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 flex-shrink-0">
                            <ImageIcon className="h-4 w-4 text-slate-400" />
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <p className="font-semibold text-slate-900 truncate">{product.name}</p>
                          <p className="text-xs text-slate-400 font-mono truncate">{product.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-slate-600">{product.category?.name || 'Non classé'}</TableCell>
                    <TableCell className="font-semibold text-indigo-600">
                      {Number(product.price || 0).toLocaleString()} FCFA
                    </TableCell>
                    <TableCell className="font-medium text-slate-700">{product.stock_quantity} unités</TableCell>
                    <TableCell><StockBadge status={product.stock_status} /></TableCell>
                    <TableCell className="text-right px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50" onClick={() => handleOpenEditForm(product)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(product.slug)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                    Aucun produit trouvé dans le catalogue local.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl bg-white p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/50">
            <DialogTitle className="text-lg font-bold text-slate-900">
              {editing ? 'Modifier la référence' : 'Ajouter un produit au catalogue'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nom de la référence</label>
              <Input placeholder="Ex: Mac Studio M3 Max" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="rounded-xl border-slate-200" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description technique</label>
              <textarea placeholder="Détails du produit..." className="w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prix de vente (FCFA)</label>
                <Input type="number" step="0.01" placeholder="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required className="rounded-xl border-slate-200" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quantité d'inventaire</label>
                <Input type="number" placeholder="0" value={formData.stock_quantity} onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })} required className="rounded-xl border-slate-200" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Catégorie</label>
                <select className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer" value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} required>
                  <option value="">Sélectionner...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Illustration (Image)</label>
                <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer border border-slate-200 rounded-xl p-1 bg-white h-10 flex items-center" />
              </div>
            </div>

            {/* AJOUT DES OPTIONS DE STATUT (ACTIF & MIS EN AVANT) */}
            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={formData.is_active} 
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                Actif (Disponible à la vente)
              </label>

              <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={formData.featured} 
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                Mis en avant (Page d'accueil)
              </label>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={loading} className="rounded-xl px-5 bg-indigo-600 hover:bg-indigo-700 text-white">
                {loading ? 'Synchronisation...' : editing ? 'Mettre à jour' : 'Ajouter au catalogue'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
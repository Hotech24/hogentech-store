import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Shield, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../../api/axios.js'
import ProductCard from '../../components/client/ProductCard.jsx'
import { Button } from '../../components/ui.jsx'

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products/?featured=true'),
          api.get('/products/categories/'),
        ])

        // Sécurisation de la lecture des produits (gère le format paginé "results" ou brut)
        if (productsRes.data && productsRes.data.results) {
          setProducts(productsRes.data.results)
        } else if (Array.isArray(productsRes.data)) {
          setProducts(productsRes.data)
        } else {
          setProducts([])
        }

        // Sécurisation de la lecture des catégories (souvent un tableau brut)
        if (categoriesRes.data && categoriesRes.data.results) {
          setCategories(categoriesRes.data.results)
        } else if (Array.isArray(categoriesRes.data)) {
          setCategories(categoriesRes.data)
        } else {
          setCategories([])
        }

      } catch (err) {
        console.error("Erreur de chargement de la page d'accueil :", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Fonction utilitaire pour le scroll interne depuis le Hero
  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
              HogenTech <span className="text-indigo-600">Store</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
              Découvrez notre sélection de produits tech de haute qualité. 
              Une expérience d'achat moderne, fluide et sécurisée.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button 
                size="lg" 
                className="gap-2"
                onClick={() => scrollToSection('produits-section')}
              >
                Explorer <ArrowRight className="h-4 w-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => scrollToSection('categories-section')}
              >
                En savoir plus
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-slate-100 bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: Zap, title: 'Livraison rapide', desc: 'Recevez vos commandes en 24-48h' },
              { icon: Shield, title: 'Paiement sécurisé', desc: 'Transactions cryptées et protégées' },
              { icon: Truck, title: 'Retour gratuit', desc: "30 jours pour changer d'avis" },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
                  <feature.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {/* CORRECTION : Ajout de l'id pour cibler le scroll de la Navbar */}
      <section id="produits-section" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Produits populaires</h2>
              <p className="mt-2 text-slate-500">Notre sélection du moment</p>
            </div>
            <Button variant="outline" onClick={() => scrollToSection('produits-section')}>
              Voir tout
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              Aucun produit mis en avant pour le moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      {/* CORRECTION : Ajout de l'id pour cibler le scroll de la Navbar */}
      <section id="categories-section" className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 text-3xl font-bold text-slate-900">Catégories</h2>
          
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-200" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              Aucune catégorie disponible.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category, i) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={`/products?category=${category.slug}`}
                    className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <span className="text-lg">{category.icon || '📦'}</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">{category.name}</h3>
                      <p className="text-xs text-slate-500">{category.description || 'Voir les produits'}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
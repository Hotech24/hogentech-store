import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingBag, Search, Menu, X, Store } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth.js'
import { useCart } from '../../context/CartContext.jsx'
import { Button, Badge } from '../ui.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { count, setIsOpen } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Fonction pour gérer le défilement fluide vers une section
  const handleScrollTo = (sectionId) => {
    setMobileMenuOpen(false) // Ferme le menu mobile si ouvert

    if (location.pathname !== '/') {
      // Si on n'est pas sur l'accueil, on y va d'abord, puis on scrolle
      navigate('/')
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
      }, 300)
    } else {
      // Si on est déjà sur l'accueil, on scrolle directement
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <Store className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">HogenTech</span>
        </Link>

        {/* Navigation Bureau */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/" className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600">
            Accueil
          </Link>
          <button 
            onClick={() => handleScrollTo('produits-section')}
            className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600"
          >
            Produits
          </button>
          <button 
            onClick={() => handleScrollTo('categories-section')}
            className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600"
          >
            Catégories
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative" onClick={() => setIsOpen(true)}>
            <ShoppingBag className="h-5 w-5 text-slate-600" />
            {count > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-indigo-600 p-0 text-[10px] text-white">
                {count}
              </Badge>
            )}
          </Button>

          {user ? (
            <div className="flex items-center gap-3">
              {(user.role === 'admin' || user.role === 'vendor') && (
                <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                  Dashboard
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={logout}>
                Déconnexion
              </Button>
            </div>
          ) : (
            <Button variant="default" size="sm" onClick={() => navigate('/login')}>
              Connexion
            </Button>
          )}

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Navigation Mobile */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 bg-white md:hidden"
          >
            <div className="flex flex-col space-y-1 px-4 py-3 text-left">
              <Link 
                to="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
              >
                Accueil
              </Link>
              <button 
                onClick={() => handleScrollTo('produits-section')}
                className="rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
              >
                Produits
              </button>
              <button 
                onClick={() => handleScrollTo('categories-section')}
                className="rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
              >
                Catégories
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
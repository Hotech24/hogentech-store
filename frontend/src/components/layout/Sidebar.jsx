import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, ShoppingCart, Package, Receipt, BarChart3,
  Settings, Users, ChevronLeft, ChevronRight, LogOut, Store
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.js'
import { Button } from '../ui.jsx'

// Utilitaire de gestion des classes CSS (Safe Injection)
function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

const navItems = [
  { path: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard, roles: ['admin', 'vendor'] },
  { path: '/dashboard/pos', label: 'Point de Vente', icon: ShoppingCart, roles: ['admin', 'vendor'] },
  { path: '/dashboard/products', label: 'Produits', icon: Package, roles: ['admin', 'vendor'] },
  { path: '/dashboard/orders', label: 'Commandes', icon: Receipt, roles: ['admin', 'vendor'] },
  { path: '/dashboard/invoices', label: 'Factures', icon: Receipt, roles: ['admin', 'vendor'] },
  { path: '/dashboard/stats', label: 'Statistiques', icon: BarChart3, roles: ['admin'] },
  { path: '/dashboard/users', label: 'Utilisateurs', icon: Users, roles: ['admin'] },
  { path: '/dashboard/settings', label: 'Paramètres', icon: Settings, roles: ['admin'] },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout, hasRole } = useAuth()
  const location = useLocation()

  // Protection du filtrage par rôles utilisateur (évite un crash si hasRole est asynchrone)
  const filteredNav = navItems.filter((item) => 
    typeof hasRole === 'function' ? (hasRole(item.roles[0]) || hasRole('admin')) : true
  )

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-slate-200 bg-white/90 backdrop-blur-xl"
    >
      {/* Header Sidebar */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100 bg-white">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2 overflow-hidden"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 shadow-sm shadow-indigo-600/20">
                <Store className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-bold text-slate-900 tracking-tight whitespace-nowrap">
                HogenTech
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 rounded-lg text-slate-500 hover:bg-slate-100"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation Centrale */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {filteredNav.map((item) => {
          const Icon = item.icon
          const isCurrentPath = location.pathname === item.path

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50/80 hover:text-slate-900'
                )
              }
            >
              <Icon className={cn('h-5 w-5 shrink-0 transition-colors', isCurrentPath ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600')} />
              
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              
              {isCurrentPath && !collapsed && (
                <motion.div
                  layoutId="active-pill"
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-600"
                />
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer Profil & Déconnexion */}
      <div className="border-t border-slate-200 p-3 bg-white/50 space-y-2">
        <div className={cn('flex items-center gap-3 rounded-xl p-2 bg-slate-50 border border-slate-100', collapsed && 'justify-center')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 shadow-inner">
            <span className="text-xs font-bold uppercase">
              {user?.first_name?.[0] || 'A'}{user?.last_name?.[0] || 'D'}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-semibold text-slate-900">{user?.first_name || 'Utilisateur'} {user?.last_name || ''}</p>
              <p className="truncate text-[10px] text-slate-400 uppercase font-bold tracking-wider">{user?.role_display || 'Admin / Vendeur'}</p>
            </div>
          )}
        </div>
        
        <Button
          variant="ghost"
          className={cn('w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl px-3 py-2.5 h-auto font-medium text-sm', collapsed && 'justify-center')}
          onClick={logout}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="ml-3">Déconnexion</span>}
        </Button>
      </div>
    </motion.aside>
  )
}
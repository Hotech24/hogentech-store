import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.js'

import ClientLayout from './components/layout/ClientLayout.jsx'
import DashboardLayout from './components/layout/DashboardLayout.jsx'
import HomePage from './pages/client/HomePage.jsx'
import ProductPage from './pages/client/ProductPage.jsx'
import CartPage from './pages/client/CartPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import DashboardHome from './pages/dashboard/DashboardHome.jsx'
import POSPage from './pages/dashboard/POSPage.jsx'
import ProductsPage from './pages/dashboard/ProductsPage.jsx'
import OrdersPage from './pages/dashboard/OrdersPage.jsx'
import InvoicesPage from './pages/dashboard/InvoicesPage.jsx'
import StatsPage from './pages/dashboard/StatsPage.jsx'

// Composant de protection des routes de l'administration
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default function App() {
  return (
    <Routes>
      {/* Client Routes */}
      <Route element={<ClientLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
      </Route>

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />

      {/* Dashboard Routes */}
      <Route
        element = {
          <ProtectedRoute allowedRoles={['admin', 'vendor']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/dashboard/pos" element={<POSPage />} />
        <Route path="/dashboard/products" element={<ProductsPage />} />
        <Route path="/dashboard/orders" element={<OrdersPage />} />
        <Route path="/dashboard/invoices" element={<InvoicesPage />} />
        <Route path="/dashboard/stats" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <StatsPage />
          </ProtectedRoute>
        } />
      </Route>

      {/* Fallback général */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
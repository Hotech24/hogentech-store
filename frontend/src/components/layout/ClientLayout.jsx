import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import CartDrawer from '../client/CartDrawer.jsx'

export default function ClientLayout() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <CartDrawer />
      <main>
        <Outlet />
      </main>
    </div>
  )
}

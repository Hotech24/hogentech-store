import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import CommandPalette from './CommandPalette.jsx'

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <Sidebar />
      <main className="flex-1 ml-[280px] transition-all duration-300">
        <div className="mx-auto max-w-7xl p-6">
          <Outlet />
        </div>
      </main>
      <CommandPalette />
    </div>
  )
}

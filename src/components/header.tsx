"use client"

import { useAuth } from "@/app/context/auth-context"
import { Button } from "@/components/ui/button"
import {
  Users,
  Calendar,
  Receipt,
  BarChart3,
  UserCog,
  Menu,
  X,
} from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "./theme-toggle"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { useState } from "react"

export function Header() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (!user) return null

  const menuItems = [
    { name: "Empleados", href: "/employees", icon: UserCog },
    { name: "Clientes", href: "/clients", icon: Users },
    { name: "Reservas", href: "/reservations", icon: Calendar },
    { name: "Facturación", href: "/billing", icon: Receipt },
    { name: "Informes", href: "/reports", icon: BarChart3 },
  ]

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <header className="relative w-full border-b bg-background">
      <div className="container max-w-screen-2xl mx-auto px-4 py-3">
        <div className="flex items-center">
          {/* Logo */}
          <div className="font-bold text-lg shrink-0 text-foreground">
            <Link href="/dashboard">Portal Admin</Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden ml-auto flex items-center gap-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Menu"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Desktop Navigation - Hidden on mobile */}
          <nav className="hidden md:flex items-center space-x-6 ml-8">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors",
                    isActive
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Desktop User Controls - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-4 ml-auto">
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground">{user.username}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="hover:bg-accent"
            >
              Salir
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 z-50 bg-background border-b shadow-lg">
          <div className="container max-w-screen-2xl mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-3">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium transition-colors p-2 rounded-md",
                      isActive
                        ? "text-primary font-semibold bg-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              <div className="pt-3 mt-3 border-t">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-foreground">
                    {user.username}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="w-full hover:bg-accent"
                >
                  Salir
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

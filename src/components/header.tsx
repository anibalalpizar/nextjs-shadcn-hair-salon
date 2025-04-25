"use client"

import { useAuth } from "@/app/context/auth-context"
import { Button } from "@/components/ui/button"
import { Users, Calendar, Receipt, BarChart3, UserCog } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "./theme-toggle"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export function Header() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  if (!user) return null

  const menuItems = [
    { name: "Empleados", href: "/employees", icon: UserCog },
    { name: "Clientes", href: "/clients", icon: Users },
    { name: "Reservas", href: "/reservations", icon: Calendar },
    { name: "Facturación", href: "/billing", icon: Receipt },
    { name: "Informes", href: "/reports", icon: BarChart3 },
  ]

  return (
    <header className="py-3 w-full border-b bg-background">
      <div className="container max-w-screen-2xl mx-auto px-4">
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <div className="font-bold text-lg shrink-0 text-foreground">
            <Link href="/dashboard">Portal Admin</Link>
          </div>

          {/* Main Navigation - Left aligned */}
          <nav className="flex items-center space-x-6">
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

          {/* User Controls - Push to the right */}
          <div className="flex items-center gap-4 ml-auto">
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
    </header>
  )
}

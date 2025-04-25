"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { AnimatePresence, motion } from "framer-motion"
import { useAuth } from "./context/auth-context"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  demoBills,
  demoClients,
  demoEmployees,
  demoReservations,
} from "@/lib/demo-data"

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [useDemoData, setUseDemoData] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("useDemoData") === "true"
    }
    return false
  })

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  useEffect(() => {
    localStorage.setItem("useDemoData", useDemoData.toString())
    if (useDemoData) {
      localStorage.setItem("employees", JSON.stringify(demoEmployees))
      localStorage.setItem("clients", JSON.stringify(demoClients))
      localStorage.setItem("reservations", JSON.stringify(demoReservations))
      localStorage.setItem("bills", JSON.stringify(demoBills))
    } else {
      localStorage.setItem("employees", JSON.stringify([]))
      localStorage.setItem("clients", JSON.stringify([]))
      localStorage.setItem("reservations", JSON.stringify([]))
      localStorage.setItem("bills", JSON.stringify([]))
    }
  }, [useDemoData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted/30">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="animate-pulse"
        >
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </motion.div>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full flex flex-col items-center gap-4"
        >
          <div className="mb-6">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-3xl font-bold text-center">
                Portal Administrativo
              </h1>
              <p className="text-muted-foreground text-center mt-2">
                Inicia sesión para acceder a tu panel de control
              </p>
            </motion.div>
          </div>

          <Card className="w-full max-w-md mb-4">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="demo-mode"
                    checked={useDemoData}
                    onCheckedChange={setUseDemoData}
                  />
                  <Label htmlFor="demo-mode" className="font-medium">
                    Datos de demostración
                  </Label>
                </div>
                <span className="text-xs text-muted-foreground">
                  {useDemoData ? "Activado" : "Desactivado"}
                </span>
              </div>
            </CardContent>
          </Card>

          <LoginForm />
        </motion.div>
      </AnimatePresence>
    </main>
  )
}

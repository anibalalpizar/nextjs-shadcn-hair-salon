"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { format, subMonths } from "date-fns"
import { es } from "date-fns/locale"
import { getBills } from "@/lib/billing"
import { getReservations } from "@/lib/reservations"
import { getClients } from "@/lib/clients"

const COLORS = ["#7c3aed", "#10b981", "#f59e0b", "#ef4444"]

export function Dashboard() {
  const [revenueData, setRevenueData] = useState([])
  const [clientsData, setClientsData] = useState([])
  const [serviceData, setServiceData] = useState([])
  const [metricsData, setMetricsData] = useState({
    totalClientes: 0,
    ingresos: 0,
    citasHoy: 0,
    citasPendientes: 0,
    satisfaccion: 98,
  })

  useEffect(() => {
    // Load data from localStorage
    const bills = getBills()
    const reservations = getReservations()
    const clients = getClients()

    // Process monthly revenue data
    const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), i)
      return {
        date,
        month: format(date, "MMM", { locale: es }),
        firstDay: format(new Date(date.getFullYear(), date.getMonth(), 1), "yyyy-MM-dd"),
        lastDay: format(new Date(date.getFullYear(), date.getMonth() + 1, 0), "yyyy-MM-dd"),
      }
    }).reverse()

    const monthlyRevenue = lastSixMonths.map((month) => {
      const monthBills = bills.filter((bill) => {
        const billDate = new Date(bill.fecha)
        return billDate >= new Date(month.firstDay) && billDate <= new Date(month.lastDay)
      })

      const total = monthBills.reduce((sum, bill) => sum + bill.total, 0)

      return {
        name: month.month,
        value: total,
      }
    })

    // @ts-expect-error Type 'number' is not assignable to type 'string'
    setRevenueData(monthlyRevenue)

    // Process clients data
    const monthlyClients = lastSixMonths.map((month) => {
      const monthReservations = reservations.filter((res) => {
        return res.fecha >= month.firstDay && res.fecha <= month.lastDay
      })

      // This is a simplified approach - in a real app, we'd need more data to determine new vs recurring
      const uniqueClients = [...new Set(monthReservations.map((r) => r.clienteId))]
      const totalClients = uniqueClients.length

      // Assuming 60% new, 40% recurring for demo purposes
      // In a real app, this would require historical data analysis
      return {
        name: month.month,
        nuevos: Math.round(totalClients * 0.6),
        recurrentes: Math.round(totalClients * 0.4),
      }
    })

    // @ts-expect-error Type 'number' is not assignable to type 'string'
    setClientsData(monthlyClients)

    // Process service data (using bill information)
    // For demo purposes, we'll categorize by the number of adults, children, seniors
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const totalPersons = bills.reduce(
      (sum, bill) => sum + bill.cantidadPersonas + bill.cantidadNinos + bill.cantidadAdultosMayores,
      0,
    )

    const adultCount = bills.reduce((sum, bill) => sum + bill.cantidadPersonas, 0)
    const childCount = bills.reduce((sum, bill) => sum + bill.cantidadNinos, 0)
    const seniorCount = bills.reduce((sum, bill) => sum + bill.cantidadAdultosMayores, 0)

    const services = [
      { name: "Adultos", value: adultCount },
      { name: "Niños", value: childCount },
      { name: "Adultos Mayores", value: seniorCount },
    ]

    // @ts-expect-error Type 'number' is not assignable to type 'string'
    setServiceData(services)

    // Process metrics data
    const today = format(new Date(), "yyyy-MM-dd")
    const todayReservations = reservations.filter((res) => res.fecha === today)
    const pendingReservations = todayReservations.filter((res) => {
      const reservationTime = new Date(`${today}T${res.hora}:00`)
      return reservationTime > new Date()
    })

    const totalRevenue = bills.reduce((sum, bill) => sum + bill.total, 0)

    setMetricsData({
      totalClientes: clients.length,
      ingresos: totalRevenue,
      citasHoy: todayReservations.length,
      citasPendientes: pendingReservations.length,
      satisfaccion: 98, // Placeholder since we don't have satisfaction data
    })
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Summary Cards */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl">Resumen General</CardTitle>
          <CardDescription>Métricas importantes del negocio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-primary/10 border border-primary/20 shadow-sm transition-all hover:shadow-md">
              <h3 className="font-semibold text-lg text-foreground">Total Clientes</h3>
              <p className="text-4xl font-bold mt-2 text-foreground">{metricsData.totalClientes}</p>
              <p className="text-sm text-muted-foreground mt-2">Clientes registrados</p>
            </div>
            <div className="p-6 rounded-xl bg-primary/10 border border-primary/20 shadow-sm transition-all hover:shadow-md">
              <h3 className="font-semibold text-lg text-foreground">Ingresos Totales</h3>
              <p className="text-4xl font-bold mt-2 text-foreground">
                {new Intl.NumberFormat("es-CR", {
                  style: "currency",
                  currency: "CRC",
                  maximumFractionDigits: 0,
                }).format(metricsData.ingresos)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">Todas las facturas</p>
            </div>
            <div className="p-6 rounded-xl bg-primary/10 border border-primary/20 shadow-sm transition-all hover:shadow-md">
              <h3 className="font-semibold text-lg text-foreground">Citas Hoy</h3>
              <p className="text-4xl font-bold mt-2 text-foreground">{metricsData.citasHoy}</p>
              <p className="text-sm text-muted-foreground mt-2">{metricsData.citasPendientes} pendientes</p>
            </div>
            <div className="p-6 rounded-xl bg-primary/10 border border-primary/20 shadow-sm transition-all hover:shadow-md">
              <h3 className="font-semibold text-lg text-foreground">Satisfacción</h3>
              <p className="text-4xl font-bold mt-2 text-foreground">{metricsData.satisfaccion}%</p>
              <p className="text-sm text-muted-foreground mt-2">Índice de satisfacción</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="border shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle>Ingresos Mensuales</CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    border: "1px solid #e2e8f0",
                  }}
                  formatter={(value) =>
                    new Intl.NumberFormat("es-CR", {
                      style: "currency",
                      currency: "CRC",
                      maximumFractionDigits: 0,
                      // @ts-expect-error Type 'number' is not assignable to type 'string'
                    }).format(value)
                  }
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#7c3aed"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle>Clientes por Mes</CardTitle>
            <CardDescription>Nuevos vs Recurrentes</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clientsData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    border: "1px solid #e2e8f0",
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: "10px" }} />
                <Bar dataKey="nuevos" fill="#7c3aed" name="Nuevos" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recurrentes" fill="#10b981" name="Recurrentes" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle>Distribución de Visitantes</CardTitle>
            <CardDescription>Por tipo de cliente</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    border: "1px solid #e2e8f0",
                  }}
                  formatter={(value) => [value, "Total"]}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <Card className="border shadow-sm">
        <CardFooter className="flex justify-between py-4">
          <p className="text-xs text-muted-foreground">© 2025 Aníbal Alpízar</p>
          <p className="text-xs text-muted-foreground">Version 1.0.0</p>
          <a
            href="https://github.com/anibalalpizar/nextjs-shadcn-hair-salon"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:underline"
          >
            Ver código fuente
          </a>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

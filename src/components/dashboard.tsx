"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
} from "recharts"
import { format, subMonths } from "date-fns"
import { es } from "date-fns/locale"
import { getBills } from "@/lib/billing"
import { getReservations } from "@/lib/reservations"
import { getClients } from "@/lib/clients"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

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
        firstDay: format(
          new Date(date.getFullYear(), date.getMonth(), 1),
          "yyyy-MM-dd"
        ),
        lastDay: format(
          new Date(date.getFullYear(), date.getMonth() + 1, 0),
          "yyyy-MM-dd"
        ),
      }
    }).reverse()

    const monthlyRevenue = lastSixMonths.map((month) => {
      const monthBills = bills.filter((bill) => {
        const billDate = new Date(bill.fecha)
        return (
          billDate >= new Date(month.firstDay) &&
          billDate <= new Date(month.lastDay)
        )
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
      const uniqueClients = [
        ...new Set(monthReservations.map((r) => r.clienteId)),
      ]
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
      (sum, bill) =>
        sum +
        bill.cantidadPersonas +
        bill.cantidadNinos +
        bill.cantidadAdultosMayores,
      0
    )

    const adultCount = bills.reduce(
      (sum, bill) => sum + bill.cantidadPersonas,
      0
    )
    const childCount = bills.reduce((sum, bill) => sum + bill.cantidadNinos, 0)
    const seniorCount = bills.reduce(
      (sum, bill) => sum + bill.cantidadAdultosMayores,
      0
    )

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
      className="w-full space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos Mensuales</CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value) =>
                    new Intl.NumberFormat("es-CR", {
                      style: "currency",
                      currency: "CRC",
                      // @ts-expect-error Type 'number' is not assignable to type 'string'
                    }).format(value)
                  }
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clientes por Mes</CardTitle>
            <CardDescription>Nuevos vs Recurrentes</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clientsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="nuevos" fill="#8884d8" name="Nuevos" />
                <Bar dataKey="recurrentes" fill="#82ca9d" name="Recurrentes" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución de Visitantes</CardTitle>
            <CardDescription>Por tipo de cliente</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {serviceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, "Total"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen General</CardTitle>
          <CardDescription>Métricas importantes del negocio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-primary/10">
              <h3 className="font-semibold text-lg">Total Clientes</h3>
              <p className="text-3xl font-bold">{metricsData.totalClientes}</p>
              <p className="text-sm text-muted-foreground">
                Clientes registrados
              </p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10">
              <h3 className="font-semibold text-lg">Ingresos Totales</h3>
              <p className="text-3xl font-bold">
                {new Intl.NumberFormat("es-CR", {
                  style: "currency",
                  currency: "CRC",
                }).format(metricsData.ingresos)}
              </p>
              <p className="text-sm text-muted-foreground">
                Todas las facturas
              </p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10">
              <h3 className="font-semibold text-lg">Citas Hoy</h3>
              <p className="text-3xl font-bold">{metricsData.citasHoy}</p>
              <p className="text-sm text-muted-foreground">
                {metricsData.citasPendientes} pendientes
              </p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10">
              <h3 className="font-semibold text-lg">Satisfacción</h3>
              <p className="text-3xl font-bold">{metricsData.satisfaccion}%</p>
              <p className="text-sm text-muted-foreground">
                Índice de satisfacción
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
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

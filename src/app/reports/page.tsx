/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  CalendarIcon,
  Users,
  DollarSign,
  Clock,
  BarChart3,
  Download,
  TrendingUp,
  TrendingDown,
  UserCog,
  CalendarPlus2Icon as CalendarIcon2,
} from "lucide-react"
import {
  getDailyAttendance,
  getDailyRevenue,
  getTimeSlotAnalysis,
} from "@/lib/reports"
import { formatCurrency } from "@/lib/billing"
import { useAuth } from "@/app/context/auth-context"

export default function ReportsPage() {
  const { user } = useAuth()
  const [date, setDate] = useState<Date>()
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [timeSlotData, setTimeSlotData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("attendance")
  const [isLoading, setIsLoading] = useState(false)

  if (!user) return null

  const generateReports = () => {
    if (!date) return

    setIsLoading(true)

    // Simulate loading
    setTimeout(() => {
      const fechaStr = format(date, "yyyy-MM-dd")
      const attendance = getDailyAttendance(fechaStr)
      const revenue = getDailyRevenue(fechaStr)
      const timeSlots = getTimeSlotAnalysis(fechaStr)

      setAttendanceData(attendance)
      setRevenueData(revenue)
      setTimeSlotData(timeSlots)
      setIsLoading(false)
    }, 800)
  }

  const getTotalAttendance = () => {
    return attendanceData.reduce((sum, item) => sum + item.total, 0)
  }

  const getTotalRevenue = () => {
    return revenueData.reduce((sum, item) => sum + item.totalIngresos, 0)
  }

  const getHighestEarningEmployee = () => {
    if (revenueData.length === 0) return null
    return revenueData.reduce((prev, current) =>
      prev.totalIngresos > current.totalIngresos ? prev : current
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 p-6 container max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Informes</h1>
              <p className="text-muted-foreground">
                Analiza los datos de asistencia, ingresos y horarios
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Generar Informes</CardTitle>
              <CardDescription>
                Seleccione una fecha para generar los informes detallados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                <div className="space-y-2">
                  <Label>Fecha del Informe</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-[240px] justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? (
                          format(date, "PPP", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button
                  onClick={generateReports}
                  disabled={!date || isLoading}
                  className="min-w-[140px]"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full mr-2"></div>
                      Generando...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Generar Informes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {(attendanceData.length > 0 ||
            revenueData.length > 0 ||
            timeSlotData) && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between space-y-0">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Total Asistencia
                        </p>
                        <p className="text-2xl font-bold">
                          {getTotalAttendance()}
                        </p>
                      </div>
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-3">
                      {date && `Fecha: ${format(date, "PPP", { locale: es })}`}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between space-y-0">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Total Ingresos
                        </p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(getTotalRevenue())}
                        </p>
                      </div>
                      <div className="p-2 bg-green-100 rounded-full">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-3">
                      {date && `Fecha: ${format(date, "PPP", { locale: es })}`}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between space-y-0">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Hora Pico
                        </p>
                        <p className="text-2xl font-bold">
                          {timeSlotData?.mayorAfluencia.hora || "N/A"}
                        </p>
                      </div>
                      <div className="p-2 bg-amber-100 rounded-full">
                        <Clock className="h-5 w-5 text-amber-600" />
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-3">
                      {timeSlotData &&
                        `${timeSlotData.mayorAfluencia.cantidadPersonas} personas`}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <TabsList>
                    <TabsTrigger
                      value="attendance"
                      className="flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" />
                      <span className="hidden sm:inline">Asistencia</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="revenue"
                      className="flex items-center gap-2"
                    >
                      <DollarSign className="h-4 w-4" />
                      <span className="hidden sm:inline">Ingresos</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="timeslots"
                      className="flex items-center gap-2"
                    >
                      <Clock className="h-4 w-4" />
                      <span className="hidden sm:inline">Horarios</span>
                    </TabsTrigger>
                  </TabsList>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Exportar</span>
                  </Button>
                </div>

                <TabsContent value="attendance" className="mt-0">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <UserCog className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Asistencia por Empleado</CardTitle>
                      </div>
                      <CardDescription>
                        Desglose de la cantidad de clientes atendidos por cada
                        empleado
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-muted/50">
                                <th className="text-left p-3 font-medium">
                                  Empleado
                                </th>
                                <th className="text-left p-3 font-medium">
                                  Total
                                </th>
                                <th className="text-left p-3 font-medium">
                                  Adultos
                                </th>
                                <th className="text-left p-3 font-medium">
                                  Niños
                                </th>
                                <th className="text-left p-3 font-medium">
                                  Adultos Mayores
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {attendanceData.map((data, index) => (
                                <tr key={index} className="hover:bg-muted/30">
                                  <td className="p-3 font-medium">
                                    {data.empleado}
                                  </td>
                                  <td className="p-3">
                                    <Badge
                                      variant="outline"
                                      className="font-normal"
                                    >
                                      {data.total}
                                    </Badge>
                                  </td>
                                  <td className="p-3">{data.adultos}</td>
                                  <td className="p-3">{data.ninos}</td>
                                  <td className="p-3">{data.adultosMayores}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="revenue" className="mt-0">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Ingresos por Empleado</CardTitle>
                      </div>
                      <CardDescription>
                        Desglose de los ingresos generados por cada empleado y
                        su comisión
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-muted/50">
                                <th className="text-left p-3 font-medium">
                                  Empleado
                                </th>
                                <th className="text-left p-3 font-medium">
                                  Total Ingresos
                                </th>
                                <th className="text-left p-3 font-medium">
                                  Ingresos Adultos
                                </th>
                                <th className="text-left p-3 font-medium">
                                  Ingresos Niños
                                </th>
                                <th className="text-left p-3 font-medium">
                                  Ingresos Adultos Mayores
                                </th>
                                <th className="text-left p-3 font-medium">
                                  Comisión
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {revenueData.map((data, index) => (
                                <tr key={index} className="hover:bg-muted/30">
                                  <td className="p-3 font-medium">
                                    {data.empleado}
                                  </td>
                                  <td className="p-3 font-medium text-green-600">
                                    {formatCurrency(data.totalIngresos)}
                                  </td>
                                  <td className="p-3">
                                    {formatCurrency(data.ingresosPorAdultos)}
                                  </td>
                                  <td className="p-3">
                                    {formatCurrency(data.ingresosPorNinos)}
                                  </td>
                                  <td className="p-3">
                                    {formatCurrency(
                                      data.ingresosPorAdultosMayores
                                    )}
                                  </td>
                                  <td className="p-3">
                                    <Badge
                                      variant="secondary"
                                      className="font-normal"
                                    >
                                      {formatCurrency(data.comision)}
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      {getHighestEarningEmployee() && (
                        <div className="mt-4 p-4 border rounded-lg bg-muted/30">
                          <div className="flex items-center gap-2 font-medium mb-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            Empleado con Mayor Ingreso
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <span className="font-medium">
                                {getHighestEarningEmployee()?.empleado}
                              </span>{" "}
                              generó{" "}
                              <span className="font-medium text-green-600">
                                {formatCurrency(
                                  getHighestEarningEmployee()?.totalIngresos
                                )}
                              </span>{" "}
                              en ingresos
                            </div>
                            <Badge variant="outline" className="font-normal">
                              Comisión:{" "}
                              {formatCurrency(
                                getHighestEarningEmployee()?.comision
                              )}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="timeslots" className="mt-0">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <CalendarIcon2 className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Análisis de Horarios</CardTitle>
                      </div>
                      <CardDescription>
                        Análisis de los horarios con mayor y menor afluencia de
                        clientes
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {timeSlotData && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="border rounded-lg p-4 bg-muted/30">
                            <div className="flex items-center gap-2 font-medium mb-4">
                              <TrendingUp className="h-5 w-5 text-green-600" />
                              <h3>Mayor Afluencia</h3>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                  Hora:
                                </span>
                                <Badge
                                  variant="outline"
                                  className="font-medium"
                                >
                                  {timeSlotData.mayorAfluencia.hora}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                  Cantidad de personas:
                                </span>
                                <span className="font-medium">
                                  {timeSlotData.mayorAfluencia.cantidadPersonas}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                  Porcentaje del total:
                                </span>
                                <span className="font-medium">
                                  {Math.round(
                                    (timeSlotData.mayorAfluencia
                                      .cantidadPersonas /
                                      getTotalAttendance()) *
                                      100
                                  )}
                                  %
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="border rounded-lg p-4 bg-muted/30">
                            <div className="flex items-center gap-2 font-medium mb-4">
                              <TrendingDown className="h-5 w-5 text-amber-600" />
                              <h3>Menor Afluencia</h3>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                  Hora:
                                </span>
                                <Badge
                                  variant="outline"
                                  className="font-medium"
                                >
                                  {timeSlotData.menorAfluencia.hora}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                  Cantidad de personas:
                                </span>
                                <span className="font-medium">
                                  {timeSlotData.menorAfluencia.cantidadPersonas}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                  Porcentaje del total:
                                </span>
                                <span className="font-medium">
                                  {Math.round(
                                    (timeSlotData.menorAfluencia
                                      .cantidadPersonas /
                                      getTotalAttendance()) *
                                      100
                                  )}
                                  %
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </motion.div>
      </main>
    </div>
  )
}

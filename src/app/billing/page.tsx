"use client"

import { Input } from "@/components/ui/input"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Trash2,
  Plus,
  Printer,
  Search,
  MoreHorizontal,
  Receipt,
  Calendar,
  User,
  DollarSign,
  FileText,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { type Client, getClients } from "@/lib/clients"
import { type Reservation, getReservations } from "@/lib/reservations"
import {
  type Bill,
  getBills,
  saveBill,
  deleteBill,
  formatCurrency,
} from "@/lib/billing"
import { useAuth } from "@/app/context/auth-context"

export default function BillingPage() {
  const { user } = useAuth()
  const [bills, setBills] = useState<Bill[]>(() => getBills())
  const [filteredBills, setFilteredBills] = useState<Bill[]>(bills)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null)
  const [clients] = useState<Client[]>(() => getClients())
  const [reservations] = useState<Reservation[]>(() => getReservations())
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState<
    "all" | "today" | "week" | "month"
  >("all")

  useEffect(() => {
    let result = bills

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (bill) =>
          bill.nombreCliente
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          bill.numeroFactura?.toString().includes(searchQuery) ||
          bill.numeroReservacion?.toString().includes(searchQuery)
      )
    }

    // Apply date filter
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date(today)
    monthAgo.setMonth(monthAgo.getMonth() - 1)

    if (dateFilter === "today") {
      result = result.filter((bill) => new Date(bill.fecha) >= today)
    } else if (dateFilter === "week") {
      result = result.filter((bill) => new Date(bill.fecha) >= weekAgo)
    } else if (dateFilter === "month") {
      result = result.filter((bill) => new Date(bill.fecha) >= monthAgo)
    }

    setFilteredBills(result)
  }, [bills, searchQuery, dateFilter])

  if (!user) return null

  const handleClientSelect = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    setSelectedClient(client || null)
    setSelectedReservation(null)
  }

  const handleReservationSelect = (reservationId: string) => {
    const reservation = reservations.find((r) => r.id === reservationId)
    setSelectedReservation(reservation || null)
  }

  const handleCreateBill = () => {
    if (!selectedClient || !selectedReservation) return

    const newBill = {
      fecha: new Date(),
      clienteId: selectedClient.id,
      nombreCliente: selectedClient.nombre,
      cedulaCliente: selectedClient.cedula,
      reservacionId: selectedReservation.id,
      numeroReservacion: selectedReservation.numeroReservacion,
      empleadoAsignado: selectedReservation.empleadoAsignado,
      cantidadPersonas: selectedReservation.cantidadPersonas,
      cantidadNinos: selectedReservation.cantidadNinos,
      cantidadAdultosMayores: selectedReservation.cantidadAdultosMayores,
    }

    // @ts-expect-error literal type
    const updatedBills = saveBill(newBill)
    setBills(updatedBills)
    setIsDialogOpen(false)
    setSelectedClient(null)
    setSelectedReservation(null)
  }

  const handleDelete = (id: string) => {
    const updated = deleteBill(id)
    setBills(updated)
  }

  const handlePrint = (bill: Bill) => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Factura ${bill.numeroFactura}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .details { margin-bottom: 20px; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .totals { text-align: right; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Mueblería XYZ</h1>
          <p>Factura: ${bill.numeroFactura}</p>
          <p>Fecha: ${format(new Date(bill.fecha), "PPP", { locale: es })}</p>
        </div>
        
        <div class="details">
          <h3>Datos del Cliente</h3>
          <p>Nombre: ${bill.nombreCliente}</p>
          <p>Cédula: ${bill.cedulaCliente}</p>
          <p>N° Reservación: ${bill.numeroReservacion}</p>
          <p>Atendido por: ${bill.empleadoAsignado}</p>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${
              bill.cantidadPersonas > 0
                ? `
              <tr>
                <td>Adultos</td>
                <td>${bill.cantidadPersonas}</td>
                <td>${formatCurrency(bill.precioAdulto)}</td>
                <td>${formatCurrency(
                  bill.cantidadPersonas * bill.precioAdulto
                )}</td>
              </tr>
            `
                : ""
            }
            ${
              bill.cantidadNinos > 0
                ? `
              <tr>
                <td>Niños</td>
                <td>${bill.cantidadNinos}</td>
                <td>${formatCurrency(bill.precioNino)}</td>
                <td>${formatCurrency(bill.cantidadNinos * bill.precioNino)}</td>
              </tr>
            `
                : ""
            }
            ${
              bill.cantidadAdultosMayores > 0
                ? `
              <tr>
                <td>Adultos Mayores</td>
                <td>${bill.cantidadAdultosMayores}</td>
                <td>${formatCurrency(bill.precioAdultoMayor)}</td>
                <td>${formatCurrency(
                  bill.cantidadAdultosMayores * bill.precioAdultoMayor
                )}</td>
              </tr>
            `
                : ""
            }
          </tbody>
        </table>

        <div class="totals">
          <p>Subtotal: ${formatCurrency(bill.subtotal)}</p>
          <p>IVA (13%): ${formatCurrency(bill.iva)}</p>
          <p><strong>Total: ${formatCurrency(bill.total)}</strong></p>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(content)
    printWindow.document.close()
    printWindow.print()
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
              <h1 className="text-3xl font-bold tracking-tight">Facturación</h1>
              <p className="text-muted-foreground">
                Gestiona las facturas de los clientes
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nueva Factura
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Crear Nueva Factura</DialogTitle>
                  <DialogDescription>
                    Seleccione el cliente y la reservación para generar la
                    factura
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Cliente</Label>
                      <Select
                        value={selectedClient?.id}
                        onValueChange={handleClientSelect}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.nombre} - {client.cedula}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Reservación</Label>
                      <Select
                        value={selectedReservation?.id}
                        onValueChange={handleReservationSelect}
                        disabled={!selectedClient}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar reservación" />
                        </SelectTrigger>
                        <SelectContent>
                          {reservations
                            .filter((r) => r.clienteId === selectedClient?.id)
                            .map((reservation) => (
                              <SelectItem
                                key={reservation.id}
                                value={reservation.id}
                              >
                                {reservation.numeroReservacion} -{" "}
                                {format(
                                  new Date(reservation.fecha),
                                  "dd/MM/yyyy"
                                )}{" "}
                                {reservation.hora}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {selectedReservation && (
                    <div className="mt-4 p-4 border rounded-lg bg-muted/30">
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        Detalles de la Reservación
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant="outline" className="font-normal">
                              {selectedReservation.cantidadPersonas} adultos
                            </Badge>
                            {selectedReservation.cantidadNinos > 0 && (
                              <Badge variant="outline" className="font-normal">
                                {selectedReservation.cantidadNinos} niños
                              </Badge>
                            )}
                            {selectedReservation.cantidadAdultosMayores > 0 && (
                              <Badge variant="outline" className="font-normal">
                                {selectedReservation.cantidadAdultosMayores}{" "}
                                adultos mayores
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Empleado: {selectedReservation.empleadoAsignado}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Fecha:{" "}
                            {format(
                              new Date(selectedReservation.fecha),
                              "dd/MM/yyyy"
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-2 ml-6">
                            Hora: {selectedReservation.hora}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <DialogFooter className="mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false)
                        setSelectedClient(null)
                        setSelectedReservation(null)
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleCreateBill}
                      disabled={!selectedClient || !selectedReservation}
                    >
                      Generar Factura
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar facturas..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={dateFilter}
                    onValueChange={(
                      value: "all" | "today" | "week" | "month"
                    ) => setDateFilter(value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por fecha" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las fechas</SelectItem>
                      <SelectItem value="today">Hoy</SelectItem>
                      <SelectItem value="week">Última semana</SelectItem>
                      <SelectItem value="month">Último mes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-3 font-medium">
                          Nº Factura
                        </th>
                        <th className="text-left p-3 font-medium">Fecha</th>
                        <th className="text-left p-3 font-medium">Cliente</th>
                        <th className="text-left p-3 font-medium">Reserva</th>
                        <th className="text-left p-3 font-medium">Detalles</th>
                        <th className="text-left p-3 font-medium">Total</th>
                        <th className="text-right p-3 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <AnimatePresence>
                        {filteredBills.length > 0 ? (
                          filteredBills.map((bill) => (
                            <motion.tr
                              key={bill.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="hover:bg-muted/30"
                            >
                              <td className="p-3 font-medium">
                                {bill.numeroFactura}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    {format(new Date(bill.fecha), "dd/MM/yyyy")}
                                  </span>
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="font-medium">
                                  {bill.nombreCliente}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {bill.cedulaCliente}
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-1.5">
                                  <Receipt className="h-4 w-4 text-muted-foreground" />
                                  <span>#{bill.numeroReservacion}</span>
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="text-sm">
                                  {bill.cantidadPersonas > 0 && (
                                    <span className="inline-block mr-2">
                                      {bill.cantidadPersonas} adultos
                                    </span>
                                  )}
                                  {bill.cantidadNinos > 0 && (
                                    <span className="inline-block mr-2">
                                      {bill.cantidadNinos} niños
                                    </span>
                                  )}
                                  {bill.cantidadAdultosMayores > 0 && (
                                    <span className="inline-block">
                                      {bill.cantidadAdultosMayores} adultos
                                      mayores
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-1.5 font-medium">
                                  <DollarSign className="h-4 w-4 text-green-600" />
                                  <span>{formatCurrency(bill.total)}</span>
                                </div>
                              </td>
                              <td className="p-3 text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">
                                        Abrir menú
                                      </span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>
                                      Acciones
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handlePrint(bill)}
                                    >
                                      <Printer className="mr-2 h-4 w-4" />
                                      Imprimir
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDelete(bill.id)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Eliminar
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </motion.tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={7}
                              className="p-8 text-center text-muted-foreground"
                            >
                              <div className="flex flex-col items-center gap-2">
                                <FileText className="h-8 w-8" />
                                <h3 className="font-medium">
                                  No se encontraron facturas
                                </h3>
                                <p className="text-sm">
                                  {searchQuery || dateFilter !== "all"
                                    ? "Intente con otros criterios de búsqueda"
                                    : "Cree una nueva factura para comenzar"}
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Mostrando {filteredBills.length} de {bills.length} facturas
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}

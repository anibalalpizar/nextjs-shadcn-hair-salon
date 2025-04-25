"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Trash2, Plus, CalendarIcon, Search, MoreHorizontal, Users, Clock, CalendarDays } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { type Client, getClients } from "@/lib/clients"
import { getEmployees } from "@/lib/employees"
import {
  type Reservation,
  getReservations,
  saveReservation,
  deleteReservation,
  getAvailableHours,
} from "@/lib/reservations"
import { useAuth } from "@/app/context/auth-context"

export default function ReservationsPage() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState<Reservation[]>(() => getReservations())
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>(reservations)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [clients] = useState<Client[]>(() => getClients())
  const [employees] = useState(() => getEmployees())
  const [date, setDate] = useState<Date>()
  const [availableHours, setAvailableHours] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState<Date>()
  const [currentReservation, setCurrentReservation] = useState({
    clienteId: "",
    nombreCliente: "",
    fecha: "",
    hora: "",
    cantidadPersonas: 0,
    cantidadNinos: 0,
    cantidadAdultosMayores: 0,
    empleadoAsignado: "",
  })

  useEffect(() => {
    if (date && currentReservation.cantidadPersonas > 0) {
      const fechaStr = format(date, "yyyy-MM-dd")
      const horas = getAvailableHours(
        fechaStr,
        currentReservation.cantidadPersonas +
          currentReservation.cantidadNinos +
          currentReservation.cantidadAdultosMayores,
      )
      setAvailableHours(horas)
    }
  }, [
    date,
    currentReservation.cantidadPersonas,
    currentReservation.cantidadNinos,
    currentReservation.cantidadAdultosMayores,
  ])

  useEffect(() => {
    let result = reservations

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (res) =>
          res.nombreCliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
          res.numeroReservacion?.toString().includes(searchQuery) ||
          res.empleadoAsignado.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply date filter
    if (dateFilter) {
      const filterDateStr = format(dateFilter, "yyyy-MM-dd")
      result = result.filter((res) => res.fecha === filterDateStr)
    }

    setFilteredReservations(result)
  }, [reservations, searchQuery, dateFilter])

  if (!user) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!date) return

    const fechaStr = format(date, "yyyy-MM-dd")
    const saved = saveReservation({
      ...currentReservation,
      fecha: fechaStr,
    })
    setReservations(saved)
    setIsDialogOpen(false)
    setCurrentReservation({
      clienteId: "",
      nombreCliente: "",
      fecha: "",
      hora: "",
      cantidadPersonas: 0,
      cantidadNinos: 0,
      cantidadAdultosMayores: 0,
      empleadoAsignado: "",
    })
    setDate(undefined)
  }

  const handleDelete = (id: string) => {
    const updated = deleteReservation(id)
    setReservations(updated)
  }

  const handleClientChange = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    if (client) {
      setCurrentReservation({
        ...currentReservation,
        clienteId: client.id,
        nombreCliente: client.nombre,
      })
    }
  }

  const getTotalPersons = (reservation: Reservation) => {
    return reservation.cantidadPersonas + reservation.cantidadNinos + reservation.cantidadAdultosMayores
  }

  const getStatusBadge = (reservation: Reservation) => {
    const reservationDate = new Date(reservation.fecha + "T" + reservation.hora)
    const now = new Date()

    if (reservationDate < now) {
      return (
        <Badge variant="outline" className="bg-muted text-muted-foreground">
          Completada
        </Badge>
      )
    } else if (reservationDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return (
        <Badge variant="outline" className="bg-amber-100 text-amber-700">
          Hoy
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-700">
          Próxima
        </Badge>
      )
    }
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
              <h1 className="text-3xl font-bold tracking-tight">Reservas</h1>
              <p className="text-muted-foreground">Gestiona las reservaciones de los clientes</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nueva Reserva
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Crear Nueva Reserva</DialogTitle>
                  <DialogDescription>Complete el formulario con los datos de la reserva</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Cliente</Label>
                      <Select value={currentReservation.clienteId} onValueChange={handleClientChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Fecha</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>Hora</Label>
                      <Select
                        value={currentReservation.hora}
                        onValueChange={(hora) => setCurrentReservation({ ...currentReservation, hora })}
                        disabled={!date || availableHours.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar hora" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableHours.map((hora) => (
                            <SelectItem key={hora} value={hora}>
                              {hora}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Empleado Asignado</Label>
                      <Select
                        value={currentReservation.empleadoAsignado}
                        onValueChange={(empleado) =>
                          setCurrentReservation({
                            ...currentReservation,
                            empleadoAsignado: empleado,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar empleado" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.nombre}>
                              {employee.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cantidadPersonas">Cantidad de Adultos</Label>
                      <Input
                        id="cantidadPersonas"
                        type="number"
                        min="0"
                        value={currentReservation.cantidadPersonas}
                        onChange={(e) =>
                          setCurrentReservation({
                            ...currentReservation,
                            cantidadPersonas: Number.parseInt(e.target.value) || 0,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cantidadNinos">Cantidad de Niños</Label>
                      <Input
                        id="cantidadNinos"
                        type="number"
                        min="0"
                        value={currentReservation.cantidadNinos}
                        onChange={(e) =>
                          setCurrentReservation({
                            ...currentReservation,
                            cantidadNinos: Number.parseInt(e.target.value) || 0,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="cantidadAdultosMayores">Cantidad de Adultos Mayores</Label>
                      <Input
                        id="cantidadAdultosMayores"
                        type="number"
                        min="0"
                        value={currentReservation.cantidadAdultosMayores}
                        onChange={(e) =>
                          setCurrentReservation({
                            ...currentReservation,
                            cantidadAdultosMayores: Number.parseInt(e.target.value) || 0,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <DialogFooter className="mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false)
                        setCurrentReservation({
                          clienteId: "",
                          nombreCliente: "",
                          fecha: "",
                          hora: "",
                          cantidadPersonas: 0,
                          cantidadNinos: 0,
                          cantidadAdultosMayores: 0,
                          empleadoAsignado: "",
                        })
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        !currentReservation.clienteId ||
                        !date ||
                        !currentReservation.hora ||
                        !currentReservation.empleadoAsignado ||
                        currentReservation.cantidadPersonas +
                          currentReservation.cantidadNinos +
                          currentReservation.cantidadAdultosMayores ===
                          0
                      }
                    >
                      Crear Reservación
                    </Button>
                  </DialogFooter>
                </form>
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
                    placeholder="Buscar reservas..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        {dateFilter ? format(dateFilter, "dd/MM/yyyy") : "Filtrar por fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <div className="p-2">
                        <Calendar mode="single" selected={dateFilter} onSelect={setDateFilter} initialFocus />
                        {dateFilter && (
                          <div className="flex justify-end p-2 pt-4">
                            <Button variant="outline" size="sm" onClick={() => setDateFilter(undefined)}>
                              Limpiar
                            </Button>
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-3 font-medium">Nº Reserva</th>
                        <th className="text-left p-3 font-medium">Cliente</th>
                        <th className="text-left p-3 font-medium">Fecha y Hora</th>
                        <th className="text-left p-3 font-medium">Personas</th>
                        <th className="text-left p-3 font-medium">Empleado</th>
                        <th className="text-left p-3 font-medium">Estado</th>
                        <th className="text-right p-3 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <AnimatePresence>
                        {filteredReservations.length > 0 ? (
                          filteredReservations.map((reservation) => (
                            <motion.tr
                              key={reservation.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="hover:bg-muted/30"
                            >
                              <td className="p-3 font-medium">{reservation.numeroReservacion}</td>
                              <td className="p-3">
                                <div className="font-medium">{reservation.nombreCliente}</div>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-1.5">
                                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                  <span>{format(new Date(reservation.fecha), "dd/MM/yyyy")}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>{reservation.hora}</span>
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-1.5">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span>{getTotalPersons(reservation)}</span>
                                </div>
                                {(reservation.cantidadNinos > 0 || reservation.cantidadAdultosMayores > 0) && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {reservation.cantidadPersonas} adultos
                                    {reservation.cantidadNinos > 0 && `, ${reservation.cantidadNinos} niños`}
                                    {reservation.cantidadAdultosMayores > 0 &&
                                      `, ${reservation.cantidadAdultosMayores} adultos mayores`}
                                  </div>
                                )}
                              </td>
                              <td className="p-3">{reservation.empleadoAsignado}</td>
                              <td className="p-3">{getStatusBadge(reservation)}</td>
                              <td className="p-3 text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">Abrir menú</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleDelete(reservation.id)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Cancelar Reserva
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </motion.tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-muted-foreground">
                              <div className="flex flex-col items-center gap-2">
                                <CalendarDays className="h-8 w-8" />
                                <h3 className="font-medium">No se encontraron reservas</h3>
                                <p className="text-sm">
                                  {searchQuery || dateFilter
                                    ? "Intente con otros criterios de búsqueda"
                                    : "Cree una nueva reserva para comenzar"}
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
                Mostrando {filteredReservations.length} de {reservations.length} reservas
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}

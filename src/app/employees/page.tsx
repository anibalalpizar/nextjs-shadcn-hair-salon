"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"
import {
  Pencil,
  Trash2,
  Search,
  UserPlus,
  Users,
  MoreHorizontal,
} from "lucide-react"
import {
  type Employee,
  getEmployees,
  saveEmployee,
  updateEmployee,
  deleteEmployee,
} from "@/lib/employees"
import { useAuth } from "@/app/context/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function EmployeesPage() {
  const { user } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>(() => getEmployees())
  const [filteredEmployees, setFilteredEmployees] =
    useState<Employee[]>(employees)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isEditing, setIsEditing] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentEmployee, setCurrentEmployee] = useState<Partial<Employee>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPosition, setFilterPosition] = useState("all")

  useEffect(() => {
    let result = employees

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (emp) =>
          emp.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.cedula.includes(searchQuery) ||
          emp.correo.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply position filter
    if (filterPosition !== "all") {
      result = result.filter((emp) => emp.puesto === filterPosition)
    }

    setFilteredEmployees(result)
  }, [employees, searchQuery, filterPosition])

  if (!user) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentEmployee.id) {
      const updated = updateEmployee(currentEmployee as Employee)
      setEmployees(updated)
    } else {
      const saved = saveEmployee(currentEmployee as Employee)
      setEmployees(saved)
    }
    setCurrentEmployee({})
    setIsEditing(false)
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    const updated = deleteEmployee(id)
    setEmployees(updated)
  }

  const handleEdit = (employee: Employee) => {
    setCurrentEmployee(employee)
    setIsDialogOpen(true)
  }

  const positions = Array.from(new Set(employees.map((emp) => emp.puesto)))

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 0,
    }).format(amount)
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
              <h1 className="text-3xl font-bold tracking-tight">Empleados</h1>
              <p className="text-muted-foreground">
                Gestiona la información de los empleados de la empresa
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Nuevo Empleado
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {currentEmployee.id
                      ? "Editar Empleado"
                      : "Agregar Nuevo Empleado"}
                  </DialogTitle>
                  <DialogDescription>
                    Complete el formulario con los datos del empleado
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cedula">Cédula</Label>
                      <Input
                        id="cedula"
                        value={currentEmployee.cedula || ""}
                        onChange={(e) =>
                          setCurrentEmployee({
                            ...currentEmployee,
                            cedula: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre Completo</Label>
                      <Input
                        id="nombre"
                        value={currentEmployee.nombre || ""}
                        onChange={(e) =>
                          setCurrentEmployee({
                            ...currentEmployee,
                            nombre: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="direccion">Dirección</Label>
                      <Input
                        id="direccion"
                        value={currentEmployee.direccion || ""}
                        onChange={(e) =>
                          setCurrentEmployee({
                            ...currentEmployee,
                            direccion: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input
                        id="telefono"
                        value={currentEmployee.telefono || ""}
                        onChange={(e) =>
                          setCurrentEmployee({
                            ...currentEmployee,
                            telefono: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="correo">Correo Electrónico</Label>
                      <Input
                        id="correo"
                        type="email"
                        value={currentEmployee.correo || ""}
                        onChange={(e) =>
                          setCurrentEmployee({
                            ...currentEmployee,
                            correo: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="puesto">Puesto</Label>
                      <Select
                        value={currentEmployee.puesto || ""}
                        onValueChange={(value) =>
                          setCurrentEmployee({
                            ...currentEmployee,
                            puesto: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar puesto" />
                        </SelectTrigger>
                        <SelectContent>
                          {positions.map((position) => (
                            <SelectItem key={position} value={position}>
                              {position}
                            </SelectItem>
                          ))}
                          <SelectItem value="Gerente">Gerente</SelectItem>
                          <SelectItem value="Asistente">Asistente</SelectItem>
                          <SelectItem value="Vendedor">Vendedor</SelectItem>
                          <SelectItem value="Técnico">Técnico</SelectItem>
                          <SelectItem value="Administrativo">
                            Administrativo
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salario">Salario</Label>
                      <Input
                        id="salario"
                        type="number"
                        value={currentEmployee.salario || ""}
                        onChange={(e) =>
                          setCurrentEmployee({
                            ...currentEmployee,
                            salario: Number(e.target.value),
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="comision">Comisión (%)</Label>
                      <Input
                        id="comision"
                        type="number"
                        value={currentEmployee.comision || ""}
                        onChange={(e) =>
                          setCurrentEmployee({
                            ...currentEmployee,
                            comision: Number(e.target.value),
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
                        setCurrentEmployee({})
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {currentEmployee.id ? "Actualizar" : "Guardar"}
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
                    placeholder="Buscar empleados..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={filterPosition}
                    onValueChange={setFilterPosition}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por puesto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los puestos</SelectItem>
                      {positions.map((position) => (
                        <SelectItem key={position} value={position}>
                          {position}
                        </SelectItem>
                      ))}
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
                        <th className="text-left p-3 font-medium">Empleado</th>
                        <th className="text-left p-3 font-medium">Contacto</th>
                        <th className="text-left p-3 font-medium">Puesto</th>
                        <th className="text-left p-3 font-medium">Salario</th>
                        <th className="text-left p-3 font-medium">Comisión</th>
                        <th className="text-right p-3 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <AnimatePresence>
                        {filteredEmployees.length > 0 ? (
                          filteredEmployees.map((employee) => (
                            <motion.tr
                              key={employee.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="hover:bg-muted/30"
                            >
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-9 w-9">
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                      {getInitials(employee.nombre)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">
                                      {employee.nombre}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {employee.cedula}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="text-sm">
                                  <div>{employee.correo}</div>
                                  <div className="text-muted-foreground">
                                    {employee.telefono}
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                <Badge
                                  variant="outline"
                                  className="font-normal"
                                >
                                  {employee.puesto}
                                </Badge>
                              </td>
                              <td className="p-3 font-medium">
                                {formatCurrency(employee.salario)}
                              </td>
                              <td className="p-3">
                                <Badge
                                  variant="secondary"
                                  className="font-normal"
                                >
                                  {employee.comision}%
                                </Badge>
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
                                      onClick={() => handleEdit(employee)}
                                    >
                                      <Pencil className="mr-2 h-4 w-4" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDelete(employee.id)}
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
                              colSpan={6}
                              className="p-8 text-center text-muted-foreground"
                            >
                              <div className="flex flex-col items-center gap-2">
                                <Users className="h-8 w-8" />
                                <h3 className="font-medium">
                                  No se encontraron empleados
                                </h3>
                                <p className="text-sm">
                                  {searchQuery || filterPosition !== "all"
                                    ? "Intente con otros criterios de búsqueda"
                                    : "Agregue un nuevo empleado para comenzar"}
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
                Mostrando {filteredEmployees.length} de {employees.length}{" "}
                empleados
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}

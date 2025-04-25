/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { motion, AnimatePresence } from "framer-motion"
import {
  Pencil,
  Trash2,
  Search,
  UserPlus,
  Users,
  Download,
  MoreHorizontal,
  Building,
} from "lucide-react"
import {
  type Client,
  getClients,
  saveClient,
  updateClient,
  deleteClient,
} from "@/lib/clients"
import { useAuth } from "@/app/context/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function ClientsPage() {
  const { user } = useAuth()
  const [clients, setClients] = useState<Client[]>(() => getClients())
  const [filteredClients, setFilteredClients] = useState<Client[]>(clients)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentClient, setCurrentClient] = useState<Partial<Client>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [clientType, setClientType] = useState("all")

  useEffect(() => {
    let result = clients

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (client) =>
          client.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.cedula.includes(searchQuery) ||
          client.correo.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply client type filter if implemented
    // This is a placeholder - you would need to add a 'type' field to your Client interface
    if (clientType !== "all" && "type" in clients[0]) {
      result = result.filter((client: any) => client.type === clientType)
    }

    setFilteredClients(result)
  }, [clients, searchQuery, clientType])

  if (!user) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentClient.id) {
      const updated = updateClient(currentClient as Client)
      setClients(updated)
    } else {
      const saved = saveClient(currentClient as Client)
      setClients(saved)
    }
    setCurrentClient({})
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    const updated = deleteClient(id)
    setClients(updated)
  }

  const handleEdit = (client: Client) => {
    setCurrentClient(client)
    setIsDialogOpen(true)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Determine if client is a company based on name (just an example)
  const isCompany = (name: string) => {
    const companyIndicators = ["S.A.", "Inc.", "LLC", "Ltd", "S.R.L.", "Corp"]
    return companyIndicators.some((indicator) => name.includes(indicator))
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
              <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
              <p className="text-muted-foreground">
                Gestiona la información de los clientes de la empresa
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Nuevo Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {currentClient.id
                      ? "Editar Cliente"
                      : "Agregar Nuevo Cliente"}
                  </DialogTitle>
                  <DialogDescription>
                    Complete el formulario con los datos del cliente
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cedula">Cédula / RUC</Label>
                      <Input
                        id="cedula"
                        value={currentClient.cedula || ""}
                        onChange={(e) =>
                          setCurrentClient({
                            ...currentClient,
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
                        value={currentClient.nombre || ""}
                        onChange={(e) =>
                          setCurrentClient({
                            ...currentClient,
                            nombre: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="direccion">Dirección</Label>
                      <Input
                        id="direccion"
                        value={currentClient.direccion || ""}
                        onChange={(e) =>
                          setCurrentClient({
                            ...currentClient,
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
                        value={currentClient.telefono || ""}
                        onChange={(e) =>
                          setCurrentClient({
                            ...currentClient,
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
                        value={currentClient.correo || ""}
                        onChange={(e) =>
                          setCurrentClient({
                            ...currentClient,
                            correo: e.target.value,
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
                        setCurrentClient({})
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {currentClient.id ? "Actualizar" : "Guardar"}
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
                    placeholder="Buscar clientes..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select value={clientType} onValueChange={setClientType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los clientes</SelectItem>
                      <SelectItem value="individual">Particulares</SelectItem>
                      <SelectItem value="company">Empresas</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-3 font-medium">Cliente</th>
                        <th className="text-left p-3 font-medium">Contacto</th>
                        <th className="text-left p-3 font-medium">Dirección</th>
                        <th className="text-right p-3 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <AnimatePresence>
                        {filteredClients.length > 0 ? (
                          filteredClients.map((client) => (
                            <motion.tr
                              key={client.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="hover:bg-muted/30"
                            >
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-9 w-9">
                                    <AvatarFallback
                                      className={
                                        isCompany(client.nombre)
                                          ? "bg-amber-100 text-amber-600"
                                          : "bg-primary/10 text-primary"
                                      }
                                    >
                                      {isCompany(client.nombre) ? (
                                        <Building className="h-4 w-4" />
                                      ) : (
                                        getInitials(client.nombre)
                                      )}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">
                                      {client.nombre}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {client.cedula}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="text-sm">
                                  <div>{client.correo}</div>
                                  <div className="text-muted-foreground">
                                    {client.telefono}
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="text-sm max-w-md truncate">
                                  {client.direccion}
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
                                      onClick={() => handleEdit(client)}
                                    >
                                      <Pencil className="mr-2 h-4 w-4" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDelete(client.id)}
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
                              colSpan={4}
                              className="p-8 text-center text-muted-foreground"
                            >
                              <div className="flex flex-col items-center gap-2">
                                <Users className="h-8 w-8" />
                                <h3 className="font-medium">
                                  No se encontraron clientes
                                </h3>
                                <p className="text-sm">
                                  {searchQuery || clientType !== "all"
                                    ? "Intente con otros criterios de búsqueda"
                                    : "Agregue un nuevo cliente para comenzar"}
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
                Mostrando {filteredClients.length} de {clients.length} clientes
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}

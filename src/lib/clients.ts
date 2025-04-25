export interface Client {
  id: string
  cedula: string
  nombre: string
  direccion: string
  telefono: string
  correo: string
}

const STORAGE_KEY = "clients"

export const getClients = (): Client[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

export const saveClient = (client: Client) => {
  const clients = getClients()
  const newClients = [...clients, { ...client, id: crypto.randomUUID() }]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newClients))
  return newClients
}

export const updateClient = (client: Client) => {
  const clients = getClients()
  const newClients = clients.map((c) => (c.id === client.id ? client : c))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newClients))
  return newClients
}

export const deleteClient = (id: string) => {
  const clients = getClients()
  const newClients = clients.filter((c) => c.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newClients))
  return newClients
}

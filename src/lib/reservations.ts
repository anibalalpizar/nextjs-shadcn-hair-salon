export interface Reservation {
  id: string
  clienteId: string
  nombreCliente: string
  fecha: string
  hora: string
  cantidadPersonas: number
  cantidadNinos: number
  cantidadAdultosMayores: number
  empleadoAsignado: string
  numeroReservacion: string
}

const STORAGE_KEY = "reservations"
const HORARIOS = [
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
]
const CAPACIDAD_MAXIMA = 50

export const getReservations = (): Reservation[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

export const checkAvailability = (
  fecha: string,
  hora: string,
  cantidadTotal: number
): boolean => {
  const reservations = getReservations()
  const existingReservations = reservations.filter(
    (r) => r.fecha === fecha && r.hora === hora
  )

  const ocupados = existingReservations.reduce(
    (total, r) => total + r.cantidadPersonas,
    0
  )

  return ocupados + cantidadTotal <= CAPACIDAD_MAXIMA
}

export const generateReservationNumber = (): string => {
  return `RES-${Date.now().toString(36).toUpperCase()}`
}

export const getAvailableHours = (
  fecha: string,
  cantidadTotal: number
): string[] => {
  return HORARIOS.filter((hora) =>
    checkAvailability(fecha, hora, cantidadTotal)
  )
}

export const saveReservation = (
  reservation: Omit<Reservation, "id" | "numeroReservacion">
) => {
  const reservations = getReservations()
  const newReservation = {
    ...reservation,
    id: crypto.randomUUID(),
    numeroReservacion: generateReservationNumber(),
  }

  const newReservations = [...reservations, newReservation]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newReservations))
  return newReservations
}

export const deleteReservation = (id: string) => {
  const reservations = getReservations()
  const newReservations = reservations.filter((r) => r.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newReservations))
  return newReservations
}

export const getHorarios = () => HORARIOS

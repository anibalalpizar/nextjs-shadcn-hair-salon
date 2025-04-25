export interface Bill {
  id: string
  numeroFactura: string
  fecha: Date
  clienteId: string
  nombreCliente: string
  cedulaCliente: string
  reservacionId: string
  numeroReservacion: string
  empleadoAsignado: string
  cantidadPersonas: number
  cantidadNinos: number
  cantidadAdultosMayores: number
  precioAdulto: number
  precioNino: number
  precioAdultoMayor: number
  subtotal: number
  iva: number
  total: number
}

const STORAGE_KEY = "bills"
const PRECIO_ADULTO = 15000
const PRECIO_NINO = 8000
const PRECIO_ADULTO_MAYOR = 12000
const IVA = 0.13

export const getBills = (): Bill[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

export const generateBillNumber = (): string => {
  return `FAC-${Date.now().toString(36).toUpperCase()}`
}

export const calculateTotal = (
  cantidadPersonas: number,
  cantidadNinos: number,
  cantidadAdultosMayores: number
): { subtotal: number; iva: number; total: number } => {
  const subtotal =
    cantidadPersonas * PRECIO_ADULTO +
    cantidadNinos * PRECIO_NINO +
    cantidadAdultosMayores * PRECIO_ADULTO_MAYOR

  const ivaAmount = subtotal * IVA
  const total = subtotal + ivaAmount

  return {
    subtotal,
    iva: ivaAmount,
    total,
  }
}

export const saveBill = (
  bill: Omit<Bill, "id" | "numeroFactura" | "subtotal" | "iva" | "total">
) => {
  const bills = getBills()
  const { subtotal, iva, total } = calculateTotal(
    bill.cantidadPersonas,
    bill.cantidadNinos,
    bill.cantidadAdultosMayores
  )

  const newBill = {
    ...bill,
    id: crypto.randomUUID(),
    numeroFactura: generateBillNumber(),
    subtotal,
    iva,
    total,
    precioAdulto: PRECIO_ADULTO,
    precioNino: PRECIO_NINO,
    precioAdultoMayor: PRECIO_ADULTO_MAYOR,
  }

  const newBills = [...bills, newBill]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newBills))
  return newBills
}

export const deleteBill = (id: string) => {
  const bills = getBills()
  const newBills = bills.filter((b) => b.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newBills))
  return newBills
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
  }).format(amount)
}

import { format } from "date-fns"
import { getBills } from "./billing"
import { getReservations } from "./reservations"
import { getEmployees } from "./employees"

interface DailyAttendanceByEmployee {
  empleado: string
  total: number
  adultos: number
  ninos: number
  adultosMayores: number
}

interface DailyRevenueByEmployee {
  empleado: string
  totalIngresos: number
  ingresosPorAdultos: number
  ingresosPorNinos: number
  ingresosPorAdultosMayores: number
  comision: number
}

interface TimeSlotAttendance {
  hora: string
  cantidadPersonas: number
}

export const getDailyAttendance = (
  fecha: string
): DailyAttendanceByEmployee[] => {
  const reservations = getReservations()
  const dailyReservations = reservations.filter((r) => r.fecha === fecha)

  const attendanceByEmployee = new Map<string, DailyAttendanceByEmployee>()

  dailyReservations.forEach((reservation) => {
    const current = attendanceByEmployee.get(reservation.empleadoAsignado) || {
      empleado: reservation.empleadoAsignado,
      total: 0,
      adultos: 0,
      ninos: 0,
      adultosMayores: 0,
    }

    attendanceByEmployee.set(reservation.empleadoAsignado, {
      ...current,
      total:
        current.total +
        reservation.cantidadPersonas +
        reservation.cantidadNinos +
        reservation.cantidadAdultosMayores,
      adultos: current.adultos + reservation.cantidadPersonas,
      ninos: current.ninos + reservation.cantidadNinos,
      adultosMayores:
        current.adultosMayores + reservation.cantidadAdultosMayores,
    })
  })

  return Array.from(attendanceByEmployee.values())
}

export const getDailyRevenue = (fecha: string): DailyRevenueByEmployee[] => {
  const bills = getBills()
  const employees = getEmployees()
  const dailyBills = bills.filter(
    (b) => format(new Date(b.fecha), "yyyy-MM-dd") === fecha
  )

  const revenueByEmployee = new Map<string, DailyRevenueByEmployee>()

  dailyBills.forEach((bill) => {
    const employee = employees.find((e) => e.nombre === bill.empleadoAsignado)
    const comisionRate = employee?.comision || 0

    const current = revenueByEmployee.get(bill.empleadoAsignado) || {
      empleado: bill.empleadoAsignado,
      totalIngresos: 0,
      ingresosPorAdultos: 0,
      ingresosPorNinos: 0,
      ingresosPorAdultosMayores: 0,
      comision: 0,
    }

    const ingresosPorAdultos = bill.cantidadPersonas * bill.precioAdulto
    const ingresosPorNinos = bill.cantidadNinos * bill.precioNino
    const ingresosPorAdultosMayores =
      bill.cantidadAdultosMayores * bill.precioAdultoMayor
    const totalIngresos =
      ingresosPorAdultos + ingresosPorNinos + ingresosPorAdultosMayores
    const comision = (totalIngresos * comisionRate) / 100

    revenueByEmployee.set(bill.empleadoAsignado, {
      ...current,
      totalIngresos: current.totalIngresos + totalIngresos,
      ingresosPorAdultos: current.ingresosPorAdultos + ingresosPorAdultos,
      ingresosPorNinos: current.ingresosPorNinos + ingresosPorNinos,
      ingresosPorAdultosMayores:
        current.ingresosPorAdultosMayores + ingresosPorAdultosMayores,
      comision: current.comision + comision,
    })
  })

  return Array.from(revenueByEmployee.values())
}

export const getTimeSlotAnalysis = (
  fecha: string
): {
  mayorAfluencia: TimeSlotAttendance
  menorAfluencia: TimeSlotAttendance
} => {
  const reservations = getReservations()
  const dailyReservations = reservations.filter((r) => r.fecha === fecha)

  const attendanceByHour = new Map<string, number>()

  dailyReservations.forEach((reservation) => {
    const current = attendanceByHour.get(reservation.hora) || 0
    attendanceByHour.set(
      reservation.hora,
      current +
        reservation.cantidadPersonas +
        reservation.cantidadNinos +
        reservation.cantidadAdultosMayores
    )
  })

  const timeSlots = Array.from(attendanceByHour.entries()).map(
    ([hora, cantidadPersonas]) => ({
      hora,
      cantidadPersonas,
    })
  )

  if (timeSlots.length === 0) {
    return {
      mayorAfluencia: { hora: "N/A", cantidadPersonas: 0 },
      menorAfluencia: { hora: "N/A", cantidadPersonas: 0 },
    }
  }

  const mayorAfluencia = timeSlots.reduce((max, current) =>
    current.cantidadPersonas > max.cantidadPersonas ? current : max
  )

  const menorAfluencia = timeSlots.reduce((min, current) =>
    current.cantidadPersonas < min.cantidadPersonas ? current : min
  )

  return { mayorAfluencia, menorAfluencia }
}

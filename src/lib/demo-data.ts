export const demoEmployees = [
  {
    id: "emp1",
    cedula: "1-1234-5678",
    nombre: "Stephanie Chacón",
    direccion: "San José, Costa Rica",
    telefono: "8888-8888",
    correo: "juan@example.com",
    comision: 5,
    salario: 450000,
    puesto: "Estilista Senior",
  },
  {
    id: "emp2",
    cedula: "2-3456-7890",
    nombre: "Nancy Calderón",
    direccion: "Heredia, Costa Rica",
    telefono: "7777-7777",
    correo: "maria@example.com",
    comision: 4,
    salario: 400000,
    puesto: "Estilista",
  },
]

export const demoClients = [
  {
    id: "cli1",
    cedula: "1-2345-6789",
    nombre: "Ana Rodríguez",
    direccion: "Cartago, Costa Rica",
    telefono: "6666-6666",
    correo: "ana@example.com",
  },
  {
    id: "cli2",
    cedula: "3-4567-8901",
    nombre: "Carlos Mora",
    direccion: "Alajuela, Costa Rica",
    telefono: "5555-5555",
    correo: "carlos@example.com",
  },
]

export const demoReservations = [
  {
    id: "res1",
    clienteId: "cli1",
    nombreCliente: "Ana Rodríguez",
    fecha: new Date().toISOString().split("T")[0],
    hora: "14:00",
    cantidadPersonas: 2,
    cantidadNinos: 1,
    cantidadAdultosMayores: 0,
    empleadoAsignado: "Juan Pérez",
    numeroReservacion: "RES-ABC123",
  },
  {
    id: "res2",
    clienteId: "cli2",
    nombreCliente: "Carlos Mora",
    fecha: new Date().toISOString().split("T")[0],
    hora: "16:00",
    cantidadPersonas: 1,
    cantidadNinos: 0,
    cantidadAdultosMayores: 2,
    empleadoAsignado: "María González",
    numeroReservacion: "RES-DEF456",
  },
]

export const demoBills = [
  {
    id: "bill1",
    numeroFactura: "FAC-ABC123",
    fecha: new Date(),
    clienteId: "cli1",
    nombreCliente: "Ana Rodríguez",
    cedulaCliente: "1-2345-6789",
    reservacionId: "res1",
    numeroReservacion: "RES-ABC123",
    empleadoAsignado: "Juan Pérez",
    cantidadPersonas: 2,
    cantidadNinos: 1,
    cantidadAdultosMayores: 0,
    precioAdulto: 15000,
    precioNino: 8000,
    precioAdultoMayor: 12000,
    subtotal: 38000,
    iva: 4940,
    total: 42940,
  },
]

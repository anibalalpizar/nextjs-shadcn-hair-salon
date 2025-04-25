export interface Employee {
  id: string
  cedula: string
  nombre: string
  direccion: string
  telefono: string
  correo: string
  comision: number
  salario: number
  puesto: string
}

const STORAGE_KEY = "employees"

export const getEmployees = (): Employee[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

export const saveEmployee = (employee: Employee) => {
  const employees = getEmployees()
  const newEmployees = [...employees, { ...employee, id: crypto.randomUUID() }]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newEmployees))
  return newEmployees
}

export const updateEmployee = (employee: Employee) => {
  const employees = getEmployees()
  const newEmployees = employees.map((emp) =>
    emp.id === employee.id ? employee : emp
  )
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newEmployees))
  return newEmployees
}

export const deleteEmployee = (id: string) => {
  const employees = getEmployees()
  const newEmployees = employees.filter((emp) => emp.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newEmployees))
  return newEmployees
}

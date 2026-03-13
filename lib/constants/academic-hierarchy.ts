// Academic Hierarchy Constants
// Departments, Faculties, and Careers for the platform

export type Department = 'Santa Cruz' | 'Cochabamba' | 'La Paz'
export type Faculty = 'Tecnologia' | 'Economia' | 'Derecho'

// Department list
export const DEPARTMENTS: Department[] = [
  'Santa Cruz',
  'Cochabamba',
  'La Paz',
]

// Faculty list (same for all departments)
export const FACULTIES: Faculty[] = [
  'Tecnologia',
  'Economia',
  'Derecho',
]

// Careers by Faculty
export const CAREERS_BY_FACULTY: Record<Faculty, string[]> = {
  'Tecnologia': [
    'Ing. de Alimentos',
    'Ing. Civil',
    'Ing. Mecanica',
    'Ing. Electromecanica',
    'Ing. Industrial',
    'Ing. de Sistemas',
    'Ing. Quimica',
    'Ing. Electrica',
    'Ing. Informatica',
    'Ing. Petroquimica',
    'Ing. Electronica',
    'Ing. en Energia',
    'Ing. Matematica',
    'Ing. en Biotecnologia',
  ],
  'Economia': [
    'Adm. de Empresas',
    'Contaduria Publica',
    'Economia',
    'Ing. Comercial',
    'Ing. Financiera',
  ],
  'Derecho': [
    'Lic. Ciencias Juridicas',
    'Lic. Ciencias Politicas',
  ],
}

// Helper function to get all careers
export function getAllCareers(): string[] {
  return Object.values(CAREERS_BY_FACULTY).flat()
}

// Helper function to get careers by faculty
export function getCareersByFaculty(faculty: Faculty): string[] {
  return CAREERS_BY_FACULTY[faculty] || []
}

// Helper function to get faculty by career
export function getFacultyByCareer(career: string): Faculty | null {
  for (const [faculty, careers] of Object.entries(CAREERS_BY_FACULTY)) {
    if (careers.includes(career)) {
      return faculty as Faculty
    }
  }
  return null
}

// Helper function to validate department
export function isValidDepartment(department: string): department is Department {
  return DEPARTMENTS.includes(department as Department)
}

// Helper function to validate faculty
export function isValidFaculty(faculty: string): faculty is Faculty {
  return FACULTIES.includes(faculty as Faculty)
}

// Helper function to validate career
export function isValidCareer(career: string): boolean {
  return getAllCareers().includes(career)
}

// Helper function to validate the complete hierarchy
export function validateAcademicHierarchy(
  department: string,
  faculty: string,
  career: string
): { valid: boolean; error?: string } {
  if (!isValidDepartment(department)) {
    return { valid: false, error: 'Departamento inválido' }
  }
  
  if (!isValidFaculty(faculty)) {
    return { valid: false, error: 'Facultad inválida' }
  }
  
  if (!isValidCareer(career)) {
    return { valid: false, error: 'Carrera inválida' }
  }
  
  const careerFaculty = getFacultyByCareer(career)
  if (careerFaculty !== faculty) {
    return { valid: false, error: 'La carrera no pertenece a la facultad seleccionada' }
  }
  
  return { valid: true }
}

// Academic Hierarchy Constants
// Departments, Faculties, and Careers for the platform

export type Department = 'Santa Cruz' | 'Cochabamba' | 'La Paz' | 'Chuquisaca' | 'Tarija' | 'Oruro' | 'Potosi' | 'Pando' | 'Beni'
export type Faculty = 
  | 'Facultad de Tecnologia' 
  | 'Facultad de Economia' 
  | 'Facultad de Derecho'
  | 'Facultad de Ciencias Agrícolas y Agropecuarias'
  | 'Facultad de Ciencias Farmacéuticas y Bioquímicas'
  | 'Facultad de Desarrollo Rural y Territorial'
  | 'Facultad de Odontología'
  | 'Facultad de Medicina'
  | 'Facultad de Arquitectura'
  | 'Facultad de Humanidades'
  | 'Facultad de Ciencias Sociales'
  | 'Facultad de Ciencias Veterinarias'

// Department list
export const DEPARTMENTS: Department[] = [
  'Santa Cruz',
  'Cochabamba',
  'La Paz',
  'Chuquisaca',
  'Tarija',
  'Oruro',
  'Potosi',
  'Pando',
  'Beni'
]

// Faculty list (same for all departments)
export const FACULTIES: Faculty[] = [
  'Facultad de Tecnologia',
  'Facultad de Economia',
  'Facultad de Derecho',
  'Facultad de Ciencias Agrícolas y Agropecuarias',
  'Facultad de Ciencias Farmacéuticas y Bioquímicas',
  'Facultad de Desarrollo Rural y Territorial',
  'Facultad de Odontología',
  'Facultad de Medicina',
  'Facultad de Arquitectura',
  'Facultad de Humanidades',
  'Facultad de Ciencias Sociales',
  'Facultad de Ciencias Veterinarias'
]

// Careers by Faculty
export const CAREERS_BY_FACULTY: Record<Faculty, string[]> = {
  'Facultad de Tecnologia': [
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
    'Ing. en Biotecnologia',
    'Lic. En Matematica',
    'Lic. En Biologia',
    'Lic. En Fisica',
    'Lic. En Quimica',
    'Prog. Desc De Tec Univ Sup En Gastronomia',
    'Ing. Ambiental',
    'Ing. De Procesos Industriales'
  ],
  'Facultad de Economia': [
    'Adm. de Empresas',
    'Contaduria Publica',
    'Economia',
    'Ing. Comercial',
    'Ing. Financiera',
  ],
  'Facultad de Derecho': [
    'Lic. Ciencias Juridicas',
    'Lic. Ciencias Politicas',
  ],
  'Facultad de Ciencias Agrícolas y Agropecuarias': [
    'Ing. Agricola',
    'Ing. Fitotecnista',
    'Ing. Forestal',
    'Ing. Agronomo Zootecnista',
    'Ing. Agroindustrial',
    'Lice. En Ingenieria Agronomica',
    'Ing. Del Medio Ambiente',
    'Tec. Superior En Mecanizacion Agricola'
  ],
  'Facultad de Ciencias Farmacéuticas y Bioquímicas': [
    'Lic. En Bioquimica Y Farmacia'
  ],
  'Facultad de Desarrollo Rural y Territorial': [
    'Lic. En Prod. Agraria Y Des. Territorial',
    'Ing. En Gest De Rec Hid. Agro',
    'Lic. Desarr. Rural Sostenible',
    'Ing. En Piscicultura',
    'Tec. Superior En Agronomia'
  ],
  'Facultad de Odontología': [
    'Lic. En Odontologia'
  ],
  'Facultad de Medicina': [
    'Lic. En Fisioterapia Y Kinesiologia',
    'Lic. En Medicina',
    'Lic. En Nutricion Y Dietetica',
    'Lic. En Enfermeria'
  ],
  'Facultad de Arquitectura': [
    'Lic. En Dis. Interiores Y Del Mobiliario',
    'Lic. En Diseño Graf Y Comunic Visual',
    'Lic. En Planif. Del Terr. Y Med. Amb',
    'Lic. En Arquitectura',
    'Lic. En Turismo',
    'Tec. Univ. Med. Etnoturismo Comunit',
    'Tec. Univ. Superior En Construcciones'
  ],
  'Facultad de Humanidades': [
    'Lic. De Linguis. Aplic. Y Ensen. De Leng',
    'Lic. En Linguis. Aplic.enseñanza Lenguas',
    'Lic. En Ciencias De La Educacion',
    'Lic. En Comunicacion Social',
    'Lic. Enciatura En Psicologia',
    'Lic. En Trabajo Social',
    'Prog Tec Sup. En Educ. Infant Parvulario',
    'Prog. Lic. En Pedagogia Social Producti',
    'Prog. Lic. En Cs. Act. Fisica Y Deporte',
    'Prog. Lic. Esp. En Cien. Soc. E Intercul',
    'Prog. Lic. Esp. En Leng. Orig. Y Comunic',
    'Prog. De Licenciatura En Musica',
    'Prog. Lic. Esp. Ed. Intercul.bilingue'
  ],
  'Facultad de Ciencias Sociales': [
    'Lic. En Sociologia',
    'Lic. En Antropologia',
    'Lic. En Historia'
  ],
  'Facultad de Ciencias Veterinarias': [
    'Lic. En Medicina Veterinaria Y Zootecnia'
  ]
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

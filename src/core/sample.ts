import type { CVData } from '@/types/cv'
import {
  createCustomEntry,
  createCustomSection,
  createEducation,
  createEmptyCV,
  createExperience,
  createLanguage,
  createLink,
  createSkillGroup,
} from './factory'

/**
 * Sample content, loaded on demand from the toolbar (never silently): it lets
 * someone see a finished CV in every template before typing anything, and it
 * exercises each section — including a custom one — for template development.
 */
export function createSampleCV(): CVData {
  const cv = createEmptyCV()
  cv.meta.title = 'CV de ejemplo'

  cv.personal = {
    ...cv.personal,
    fullName: 'Nadia Martín Reyes',
    headline: 'Desarrolladora Full-Stack',
    email: 'nadia.martin@example.com',
    phone: '+34 600 123 456',
    location: 'Valencia, España',
    links: [
      { ...createLink(), label: 'LinkedIn', url: 'linkedin.com/in/nadiamartin' },
      { ...createLink(), label: 'GitHub', url: 'github.com/nadiamartin' },
    ],
  }

  cv.summary =
    'Desarrolladora full-stack con seis años construyendo productos web en equipos pequeños. ' +
    'Trabajo sobre todo con TypeScript y Python, y disfruto de la parte donde el producto y la ' +
    'infraestructura se tocan. Busco un equipo que se tome en serio la calidad del código.'

  cv.experience = [
    {
      ...createExperience(),
      position: 'Desarrolladora Senior',
      company: 'Cartograf',
      location: 'Remoto',
      startDate: '2022-03',
      endDate: null,
      description: 'Plataforma de análisis geoespacial para administraciones públicas.',
      highlights: [
        'Reduje el tiempo de carga del visor de mapas de 4,2 s a 1,1 s reescribiendo la capa de teselado.',
        'Diseñé la migración a un monorepo que dejó el despliegue en un solo comando.',
        'Mentoricé a dos personas junior hasta llevar features a producción de forma autónoma.',
      ],
    },
    {
      ...createExperience(),
      position: 'Desarrolladora Full-Stack',
      company: 'Estudio Nube',
      location: 'Valencia',
      startDate: '2019-09',
      endDate: '2022-02',
      description: 'Agencia de producto digital: seis proyectos de cliente de principio a fin.',
      highlights: [
        'Construí el sistema de diseño compartido que usaron cuatro proyectos simultáneos.',
        'Automaticé el pipeline de QA visual y corté las regresiones de maquetación a la mitad.',
      ],
    },
  ]

  cv.education = [
    {
      ...createEducation(),
      degree: 'Grado en Ingeniería Informática',
      institution: 'Universitat Politècnica de València',
      location: 'Valencia',
      startDate: '2014-09',
      endDate: '2018-06',
      description: 'Mención en Ingeniería del Software. Proyecto final sobre visualización de datos.',
    },
  ]

  cv.skills = [
    { ...createSkillGroup(), category: 'Lenguajes', items: [
        { name: 'TypeScript', level: 5 },
        { name: 'Python', level: 4 },
        { name: 'Go', level: 3 },
        { name: 'SQL', level: 4 },
      ] },
    { ...createSkillGroup(), category: 'Frontend', items: ['Vue 3', 'React', 'Vite', 'CSS moderno'].map((name) => ({ name })) },
    { ...createSkillGroup(), category: 'Backend', items: ['FastAPI', 'PostgreSQL', 'Redis', 'Docker'].map((name) => ({ name })) },
  ]

  cv.languages = [
    { ...createLanguage(), name: 'Español', level: 'Nativo' },
    { ...createLanguage(), name: 'Inglés', level: 'C1' },
    { ...createLanguage(), name: 'Francés', level: 'B1' },
  ]

  const talks = createCustomSection('Charlas')
  talks.entries = [
    {
      ...createCustomEntry(),
      title: 'Renderizar mapas sin morir en el intento',
      subtitle: 'ValenciaJS',
      date: '2024',
      description: 'Sobre presupuestos de rendimiento en visores de datos geoespaciales.',
    },
  ]
  cv.customSections = [talks]
  cv.sectionOrder = [...cv.sectionOrder, talks.id]

  return cv
}

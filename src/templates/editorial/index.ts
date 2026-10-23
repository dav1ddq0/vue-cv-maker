import type { TemplateDefinition } from '@/types/template'
import thumbnail from './thumbnail'

const definition: TemplateDefinition = {
  id: 'editorial',
  name: 'Editorial',
  descriptionKey: 'templates.editorial.description',
  thumbnail,
  supports: ['accentColor', 'customFont', 'multiPage'],
  // Warm ink brown and a serif face: the authority comes from the typography, not
  // from a colored band, which is also what keeps it ATS-safe.
  defaults: {
    accentColor: '#5b4636',
    fontFamily: "'Iowan Old Style', Georgia, 'Times New Roman', serif",
  },
  tags: ['tags.serif', 'tags.oneColumn', 'tags.ats'],
  component: () => import('./Template.vue').then((m) => m.default),
}

export default definition

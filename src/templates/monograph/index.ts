import type { TemplateDefinition } from '@/types/template'
import thumbnail from './thumbnail'

const definition: TemplateDefinition = {
  id: 'monograph',
  name: 'Monograph',
  descriptionKey: 'templates.monograph.description',
  thumbnail,
  supports: ['accentColor', 'customFont', 'multiPage'],
  defaults: {
    accentColor: '#5b3a58',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  tags: ['tags.minimal', 'tags.oneColumn', 'tags.ats'],
  component: () => import('./Template.vue').then((m) => m.default),
}

export default definition

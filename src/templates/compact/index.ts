import type { TemplateDefinition } from '@/types/template'
import thumbnail from './thumbnail'

const definition: TemplateDefinition = {
  id: 'compact',
  name: 'Compact',
  descriptionKey: 'templates.compact.description',
  thumbnail,
  supports: ['accentColor', 'customFont', 'multiPage'],
  defaults: {
    accentColor: '#7c2d3a',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  tags: ['tags.dense', 'tags.longCareer', 'tags.ats'],
  component: () => import('./Template.vue').then((m) => m.default),
}

export default definition

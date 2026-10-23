import type { TemplateDefinition } from '@/types/template'
import thumbnail from './thumbnail'

const definition: TemplateDefinition = {
  id: 'aurora',
  name: 'Aurora',
  descriptionKey: 'templates.aurora.description',
  thumbnail,
  supports: ['photo', 'sidebar', 'accentColor', 'customFont', 'multiPage'],
  defaults: {
    accentColor: '#0f766e',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  tags: ['tags.twoColumn', 'tags.photo', 'tags.lowInk'],
  component: () => import('./Template.vue').then((m) => m.default),
}

export default definition

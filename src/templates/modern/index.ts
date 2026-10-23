import type { TemplateDefinition } from '@/types/template'
import thumbnail from './thumbnail'

const definition: TemplateDefinition = {
  id: 'modern',
  name: 'Modern',
  descriptionKey: 'templates.modern.description',
  thumbnail,
  supports: ['photo', 'sidebar', 'accentColor', 'customFont', 'multiPage'],
  defaults: {
    accentColor: '#2563eb',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  tags: ['tags.twoColumn', 'tags.photo', 'tags.bold'],
  component: () => import('./Template.vue').then((m) => m.default),
}

export default definition

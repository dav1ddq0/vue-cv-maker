import type { TemplateDefinition } from '@/types/template'
import thumbnail from './thumbnail'

const definition: TemplateDefinition = {
  id: 'classic',
  name: 'Classic',
  descriptionKey: 'templates.classic.description',
  thumbnail,
  supports: ['accentColor', 'multiPage'],
  defaults: {
    accentColor: '#1f3a63',
    fontFamily: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
  },
  tags: ['tags.oneColumn', 'tags.ats', 'tags.noPhoto'],
  component: () => import('./Template.vue').then((m) => m.default),
}

export default definition

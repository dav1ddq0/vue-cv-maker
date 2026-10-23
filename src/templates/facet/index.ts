import type { TemplateDefinition } from '@/types/template'
import thumbnail from './thumbnail'

const definition: TemplateDefinition = {
  id: 'facet',
  name: 'Facet',
  descriptionKey: 'templates.facet.description',
  thumbnail,
  supports: ['photo', 'accentColor', 'customFont', 'multiPage', 'skillLevels'],
  defaults: {
    accentColor: '#4338ca',
    fontFamily: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
  },
  tags: ['tags.twoColumn', 'tags.photo', 'tags.bold'],
  component: () => import('./Template.vue').then((m) => m.default),
}

export default definition

import type { TemplateDefinition } from '@/types/template'
import thumbnail from './thumbnail'

const definition: TemplateDefinition = {
  id: 'chevron',
  name: 'Chevron',
  descriptionKey: 'templates.chevron.description',
  thumbnail,
  supports: ['photo', 'accentColor', 'customFont', 'multiPage', 'skillLevels'],
  defaults: {
    accentColor: '#7e22ce',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  tags: ['tags.twoColumn', 'tags.photo', 'tags.bold'],
  component: () => import('./Template.vue').then((m) => m.default),
}

export default definition

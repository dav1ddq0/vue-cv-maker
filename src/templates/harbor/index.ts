import type { TemplateDefinition } from '@/types/template'
import thumbnail from './thumbnail'

const definition: TemplateDefinition = {
  id: 'harbor',
  name: 'Harbor',
  descriptionKey: 'templates.harbor.description',
  thumbnail,
  supports: ['photo', 'sidebar', 'accentColor', 'customFont', 'multiPage', 'skillLevels'],
  defaults: {
    accentColor: '#0369a1',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  tags: ['tags.twoColumn', 'tags.photo', 'tags.bold'],
  component: () => import('./Template.vue').then((m) => m.default),
}

export default definition

import type { TemplateDefinition } from '@/types/template'
import thumbnail from './thumbnail'

const definition: TemplateDefinition = {
  id: 'meridian',
  name: 'Meridian',
  descriptionKey: 'templates.meridian.description',
  thumbnail,
  supports: ['photo', 'sidebar', 'accentColor', 'customFont', 'multiPage'],
  defaults: {
    accentColor: '#be123c',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  tags: ['tags.twoColumn', 'tags.photo', 'tags.bold', 'tags.longCareer'],
  component: () => import('./Template.vue').then((m) => m.default),
}

export default definition

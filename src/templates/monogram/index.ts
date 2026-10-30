import type { TemplateDefinition } from '@/types/template'
import thumbnail from './thumbnail'

const definition: TemplateDefinition = {
  id: 'monogram',
  name: 'Monogram',
  descriptionKey: 'templates.monogram.description',
  thumbnail,
  supports: ['photo', 'sidebar', 'accentColor', 'customFont', 'multiPage', 'skillLevels'],
  defaults: {
    accentColor: '#0a6bbd',
    fontFamily: "Georgia, 'Times New Roman', serif",
  },
  tags: ['tags.twoColumn', 'tags.photo', 'tags.serif'],
  component: () => import('./Template.vue').then((m) => m.default),
}

export default definition

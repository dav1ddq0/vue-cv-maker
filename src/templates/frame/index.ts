import type { TemplateDefinition } from '@/types/template'
import thumbnail from './thumbnail'

const definition: TemplateDefinition = {
  id: 'frame',
  name: 'Frame',
  descriptionKey: 'templates.frame.description',
  thumbnail,
  supports: ['photo', 'accentColor', 'customFont', 'multiPage'],
  defaults: {
    accentColor: '#b45309',
    fontFamily: "Georgia, 'Times New Roman', serif",
  },
  tags: ['tags.oneColumn', 'tags.photo', 'tags.serif'],
  component: () => import('./Template.vue').then((m) => m.default),
}

export default definition

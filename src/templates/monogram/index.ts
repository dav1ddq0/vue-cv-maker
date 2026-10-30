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
  palette: ['#2f3a45', '#5b7285', '#1f4e79', '#0a6bbd', '#17788a', '#12805c', '#e1a21a', '#b9a273', '#d81920'],
  tags: ['tags.twoColumn', 'tags.photo', 'tags.serif'],
  component: () => import('./Template.vue').then((m) => m.default),
}

export default definition

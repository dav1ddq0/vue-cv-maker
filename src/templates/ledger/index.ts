import type { TemplateDefinition } from '@/types/template'
import thumbnail from './thumbnail'

const definition: TemplateDefinition = {
  id: 'ledger',
  name: 'Ledger',
  descriptionKey: 'templates.ledger.description',
  thumbnail,
  supports: ['accentColor', 'customFont', 'multiPage', 'skillLevels'],
  defaults: {
    accentColor: '#0e7490',
    fontFamily: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
  },
  tags: ['tags.oneColumn', 'tags.noPhoto', 'tags.ats'],
  component: () => import('./Template.vue').then((m) => m.default),
}

export default definition

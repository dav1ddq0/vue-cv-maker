declare module 'pagedjs' {
  export class Previewer {
    preview(
      content: string | Element,
      stylesheets?: Array<string | Record<string, string>>,
      renderTo?: Element,
    ): Promise<{ total: number; performance: number }>
  }
}

// Transitions between steps, views and panes (spec 048): they run, in the right direction, survive
// being hammered or interrupted, leave nothing behind, and stand down for reduced motion.
const { devices } = require('playwright')
const { check, open, settled, startSample } = require('./lib.cjs')

/** Counts the View Transitions the page starts. */
const COUNT_VT = () => {
  window.__vt = 0
  const start = document.startViewTransition?.bind(document)
  if (start) document.startViewTransition = (callback) => (window.__vt++, start(callback))
}

/** Samples the step's opacity and horizontal offset every frame for `ms`. */
const sampleStep = (p, ms = 800) =>
  p.evaluate(
    (ms) =>
      new Promise((resolve) => {
        const out = []
        const t0 = performance.now()
        const tick = () => {
          const el = document.querySelector('.wizard .step-frame')
          const style = el && getComputedStyle(el)
          const dx = style && style.transform !== 'none' ? new DOMMatrixReadOnly(style.transform).m41 : 0
          out.push({ opacity: style ? Number(style.opacity) : 1, dx })
          if (performance.now() - t0 < ms) requestAnimationFrame(tick)
          else resolve(out)
        }
        tick()
      }),
    ms,
  )

/** The sides the form travels through, in order: 'L' when it is left of its place, 'R' when right. */
const travel = (frames) => frames.map((f) => (f.dx < -4 ? 'L' : f.dx > 4 ? 'R' : '')).filter(Boolean).join('').replace(/(.)\1+/g, '$1')

const heading = (p, name) => p.getByRole('heading', { name, exact: true }).first().isVisible().catch(() => false)
const vts = (p) => p.evaluate(() => window.__vt)

async function desktop(browser) {
  const B = 'transitions'
  const p = await open(browser, { viewport: { width: 1440, height: 900 } })
  await p.evaluate(COUNT_VT)
  await startSample(p)

  // Forward: the form fades out sliding left, then in from the right.
  let sampled = sampleStep(p)
  await p.getByRole('button', { name: /Siguiente/ }).first().click()
  let frames = await sampled
  check(B, 'a step fades out and back in when going forward', Math.min(...frames.map((f) => f.opacity)) < 0.2 && frames.at(-1).opacity === 1)
  check(B, 'forward leaves to the left and enters from the right', travel(frames) === 'LR', travel(frames))
  await settled(p)

  sampled = sampleStep(p)
  await p.getByRole('button', { name: /^←/ }).first().click()
  frames = await sampled
  check(B, 'back leaves to the right and enters from the left', travel(frames) === 'RL', travel(frames))
  await settled(p)

  // Hammering the button: the end state is the right step, with one form and nothing left mid-way.
  for (let i = 0; i < 6; i++) await p.getByRole('button', { name: /Siguiente/ }).first().click({ noWaitAfter: true, timeout: 3000 }).catch(() => {})
  await settled(p)
  check(B, 'six quick clicks on Next land on the seventh step', await heading(p, 'Secciones propias'))
  const leftovers = () => p.evaluate(() => ({ forms: document.querySelectorAll('.wizard .step-frame').length, leaving: document.querySelectorAll('[class*="-leave-"], [class*="-enter-"]').length }))
  let rest = await leftovers()
  check(B, 'after the clicks there is one form and no transition class left', rest.forms === 1 && rest.leaving === 0, JSON.stringify(rest))
  for (let i = 0; i < 4; i++) {
    await p.getByRole('button', { name: /^←/ }).first().click({ timeout: 3000 }).catch(() => {})
    await p.getByRole('button', { name: /Siguiente/ }).first().click({ timeout: 3000 }).catch(() => {})
  }
  await settled(p)
  rest = await leftovers()
  check(B, 'alternating back and next ends where it started, clean', (await heading(p, 'Secciones propias')) && rest.forms === 1 && rest.leaving === 0, JSON.stringify(rest))

  // Typed data survives the slide, and a new step starts at the top.
  await p.locator('nav button.row', { hasText: 'Datos personales' }).first().click()
  await settled(p)
  const name = p.getByLabel('Nombre completo')
  await name.fill('Nadia Transición')
  await p.getByRole('button', { name: /Siguiente/ }).first().click()
  await settled(p)
  await p.locator('.wizard').first().evaluate((el) => (el.scrollTop = 200))
  await p.getByRole('button', { name: /^←/ }).first().click()
  await settled(p)
  check(B, 'what was typed is still there after leaving and coming back', (await name.inputValue()) === 'Nadia Transición')
  check(B, 'a step starts at the top', (await p.locator('.wizard').first().evaluate((el) => el.scrollTop)) === 0)

  // Full-width preview: one View Transition each way, and Escape brings the form back.
  const before = await vts(p)
  await p.getByRole('button', { name: /Ampliar vista previa|Vista completa|Expandir/ }).first().click()
  await settled(p)
  check(B, 'the full-width preview starts one View Transition', (await vts(p)) === before + 1 && (await p.locator('.editor--expanded').count()) === 1)
  await p.keyboard.press('Escape')
  await settled(p)
  check(B, 'Escape collapses it with another, and the form is back', (await vts(p)) === before + 2 && (await p.locator('.editor--expanded').count()) === 0 && (await p.getByLabel('Nombre completo').isVisible()))

  // Views: one main at a time, and back to the editor with the data intact.
  await p.getByRole('button', { name: /^Mis CVs/ }).first().click()
  await settled(p)
  check(B, 'moving to My CVs leaves one view on screen', (await p.locator('#app main').count()) === 1 && (await p.locator('.scroll-view').count()) === 1)
  await p.locator('.scroll-view button.tile-open, .scroll-view [class*=card] button').first().click().catch(() => {})
  await settled(p)
  check(B, 'no console errors on the desktop walk', p.errs.length === 0, p.errs.join(' | '))
  await p.context().close()
}

async function phone(browser) {
  const B = 'transitions'
  const p = await open(browser, devices['Pixel 7'])
  await p.evaluate(COUNT_VT)
  await startSample(p)
  const before = await vts(p)
  await p.getByRole('button', { name: /^Vista previa$/ }).click()
  await settled(p)
  check(B, 'phone: Preview starts a View Transition and shows the preview', (await vts(p)) === before + 1 && (await p.locator('.editor--preview-open').count()) === 1)
  // Interrupted: switch back while the first one may still be running.
  await p.getByRole('button', { name: /^Editar$/ }).click()
  await p.getByRole('button', { name: /^Vista previa$/ }).click()
  await p.getByRole('button', { name: /^Editar$/ }).click()
  await settled(p)
  check(B, 'phone: a quick Edit / Preview / Edit ends on Edit', (await p.locator('.editor--preview-open').count()) === 0 && (await p.locator('.wizard').first().isVisible()))
  // A step change interrupted by the preview switch.
  await p.getByRole('button', { name: /Siguiente/ }).first().click()
  await p.getByRole('button', { name: /^Vista previa$/ }).click()
  await settled(p)
  check(B, 'phone: a step change cut short by Preview still shows the preview', (await p.locator('.editor--preview-open').count()) === 1)
  await p.getByRole('button', { name: /^Editar$/ }).click()
  await settled(p)
  check(B, 'phone: no sideways scroll after the transitions', !(await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)))
  check(B, 'phone: no console errors', p.errs.length === 0, p.errs.join(' | '))
  await p.context().close()
}

async function reducedMotion(browser) {
  const B = 'transitions'
  const p = await open(browser, { ...devices['Pixel 7'], reducedMotion: 'reduce' })
  await p.evaluate(COUNT_VT)
  await startSample(p)
  await p.getByRole('button', { name: /^Vista previa$/ }).click()
  await settled(p)
  check(B, 'reduced motion: the switch happens and starts no View Transition', (await vts(p)) === 0 && (await p.locator('.editor--preview-open').count()) === 1)
  await p.getByRole('button', { name: /^Editar$/ }).click()
  await settled(p)
  const sampled = sampleStep(p, 300)
  await p.getByRole('button', { name: /Siguiente/ }).first().click()
  const frames = await sampled
  check(B, 'reduced motion: a step change never fades out', frames.every((f) => f.opacity > 0.9), `min opacity ${Math.min(...frames.map((f) => f.opacity)).toFixed(2)}`)
  await p.context().close()
}

async function run(browser) {
  await Promise.all([desktop(browser), phone(browser), reducedMotion(browser)])
}

module.exports = { run }

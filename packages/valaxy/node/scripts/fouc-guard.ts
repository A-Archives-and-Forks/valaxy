/**
 * FOUC (Flash of Unstyled Content) guard — inline `<head>` snippets.
 *
 * Hides body via `opacity: 0 !important` (immune to beasties-inlined CSS),
 * then removes the guard `<style id="valaxy-fouc">` once all stylesheets
 * have loaded. Uses MutationObserver to detect async stylesheet changes
 * (e.g. beasties `media="print"` → `media="all"`).
 *
 * @see build.foucGuard in ValaxyExtendConfig
 */

export function foucGuardHtml(maxDuration: number) {
  return [
    `<style id="valaxy-fouc">body{opacity:0!important}</style>`,
    `<style>body{transition:opacity .15s ease}</style>`,
    `<noscript><style>body{opacity:1!important}</style></noscript>`,
    `<script>(${foucGuardScript.toString()})(${maxDuration})</script>`,
  ].join('')
}

/**
 * This function is serialized via `.toString()` and inlined into `<head>`.
 * It runs in the browser — do NOT use any Node/TS APIs or outer-scope references.
 */
function foucGuardScript(maxDuration: number) {
  let done = 0

  function reveal() {
    if (done)
      return
    done = 1
    const s = document.getElementById('valaxy-fouc')
    if (s)
      s.remove()
  }

  function check() {
    const links = document.querySelectorAll('link[rel="stylesheet"]')
    for (let i = 0; i < links.length; i++) {
      if (!links[i].sheet)
        return
    }
    reveal()
  }

  new MutationObserver(check).observe(document.head, {
    childList: true,
    attributes: true,
    attributeFilter: ['media', 'rel'],
  })

  addEventListener('load', reveal)

  if (maxDuration)
    setTimeout(reveal, maxDuration)
}

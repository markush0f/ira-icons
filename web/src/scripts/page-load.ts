/** Run once for the current page, and again after each Astro client navigation. */
export function onPageLoad(init: () => void) {
  document.addEventListener("astro:page-load", init);
  init();
}

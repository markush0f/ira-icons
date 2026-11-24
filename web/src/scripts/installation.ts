import { requireElement } from './dom.ts';
import { t } from './i18n.ts';
import { onPageLoad } from './page-load.ts';
import { constantIteration, iterationProperty, speedProperty } from '../../../scripts/npm-package/shared/animation-speed.ts';


let installationNavigation: AbortController | undefined;

export function mountInstallation() {
  const root = document.querySelector("[data-install-command], [data-install-examples]");
  if (!root) {
    installationNavigation?.abort();
    installationNavigation = undefined;
    return;
  }
  if (root instanceof HTMLElement && root.dataset.mounted === "true") return;
  if (root instanceof HTMLElement) root.dataset.mounted = "true";
  installationNavigation?.abort();
  installationNavigation = new AbortController();
  const { signal } = installationNavigation;

  const chapters = [...document.querySelectorAll<HTMLAnchorElement>(".docs-sidebar a[href^='#']")]
    .map(link => ({ link, heading: document.getElementById(link.hash.slice(1)) }))
    .filter((chapter): chapter is { link: HTMLAnchorElement; heading: HTMLElement } => chapter.heading !== null);

  if (chapters.length) {
    let frame = 0;
    function syncActiveChapter() {
      frame = 0;
      const offset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      let active = chapters[0];
      for (const chapter of chapters) {
        if (chapter.heading.getBoundingClientRect().top <= offset + 1) active = chapter;
      }
      // The final heading may never reach the top on shorter viewports/pages.
      const page = document.documentElement;
      if (window.scrollY > 0 && window.scrollY + window.innerHeight >= page.scrollHeight - 2) {
        active = chapters[chapters.length - 1];
      }
      for (const chapter of chapters) {
        if (chapter === active) chapter.link.setAttribute("aria-current", "location");
        else chapter.link.removeAttribute("aria-current");
      }
    }
    function scheduleChapterSync() {
      if (!frame) frame = requestAnimationFrame(syncActiveChapter);
    }
    window.addEventListener("scroll", scheduleChapterSync, { passive: true, signal });
    window.addEventListener("resize", scheduleChapterSync, { signal });
    window.addEventListener("pageshow", scheduleChapterSync, { signal });
    const observer = new ResizeObserver(scheduleChapterSync);
    observer.observe(document.querySelector(".docs-content")!);
    signal.addEventListener("abort", () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    }, { once: true });
    document.addEventListener("astro:before-swap", () => installationNavigation?.abort(), { once: true, signal });
    syncActiveChapter();
  }

const packageOptions = document.querySelector<HTMLElement>("[data-package-options]");
const installBox = document.querySelector<HTMLElement>("[data-install-command]");
const installSnippet = installBox?.querySelector("[data-snippet]");
let installTarget = "react";
let syncCommand = () => {};

function resetCopyFeedback(snippet: Element) {
  requireElement("[data-copy-label]", snippet).textContent = t("snippet.copy");
  requireElement("[data-copy-feedback]", snippet).textContent = "";
}

if (packageOptions && installSnippet && installBox) {
  const command = requireElement("[data-snippet-code] code", installSnippet);
  syncCommand = () => {
    const selected = packageOptions.querySelector<HTMLInputElement>("input:checked");
    if (!selected) return;
    const name = installBox.dataset.packageBase;
    const target = installTarget === "svg" ? name : `${name}-${installTarget}`;
    const text = `${selected.value} ${target}`;
    if (command.textContent !== text) {
      command.textContent = text;
      resetCopyFeedback(installSnippet);
    }
  };

  syncCommand();
  packageOptions.hidden = false;
  packageOptions.addEventListener("change", syncCommand);
  window.addEventListener("pageshow", syncCommand, { signal });
}

const exampleLinks = document.querySelector<HTMLElement>("[data-install-example-links]");
const examples = [...document.querySelectorAll<HTMLDetailsElement>("[data-install-examples] [data-install-example]")];

if (exampleLinks && examples.length) {
  const links = [...exampleLinks.querySelectorAll<HTMLAnchorElement>("a[href^='#']")];
  function showExample(hash: string) {
    const active = examples.find((example) => `#${example.id}` === hash)?.id ?? "react";
    installTarget = active === "next" ? "react" : active;
    syncCommand();
    for (const example of examples) {
      const selected = `#${example.id}` === hash;
      example.open = selected;
      example.hidden = !selected;
    }
    for (const link of links) {
      const selected = link.hash === hash;
      link.setAttribute("aria-controls", link.hash.slice(1));
      link.setAttribute("aria-expanded", String(selected));
      if (selected) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    }
  }

  for (const example of examples) example.querySelector("summary")!.hidden = true;
  showExample(links.some(link => link.hash === location.hash) ? location.hash : "#react");
  window.addEventListener("hashchange", () => {
    if (links.some(link => link.hash === location.hash)) showExample(location.hash);
  }, { signal });
  exampleLinks.addEventListener("click", (event: MouseEvent) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href^='#']") : null;
    if (!link || !examples.some((example) => `#${example.id}` === link.hash)) return;
    event.preventDefault();
    showExample(link.hash);
  });
}

const demo = document.querySelector('[data-animation-demo]');
if (demo) {
  const preview = requireElement('[data-animation-preview]', demo);
  const still = preview.firstElementChild!;
  const template = requireElement<HTMLTemplateElement>('[data-animation-template]', demo);
  const speed = requireElement<HTMLSelectElement>('[data-animation-speed]', demo);
  const loop = requireElement<HTMLInputElement>('[data-animation-loop]', demo);
  const play = requireElement<HTMLButtonElement>('[data-animation-play]', demo);
  const stop = requireElement<HTMLButtonElement>('[data-animation-stop]', demo);
  const snippet = requireElement('[data-snippet]', demo);
  const code = requireElement('[data-snippet-code] code', snippet);
  const reducedNote = requireElement<HTMLElement>('[data-animation-reduced]', demo);
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');

  function resetPreview() {
    preview.replaceChildren(still);
    stop.disabled = true;
  }

  function playPreview() {
    if (motionPreference.matches) return;
    const svg = template.content.querySelector('svg')!.cloneNode(true) as SVGSVGElement;
    svg.style.setProperty(speedProperty, speed.value);
    svg.style.setProperty(iterationProperty, constantIteration(loop.checked));
    preview.replaceChildren(svg);
    stop.disabled = false;
    if (!loop.checked) {
      const animations = svg.getAnimations({ subtree: true });
      void Promise.all(animations.map(animation => animation.finished)).then(() => {
        if (preview.firstElementChild !== svg) return;
        if (document.activeElement === stop) play.focus();
        resetPreview();
      }, () => { /* A stopped or restarted preview cancels its animations. */ });
    }
  }

  function syncPreview() {
    code.textContent = code.textContent.replace(/speed=\{[^}]+\} constant=\{[^}]+\}/,
      `speed={${speed.value}} constant={${loop.checked}}`);
    resetCopyFeedback(snippet);
    if (!stop.disabled) playPreview();
  }

  function syncMotionPreference() {
    reducedNote.hidden = !motionPreference.matches;
    play.disabled = motionPreference.matches;
    if (motionPreference.matches) resetPreview();
  }

  play.addEventListener('click', playPreview, { signal });
  stop.addEventListener('click', () => { play.focus(); resetPreview(); }, { signal });
  speed.addEventListener('change', syncPreview, { signal });
  loop.addEventListener('change', syncPreview, { signal });
  motionPreference.addEventListener('change', syncMotionPreference, { signal });
  syncMotionPreference();
  requireElement<HTMLElement>('[data-animation-controls]', demo).hidden = false;
}

if (navigator.clipboard?.writeText) {
  for (const snippet of document.querySelectorAll("[data-snippet]")) {
    const button = requireElement<HTMLButtonElement>("[data-copy-snippet]", snippet);
    const label = requireElement("[data-copy-label]", snippet);
    const feedback = requireElement("[data-copy-feedback]", snippet);
    const code = requireElement("[data-snippet-code] code", snippet);
    let copyRequest = 0;
    let resetTimer: ReturnType<typeof setTimeout> | undefined;

    button.hidden = false;
    button.addEventListener("click", async () => {
      const request = ++copyRequest;
      const text = code.textContent;
      clearTimeout(resetTimer);
      resetCopyFeedback(snippet);
      let copied = false;

      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch {
        // The snippet remains selectable if the browser blocks clipboard access.
      }

      if (request !== copyRequest || text !== code.textContent) return;
      label.textContent = copied ? t("snippet.copied") : t("snippet.failed");
      feedback.textContent = copied ? t("snippet.copiedFeedback") : t("snippet.failedFeedback");
      resetTimer = setTimeout(() => resetCopyFeedback(snippet), 2500);
    });
  }
}
}

onPageLoad(mountInstallation);

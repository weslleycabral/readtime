(() => {
  "use strict";

  const ATTR = {
    role: "data-readtime",
    context: "data-readtime-context",
    wpm: "data-readtime-wpm",
    ignore: "data-readtime-ignore",
  };

  const ROLE = {
    container: "container",
    content: "content",
    time: "time",
  };

  const DEFAULT_WPM = 200;

  function toInt(value, fallback) {
    const n = parseInt(String(value ?? ""), 10);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  }

  function getRole(el) {
    return el?.getAttribute?.(ATTR.role) || "";
  }

  function getContext(el) {
    const v = el?.getAttribute?.(ATTR.context);
    return typeof v === "string" ? v.trim() : "";
  }

  function getWpm(el) {
    return toInt(el?.getAttribute?.(ATTR.wpm), DEFAULT_WPM);
  }

  function cloneWithoutIgnored(rootEl) {
    const clone = rootEl.cloneNode(true);
    clone.querySelectorAll(`[${ATTR.ignore}]`).forEach((node) => node.remove());
    return clone;
  }

  function countWordsFromElement(el) {
    if (!el) return 0;

    const clone = cloneWithoutIgnored(el);
    const text = (clone.innerText || "")
      .replace(/\s+/g, " ")
      .trim();

    if (!text) return 0;
    return text.split(" ").filter(Boolean).length;
  }

  function computeMinutes(totalWords, wpm) {
    if (!totalWords || totalWords <= 0) return 0;
    return Math.ceil(totalWords / Math.max(1, wpm));
  }

  function updateTimeEl(timeEl, minutes) {
    if (!timeEl) return;
    timeEl.textContent = String(minutes);
  }

  function processContainer(containerEl) {
    const contents = Array.from(
      containerEl.querySelectorAll(`[${ATTR.role}="${ROLE.content}"]`)
    );

    if (!contents.length) return;

    const timeEl = containerEl.querySelector(`[${ATTR.role}="${ROLE.time}"]`);
    if (!timeEl) return;

    let totalWords = 0;
    let minWpm = Infinity;

    for (const contentEl of contents) {
      totalWords += countWordsFromElement(contentEl);
      minWpm = Math.min(minWpm, getWpm(contentEl));
    }

    if (minWpm === Infinity) minWpm = DEFAULT_WPM;

    const minutes = computeMinutes(totalWords, minWpm);
    updateTimeEl(timeEl, minutes);
  }

  function processAllContainers(root = document) {
    const containers = Array.from(
      root.querySelectorAll(`[${ATTR.role}="${ROLE.container}"]`)
    );

    for (const containerEl of containers) {
      processContainer(containerEl);
    }
  }

  function groupByContext(elements) {
    const map = new Map();
    for (const el of elements) {
      const key = getContext(el);
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(el);
    }
    return map;
  }

  function processContexts(root = document) {
    const allContents = Array.from(
      root.querySelectorAll(`[${ATTR.role}="${ROLE.content}"][${ATTR.context}]`)
    ).filter((el) => !el.closest(`[${ATTR.role}="${ROLE.container}"]`));

    const allTimes = Array.from(
      root.querySelectorAll(`[${ATTR.role}="${ROLE.time}"][${ATTR.context}]`)
    ).filter((el) => !el.closest(`[${ATTR.role}="${ROLE.container}"]`));

    const contentsByCtx = groupByContext(allContents);
    const timesByCtx = groupByContext(allTimes);

    for (const [ctx, timeEls] of timesByCtx.entries()) {
      const contentEls = contentsByCtx.get(ctx) || [];
      if (!contentEls.length) continue;

      let totalWords = 0;
      let minWpm = Infinity;

      for (const contentEl of contentEls) {
        totalWords += countWordsFromElement(contentEl);
        minWpm = Math.min(minWpm, getWpm(contentEl));
      }

      if (minWpm === Infinity) minWpm = DEFAULT_WPM;

      const minutes = computeMinutes(totalWords, minWpm);

      for (const timeEl of timeEls) {
        updateTimeEl(timeEl, minutes);
      }
    }
  }

  function refresh(root = document) {
    processAllContainers(root);
    processContexts(root);
  }

  let observer = null;

  function observe(options = {}) {
    const {
      root = document.body,
      subtree = true,
      childList = true,
      characterData = true,
      attributes = true,
      debounceMs = 50,
    } = options;

    if (!root) return;

    if (observer) observer.disconnect();

    let t = null;
    const schedule = () => {
      if (t) clearTimeout(t);
      t = setTimeout(() => refresh(document), debounceMs);
    };

    observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "childList" || m.type === "characterData") {
          schedule();
          return;
        }
        if (m.type === "attributes") {
          const name = m.attributeName || "";
          if (
            name === ATTR.role ||
            name === ATTR.context ||
            name === ATTR.wpm ||
            name === ATTR.ignore
          ) {
            schedule();
            return;
          }
        }
      }
    });

    observer.observe(root, { subtree, childList, characterData, attributes });
  }

  function disconnect() {
    if (observer) observer.disconnect();
    observer = null;
  }

  // Auto-init
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => refresh(document));
  } else {
    refresh(document);
  }

  // Public API
  window.ReadTime = {
    refresh,
    observe,
    disconnect,
    version: "0.1.0",
  };
})();
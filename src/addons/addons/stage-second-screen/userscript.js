// Stage on second screen: moves the editor's stage (canvas, variable displays, ask box, extension layers)
// into a borderless full-screen window on another display, where it looks and works as in the editor;
// the button puts it back. The window itself is placed by the desktop app (electron-main.js, "pm-stage-feed").
//
// The moved elements stay the editor's own (same page, same renderer, same React components). Three things
// make them work in the other window:
// - the editor's style sheets and theme are copied into it and kept up to date;
// - its mouse, touch, keyboard and form events are re-sent to the editor's page with their real target,
//   because React and the project's keyboard/mouse handling listen on the editor's document;
// - the stage is scaled to fill the screen, and the renderer draws at that screen's resolution.

const FEED_NAME = "pm-stage-feed";

const ICON =
  '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2 3h16v11H2zm1.5 1.5v8h13v-8zM7 16h6v1.5H7z"/>' +
  '<path d="M8 6.5v4l3.5-2z"/></svg>';

// Events handled by React (document listeners) or by the stage and keyboard code on the editor's page.
const FORWARDED = [
  "click", "dblclick", "mousedown", "mouseup", "mousemove", "mouseover", "mouseout", "contextmenu", "wheel",
  "pointerdown", "pointerup", "pointermove", "touchstart", "touchmove", "touchend", "touchcancel",
  "keydown", "keyup", "keypress", "input", "change", "focus", "blur", "dragstart", "drop", "dragover",
];

export default async function ({ addon }) {
  const desktop = window.PMDesktop;
  // Only the desktop app can place a window on another screen.
  if (!desktop || typeof desktop.displayCount !== "function") return;

  const vm = addon.tab.traps.vm;
  const renderer = vm.runtime.renderer;
  if (!renderer) return;

  let displayCount = 1;
  let feed = null; // the second-screen window while the stage is in it
  let moved = null; // the stage element that was moved
  let holder = null; // the box in the second window that scales the stage
  let placeholder = null; // where the stage goes back in the editor
  let removedByEditor = false; // the editor rebuilt its stage while it was away
  let restoreParent = null;
  let observers = [];
  let checkTimer = null;

  // ---- renderer: while the stage is away, draw at the second screen's resolution ----
  const originalResize = renderer.resize;
  renderer.resize = function (pixelsWide, pixelsTall) {
    if (feed && holder) {
      const [w, h] = feedPixels();
      const dpr = window.devicePixelRatio || 1;
      return originalResize.call(this, w / dpr, h / dpr);
    }
    return originalResize.call(this, pixelsWide, pixelsTall);
  };

  // The stage's size in the second screen's pixels (stage aspect ratio, as large as fits).
  const feedPixels = () => {
    const [nativeWidth, nativeHeight] = renderer.getNativeSize();
    const dpr = feed.devicePixelRatio || 1;
    const box = feed.document.body.getBoundingClientRect();
    const scale = Math.min((box.width * dpr) / nativeWidth, (box.height * dpr) / nativeHeight);
    return [Math.max(1, Math.round(nativeWidth * scale)), Math.max(1, Math.round(nativeHeight * scale))];
  };

  // Scale the stage (still at its editor size) to fill the second screen, then let the editor re-measure it.
  const layout = () => {
    if (!feed || feed.closed || !moved) return;
    const box = feed.document.body.getBoundingClientRect();
    // Sized by the canvas: the stage's outer boxes can be a pixel larger than the picture.
    const width = renderer.canvas.offsetWidth;
    const height = renderer.canvas.offsetHeight;
    if (!width || !height) return;
    const scale = Math.min(box.width / width, box.height / height);
    holder.style.transform = `scale(${scale})`;
    holder.style.width = `${width}px`;
    holder.style.height = `${height}px`;
    // The stage code reads the canvas position on "resize"; mouse positions then map correctly.
    window.dispatchEvent(new Event("resize"));
    const dpr = window.devicePixelRatio || 1;
    renderer.resize(renderer.canvas.width / dpr, renderer.canvas.height / dpr);
    renderer.dirty = true;
  };

  // ---- copy the editor's styles and theme, and keep them up to date ----
  const copyStyles = (doc) => {
    doc.head.textContent = "";
    for (const node of document.querySelectorAll("style, link[rel='stylesheet']")) {
      doc.head.appendChild(node.cloneNode(true));
    }
    const base = doc.createElement("style");
    base.textContent =
      "html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#000}" +
      "body{display:flex;align-items:center;justify-content:center}" +
      ".sa-stage-holder{flex:none;transform-origin:center center;overflow:hidden;position:relative}" +
      // The editor's stage frame and minimum column width have no meaning here.
      ".sa-stage-holder>*{min-width:0!important;margin:0!important}" +
      // No border here, so also not the 1px shift the editor uses to line the stage up with it.
      ".sa-stage-holder>*>*{border:0!important;border-radius:0!important;box-shadow:none!important;transform:none!important}";
    doc.head.appendChild(base);
  };
  const copyRootAttributes = (doc) => {
    for (const { name, value } of document.documentElement.attributes) doc.documentElement.setAttribute(name, value);
    doc.body.className = document.body.className.replace("sa-stage-away", "");
    doc.body.setAttribute("style", document.body.getAttribute("style") || "");
    for (const font of document.fonts) {
      try {
        if (!doc.fonts.has(font)) doc.fonts.add(font);
      } catch (e) {
        // A font that belongs to the editor's page only.
      }
    }
  };

  // ---- send the second window's events to the editor's page, with their real target ----
  const forward = (event) => {
    if (!feed || event.pmForwarded) return;
    const doc = feed.document;
    let target = event.target;
    // The window itself gaining or losing focus means nothing to the editor.
    if ((event.type === "focus" || event.type === "blur") && target === feed) return;
    // Keys pressed with nothing focused go to the project, as they do when the editor's page has them.
    if (target === doc || target === doc.body || target === doc.documentElement || target === feed) {
      target = event.type.startsWith("key") ? document.body : document;
    }
    let copy;
    try {
      copy = new event.constructor(event.type, event);
    } catch (e) {
      return;
    }
    const keep = { target, srcElement: target, pmForwarded: true };
    if (event instanceof feed.KeyboardEvent) {
      Object.assign(keep, { keyCode: event.keyCode, which: event.which, charCode: event.charCode });
    }
    for (const [name, value] of Object.entries(keep)) {
      Object.defineProperty(copy, name, { value, configurable: true });
    }
    document.dispatchEvent(copy);
    if (copy.defaultPrevented && event.cancelable) event.preventDefault();
  };

  // ---- React: the editor may re-render or remove its stage while it is in the other window ----
  const guardParent = (parent) => {
    const { removeChild, insertBefore } = parent;
    parent.removeChild = function (child) {
      if (child === moved && child.parentNode !== this) {
        removedByEditor = true;
        if (placeholder && placeholder.parentNode === this) removeChild.call(this, placeholder);
        child.remove();
        return child;
      }
      return removeChild.call(this, child);
    };
    parent.insertBefore = function (child, before) {
      if (before === moved && moved.parentNode !== this) before = placeholder;
      if (child === moved && moved.parentNode !== this) return child; // stays in the second window
      return insertBefore.call(this, child, before);
    };
    return () => {
      parent.removeChild = removeChild;
      parent.insertBefore = insertBefore;
    };
  };

  const findStage = () => {
    const canvas = renderer.canvas;
    const wrapper = canvas && canvas.closest("[class*='stage_stage-wrapper']");
    return wrapper || null;
  };

  const bringBack = () => {
    const w = feed;
    if (!w) return;
    feed = null;
    document.body.classList.remove("sa-stage-away");
    clearInterval(checkTimer);
    for (const stop of observers) stop();
    observers = [];
    if (moved) {
      if (!removedByEditor && placeholder && placeholder.parentNode) placeholder.replaceWith(moved);
      else if (placeholder) placeholder.remove();
    }
    if (restoreParent) restoreParent();
    restoreParent = null;
    moved = null;
    holder = null;
    placeholder = null;
    if (!w.closed) w.close();
    // Give the stage back the size the editor wants.
    window.dispatchEvent(new Event("resize"));
    const rect = renderer.canvas.getBoundingClientRect();
    if (rect.width && rect.height) originalResize.call(renderer, rect.width, rect.height);
    renderer.dirty = true;
    updateButton();
  };

  const moveAway = () => {
    if (feed) return;
    const stage = findStage();
    if (!stage || !stage.parentNode) return;
    // Refused by the desktop app when the editor's screen is the only one.
    const w = window.open("", FEED_NAME);
    if (!w) return;
    feed = w;
    removedByEditor = false;
    const doc = w.document;
    doc.title = "Stage";
    copyStyles(doc);
    copyRootAttributes(doc);

    placeholder = document.createComment("stage on second screen");
    stage.parentNode.insertBefore(placeholder, stage);
    restoreParent = guardParent(stage.parentNode);
    moved = stage;
    holder = doc.createElement("div");
    holder.className = "sa-stage-holder";
    doc.body.appendChild(holder);
    holder.appendChild(stage);

    for (const type of FORWARDED) w.addEventListener(type, forward, { capture: type === "focus" || type === "blur", passive: false });
    w.addEventListener("resize", layout);

    let stylesQueued = false;
    const headObserver = new MutationObserver(() => {
      if (stylesQueued) return;
      stylesQueued = true;
      requestAnimationFrame(() => {
        stylesQueued = false;
        if (feed === w) copyStyles(doc);
      });
    });
    headObserver.observe(document.head, { childList: true, subtree: true, characterData: true });
    const rootObserver = new MutationObserver(() => copyRootAttributes(doc));
    rootObserver.observe(document.documentElement, { attributes: true });
    rootObserver.observe(document.body, { attributes: true });
    // The editor resizes the stage (another stage size, a project with other dimensions): fit it again.
    // (On the next frame and only on a real change: changing sizes inside the observer would loop.)
    let lastSize = "";
    const sizeObserver = new ResizeObserver(() => requestAnimationFrame(() => {
      const size = `${renderer.canvas.offsetWidth}x${renderer.canvas.offsetHeight}`;
      if (size !== lastSize) {
        lastSize = size;
        layout();
      }
    }));
    sizeObserver.observe(stage);
    observers = [() => headObserver.disconnect(), () => rootObserver.disconnect(), () => sizeObserver.disconnect()];

    // The window was closed some other way (Alt+F4, its screen unplugged), or the editor rebuilt its stage.
    checkTimer = setInterval(() => {
      if (!feed) return;
      if (feed.closed || removedByEditor || !moved.contains(renderer.canvas)) bringBack();
    }, 500);

    document.body.classList.add("sa-stage-away");
    layout();
    updateButton();
  };

  // ---- the button in the stage header ----
  const button = document.createElement("button");
  button.type = "button";
  button.className = `${addon.tab.scratchClass("stage-header_stage-button")} sa-stage-feed-button`;
  button.innerHTML = ICON;
  button.addEventListener("click", () => (feed ? bringBack() : moveAway()));
  const updateButton = () => {
    const label = feed ? "Bring the stage back from the second screen" : "Move the stage to the second screen";
    button.title = label;
    button.setAttribute("aria-label", label);
    button.setAttribute("aria-pressed", feed ? "true" : "false");
    // Shown only while there is a second screen (or the stage is still on it).
    button.style.display = addon.self.disabled || (displayCount < 2 && !feed) ? "none" : "";
  };

  displayCount = (await desktop.displayCount()) || 1;
  desktop.onDisplayCount((count) => {
    displayCount = count;
    updateButton();
  });
  addon.self.addEventListener("disabled", () => {
    bringBack();
    updateButton();
  });
  addon.self.addEventListener("reenabled", updateButton);
  window.addEventListener("beforeunload", () => bringBack());
  // Full screen and player mode are ways of showing the stage in the editor's window: the stage comes back.
  addon.tab.redux.initialize();
  addon.tab.redux.addEventListener("statechanged", ({ detail }) => {
    const type = detail.action.type;
    if (feed && (type === "scratch-gui/mode/SET_FULL_SCREEN" || type === "scratch-gui/mode/SET_PLAYER")) {
      bringBack();
    }
  });
  updateButton();

  while (true) {
    const buttons = await addon.tab.waitForElement("[class*='stage-header_embed-buttons']", {
      markAsSeen: true,
      reduxEvents: [
        "scratch-gui/mode/SET_PLAYER",
        "scratch-gui/mode/SET_FULL_SCREEN",
        "fontsLoaded/SET_FONTS_LOADED",
        "scratch-gui/locales/SELECT_LOCALE",
      ],
    });
    buttons.insertBefore(button, buttons.firstChild);
  }
}

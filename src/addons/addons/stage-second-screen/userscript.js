// Stage on second screen: a "clean feed" of the stage, like DaVinci Resolve's — a borderless full-screen
// window on another display that shows only the stage, live, while the editor stays usable.
// The window itself is placed by the desktop app (electron-main.js, "pm-stage-feed"); this script fills it:
// after every frame the renderer really draws, that frame is copied into a canvas in the feed window.
// While the feed is open the stage is drawn at the feed's resolution (the editor shows it scaled down, as in
// full screen mode), so the feed is sharp; closing it gives the stage back the size the editor asked for.

const FEED_NAME = "pm-stage-feed";

const ICON =
  '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2 3h16v11H2zm1.5 1.5v8h13v-8zM7 16h6v1.5H7z"/>' +
  '<path d="M8 6.5v4l3.5-2z"/></svg>';

export default async function ({ addon }) {
  const desktop = window.PMDesktop;
  // Only the desktop app can place a window on another screen.
  if (!desktop || typeof desktop.displayCount !== "function") return;

  const vm = addon.tab.traps.vm;
  const renderer = vm.runtime.renderer;
  if (!renderer) return;

  let displayCount = 1;
  let feed = null; // the feed window while it is open
  let feedCanvas = null;
  let feedCtx = null;
  let closedCheck = null;
  let requested = null; // the stage size (CSS pixels) the editor last asked the renderer for

  // ---- renderer: remember the editor's size, draw bigger while the feed is open, copy each drawn frame ----
  const originalResize = renderer.resize;
  const originalDraw = renderer.draw;
  renderer.resize = function (pixelsWide, pixelsTall) {
    requested = [pixelsWide, pixelsTall];
    if (feed && feedCanvas) {
      const dpr = window.devicePixelRatio || 1;
      pixelsWide = Math.max(pixelsWide, feedCanvas.width / dpr);
      pixelsTall = Math.max(pixelsTall, feedCanvas.height / dpr);
    }
    return originalResize.call(this, pixelsWide, pixelsTall);
  };
  renderer.draw = function () {
    const wasDirty = this.dirty;
    const result = originalDraw.call(this);
    // Copied in the same task as the draw: a WebGL canvas can only be read before the frame is shown.
    if (wasDirty && feedCtx && !this.dirty) copyFrame();
    return result;
  };

  const copyFrame = () => {
    try {
      feedCtx.drawImage(renderer.canvas, 0, 0, feedCanvas.width, feedCanvas.height);
    } catch (e) {
      // The feed window was closed between two frames.
    }
  };

  const redraw = () => {
    renderer.dirty = true;
    renderer.draw();
  };

  const applyEditorSize = () => {
    const dpr = window.devicePixelRatio || 1;
    const size = requested || [renderer.canvas.width / dpr, renderer.canvas.height / dpr];
    renderer.resize(size[0], size[1]);
  };

  // The feed canvas fills the feed screen at the stage's aspect ratio (black bars on the other sides).
  const layout = () => {
    if (!feed || feed.closed || !feedCanvas) return;
    const [nativeWidth, nativeHeight] = renderer.getNativeSize();
    // Worked out in the screen's own pixels, so a 1920×1080 stage fills a 1920×1080 screen exactly.
    const dpr = feed.devicePixelRatio || 1;
    // (The body's box is measured to fractions of a pixel; innerWidth/innerHeight are rounded.)
    const box = feed.document.body.getBoundingClientRect();
    const width = Math.round(box.width * dpr);
    const height = Math.round(box.height * dpr);
    if (!width || !height || !nativeWidth || !nativeHeight) return;
    const scale = Math.min(width / nativeWidth, height / nativeHeight);
    feedCanvas.width = Math.max(1, Math.min(width, Math.round(nativeWidth * scale)));
    feedCanvas.height = Math.max(1, Math.min(height, Math.round(nativeHeight * scale)));
    feedCanvas.style.width = `${feedCanvas.width / dpr}px`;
    feedCanvas.style.height = `${feedCanvas.height / dpr}px`;
    feedCtx.imageSmoothingQuality = "high";
    applyEditorSize();
    redraw();
  };

  const onNativeSize = () => layout();

  const closeFeed = () => {
    const w = feed;
    if (!w) return;
    feed = null;
    feedCanvas = null;
    feedCtx = null;
    clearInterval(closedCheck);
    renderer.removeListener("NativeSizeChanged", onNativeSize);
    if (!w.closed) w.close();
    applyEditorSize();
    redraw();
    updateButton();
  };

  const openFeed = () => {
    if (feed) return;
    // Refused by the desktop app when the editor's screen is the only one.
    const w = window.open("", FEED_NAME);
    if (!w) return;
    feed = w;
    const doc = w.document;
    doc.title = "Stage";
    doc.body.style.cssText =
      "margin:0;height:100vh;overflow:hidden;background:#000;cursor:none;" +
      "display:flex;align-items:center;justify-content:center";
    feedCanvas = doc.createElement("canvas");
    feedCanvas.style.display = "block";
    doc.body.appendChild(feedCanvas);
    feedCtx = feedCanvas.getContext("2d", { alpha: false });
    w.addEventListener("resize", layout);
    w.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeFeed();
    });
    // Closed some other way (Alt+F4, its screen unplugged, the editor closing).
    closedCheck = setInterval(() => {
      if (feed && feed.closed) closeFeed();
    }, 500);
    renderer.on("NativeSizeChanged", onNativeSize);
    layout();
    updateButton();
  };

  // ---- the button in the stage header ----
  const button = document.createElement("button");
  button.type = "button";
  button.className = `${addon.tab.scratchClass("stage-header_stage-button")} sa-stage-feed-button`;
  button.innerHTML = ICON;
  button.addEventListener("click", () => (feed ? closeFeed() : openFeed()));
  const updateButton = () => {
    const label = feed ? "Close the stage on the second screen" : "Show the stage on the second screen";
    button.title = label;
    button.setAttribute("aria-label", label);
    button.setAttribute("aria-pressed", feed ? "true" : "false");
    // Shown only while there is a second screen (or the feed is still open).
    button.style.display = addon.self.disabled || (displayCount < 2 && !feed) ? "none" : "";
  };

  displayCount = (await desktop.displayCount()) || 1;
  desktop.onDisplayCount((count) => {
    displayCount = count;
    updateButton();
  });
  addon.self.addEventListener("disabled", () => {
    closeFeed();
    updateButton();
  });
  addon.self.addEventListener("reenabled", updateButton);
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

// The mouse position and the clone counter both go after the stop button. Elements an addon
// waited for with markAsSeen are not reported to it again, so one loop places both.
const entries = [];
let started = false;

const place = (addon, entry) => {
  if (entry.condition()) {
    addon.tab.appendToSharedSpace({ space: "afterStopButton", element: entry.element, order: entry.order });
  }
};

export function addAfterStopButton(addon, element, order, condition) {
  const entry = { element, order, condition };
  entries.push(entry);
  if (started) {
    place(addon, entry);
    return;
  }
  started = true;
  (async () => {
    while (true) {
      await addon.tab.waitForElement('[class*="controls_controls-container"]', {
        markAsSeen: true,
        reduxEvents: ["scratch-gui/mode/SET_PLAYER", "fontsLoaded/SET_FONTS_LOADED", "scratch-gui/locales/SELECT_LOCALE"],
      });
      for (const e of entries) place(addon, e);
    }
  })();
}

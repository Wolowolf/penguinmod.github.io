// Desktop fork (section 217): the chosen colours replace the theme colour variables of
// src/lib/pm-theme-colors.js, which every part of the editor uses.
import {themeColorsCSS, applyThemeColors} from "../../../lib/pm-theme-colors.js";

export default async function ({ addon }) {
  const stylesheet = document.createElement("style");
  stylesheet.className = "sa-theme-colors";
  document.head.appendChild(stylesheet);

  const apply = () => {
    applyThemeColors(stylesheet, addon.self.disabled ? "" : themeColorsCSS((id) => addon.settings.get(id)));
  };
  apply();
  addon.settings.addEventListener("change", apply);
  addon.self.addEventListener("disabled", apply);
  addon.self.addEventListener("reenabled", apply);
}

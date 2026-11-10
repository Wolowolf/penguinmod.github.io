import * as sharedModule from "./module.js";

export default async function ({ addon, console }) {
  const update = () => {
    const enabled = !addon.self.disabled;
    sharedModule.setCherryPicking(enabled, addon.settings.get("invertDrag"));
    sharedModule.setDuplication(enabled);
  };
  addon.self.addEventListener("disabled", update);
  addon.self.addEventListener("reenabled", update);
  addon.settings.addEventListener("change", update);
  update();
  sharedModule.load(addon);
}

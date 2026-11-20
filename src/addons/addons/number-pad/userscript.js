export default async function ({ addon, msg, console }) {
  const ScratchBlocks = await addon.tab.traps.getBlockly();

  // number fields are text fields with numeric_ set (no menu); their editor shows the pad when useTouchInteraction_ is on
  const originalMouseDown = ScratchBlocks.FieldTextInput.prototype.showEditor_;
  ScratchBlocks.FieldTextInput.prototype.showEditor_ = function (...args) {
    if (!addon.self.disabled && this.numeric_ && !this.menuGenerator_) {
      this.useTouchInteraction_ = true;
    }
    return originalMouseDown.apply(this, args);
  };
}

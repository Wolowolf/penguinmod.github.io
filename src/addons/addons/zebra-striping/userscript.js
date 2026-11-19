export default async function ({ addon, msg, console }) {
  const vm = addon.tab.traps.vm;
  const ScratchBlocks = await addon.tab.traps.getBlockly();

  const originalRender = ScratchBlocks.BlockSvg.prototype.render;
  ScratchBlocks.BlockSvg.prototype.render = function (opt_bubble) {
    // Any changes that affect block striping should bubble to the top block of the script.
    // The top block of the script is responsible for striping all of its children.
    // This way stripes are computed exactly once.
    if (!this.isInFlyout && !this.isShadow() && this.getParent() === null) {
      const stripeState = new Map();
      // Conveniently getDescendants() returns blocks in an order such that each block's
      // parent will always come before that block (except the first block which has no
      // parent).
      for (const block of this.getDescendants()) {
        const parent = block.getSurroundParent();

        let isStriped = false;
        if (parent) {
          if (block.isShadow()) {
            isStriped = !!stripeState.get(parent);
          } else if (parent.getColour() === block.getColour()) {
            isStriped = !stripeState.get(parent);
          }
        }
        stripeState.set(block, isStriped);

        const elements = [block.svgPath_];
        for (const input of block.inputList) {
          if (input.outlinePath) {
            elements.push(input.outlinePath);
          }
          for (const field of input.fieldRow) {
            if (field.fieldGroup_) {
              elements.push(field.fieldGroup_);
            }
          }
        }
        for (const el of elements) {
          el.classList.toggle("sa-zebra-stripe", isStriped);
        }
      }
    }
    return originalRender.call(this, opt_bubble);
  };

  if (vm.editingTarget) {
    vm.emitWorkspaceUpdate();
  }
}

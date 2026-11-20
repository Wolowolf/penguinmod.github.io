// Striped blocks get precomputed lighter or darker colours (no CSS filter): the block's
// colour getters return the shaded colour, so its path, slots and fields use it when drawn.
export default async function ({ addon, msg, console }) {
  const vm = addon.tab.traps.vm;
  const ScratchBlocks = await addon.tab.traps.getBlockly();
  const BlockProto = ScratchBlocks.Block.prototype;
  const BlockSvgProto = ScratchBlocks.BlockSvg.prototype;

  // CSS brightness(1 + p) then saturate(1 - p), p = ±intensity: worked out once per colour
  let cache = new Map();
  let percent = 0;
  const readSettings = () => {
    const sign = addon.settings.get("shade") === "darker" ? -1 : 1;
    percent = (sign * Math.min(100, Math.max(0, Number(addon.settings.get("intensity")) || 0))) / 100;
    cache = new Map();
  };
  readSettings();
  const clamp = (v) => Math.min(255, Math.max(0, v));
  const hex2 = (v) => Math.round(v).toString(16).padStart(2, "0");
  const shade = (colour) => {
    if (typeof colour !== "string") return colour;
    let result = cache.get(colour);
    if (result !== undefined) return result;
    result = colour;
    let h = colour.trim();
    if (/^#[0-9a-f]{3,4}$/i.test(h)) h = "#" + [...h.slice(1)].map((c) => c + c).join("");
    if (/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(h)) {
      const b = 1 + percent;
      const s = 1 - percent;
      const r = clamp(parseInt(h.slice(1, 3), 16) * b);
      const g = clamp(parseInt(h.slice(3, 5), 16) * b);
      const bl = clamp(parseInt(h.slice(5, 7), 16) * b);
      result =
        "#" +
        hex2(clamp((0.213 + 0.787 * s) * r + (0.715 - 0.715 * s) * g + (0.072 - 0.072 * s) * bl)) +
        hex2(clamp((0.213 - 0.213 * s) * r + (0.715 + 0.285 * s) * g + (0.072 - 0.072 * s) * bl)) +
        hex2(clamp((0.213 - 0.213 * s) * r + (0.715 - 0.715 * s) * g + (0.072 + 0.928 * s) * bl)) +
        h.slice(7);
    }
    cache.set(colour, result);
    return result;
  };

  const striped = (block) => block.pmZebra_ && !addon.self.disabled;
  for (const name of ["getColour", "getColourSecondary", "getColourTertiary"]) {
    const original = BlockProto[name];
    BlockSvgProto[name] = function () {
      const c = original.call(this);
      return striped(this) ? shade(c) : c;
    };
  }

  // draw a block's colours again (path, slots, dropdown boxes)
  const recolour = (block) => {
    if (!block.svgPath_ || block.isInFlyout) return;
    block.updateColour();
    if (block.isShadow()) return;
    for (const input of block.inputList) {
      for (const field of input.fieldRow) {
        if (field.box_ && field.box_.classList.contains("blocklyBlockBackground")) {
          field.box_.setAttribute("fill", block.getColour());
        }
      }
    }
  };

  const originalRender = BlockSvgProto.render;
  BlockSvgProto.render = function (opt_bubble) {
    // Any changes that affect block striping should bubble to the top block of the script.
    // The top block of the script is responsible for striping all of its children.
    // This way stripes are computed exactly once; only blocks whose stripe changed are recoloured.
    if (!this.isInFlyout && !this.isShadow() && this.getParent() === null) {
      // getDescendants() lists each block's parent before the block itself.
      for (const block of this.getDescendants()) {
        const parent = block.getSurroundParent();
        let isStriped = false;
        if (parent) {
          if (block.isShadow()) {
            isStriped = !!parent.pmZebra_;
          } else if (parent.colour_ === block.colour_) {
            isStriped = !parent.pmZebra_;
          }
        }
        if (!!block.pmZebra_ !== isStriped) {
          block.pmZebra_ = isStriped;
          if (!addon.self.disabled) recolour(block);
        }
      }
    }
    return originalRender.call(this, opt_bubble);
  };

  const recolourAll = () => {
    const workspace = ScratchBlocks.getMainWorkspace();
    if (!workspace) return;
    for (const block of workspace.getAllBlocks()) if (block.pmZebra_) recolour(block);
  };
  addon.settings.addEventListener("change", () => {
    readSettings();
    recolourAll();
  });
  addon.self.addEventListener("disabled", recolourAll);
  addon.self.addEventListener("reenabled", recolourAll);

  if (vm.editingTarget) {
    vm.emitWorkspaceUpdate();
  }
}

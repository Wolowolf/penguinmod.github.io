// Hides either the single blocks or the modular (− / +) blocks in the block palette.
// Only the palette is filtered: blocks already in a project are untouched and keep working.

// Built-in modular blocks and their singles (scratch-blocks' shared maker).
// The core "if" and "if else" are the modular if itself (with 1 and 2 branches), so they stay in both modes;
// "stop checking" works in single and modular "check" blocks, so it stays too.
const CORE_MODULAR = [
  "operator_expandableMath",
  "operator_expandableBool",
  "operator_expandableCompare",
  "operator_expandablejoininputs",
  "control_expandableIfReturn",
  "control_expandableSwitch",
];
const CORE_SINGLE = [
  "operator_add", "operator_subtract", "operator_multiply", "operator_divide", "operator_mod", "operator_power",
  "operator_gt", "operator_gtorequal", "operator_lt", "operator_ltorequal",
  "operator_equals", "operator_notequal", "operator_strictEquals",
  "operator_and", "operator_or", "operator_nand", "operator_nor", "operator_xor", "operator_xnor",
  "operator_join",
  "control_if_return_else_return",
  "control_switch", "control_switch_default", "control_case", "control_case_next",
  // Not made by the shared maker, but singles of the modular if.
  "pmControlsExpansion_ifElseIf", "pmControlsExpansion_ifElseIfElse",
  "SPadvControl_ifPart", "SPadvControl_elsePart",
];

export default async function ({ addon }) {
  const Blockly = await addon.tab.traps.getBlockly();
  const vm = addon.tab.traps.vm;
  addon.tab.redux.initialize();

  const active = () => !addon.self.disabled;

  // Block types to hide now: the other set. Extension blocks declare `modular` (with `lock` for a single).
  const hiddenTypes = () => {
    const single = addon.settings.get("mode") === "single";
    const hidden = new Set(single ? CORE_MODULAR : CORE_SINGLE);
    for (const category of vm.runtime._blockInfo) {
      for (const block of category.blocks || []) {
        const modular = block.json && block.json.modular;
        if (!modular) continue;
        const isSingle = modular.lock !== undefined;
        if (isSingle !== single) hidden.add(block.json.type);
      }
    }
    return hidden;
  };

  const filterTree = (tree) => {
    const dom = typeof tree === "string" ? Blockly.Xml.textToDom(tree) : tree.cloneNode(true);
    const hidden = hiddenTypes();
    for (const category of dom.querySelectorAll("category")) {
      let previousWasGap = true; // also drops a gap left at the very top
      for (const child of Array.from(category.children)) {
        const tag = child.tagName.toLowerCase();
        if (tag === "block" && hidden.has(child.getAttribute("type"))) {
          child.remove();
        } else if (tag === "sep") {
          if (previousWasGap) child.remove();
          previousWasGap = true;
        } else {
          previousWasGap = false;
        }
      }
    }
    return dom;
  };

  const originalUpdateToolbox = Blockly.WorkspaceSvg.prototype.updateToolbox;
  Blockly.WorkspaceSvg.prototype.updateToolbox = function (tree) {
    if (!active() || this.isFlyout || !tree) return originalUpdateToolbox.call(this, tree);
    return originalUpdateToolbox.call(this, filterTree(tree));
  };

  // Redraw the palette from the editor's own toolbox, keeping the scroll position in the open category.
  let pending = false;
  const refresh = () => {
    const workspace = Blockly.getMainWorkspace();
    const xml = addon.tab.redux.state.scratchGui.toolbox.toolboxXML;
    if (!workspace || !workspace.toolbox_ || !xml) return;
    if (addon.tab.redux.state.scratchGui.editorTab.activeTabIndex !== 0) {
      pending = true; // the code area is hidden; redraw when it is shown
      return;
    }
    pending = false;
    const toolbox = workspace.toolbox_;
    const categoryId = toolbox.getSelectedCategoryId();
    const offset = toolbox.getCategoryScrollOffset();
    workspace.updateToolbox(xml);
    const length = toolbox.getCategoryLengthById(categoryId);
    toolbox.setFlyoutScrollPos(toolbox.getCategoryPositionById(categoryId) + Math.min(offset, length));
  };

  addon.tab.redux.addEventListener("statechanged", (e) => {
    if (pending && e.detail.action.type === "scratch-gui/navigation/ACTIVATE_TAB" && e.detail.action.activeTabIndex === 0) {
      setTimeout(refresh);
    }
  });
  addon.settings.addEventListener("change", refresh);
  addon.self.addEventListener("disabled", refresh);
  addon.self.addEventListener("reenabled", refresh);
  refresh();
}

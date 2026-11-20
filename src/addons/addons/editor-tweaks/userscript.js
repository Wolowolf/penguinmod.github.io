// Editor Tweaks
// By: SharkPool

export default async function({ addon }) {
  const Blockly = await addon.tab.traps.getBlockly();
  const vm = addon.tab.traps.vm;

  // addon settings
  let oldCkbxEnabled = true;
  let ckbxEnabled = true;
  let workspaceRefreshCache = 0;

  // patch variables and functions
  const ogWS2Dom = Blockly.Xml.workspaceToDom;
  const ogMutatorBuilder = Blockly.scratchBlocksUtils.generateMutatorShadow;
  const ogSetShadowDom = ScratchBlocks.RenderedConnection.prototype.setShadowDom;

  const fixedWorkspace2Dom = function(...args) {
    const dom = ogWS2Dom.call(this, ...args);
    if (!args[0].isFlyout) return dom;

    // we only want to edit the flyout
    const domArray = Array.from(dom.children);
    for (const item of domArray) {
      if (item.localName !== "block") continue;

      for (const input of Array.from(item.children)) {
        // clear checkboxes
        if (input.localName !== "value") continue;
        const shadow = input.firstChild;
        if (shadow.getAttribute("type") === "checkbox") shadow.remove();
      }
    }
    return dom;
  }

  const fixedSetShadowDom = function(...args) {
    // prevent checkboxes from respawning
    if (this.sourceBlock_.isInFlyout) {
      if (args[0] && args[0].getAttribute("type") === "checkbox") {
        this.shadowDom_ = null;
        queueMicrotask(() => {
          const shadowBlock = this.targetBlock();
          if (shadowBlock) shadowBlock.dispose();
        });
        return;
      }
    }
    return ogSetShadowDom.call(this, ...args);
  };

  // internals
  function updateAllBlocks(flyoutOnly) {
    const workspace = Blockly.getMainWorkspace();
    if (workspace) {
      if (!flyoutOnly && vm.editingTarget) vm.emitWorkspaceUpdate();
      const flyout = workspace.getFlyout();
      if (flyout) {
        const flyoutWorkspace = flyout.getWorkspace();
        Blockly.Xml.clearWorkspaceAndLoadFromXml(Blockly.Xml.workspaceToDom(flyoutWorkspace), flyoutWorkspace);
        workspace.getToolbox().refreshSelection();
        workspace.toolboxRefreshEnabled_ = true;
      }
    }
  }

  function requestAddonState() {
    ckbxEnabled = addon.settings.get("checkboxesEnabled");
    Blockly.Procedures.ADDON_SP_CHECKBOXES_DISABLED = !ckbxEnabled;
  }

  function applyChanges() {
    requestAddonState();
    toggleCheckboxes();
    if (workspaceRefreshCache > 0) updateAllBlocks(2 > workspaceRefreshCache);
    workspaceRefreshCache = 0;
  }

  function toggleCheckboxes() {
    if (oldCkbxEnabled === ckbxEnabled) return;
    oldCkbxEnabled = ckbxEnabled;
    workspaceRefreshCache++;

    Blockly.Xml.workspaceToDom = ckbxEnabled ? ogWS2Dom : fixedWorkspace2Dom;
    Blockly.RenderedConnection.prototype.setShadowDom = ckbxEnabled ? ogSetShadowDom : fixedSetShadowDom;

    Blockly.scratchBlocksUtils.generateMutatorShadow = ckbxEnabled ? ogMutatorBuilder : function(...args) {
      if (args[1] === "checkbox") return;
      ogCheckboxBlockInit.call(this, ...args);
    };

    Blockly.Blocks["control_expandableIf"].fillInBlock = Blockly.scratchBlocksUtils.generateMutatorShadow;
    Blockly.Blocks["operator_expandableBool"].fillInBlock = Blockly.scratchBlocksUtils.generateMutatorShadow;
    // Desktop fork (section 281): the modular "if then else" reporter's new "else if" slots
    Blockly.Blocks["control_expandableIfReturn"].fillInBlock = Blockly.scratchBlocksUtils.generateMutatorShadow;
  }

  addon.self.addEventListener("reenabled", applyChanges);
  addon.settings.addEventListener("change", applyChanges);
  addon.self.addEventListener("disabled", () => {
    ckbxEnabled = true;
    applyChanges();
  });

  applyChanges();
}

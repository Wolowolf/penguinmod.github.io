// Editor Tweaks
// By: SharkPool

export default async function({ addon }) {
  const Blockly = await addon.tab.traps.getBlockly();
  const vm = addon.tab.traps.vm;

  // addon settings
  let oldCkbxEnabled = true, oldToolboxScrolls = true, oldBlocksGlow = true;
  let ckbxEnabled = true, toolboxScrolls = true, blocksGlow = true;
  let workspaceRefreshCache = 0;

  // patch variables and functions
  const ogWS2Dom = Blockly.Xml.workspaceToDom;
  const ogMutatorBuilder = Blockly.scratchBlocksUtils.generateMutatorShadow;
  const ogSetShadowDom = ScratchBlocks.RenderedConnection.prototype.setShadowDom;
  const ogStartScrollAnim = Blockly.Flyout.prototype.startScrollAnimation;
  const ogGlowFuncs = {
    run: Blockly.BlockSvg.prototype.setGlowStack,
    error: Blockly.BlockSvg.prototype.setErrorStack,
    replace1: Blockly.BlockSvg.prototype.highlightForReplacement,
    replace2: Blockly.BlockSvg.prototype.highlightShapeForInput
  };

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
    toolboxScrolls = addon.settings.get("toolboxScrolling");
    blocksGlow = addon.settings.get("blocksGlow");
    Blockly.Procedures.ADDON_SP_CHECKBOXES_DISABLED = !ckbxEnabled;
  }

  function applyChanges() {
    requestAddonState();
    toggleCheckboxes();
    toggleToolBoxScroll();
    toggleBlockGlow();
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

  function toggleToolBoxScroll() {
    if (oldToolboxScrolls === toolboxScrolls) return;
    oldToolboxScrolls = toolboxScrolls;

    Blockly.Flyout.prototype.startScrollAnimation = toolboxScrolls ? ogStartScrollAnim : function() {
      this.scrollTime = -1;
      this.scrollStart = this.scrollTarget;
      this.stepScrollAnimation(performance.now());
    };
  }

  function toggleBlockGlow() {
    if (oldBlocksGlow === blocksGlow) return;
    oldBlocksGlow = blocksGlow;
    if (blocksGlow) return;

    const workspace = Blockly.getMainWorkspace();
    if (!workspace) {
        console.warn("Editor Tweaks: Error -- Could not remove glow from workspace");
        oldBlocksGlow = undefined;
        return;
    }

    // these are shared across workspaces, remove to save RAM
    workspace.options.stackGlowBlur.parentNode.remove();
    workspace.options.stackGlowBlurError.parentNode.remove();
    workspace.options.stackReplaceGlow.remove();

    const applyToOuterStack = (topBlock, func) => {
        func(topBlock);
        let nextBlock = topBlock.getNextBlock();
        while (nextBlock !== null) {
            func(nextBlock);
            nextBlock = nextBlock.getNextBlock();
        }
    };

    // patch glow functions to not... glow. Instead give a lighter indicator
    const BlockSvgProto = Blockly.BlockSvg.prototype;
    BlockSvgProto.setGlowStack = blocksGlow ? ogGlowFuncs.run : function(isGlowingStack) {
      this.isGlowingStack_ = isGlowingStack;
      this.getSvgRoot().removeAttribute("filter"); //remove old glow

      if (isGlowingStack) applyToOuterStack(this, (block) => {
        block.svgPath_.classList.remove("blocklyPath");
        block.svgPath_.setAttribute("stroke", "#fff200");
        block.svgPath_.setAttribute("stroke-width", "5");
      });
      else applyToOuterStack(this, (block) => {
        block.svgPath_.classList.add("blocklyPath");
        block.svgPath_.setAttribute("stroke", block.colourTertiary_);
        block.svgPath_.removeAttribute("stroke-width");
      });
    };
    BlockSvgProto.setErrorStack = blocksGlow ? ogGlowFuncs.error : function(isGlowingStack) {
      this.isGlowingStack_ = isGlowingStack;
      this.getSvgRoot().removeAttribute("filter"); //remove old glow

      if (isGlowingStack) applyToOuterStack(this, (block) => {
        block.svgPath_.classList.remove("blocklyPath");
        block.svgPath_.setAttribute("stroke", "#ff0000");
        block.svgPath_.setAttribute("stroke-width", "5");
      });
      else applyToOuterStack(this, (block) => {
        block.svgPath_.classList.add("blocklyPath");
        block.svgPath_.setAttribute("stroke", block.colourTertiary_);
        block.svgPath_.removeAttribute("stroke-width");
      });
    };

    BlockSvgProto.highlightForReplacement = blocksGlow ? ogGlowFuncs.replace1 : function(adding) {
      this.getSvgRoot().removeAttribute("filter"); //remove old glow
      if (adding) {
        this.svgPath_.classList.remove("blocklyPath");
        this.svgPath_.setAttribute("stroke", "#fff");
        this.svgPath_.setAttribute("stroke-width", "6");
      } else {
        this.svgPath_.classList.add("blocklyPath");
        this.svgPath_.setAttribute("stroke", this.colourTertiary_);
        this.svgPath_.removeAttribute("stroke-width");
      }
    };
    BlockSvgProto.highlightShapeForInput = blocksGlow ? ogGlowFuncs.replace2 : function(connection, adding) {
      const input = this.getInputWithConnection(connection);
      if (!input) throw 'No input found for the connection';
      if (!input.outlinePath) return;

      input.outlinePath.removeAttribute("filter"); //remove old glow
      if (adding) {
        input.outlinePath.classList.remove("blocklyPath");
        input.outlinePath.setAttribute("stroke", "#fff");
        input.outlinePath.setAttribute("stroke-width", "5");
      } else {
        input.outlinePath.classList.add("blocklyPath");
        input.outlinePath.setAttribute("stroke", this.colourTertiary_);
        input.outlinePath.removeAttribute("stroke-width");
      }
    };
  }

  addon.self.addEventListener("reenabled", applyChanges);
  addon.settings.addEventListener("change", applyChanges);
  addon.self.addEventListener("disabled", () => {
    ckbxEnabled = true;
    applyChanges();
  });

  applyChanges();
}

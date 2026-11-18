// The gamepad addon's settings editor (editor only); the rest of the gamepad code is shared with packaged games in scratch-vm/src/web-shared/.
import EventTarget from "scratch-vm/src/web-shared/event-target.js";
import {
  defaultAxesMappings,
  emptyMapping,
  transformAndCopyMapping,
  getGamepadId,
  prepareAxisMappingForExport,
  prepareButtonMappingForExport
} from "scratch-vm/src/web-shared/gamepadlib.js";

const removeAllChildren = (el) => {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
};
const buttonHtmlId = (index) => `gamepadlib-button-${index}`;
const axisHtmlId = (n) => `gamepadlib-axis-${n}`;

class GamepadEditor extends EventTarget {
  constructor(gamepadLib) {
    super();

    /** @type {GamepadLib} */
    this.gamepadLib = gamepadLib;

    this.root = Object.assign(document.createElement("div"), {
      className: "gamepadlib-root",
    });
    this.selector = Object.assign(document.createElement("select"), {
      className: "gamepadlib-selector",
    });
    this.content = Object.assign(document.createElement("div"), {
      className: "gamepadlib-content",
    });

    this.root.appendChild(this.selector);
    this.root.appendChild(this.content);

    this.onSelectorChange = this.onSelectorChange.bind(this);
    this.onGamepadsChange = this.onGamepadsChange.bind(this);

    this.selector.addEventListener("change", this.onSelectorChange);
    this.gamepadLib.addEventListener("gamepadconnected", this.onGamepadsChange);
    this.gamepadLib.addEventListener("gamepaddisconnected", this.onGamepadsChange);

    this.buttonIdToElement = new Map();
    this.axisIdToElement = new Map();

    this.hidden = false;

    // should be overridden later
    this.msg = (id, opts) => id;
  }

  onSelectorChange() {
    this.updateContent();
    this.dispatchEvent(new CustomEvent("gamepad-changed"));
  }

  onGamepadsChange() {
    this.updateAllContent();
    this.dispatchEvent(new CustomEvent("gamepad-changed"));
  }

  updateAllContent() {
    this.updateDropdown();
    this.updateContent();
    this.focus();
  }

  updateDropdown() {
    removeAllChildren(this.selector);

    const gamepads = Array.from(this.gamepadLib.gamepads.entries());
    if (gamepads.length === 0) {
      this.selector.hidden = true;
      return;
    }
    this.selector.hidden = false;
    for (const [id, _] of gamepads) {
      const option = document.createElement("option");
      option.textContent = id;
      option.value = id;
      this.selector.appendChild(option);
    }
  }

  keyToString(key) {
    if (key === " ") return this.msg("key-space");
    if (key === "ArrowUp") return this.msg("key-up");
    if (key === "ArrowDown") return this.msg("key-down");
    if (key === "ArrowLeft") return this.msg("key-left");
    if (key === "ArrowRight") return this.msg("key-right");
    if (key === "Enter") return this.msg("key-enter");
    if (key.length === 1) {
      return key.toUpperCase();
    }
    // Convert eg. "PageUp" -> "Page Up"
    return key.replace(/[a-z]([A-Z])/, (n) => `${n[0]} ${n[1]}`)
  }

  createButtonMapping(mappingList, index, { property = "high", allowClick = true } = {}) {
    const input = document.createElement("input");
    input.readOnly = true;
    input.className = "gamepadlib-keyinput";
    input.title = this.msg("keyinput-title");
    input.dataset.index = index;

    const update = () => {
      const mapping = mappingList[index];
      input.dataset.empty = false;
      if (mapping.type === "key") {
        if (mapping[property] === null) {
          input.value = this.msg("key-none");
          input.dataset.empty = true;
        } else {
          input.value = this.keyToString(mapping[property]);
        }
      } else if (mapping.type === "mousedown") {
        let value = this.msg("key-click");
        if (mapping.button !== 0) {
          value += ` (${mapping.button})`;
        }
        input.value = value;
      } else {
        // should never happen
        input.value = `??? ${mapping.type}`;
      }
    };

    const changedMapping = () => {
      mappingList[index] = transformAndCopyMapping(mappingList[index]);
      isAcceptingInput = false;
      input.blur();
      update();
      input.dispatchEvent(new CustomEvent("mapping-changed"));
      this.changed();
    };

    let isAcceptingInput = false;

    const handleClick = (e) => {
      e.preventDefault();
      if (isAcceptingInput) {
        if (allowClick) {
          const mapping = mappingList[index];
          mapping.type = "mousedown";
          mapping.button = e.button;
          changedMapping();
        } else {
          handleBlur();
        }
      } else {
        input.value = "...";
        input.dataset.acceptingInput = true;
        isAcceptingInput = true;
      }
    };

    const handleKeyEvent = (e) => {
      if (isAcceptingInput) {
        e.preventDefault();
        const key = e.key;
        // TW: We allow binding to control and shift
        if (["Alt"].includes(key)) {
          return;
        }
        const mapping = mappingList[index];
        const KEYS = [
          "ArrowUp",
          "ArrowDown",
          "ArrowRight",
          "ArrowLeft",
          "Enter",
          // TW: We support more keys
          // "Backspace",
          // "Delete",
          "Shift",
          "CapsLock",
          "ScrollLock",
          "Control",
          // "Escape",
          "Insert",
          "Home",
          "End",
          "PageUp",
          "PageDown",
        ];
        if (key.length === 1 || KEYS.includes(key)) {
          mapping.type = "key";
          mapping[property] = key;
        } else if (key !== "Escape") {
          mapping.type = "key";
          mapping[property] = null;
        }
        changedMapping();
      } else if (e.key === "Enter") {
        e.preventDefault();
        e.target.click();
      }
    };

    const MODIFIER_KEYS = ["Shift", "Control"];
    const handleKeyDown = (e) => {
      if (!MODIFIER_KEYS.includes(e.key)) handleKeyEvent(e);
    };

    const handleKeyUp = (e) => {
      if (MODIFIER_KEYS.includes(e.key)) handleKeyEvent(e);
    };

    const handleBlur = () => {
      input.dataset.acceptingInput = false;
      if (isAcceptingInput) {
        isAcceptingInput = false;
        update();
      }
    };

    input.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    input.addEventListener("mouseup", handleClick);
    input.addEventListener("keydown", handleKeyDown);
    input.addEventListener("keyup", handleKeyUp);
    input.addEventListener("blur", handleBlur);
    update();

    return input;
  }

  createAxisMapping(mappingList, index) {
    const selector = document.createElement("select");
    selector.className = "gamepadlib-axis-mapping";
    selector.id = axisHtmlId(index);
    selector.appendChild(
      Object.assign(document.createElement("option"), {
        textContent: this.msg("axis-none"),
        value: "none",
      })
    );
    selector.appendChild(
      Object.assign(document.createElement("option"), {
        textContent: this.msg("axis-cursor"),
        value: "cursor",
      })
    );
    selector.appendChild(
      Object.assign(document.createElement("option"), {
        // doesn't really make sense to translate
        textContent: "WASD",
        value: "wasd",
      })
    );
    selector.appendChild(
      Object.assign(document.createElement("option"), {
        textContent: this.msg("axis-arrows"),
        value: "arrows",
      })
    );
    selector.appendChild(
      Object.assign(document.createElement("option"), {
        textContent: this.msg("axis-custom"),
        value: "custom",
      })
    );

    const updateDropdownValue = () => {
      if (mappingList[index].type === "key" || mappingList[index].type === "mousedown") {
        if (
          mappingList[index].high === null &&
          mappingList[index].low === null &&
          mappingList[index + 1].high === null &&
          mappingList[index + 1].low === null
        ) {
          selector.value = "none";
        } else if (
          mappingList[index].high === defaultAxesMappings.wasd[0].high &&
          mappingList[index].low === defaultAxesMappings.wasd[0].low &&
          mappingList[index + 1].high === defaultAxesMappings.wasd[1].high &&
          mappingList[index + 1].low === defaultAxesMappings.wasd[1].low
        ) {
          selector.value = "wasd";
        } else if (
          mappingList[index].high === defaultAxesMappings.arrows[0].high &&
          mappingList[index].low === defaultAxesMappings.arrows[0].low &&
          mappingList[index + 1].high === defaultAxesMappings.arrows[1].high &&
          mappingList[index + 1].low === defaultAxesMappings.arrows[1].low
        ) {
          selector.value = "arrows";
        } else {
          selector.value = "custom";
        }
      } else if (mappingList[index].type === "virtual_cursor") {
        selector.value = "cursor";
      } else {
        // should never happen
        selector.value = "none";
      }
    };
    updateDropdownValue();

    const circleOverlay = document.createElement("div");
    circleOverlay.className = "gamepadlib-axis-circle-overlay";
    const updateOverlay = () => {
      removeAllChildren(circleOverlay);
      if (mappingList[index].type === "key") {
        const buttons = [
          this.createButtonMapping(mappingList, index + 1, { property: "low", allowClick: false }),
          this.createButtonMapping(mappingList, index, { property: "low", allowClick: false }),
          this.createButtonMapping(mappingList, index, { property: "high", allowClick: false }),
          this.createButtonMapping(mappingList, index + 1, { property: "high", allowClick: false }),
        ];
        for (const button of buttons) {
          button.classList.add("gamepadlib-axis-mapper");
          button.addEventListener("mapping-changed", updateDropdownValue);
          circleOverlay.appendChild(button);
        }
      }
    };
    updateOverlay();

    selector.addEventListener("change", () => {
      if (selector.value === "custom") {
        // If key mappings already exist, leave them as-is
        if (mappingList[index].type !== "key") {
          mappingList[index] = transformAndCopyMapping(defaultAxesMappings.arrows[0]);
          mappingList[index + 1] = transformAndCopyMapping(defaultAxesMappings.arrows[1]);
        }
      } else if (selector.value === "arrows") {
        mappingList[index] = transformAndCopyMapping(defaultAxesMappings.arrows[0]);
        mappingList[index + 1] = transformAndCopyMapping(defaultAxesMappings.arrows[1]);
      } else if (selector.value === "wasd") {
        mappingList[index] = transformAndCopyMapping(defaultAxesMappings.wasd[0]);
        mappingList[index + 1] = transformAndCopyMapping(defaultAxesMappings.wasd[1]);
      } else if (selector.value === "cursor") {
        mappingList[index] = transformAndCopyMapping(defaultAxesMappings.cursor[0]);
        mappingList[index + 1] = transformAndCopyMapping(defaultAxesMappings.cursor[1]);
      } else {
        mappingList[index] = transformAndCopyMapping(emptyMapping());
        mappingList[index + 1] = transformAndCopyMapping(emptyMapping());
      }
      updateOverlay();
      this.changed();
    });

    return {
      circleOverlay,
      selector,
    };
  }

  hasControllerSelected() {
    return !!this.selector.value;
  }

  updateContent() {
    removeAllChildren(this.content);

    if (this.hidden) {
      return;
    }

    const selectedId = this.selector.value;
    if (!selectedId) {
      const message = document.createElement("div");
      message.textContent = this.msg("no-controllers");
      this.content.appendChild(message);
      return;
    }

    const gamepadData = this.gamepadLib.gamepads.get(selectedId);
    if (!gamepadData) {
      // Users should never be able to see this
      const message = document.createElement("div");
      message.textContent = `Cannot find controller: ${selectedId}`;
      this.content.appendChild(message);
      return;
    }

    this.buttonIdToElement.clear();
    this.axisIdToElement.clear();

    const mappingsContainer = document.createElement("div");
    mappingsContainer.className = "gamepadlib-content-buttons";
    const buttonMappings = gamepadData.buttonMappings;
    for (let i = 0; i < buttonMappings.length; i++) {
      const container = document.createElement("div");
      container.className = "gamepadlib-mapping";
      container.dataset.id = i;
      const label = document.createElement("label");
      label.className = "gamepadlib-mapping-label";
      label.textContent = this.msg("button-n", { n: i });
      const id = buttonHtmlId(i);
      label.htmlFor = id;
      const options = document.createElement("div");
      options.className = "gamepadlib-mapping-options";
      const mappingInput = this.createButtonMapping(buttonMappings, i);
      mappingInput.id = id;
      options.appendChild(mappingInput);
      container.appendChild(label);
      container.appendChild(options);
      mappingsContainer.appendChild(container);
      this.buttonIdToElement.set(i, container);
    }

    const axesContainer = document.createElement("div");
    axesContainer.className = "gamepadlib-content-axes";
    const axesMappings = gamepadData.axesMappings;
    for (let i = 0; i < axesMappings.length; i += 2) {
      const container = document.createElement("div");
      container.className = "gamepadlib-axis";
      const label = document.createElement("label");
      label.textContent = this.msg("axes-a-b", { a: i, b: i + 1 });
      label.htmlFor = axisHtmlId(i);
      const circle = document.createElement("div");
      circle.className = "gamepadlib-axis-circle";
      const { circleOverlay, selector } = this.createAxisMapping(axesMappings, i);
      circle.appendChild(circleOverlay);
      const dot = document.createElement("div");
      dot.className = "gamepadlib-axis-dot";
      circle.appendChild(dot);
      container.appendChild(label);
      container.appendChild(circle);
      container.appendChild(selector);
      axesContainer.appendChild(container);
      this.axisIdToElement.set(i, dot);
    }

    this.content.appendChild(mappingsContainer);
    this.content.appendChild(axesContainer);
  }

  update(gamepads) {
    if (this.hidden) {
      return;
    }
    const selectedId = this.selector.value;
    if (!selectedId) {
      return;
    }
    const gamepad = Array.from(gamepads).find((i) => i && getGamepadId(i) === this.selector.value);
    if (!gamepad) {
      return;
    }
    for (let i = 0; i < gamepad.buttons.length; i++) {
      const element = this.buttonIdToElement.get(i);
      if (element) {
        const button = gamepad.buttons[i];
        const value = button.value.toString();
        if (value !== element.dataset.value) {
          element.dataset.value = value;
        }
      }
    }
    for (let i = 0; i < gamepad.axes.length; i += 2) {
      const element = this.axisIdToElement.get(i);
      if (element) {
        const x = gamepad.axes[i];
        const y = gamepad.axes[i + 1] || 0;
        const size = 150 / 2;
        element.style.transform = `translate(-50%, -50%) translate(${x * size}px, ${y * size}px)`;
      }
    }
  }

  export() {
    const selectedId = this.selector.value;
    if (!selectedId) {
      return null;
    }
    const gamepadData = this.gamepadLib.gamepads.get(selectedId);
    if (!gamepadData) {
      return null;
    }
    return {
      axes: gamepadData.axesMappings.map(prepareAxisMappingForExport),
      buttons: gamepadData.buttonMappings.map(prepareButtonMappingForExport),
    };
  }

  changed() {
    this.dispatchEvent(new CustomEvent("mapping-changed"));
  }

  hide() {
    this.hidden = true;
    this.updateContent();
  }

  focus() {
    if (this.selector.value) {
      this.selector.focus();
    }
  }

  generateEditor() {
    this.hidden = false;
    this.updateAllContent();
    return this.root;
  }
}

export default GamepadEditor;

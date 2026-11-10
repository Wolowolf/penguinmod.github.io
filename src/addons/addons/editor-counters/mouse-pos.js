import { addAfterStopButton } from "./after-stop-button.js";

export default async function ({ addon, console }) {
  var posContainerContainer = document.createElement("div");
  addon.tab.displayNoneWhileDisabled(posContainerContainer, { display: "flex" });

  var posContainer = document.createElement("div");
  var pos = document.createElement("span");

  posContainerContainer.className = "pos-container-container";
  posContainer.className = "pos-container";

  posContainerContainer.appendChild(posContainer);
  posContainer.appendChild(pos);

  const vm = addon.tab.traps.vm;

  vm.runtime.ioDevices.mouse.__scratchX = vm.runtime.ioDevices.mouse._scratchX;
  vm.runtime.ioDevices.mouse.__scratchY = vm.runtime.ioDevices.mouse._scratchY;

  var x = vm.runtime.ioDevices.mouse.__scratchX ? vm.runtime.ioDevices.mouse.__scratchX : 0;
  var y = vm.runtime.ioDevices.mouse.__scratchY ? vm.runtime.ioDevices.mouse.__scratchY : 0;

  const showUpdatedValue = () => pos.setAttribute("data-content", `${Math.round(x)}, ${Math.round(y)}`);

  Object.defineProperty(vm.runtime.ioDevices.mouse, "_scratchX", {
    get: function () {
      return this.__scratchX;
    },
    set: function (setx) {
      x = setx;
      showUpdatedValue();
      this.__scratchX = setx;
    },
  });

  Object.defineProperty(vm.runtime.ioDevices.mouse, "_scratchY", {
    get: function () {
      return this.__scratchY;
    },
    set: function (sety) {
      y = sety;
      showUpdatedValue();
      this.__scratchY = sety;
    },
  });

  if (addon.tab.redux.state && addon.tab.redux.state.scratchGui.stageSize.stageSize === "small") {
    document.body.classList.add("sa-mouse-pos-small");
  }
  document.addEventListener(
    "click",
    (e) => {
      if (e.target.closest("[class*='stage-header_stage-button-first']")) {
        document.body.classList.add("sa-mouse-pos-small");
      } else if (e.target.closest("[class*='stage-header_stage-button-last']")) {
        document.body.classList.remove("sa-mouse-pos-small");
      }
    },
    { capture: true }
  );

  addAfterStopButton(addon, posContainerContainer, 1, () => addon.tab.editorMode === "editor");
}

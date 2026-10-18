// Adapted from the Custom Styles extension by TheShovel (MIT): the styles come from this addon's
// settings instead of blocks, and apply to every project shown in the editor.

const monitorRoot = 'div[class^="monitor_monitor-container_"]';
const monitorValue = 'div[class^="monitor_value_"]';
const monitorValueLarge = 'div[class^="monitor_large-value_"]';
const monitorListHeader = 'div[class^="monitor_list-header_"]';
const monitorListFooter = 'div[class^="monitor_list-footer_"]';
const monitorRowValueOuter = 'div[class^="monitor_list-value_"]';
const monitorRowsInner = 'div[class^="monitor_list-body_"]';
const monitorRowsScroller = 'div[class^="monitor_list-body_"] > .ReactVirtualized__List';
const monitorRowIndex = 'div[class^="monitor_list-index_"]';
const askBoxBG = 'div[class^="question_question-container_"]';
const askBoxButton = 'button[class^="question_question-submit-button_"]';
const askBoxInner = '[class^="question_question-container_"] input[class^="input_input-form_"]';
const askBoxText = '[class^="question_question-container_"] div[class^="question_question-label_"]';
const askBoxBorderMain =
  '[class^="question_question-input_"] input:focus, [class^="question_question-input_"] input:hover';
const askBoxBorderOuter = '[class^="question_question-input_"] > input:focus';

export default async function ({ addon }) {
  const stylesheet = document.createElement("style");
  stylesheet.className = "sa-custom-styles";
  // end of <body> for higher precedence than other sheets
  document.body.appendChild(stylesheet);

  const applyCSS = () => {
    if (addon.self.disabled) {
      stylesheet.textContent = "";
      return;
    }
    const get = (id) => addon.settings.get(id);
    let css = "";
    if (get("monitors")) {
      css += `${monitorRoot}, ${monitorRowIndex} { color: ${get("monitor-text")} !important; }`;
      css += `${monitorRoot} { background: ${get("monitor-background")}; border-color: ${get("monitor-border")}; border-width: ${get("monitor-border-width")}px; border-radius: ${get("monitor-roundness")}px !important; accent-color: ${get("slider")} !important; }`;
      css += `${monitorValue}, ${monitorValueLarge} { background: ${get("value-background")} !important; color: ${get("value-text")} !important; }`;
      css += `${monitorValue} { border-radius: ${get("value-roundness")}px !important; }`;
    }
    if (get("lists")) {
      css += `${monitorListHeader} { background: ${get("list-header")}; }`;
      css += `${monitorListFooter} { background: ${get("list-footer")}; }`;
      css += `${monitorRowValueOuter} { background: ${get("list-value-background")} !important; color: ${get("list-value-text")} !important; border-radius: ${get("list-value-roundness")}px !important; }`;
      css += `${monitorRowsScroller} { overflow: ${get("list-scrolling") === "disabled" ? "hidden" : "auto"} !important; }`;
    }
    if (get("ask")) {
      css += `${askBoxBG} { background: ${get("ask-background")} !important; border-style: solid !important; border-width: ${get("ask-border-width")}px !important; border-radius: ${get("ask-roundness")}px !important; }`;
      css += `${askBoxText} { color: ${get("ask-question")} !important; }`;
      css += `${askBoxInner} { background: ${get("ask-input-background")} !important; color: ${get("ask-input-text")} !important; border: ${get("ask-input-border-width")}px solid ${get("ask-input-border")} !important; border-radius: ${get("ask-input-roundness")}px !important; }`;
      css += `${askBoxBorderMain}, ${askBoxBorderOuter} { border-color: ${get("ask-input-border")} !important; }`;
      css += `${askBoxBorderOuter} { box-shadow: none !important; }`;
      css += `${askBoxButton} { background-color: ${get("ask-button")}; border-radius: ${get("ask-button-roundness")}px !important; }`;
    }
    stylesheet.textContent = css;
  };

  applyCSS();
  addon.settings.addEventListener("change", applyCSS);
  addon.self.addEventListener("disabled", applyCSS);
  addon.self.addEventListener("reenabled", applyCSS);
}

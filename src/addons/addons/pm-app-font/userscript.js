// Section 117: the font of the whole editor. The editor's CSS reads --pm-font (all text),
// --pm-font-blocks (block text) and --pm-font-mono (monospace text); without this addon they
// fall back to Atkinson Hyperlegible Next and Atkinson Hyperlegible Mono.
import nextUrl from "../../../lib/tw-scratch-render-fonts/AtkinsonHyperlegibleNext.ttf";
import nextItalicUrl from "../../../lib/tw-scratch-render-fonts/AtkinsonHyperlegibleNext-Italic.ttf";
import monoUrl from "../../../lib/tw-scratch-render-fonts/AtkinsonHyperlegibleMono.ttf";
import monoItalicUrl from "../../../lib/tw-scratch-render-fonts/AtkinsonHyperlegibleMono-Italic.ttf";
import lexendUrl from "../../../lib/tw-scratch-render-fonts/Lexend.ttf";
import lexendDecaUrl from "../../../lib/tw-scratch-render-fonts/LexendDeca.ttf";
import lexendExaUrl from "../../../lib/tw-scratch-render-fonts/LexendExa.ttf";
import lexendGigaUrl from "../../../lib/tw-scratch-render-fonts/LexendGiga.ttf";
import lexendMegaUrl from "../../../lib/tw-scratch-render-fonts/LexendMega.ttf";
import lexendPetaUrl from "../../../lib/tw-scratch-render-fonts/LexendPeta.ttf";
import lexendTeraUrl from "../../../lib/tw-scratch-render-fonts/LexendTera.ttf";
import lexendZettaUrl from "../../../lib/tw-scratch-render-fonts/LexendZetta.ttf";

// Variable fonts have files and a weight range; the others are only family names.
// xHeight (x-height / font size) makes "Text size" give every font the same x-height.
const FONTS = {
  next: { family: "Atkinson Hyperlegible Next", url: nextUrl, italicUrl: nextItalicUrl, weights: [200, 800], xHeight: 0.496 },
  mono: { family: "Atkinson Hyperlegible Mono", url: monoUrl, italicUrl: monoItalicUrl, weights: [200, 800], xHeight: 0.496 },
  lexend: { family: "Lexend", url: lexendUrl, weights: [100, 900], xHeight: 0.525 },
  opendyslexic: { family: "OpenDyslexic", xHeight: 0.56 },
  comic: { family: "Comic Sans MS", xHeight: 0.54 },
  arial: { family: "Arial", xHeight: 0.519 },
  verdana: { family: "Verdana", xHeight: 0.545 },
};
const LEXEND_WIDTHS = {
  lexend: ["Lexend", lexendUrl],
  deca: ["Lexend Deca", lexendDecaUrl],
  exa: ["Lexend Exa", lexendExaUrl],
  giga: ["Lexend Giga", lexendGigaUrl],
  mega: ["Lexend Mega", lexendMegaUrl],
  peta: ["Lexend Peta", lexendPetaUrl],
  tera: ["Lexend Tera", lexendTeraUrl],
  zetta: ["Lexend Zetta", lexendZettaUrl],
};
const VARIABLES = ["--pm-font", "--pm-font-blocks", "--pm-font-mono"];

export default async function ({ addon }) {
  const vm = addon.tab.traps.vm;
  const style = document.createElement("style");
  style.id = "pm-app-font";
  let applied = false;

  const getFont = (id) => {
    const font = FONTS[id] || FONTS.next;
    if (id !== "lexend") return font;
    const [family, url] = LEXEND_WIDTHS[addon.settings.get("lexendWidth")] || LEXEND_WIDTHS.lexend;
    return { ...font, family, url };
  };

  // A variable font with other weights than 400 / 700 gets its own family whose two weights are
  // the chosen ones: the browser picks the "normal" face for weights up to 500 and the "bold" face
  // above, and clamps the font's weight axis to the face's single weight.
  const fontFaces = [];
  const familyFor = (font, alias, normalWeight, boldWeight) => {
    if (!font.url || (normalWeight === 400 && boldWeight === 700)) return `"${font.family}"`;
    const clamp = (w) => Math.min(font.weights[1], Math.max(font.weights[0], w));
    for (const weight of [clamp(normalWeight), clamp(boldWeight)]) {
      fontFaces.push(`@font-face { font-family: "${alias}"; src: url("${font.url}"); font-weight: ${weight}; font-style: normal; }`);
      if (font.italicUrl) {
        fontFaces.push(`@font-face { font-family: "${alias}"; src: url("${font.italicUrl}"); font-weight: ${weight}; font-style: italic; }`);
      }
    }
    return `"${alias}"`;
  };

  const updateAllBlocks = async (families, italic) => {
    // Block widths are measured from their text, so draw them again once the fonts are loaded
    // (a face only starts loading when text uses it)
    const loads = [];
    for (const family of families) {
      for (const weight of [400, 700]) loads.push(document.fonts.load(`${italic ? "italic " : ""}${weight} 16px ${family}`));
    }
    await Promise.all(loads).catch(() => {});
    const Blockly = await addon.tab.traps.getBlockly();
    // The editor keeps the text width cache on all the time: empty it, or the old widths are used
    if (Blockly.Field.cacheWidths_) Blockly.Field.cacheWidths_ = {};
    const workspace = Blockly.getMainWorkspace();
    if (!workspace) return;
    if (vm.editingTarget) vm.emitWorkspaceUpdate();
    const flyout = workspace.getFlyout();
    if (flyout) {
      const flyoutWorkspace = flyout.getWorkspace();
      Blockly.Xml.clearWorkspaceAndLoadFromXml(Blockly.Xml.workspaceToDom(flyoutWorkspace), flyoutWorkspace);
      workspace.getToolbox().refreshSelection();
      workspace.toolboxRefreshEnabled_ = true;
    }
  };

  const update = () => {
    const root = document.documentElement.style;
    for (const name of VARIABLES) root.removeProperty(name);
    style.remove();
    fontFaces.length = 0;
    const wasApplied = applied;
    applied = false;
    let blockFamilies = ['"Atkinson Hyperlegible Next"'];
    let italic = false;

    if (!addon.self.disabled) {
      const normalWeight = addon.settings.get("normalWeight");
      const boldWeight = Math.max(normalWeight, addon.settings.get("boldWeight"));
      const fontId = addon.settings.get("font");
      const font = getFont(fontId);
      const blockId = addon.settings.get("blockFont");
      const monoId = addon.settings.get("monoFont");
      const main = familyFor(font, "PM App Font", normalWeight, boldWeight);
      const blocks = blockId === "same" ? main : familyFor(getFont(blockId), "PM App Font Blocks", normalWeight, boldWeight);
      const mono = monoId === "same" ? main : familyFor(getFont(monoId), "PM App Font Mono", normalWeight, boldWeight);
      const changed = fontId !== "next" || blockId !== "same" || monoId !== "mono" || fontFaces.length > 0;
      if (changed) {
        root.setProperty("--pm-font", `${main}, sans-serif`);
        root.setProperty("--pm-font-blocks", `${blocks}, sans-serif`);
        root.setProperty("--pm-font-mono", `${mono}, monospace`);
      }

      const rules = [];
      const size = addon.settings.get("size");
      if (size !== 100) rules.push(`font-size-adjust: ex-height ${((font.xHeight * size) / 100).toFixed(3)};`);
      const letterSpacing = addon.settings.get("letterSpacing");
      if (letterSpacing !== 0) rules.push(`letter-spacing: ${letterSpacing / 100}em;`);
      const wordSpacing = addon.settings.get("wordSpacing");
      if (wordSpacing !== 0) rules.push(`word-spacing: ${wordSpacing / 100}em;`);
      italic = addon.settings.get("italic");
      if (italic) rules.push("font-style: italic;");

      if (changed || rules.length) {
        blockFamilies = [main, blocks];
        // The paint editor's text box shows the costume's own text: leave it as it is
        style.textContent = fontFaces.join("\n") + `\nhtml { ${rules.join(" ")} }\n` +
          'textarea[class*="paint-editor_text-area"] { font-size-adjust: none; letter-spacing: normal; word-spacing: normal; font-style: normal; }';
        document.head.appendChild(style);
        applied = true;
      }
    }
    // With the default look before and after, the blocks are already drawn right
    if (applied || wasApplied) updateAllBlocks(blockFamilies, italic);
  };

  addon.self.addEventListener("disabled", update);
  addon.self.addEventListener("reenabled", update);
  addon.settings.addEventListener("change", update);
  update();
}

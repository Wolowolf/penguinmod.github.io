// Desktop fork (section 217): the one list of colours the light and dark themes are made of.
// Every UI colour of the themes is a CSS variable from here (7 chosen, the rest worked out from them);
// the "Theme colors" addon (src/addons/addons/theme-colors) overrides them per theme.
// Light values are on :root, dark values on :root when <body theme="dark">, so every page that
// sets the body's theme attribute (editor, addon settings, credits) gets them.

import themeUsesCSS from '!raw-loader!./pm-theme-uses.css';

// Grouped by what each area is used for (Session 238):
// background = the app's frame; panels = where you take things from (block palette, category menu,
// sprite / costume / sound lists); workspace = where things come together and the focus is (code area,
// costume editor around the drawing, sound editor waveform); raised = what sits on top (buttons, inputs,
// tiles, menus, dialogs); lines = borders, scrollbars, grid; text; accent = selection, links, focus and
// the menu bar. In dark mode the workspace is darker than the panels, in light mode lighter: both put
// the most contrast with the text where the focus is.
const THEME_COLORS = [
    {id: 'background', variable: '--ui-primary', name: 'Background', light: '#e5f0ff', dark: '#111111'},
    {id: 'panel', variable: '--ui-secondary', name: 'Panels (block palette, category menu, sprite, costume and sound lists)', light: '#e9f1fc', dark: '#1e1e1e'},
    {id: 'workspace', variable: '--ui-workspace', name: 'Workspace (code area, costume and sound editing)', light: '#f9f9f9', dark: '#181818'},
    {id: 'surface', variable: '--ui-surface', name: 'Buttons, inputs, tiles, menus and dialogs', light: '#ffffff', dark: '#262626'},
    {id: 'edge', variable: '--ui-edge', name: 'Borders, scrollbars and grid', light: '#c6cdd6', dark: '#404040'},
    {id: 'text', variable: '--text-primary', name: 'Text (dim text and inactive icons follow it)', light: '#575e75', dark: '#eeeeee'},
    {id: 'accent', variable: '--ui-accent', name: 'Accent and menu bar (selection, links, focus)', light: '#00c3ff', dark: '#00c3ff'}
];

// colours worked out from the ones above (not chosen in the addon)
const DERIVED_BOTH = {
    // hover and selected: a light tint of the text over what is hovered
    '--ui-tertiary': 'color-mix(in srgb, var(--text-primary) 10%, var(--ui-surface))',
    // dim text and inactive icons: weaker text
    '--text-secondary': 'color-mix(in srgb, var(--text-primary) 75%, var(--ui-surface))',
    // the block palette and category menu are panels
    '--ui-palette': 'var(--ui-secondary)',
    // the costume editor (scratch-paint) reads these
    '--paint-text-primary': 'var(--text-primary)',
    '--paint-ui-pane-border': 'var(--ui-edge)',
    '--paint-form-border': 'var(--ui-edge)'
};
const DERIVED_LIGHT = Object.assign({}, DERIVED_BOTH, {
    '--ui-menu-bar': 'var(--ui-accent)',
    '--ui-modal-overlay': 'hsl(from var(--ui-accent) h s calc(l + 15) / 0.9)'
});
const DERIVED_DARK = Object.assign({}, DERIVED_BOTH, {
    '--ui-menu-bar': 'hsl(from var(--ui-accent) h s calc(l * 0.8))',
    '--ui-modal-overlay': 'color-mix(in srgb, var(--ui-tertiary) 67%, transparent)'
});

const LIGHT_SELECTOR = ':root';
const DARK_SELECTOR = ':root:has(> body[theme="dark"])';
// one step more specific than the defaults, for the addon's values
const CUSTOM_LIGHT_SELECTOR = 'html:root:has(> body:not([theme="dark"]))';
const CUSTOM_DARK_SELECTOR = 'html:root:has(> body[theme="dark"])';

const block = (selector, values) => {
    const lines = Object.keys(values).map(variable => `    ${variable}: ${values[variable]};`);
    return lines.length ? `${selector} {\n${lines.join('\n')}\n}\n` : '';
};

const defaultsCSS = () => {
    const light = {};
    const dark = {};
    for (const color of THEME_COLORS) {
        light[color.variable] = color.light;
        dark[color.variable] = color.dark;
    }
    Object.assign(light, DERIVED_LIGHT);
    Object.assign(dark, DERIVED_DARK);
    return block(LIGHT_SELECTOR, light) + block(DARK_SELECTOR, dark);
};

let installed = false;
const installThemeColors = () => {
    if (installed || typeof document === 'undefined') return;
    installed = true;
    const style = document.createElement('style');
    style.className = 'pm-theme-colors';
    style.textContent = defaultsCSS();
    // first in <head>: everything else may build on the variables
    document.head.insertBefore(style, document.head.firstChild);
    // where Blockly and other libraries use them: start of <body>, after the libraries' own styles
    const uses = document.createElement('style');
    uses.className = 'pm-theme-uses';
    uses.textContent = themeUsesCSS;
    const addUses = () => document.body.insertBefore(uses, document.body.firstChild);
    if (document.body) addUses();
    else document.addEventListener('DOMContentLoaded', addUses, {once: true});
};

const isColor = value => typeof value === 'string' && /^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(value);

// lightValues / darkValues: {colour id: '#rrggbb' or '#rrggbbaa'}; anything else keeps the default
const customCSS = (lightValues, darkValues) => {
    const light = {};
    const dark = {};
    for (const color of THEME_COLORS) {
        const l = lightValues[color.id];
        const d = darkValues[color.id];
        if (isColor(l) && l.toLowerCase() !== color.light) light[color.variable] = l;
        if (isColor(d) && d.toLowerCase() !== color.dark) dark[color.variable] = d;
    }
    return block(CUSTOM_LIGHT_SELECTOR, light) + block(CUSTOM_DARK_SELECTOR, dark);
};

// the CSS for the "Theme colors" addon's settings; get(settingId) reads one
// (settings "light" / "dark" switch a theme on, "light-<id>" / "dark-<id>" are its colours)
const themeColorsCSS = get => {
    const values = mode => {
        const result = {};
        if (get(mode) !== true) return result;
        for (const color of THEME_COLORS) result[color.id] = get(`${mode}-${color.id}`);
        return result;
    };
    return customCSS(values('light'), values('dark'));
};

export {
    THEME_COLORS,
    installThemeColors,
    customCSS,
    themeColorsCSS
};

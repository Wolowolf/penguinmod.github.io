// Desktop fork (section 217): the one list of colours the light and dark themes are made of.
// Every UI colour that differs between the themes (and the accent) is a CSS variable from here;
// the "Theme colors" addon (src/addons/addons/theme-colors) overrides them per theme.
// Light values are on :root, dark values on :root when <body theme="dark">, so every page that
// sets the body's theme attribute (editor, addon settings, credits) gets them.

import themeUsesCSS from '!raw-loader!./pm-theme-uses.css';

const THEME_COLORS = [
    {id: 'background', variable: '--ui-primary', name: 'Background', light: '#e5f0ff', dark: '#111111'},
    {id: 'panel', variable: '--ui-secondary', name: 'Panels', light: '#e9f1fc', dark: '#1e1e1e'},
    {id: 'hover', variable: '--ui-tertiary', name: 'Hover and selected', light: '#d9e3f2', dark: '#2e2e2e'},
    {id: 'surface', variable: '--ui-surface', name: 'Buttons, inputs and tiles', light: '#ffffff', dark: '#1e1e1e'},
    {id: 'edge', variable: '--ui-edge', name: 'Borders and scrollbars', light: '#c6cdd6', dark: '#404040'},
    {id: 'text', variable: '--text-primary', name: 'Text', light: '#575e75', dark: '#eeeeee'},
    {id: 'text-dim', variable: '--text-secondary', name: 'Dim text and inactive icons', light: '#81869a', dark: '#aaaaaa'},
    {id: 'code-area', variable: '--ui-code-area', name: 'Code area', light: '#f9f9f9', dark: '#1e1e1e'},
    {id: 'palette', variable: '--ui-palette', name: 'Block palette and category menu', light: '#f9f9f9', dark: '#111111'},
    {id: 'menu-bar', variable: '--ui-menu-bar', name: 'Menu bar and window headers', light: '#00c3ff', dark: '#009ccc'},
    {id: 'accent', variable: '--ui-accent', name: 'Accent (selection, links, focus)', light: '#00c3ff', dark: '#00c3ff'}
];

// colours made from the ones above (not chosen in the addon)
const DERIVED_LIGHT = {
    '--ui-modal-overlay': 'hsl(from var(--ui-accent) h s calc(l + 15) / 0.9)'
};
const DERIVED_DARK = {
    '--ui-modal-overlay': 'color-mix(in srgb, var(--ui-tertiary) 67%, transparent)'
};

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

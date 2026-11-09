// Desktop fork (section 217): the one list of colours the light and dark themes are made of.
// Every UI colour of the themes is a CSS variable from here (7 chosen, the rest worked out from them);
// the "Theme colors" addon (src/addons/addons/theme-colors) overrides them per theme.
// Light values are on :root, dark values on :root when <body theme="dark">, so every page that
// sets the body's theme attribute (editor, addon settings, credits) gets them.

import themeUsesCSS from '!raw-loader!./pm-theme-uses.css';
import startThemedIcons, {refreshIcons, iconInfo} from './pm-themed-icons.js';
import startContrastGuard from './pm-contrast-guard.js';

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

// colours worked out from the ones above in CSS (not chosen in the addon)
const DERIVED_BOTH = {
    // the block palette and category menu are panels
    '--ui-palette': 'var(--ui-secondary)',
    // the costume editor (scratch-paint) reads these
    '--paint-text-primary': 'var(--text-primary)',
    '--paint-ui-pane-border': 'var(--ui-edge)',
    '--paint-form-border': 'var(--ui-edge)'
};
const DERIVED_LIGHT = Object.assign({}, DERIVED_BOTH, {
    '--ui-modal-overlay': 'hsl(from var(--ui-accent) h s calc(l + 15) / 0.9)'
});
const DERIVED_DARK = Object.assign({}, DERIVED_BOTH, {
    '--ui-modal-overlay': 'color-mix(in srgb, var(--ui-tertiary) 67%, transparent)'
});

// ---- contrast (section 219): text and symbols stay readable whatever colours are chosen ----
// WCAG contrast ratios; the default colours meet them, so only chosen colours get corrected.
const MIN_TEXT = 4.5; // text against every surface it is drawn on
const MIN_DIM_TEXT = 3; // dim text and inactive icons
// accent-coloured text and icons (selected tab, links, icons): a colourful one reads at a lower
// contrast than a grey one, so the minimum goes from 3 (grey) down to 1.7 (pure colour)
const chroma = rgb => (Math.max(...rgb) - Math.min(...rgb)) / 255;
const MIN_ACCENT_SYMBOL = color => 3 - (1.3 * chroma(color));
const MIN_LINE = 1.35; // borders, scrollbars and the grid against what they separate
const MIN_ACCENT_FILL = 1.7; // the accent as a fill (selections, buttons) against every surface

const parse = hex => {
    const h = hex.replace('#', '').slice(0, 6);
    return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
};
const toHex = rgb => `#${rgb.map(c => Math.round(Math.max(0, Math.min(255, c))).toString(16)
    .padStart(2, '0')).join('')}`;
const mix = (a, b, amountOfA) => a.map((c, i) => (c * amountOfA) + (b[i] * (1 - amountOfA)));
const luminance = rgb => {
    const [r, g, b] = rgb.map(c => {
        const v = c / 255;
        return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
};
const contrast = (a, b) => {
    const la = luminance(a);
    const lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};
const minContrast = (color, backgrounds) => Math.min(...backgrounds.map(b => contrast(color, b)));
const WHITE = [255, 255, 255];
const BLACK = [0, 0, 0];

// the smallest change that gives the colour at least the minimum contrast with every background:
// moved step by step towards black and towards white; when the backgrounds are both light and dark
// (section 220) a middle grey can be the only answer, so greys are tried too; when nothing reaches the
// minimum, the most readable of all these
const GREYS = Array.from({length: 86}, (unused, i) => [i * 3, i * 3, i * 3]);
const ensureContrast = (color, backgrounds, minimum) => {
    // the minimum may depend on the colour tried
    const needed = typeof minimum === 'function' ? minimum : () => minimum;
    if (minContrast(color, backgrounds) >= needed(color)) return color;
    let best = color;
    let bestContrast = minContrast(color, backgrounds);
    const consider = candidate => {
        const value = minContrast(candidate, backgrounds);
        if (value > bestContrast) {
            best = candidate;
            bestContrast = value;
        }
        return value >= needed(candidate);
    };
    for (let step = 1; step <= 50; step++) {
        for (const target of [BLACK, WHITE]) {
            const candidate = mix(target, color, step / 50);
            if (consider(candidate)) return candidate;
        }
    }
    let grey = null;
    for (const candidate of GREYS) {
        if (minContrast(candidate, backgrounds) >= needed(candidate) && (!grey ||
            Math.abs(luminance(candidate) - luminance(color)) < Math.abs(luminance(grey) - luminance(color)))) {
            grey = candidate;
        }
        consider(candidate);
    }
    return grey || best;
};

// text and icons on a coloured background: white while it stays readable there (2:1 or more on a
// pure colour, as the default accent has, up to 3:1 on a grey), otherwise black or white, whichever
// reads better (like CSS contrast-color())
const onColor = background => (contrast(WHITE, background) >= 3 - chroma(background) ||
    contrast(WHITE, background) >= contrast(BLACK, background) ? WHITE : BLACK);

const toHsl = rgb => {
    const [r, g, b] = rgb.map(c => c / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return [0, 0, l];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h;
    if (max === r) h = ((g - b) / d) + (g < b ? 6 : 0);
    else if (max === g) h = ((b - r) / d) + 2;
    else h = ((r - g) / d) + 4;
    return [h / 6, s, l];
};
const fromHsl = ([h, s, l]) => {
    if (s === 0) return [l * 255, l * 255, l * 255];
    const q = l < 0.5 ? l * (1 + s) : l + s - (l * s);
    const p = (2 * l) - q;
    const channel = t => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + ((q - p) * 6 * t);
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + ((q - p) * ((2 / 3) - t) * 6);
        return p;
    };
    return [channel(h + (1 / 3)) * 255, channel(h) * 255, channel(h - (1 / 3)) * 255];
};

// Section 221: every kind of background something can be drawn on is a "context" with its own text,
// dim text and accent-for-symbols colours, each corrected against that background alone. A style rule
// that gives an element one of these backgrounds also sets --text-primary, --text-secondary,
// --ui-accent-symbol and color to that context's (written into the rules by script: the four
// surfaces, the hover tint, the selected tint, the accent and the menu bar), so nothing inside can
// keep the colours of the area around it.
const SURFACES = ['background', 'panel', 'workspace', 'surface'];
const CONTEXTS = SURFACES.concat(['hover', 'selected', 'accent', 'menu-bar']);

// every variable of one theme, from its 7 colours ({id: '#rrggbb'})
const paletteVariables = (values, mode) => {
    const c = {};
    for (const color of THEME_COLORS) c[color.id] = parse(values[color.id]);
    const result = {};
    for (const color of THEME_COLORS) result[color.variable] = toHex(c[color.id]);
    // the accent fills selections and buttons: it must stand out from every surface
    const accent = ensureContrast(c.accent, SURFACES.map(id => c[id]), MIN_ACCENT_FILL);
    const hsl = toHsl(accent);
    const menuBar = mode === 'dark' ? fromHsl([hsl[0], hsl[1], hsl[2] * 0.8]) : accent;
    // Where the chosen text does not read, it is not just nudged to the minimum (dim grey on black):
    // it becomes as strong there as the choice is on the surface it reads best on (black text chosen
    // for white buttons turns white on black panels).
    const strongest = color => Math.max(...SURFACES.map(id => contrast(color, c[id])));
    const textWanted = Math.max(MIN_TEXT, strongest(c.text));
    const textOn = background => (contrast(c.text, background) >= MIN_TEXT ? c.text :
        ensureContrast(c.text, [background], textWanted));
    const accentWanted = Math.min(7, strongest(accent));
    const accentOn = background => ensureContrast(accent, [background], color =>
        (contrast(accent, background) >= MIN_ACCENT_SYMBOL(accent) ? 0 : Math.max(MIN_ACCENT_SYMBOL(color), accentWanted)));
    const backgrounds = {};
    for (const id of SURFACES) backgrounds[id] = c[id];
    // hover: a light tint of the buttons' text over the button colour
    backgrounds.hover = mix(textOn(c.surface), c.surface, 0.1);
    // selected (not hovered) rows: a tint of the accent over the button colour
    backgrounds.selected = mix(accent, c.surface, 0.15);
    for (const id of Object.keys(backgrounds)) {
        const background = backgrounds[id];
        const text = textOn(background);
        // dim text: 75% text on this background, stronger when that is not readable enough
        let amount = 0.75;
        while (amount < 1 && contrast(mix(text, background, amount), background) < MIN_DIM_TEXT) amount += 0.05;
        const dim = ensureContrast(mix(text, background, Math.min(1, amount)), [background], MIN_DIM_TEXT);
        result[`--text-on-${id}`] = toHex(text);
        result[`--text-dim-on-${id}`] = toHex(dim);
        // the accent as the colour of text and symbols there
        result[`--accent-on-${id}`] = toHex(accentOn(background));
    }
    // on the accent and the menu bar everything is black or white
    for (const [id, background] of [['accent', accent], ['menu-bar', menuBar]]) {
        const on = toHex(onColor(background));
        result[`--text-on-${id}`] = on;
        result[`--text-dim-on-${id}`] = on;
        result[`--accent-on-${id}`] = on;
    }
    const edge = ensureContrast(c.edge, [c.panel, c.workspace, c.surface], MIN_LINE);
    Object.assign(result, {
        // the page itself is the background
        '--text-primary': result['--text-on-background'],
        '--text-secondary': result['--text-dim-on-background'],
        '--ui-accent-symbol': result['--accent-on-background'],
        '--ui-accent': toHex(accent),
        '--ui-edge': toHex(edge),
        '--ui-menu-bar': toHex(menuBar),
        '--ui-tertiary': toHex(backgrounds.hover),
        '--ui-selected': toHex(backgrounds.selected),
        // turns a one-colour picture icon into the black or white of text on the accent / menu bar
        '--pm-on-accent-filter': onColor(accent) === WHITE ? 'brightness(0) invert(1)' : 'brightness(0)',
        '--pm-on-menu-bar-filter': onColor(menuBar) === WHITE ? 'brightness(0) invert(1)' : 'brightness(0)'
    });
    return result;
};

const defaultValues = mode => {
    const values = {};
    for (const color of THEME_COLORS) values[color.id] = color[mode];
    return values;
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
    const light = Object.assign(paletteVariables(defaultValues('light'), 'light'), DERIVED_LIGHT);
    const dark = Object.assign(paletteVariables(defaultValues('dark'), 'dark'), DERIVED_DARK);
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
    // section 219: picture icons in the theme's colours
    startThemedIcons();
    // section 221: corrects what still does not read while a theme has chosen colours
    startContrastGuard({contrast, ensureContrast}, {refreshIcons, iconInfo});
};

// puts the addon's colours (CSS from themeColorsCSS, '' for none) into its style element and tells
// the icons and the contrast guard
const applyThemeColors = (styleElement, css) => {
    styleElement.textContent = css;
    document.dispatchEvent(new CustomEvent('pm-theme-colors-changed', {detail: {custom: css !== ''}}));
};

const isColor = value => typeof value === 'string' && /^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(value);

// lightValues / darkValues: {colour id: '#rrggbb'} for a theme that is changed, or null; a changed
// theme gets all its variables again, since the contrast checks look at its colours together
const customCSS = (lightValues, darkValues) => {
    const theme = (values, mode) => {
        if (!values) return {};
        const merged = defaultValues(mode);
        for (const color of THEME_COLORS) {
            if (isColor(values[color.id])) merged[color.id] = values[color.id].slice(0, 7).toLowerCase();
        }
        return paletteVariables(merged, mode);
    };
    return block(CUSTOM_LIGHT_SELECTOR, theme(lightValues, 'light')) +
        block(CUSTOM_DARK_SELECTOR, theme(darkValues, 'dark'));
};

// the CSS for the "Theme colors" addon's settings; get(settingId) reads one
// (settings "light" / "dark" switch a theme on, "light-<id>" / "dark-<id>" are its colours)
const themeColorsCSS = get => {
    const values = mode => {
        if (get(mode) !== true) return null;
        const result = {};
        for (const color of THEME_COLORS) result[color.id] = get(`${mode}-${color.id}`);
        return result;
    };
    return customCSS(values('light'), values('dark'));
};

export {
    THEME_COLORS,
    installThemeColors,
    customCSS,
    themeColorsCSS,
    applyThemeColors,
    paletteVariables,
    SURFACES,
    CONTEXTS,
    contrast,
    ensureContrast
};

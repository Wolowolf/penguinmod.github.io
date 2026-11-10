// Desktop fork (section 217): the one list of colours the light and dark themes are made of.
// Every UI colour of the themes is a CSS variable from here (7 chosen, the rest worked out from them);
// the "Theme colors" addon (src/addons/addons/theme-colors) overrides them per theme.
// Light values are on :root, dark values on :root when <body theme="dark">, so every page that
// sets the body's theme attribute (editor, addon settings, credits) gets them.

import themeUsesCSS from '!raw-loader!./pm-theme-uses.css';
import startThemedIcons, {isThemedIcon} from './pm-themed-icons.js';
import startContrastGuard from './pm-contrast-guard.js';

// Grouped by what each thing is used for (Session 242; the ids and variable names are older):
//   frame     (background) navigating the app: menu bar, tab row, stage header, title bars, around the stage
//   panels    (panel)      containers you take from or decide in: block palette, category menu, sprite /
//                          costume / sound lists, editor toolbars, libraries, dialogs, menus, pop-ups
//   workspace              where content is made or entered: code area, costume canvas surround, sound
//                          waveform, variables table, every text field
//   controls  (surface)    things you press or pick: buttons, tabs, tiles, checkboxes, switches
//   lines     (edge)       quiet marks that organise space: borders, separators, grid, scrollbars
//   ink       (text)       everything you read: text and icons (quiet and disabled strengths follow it)
//   accent                 state and emphasis only: selected, on, focus, links, the main action
const THEME_COLORS = [
    {id: 'background', variable: '--ui-primary', name: 'Frame (menu bar, tab row, stage header, title bars)', light: '#d9e3f0', dark: '#101012'},
    {id: 'panel', variable: '--ui-secondary', name: 'Panels (block palette, lists, toolbars, dialogs, menus)', light: '#edf2f8', dark: '#1d1d20'},
    {id: 'workspace', variable: '--ui-workspace', name: 'Workspace (code area, canvas, text fields)', light: '#fbfcfe', dark: '#151517'},
    {id: 'surface', variable: '--ui-surface', name: 'Controls (buttons, tabs, tiles, checkboxes)', light: '#ffffff', dark: '#2b2b2f'},
    {id: 'edge', variable: '--ui-edge', name: 'Lines (borders, separators, grid, scrollbars)', light: '#c3ccd8', dark: '#3f3f45'},
    {id: 'text', variable: '--text-primary', name: 'Ink (text and icons)', light: '#3f4860', dark: '#ececf0'},
    {id: 'accent', variable: '--ui-accent', name: 'Accent (selected, switched on, focus, links, main action)', light: '#0096d6', dark: '#1fb6f5'}
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
// the dimming behind a dialog is neutral in both themes
const DERIVED_LIGHT = Object.assign({}, DERIVED_BOTH, {
    '--ui-modal-overlay': 'rgba(20, 24, 32, 0.45)'
});
const DERIVED_DARK = Object.assign({}, DERIVED_BOTH, {
    '--ui-modal-overlay': 'rgba(0, 0, 0, 0.6)'
});

// ---- contrast (section 219): text and symbols stay readable whatever colours are chosen ----
// WCAG contrast ratios; the default colours meet them, so only chosen colours get corrected.
const MIN_TEXT = 4.5; // text against every surface it is drawn on
const MIN_DIM_TEXT = 3; // quiet ink (secondary text)
const MIN_DISABLED = 1.6; // disabled ink: weak on purpose, still perceivable
// accent-coloured text and icons (selected tab, links, icons): a colourful one reads at a lower
// contrast than a grey one, so the minimum goes from 3 (grey) down to 1.7 (pure colour)
const chroma = rgb => (Math.max(...rgb) - Math.min(...rgb)) / 255;
const MIN_ACCENT_SYMBOL = color => 3 - (1.3 * chroma(color));
const MIN_LINE = 1.35; // borders, scrollbars and the grid against what they separate
const MIN_ACCENT_FILL = 1.7; // the accent as a fill (selections, buttons) against every surface
// Section 223: colours that keep their meaning whatever the theme (go, pause, stop, warning) are
// pushed darker or lighter until they have 3:1 on the background they are drawn on; per context as
// --<name>-on-<context>
const STATUS_COLORS = {go: '#2fbf4f', pause: '#ffbf00', stop: '#e5403b', warn: '#ff8c1a'};
const MIN_STATUS = 3;

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

// Sections 221, 222: every kind of background something can be drawn on is a "context" with its own
// ink (text and icons), quiet ink, disabled ink, accent-for-symbols, hover tint and selected tint,
// each worked out against that background alone. A style rule that gives an element one of these
// backgrounds also sets --text-primary, --text-secondary, --text-disabled, --ui-accent-symbol,
// --ui-tertiary (hover), --ui-selected and color to that context's (written into the rules by
// bench\contexts.js), so nothing inside can keep the colours of the area around it.
const SURFACES = ['background', 'panel', 'workspace', 'surface'];
// "inverse" is ink used as a background (tooltips): it stands out on anything
const CONTEXTS = SURFACES.concat(['accent', 'inverse']);

// every variable of one theme, from its 7 colours ({id: '#rrggbb'})
const paletteVariables = values => {
    const c = {};
    for (const color of THEME_COLORS) c[color.id] = parse(values[color.id]);
    const result = {};
    for (const color of THEME_COLORS) result[color.variable] = toHex(c[color.id]);
    // the accent fills selections and buttons: it must stand out from every surface
    const accent = ensureContrast(c.accent, SURFACES.map(id => c[id]), MIN_ACCENT_FILL);
    // Where the chosen ink does not read, it is not just nudged to the minimum (dim grey on black):
    // it becomes as strong there as the choice is on the surface it reads best on (black ink chosen
    // for white controls turns white on black panels).
    const strongest = color => Math.max(...SURFACES.map(id => contrast(color, c[id])));
    const inkWanted = Math.max(MIN_TEXT, strongest(c.text));
    const inkOn = backgrounds => (minContrast(c.text, backgrounds) >= MIN_TEXT ? c.text :
        ensureContrast(c.text, backgrounds, inkWanted));
    const accentWanted = Math.min(7, strongest(accent));
    const accentOn = background => ensureContrast(accent, [background], color =>
        (contrast(accent, background) >= MIN_ACCENT_SYMBOL(accent) ? 0 : Math.max(MIN_ACCENT_SYMBOL(color), accentWanted)));
    const context = (id, background, fixedInk) => {
        // hover: a light tint of the ink over this background; selected: a tint of the accent
        let ink = fixedInk || inkOn([background]);
        let hover = mix(ink, background, 0.1);
        let selected = mix(accent, background, 0.16);
        if (!fixedInk) {
            // the ink must also read on its own hover and selected tints
            ink = inkOn([background, hover, selected]);
            hover = mix(ink, background, 0.1);
        }
        // quiet ink (secondary text): 72% ink, stronger when that is not readable enough
        let amount = 0.72;
        while (amount < 1 && contrast(mix(ink, background, amount), background) < MIN_DIM_TEXT) amount += 0.04;
        const quiet = fixedInk || ensureContrast(mix(ink, background, Math.min(1, amount)), [background], MIN_DIM_TEXT);
        // disabled ink: clearly weaker than quiet, still perceivable
        const disabled = ensureContrast(mix(ink, background, 0.38), [background], MIN_DISABLED);
        result[`--text-on-${id}`] = toHex(ink);
        result[`--text-dim-on-${id}`] = toHex(quiet);
        result[`--text-off-on-${id}`] = toHex(disabled);
        result[`--accent-on-${id}`] = toHex(fixedInk || accentOn(background));
        result[`--hover-on-${id}`] = toHex(hover);
        result[`--selected-on-${id}`] = toHex(selected);
        for (const name of Object.keys(STATUS_COLORS)) {
            result[`--${name}-on-${id}`] = toHex(ensureContrast(parse(STATUS_COLORS[name]), [background], MIN_STATUS));
        }
    };
    for (const id of SURFACES) context(id, c[id]);
    // on the accent everything is black or white
    context('accent', accent, onColor(accent));
    // tooltips: the panels' ink as background, the panel colour as ink
    const inverse = inkOn([c.panel]);
    context('inverse', inverse, ensureContrast(c.panel, [inverse], MIN_TEXT));
    const edge = ensureContrast(c.edge, [c.panel, c.workspace, c.surface], MIN_LINE);
    Object.assign(result, {
        // the page itself is the frame
        '--text-primary': result['--text-on-background'],
        '--text-secondary': result['--text-dim-on-background'],
        '--text-disabled': result['--text-off-on-background'],
        '--ui-accent-symbol': result['--accent-on-background'],
        '--ui-tertiary': result['--hover-on-background'],
        '--ui-selected': result['--selected-on-background'],
        '--ui-accent': toHex(accent),
        '--ui-edge': toHex(edge),
        '--ui-inverse': toHex(inverse),
        // the menu bar is part of the frame (older rules name it)
        '--ui-menu-bar': result['--ui-primary'],
        '--text-on-menu-bar': result['--text-on-background'],
        // turns a one-colour picture that is not redrawn into the ink of the accent / the frame
        '--pm-on-accent-filter': onColor(accent) === WHITE ? 'brightness(0) invert(1)' : 'brightness(0)',
        '--pm-on-menu-bar-filter': luminance(parse(result['--text-on-background'])) > 0.4 ?
            'brightness(0) invert(1)' : 'brightness(0)'
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
    const light = Object.assign(paletteVariables(defaultValues('light')), DERIVED_LIGHT);
    const dark = Object.assign(paletteVariables(defaultValues('dark')), DERIVED_DARK);
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
    const started = () => {
        addUses();
        startSharing();
    };
    if (document.body) started();
    else document.addEventListener('DOMContentLoaded', started, {once: true});
    // section 219: picture icons in the theme's colours
    startThemedIcons();
    // section 221: corrects what still does not read while a theme has chosen colours
    startContrastGuard({contrast, ensureContrast}, {isThemedIcon});
};

// Section 223: the packager (its own page on the same address) takes the editor's colours: every
// variable as it is now on this page, and whether the theme is light or dark, in localStorage
const SHARED_KEY = 'pm:theme-vars';
const sharedNames = () => Object.keys(Object.assign(paletteVariables(defaultValues('light')), DERIVED_LIGHT));
let shareTimer = null;
const shareTheme = () => {
    if (shareTimer || typeof document === 'undefined' || !document.body) return;
    // after the styles of this change are applied
    shareTimer = setTimeout(() => {
        shareTimer = null;
        try {
            const computed = getComputedStyle(document.documentElement);
            const vars = {};
            for (const name of sharedNames()) vars[name] = computed.getPropertyValue(name).trim();
            const mode = document.body.getAttribute('theme') === 'dark' ? 'dark' : 'light';
            const value = JSON.stringify({mode, vars});
            if (localStorage.getItem(SHARED_KEY) !== value) localStorage.setItem(SHARED_KEY, value);
        } catch (e) {
            // storage unavailable: the packager keeps its own colours
        }
    }, 50);
};
const startSharing = () => {
    shareTheme();
    new MutationObserver(shareTheme).observe(document.body, {attributes: true, attributeFilter: ['theme']});
    document.addEventListener('pm-theme-colors-changed', shareTheme);
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
        return paletteVariables(merged);
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

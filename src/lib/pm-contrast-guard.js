// Desktop fork (section 221): the last line of defence of the "Theme colors" addon.
// The theme's own rules give every background its text and symbol colours (pm-theme-colors.js), but
// styles written elsewhere (addons, libraries, fixed colours with a meaning) can still put a text or
// an icon on a background it does not read on. While a theme has chosen colours, this looks at what is
// really drawn: for each text, text field and themed icon it works out the colour behind it (the
// backgrounds of the element and what it is in, laid over each other) and, when the two are too close,
// gives that one element a colour that reads there. It looks again when the page, a state (class) or
// the hovered or focused element changes, and takes its correction back when it is no longer needed.
// Not looked at: the stage and its monitors (the project's own colours), blocks (category colours),
// pictures with colours of their own, and text over a gradient or a picture.

// What counts as "does not read": a little below the theme's own lowest contrasts, so the colours the
// theme works out are never touched. Like there, colour helps: grey on grey needs 2.7, a pure colour
// (as text or as what is behind it) 1.4.
const chroma = rgb => (Math.max(...rgb) - Math.min(...rgb)) / 255;
const minimumFor = (shown, backdrop) => Math.max(1.4, 2.7 - (1.3 * Math.max(chroma(shown), chroma(backdrop))));
const TARGET_TEXT = 4.5;
const TARGET_SYMBOL = 3;
const PER_FRAME = 500; // elements looked at per frame
const SKIP = '[class*="monitor_monitor-container"], [class*="monitor-list_"], [class*="question_question-container"], ' +
    '[class*="stage_stage_"] canvas, .blocklyHtmlInput, .scratchCommentTextarea, .pm-contrast-skip, ' +
    // outlined white names on the categories' own colours; the window buttons float over the menu bar
    '.scratchCategoryMenuItem, #pm-window-controls, ' +
    // names written over a picture; things that are dimmed because they cannot be used
    '[class*="library-item_featured-authors"], .goog-menuitem-disabled, [disabled], [aria-disabled="true"], ' +
    // the little arrows of pop-ups are the pop-up's own colour on purpose
    '[class*="-tip"], .Popover-tip';
const FIELDS = 'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]):not([type="file"]), textarea, select';

let tools = null; // {contrast, ensureContrast} of pm-theme-colors.js
let icons = null; // {iconInfo, refreshIcons} of pm-themed-icons.js
let active = false;
const corrected = new Map(); // element -> [[property, old value, old priority], …]
const queue = new Set();
let scheduled = false;

const parseColor = text => {
    if (!text) return null;
    let m = text.match(/^rgba?\(([^)]+)\)$/);
    if (m) {
        const p = m[1].split(/[\s,/]+/).map(Number);
        return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
    }
    m = text.match(/^color\(srgb ([\d.e-]+) ([\d.e-]+) ([\d.e-]+)(?: \/ ([\d.e-]+))?\)$/);
    if (m) return [m[1] * 255, m[2] * 255, m[3] * 255, m[4] === undefined ? 1 : Number(m[4])];
    return null;
};
const over = (top, bottom) => [0, 1, 2].map(i => (top[i] * top[3]) + (bottom[i] * (1 - top[3])));
const toHex = rgb => `#${rgb.map(c => Math.round(Math.max(0, Math.min(255, c))).toString(16)
    .padStart(2, '0')).join('')}`;
// a '#rrggbb' custom property of a computed style, as [r, g, b]
const variable = (style, name) => {
    const m = style.getPropertyValue(name).trim().match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
    return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [0, 0, 0];
};

// the colour behind an element's content: its background over those of what it is in;
// null when a gradient makes it unknowable
const backdropOf = (element, cache) => {
    if (!element || element === document.documentElement) {
        const root = parseColor(getComputedStyle(document.documentElement).backgroundColor);
        return root && root[3] > 0 ? over(root, [255, 255, 255]) : [255, 255, 255];
    }
    if (cache.has(element)) return cache.get(element);
    const style = getComputedStyle(element);
    let result;
    if (/gradient\(/.test(style.backgroundImage)) {
        result = null;
    } else {
        const own = parseColor(style.backgroundColor);
        if (own && own[3] >= 0.995) {
            result = own.slice(0, 3);
        } else {
            const below = backdropOf(element.parentElement, cache);
            result = below && own && own[3] > 0 ? over(own, below) : below;
        }
    }
    cache.set(element, result);
    return result;
};

const restore = element => {
    const changes = corrected.get(element);
    if (!changes) return;
    corrected.delete(element);
    for (const [property, value, priority] of changes) {
        if (value) element.style.setProperty(property, value, priority);
        else element.style.removeProperty(property);
    }
    element.removeAttribute('data-pm-contrast');
};
const correct = (element, properties) => {
    const changes = [];
    for (const property of Object.keys(properties)) {
        changes.push([property, element.style.getPropertyValue(property), element.style.getPropertyPriority(property)]);
        element.style.setProperty(property, properties[property], 'important');
    }
    corrected.set(element, changes);
    element.setAttribute('data-pm-contrast', '');
};

const visible = element => {
    const rect = element.getBoundingClientRect();
    return rect.width > 1 && rect.height > 1;
};

// the elements under root that draw text or a themed icon
const candidatesIn = root => {
    const found = new Set();
    if (!(root instanceof HTMLElement) || !root.isConnected) return found;
    const skipped = element => element.closest(SKIP) !== null;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const parent = node.parentElement;
        if (!parent || found.has(parent) || !(parent instanceof HTMLElement)) continue;
        if (!/\S/.test(node.nodeValue) || /^(SCRIPT|STYLE|OPTION|NOSCRIPT)$/.test(parent.tagName)) continue;
        found.add(parent);
    }
    const add = element => {
        if (element instanceof HTMLElement || element.tagName === 'svg') found.add(element);
    };
    if (root.matches(`${FIELDS}, img[data-pm-themed]`)) add(root);
    for (const element of root.querySelectorAll(`${FIELDS}, img[data-pm-themed]`)) add(element);
    // small drawn symbols (run buttons…), not Blockly's workspaces
    for (const element of root.querySelectorAll('svg')) {
        if (element.parentElement instanceof HTMLElement && !element.closest('.injectionDiv, .blocklyWidgetDiv, .blocklyDropDownDiv') &&
            !/blockly/.test(element.getAttribute('class') || '')) add(element);
    }
    for (const element of Array.from(found)) if (skipped(element)) found.delete(element);
    return found;
};

// what is wrong with one element, as {element, kind, foreground, backdrop, ratio, minimum}, or null
const examine = (element, cache) => {
    if (!element.isConnected || !visible(element)) return null;
    const style = getComputedStyle(element);
    if (style.visibility === 'hidden') return null;
    let kind = 'text';
    let foreground;
    let other = null; // a two-colour icon's second colour
    let behind = element;
    if (element.tagName === 'IMG') {
        const info = icons && icons.iconInfo(element);
        if (!info) return null;
        kind = info.mode;
        // a one-colour icon is its background colour seen through a mask: what is behind it is its parent's
        behind = element.parentElement;
        if (info.mode === 'mono') {
            foreground = parseColor(style.backgroundColor);
        } else {
            foreground = variable(style, '--ui-accent-symbol').concat(1);
            other = variable(style, '--text-primary');
        }
    } else if (element.tagName === 'svg') {
        // only a drawing that takes its colour from outside (a CSS fill, or currentColor) can be
        // judged and corrected; one that names its own colours is a picture
        const shape = element.querySelector('path, rect, circle, ellipse, polygon, polyline, line');
        if (!shape) return null;
        const own = name => shape.getAttribute(name) || shape.style.getPropertyValue(name);
        behind = element.parentElement;
        if (/currentcolor/i.test(`${own('fill')} ${own('stroke')}`)) {
            kind = 'drawing-color';
            foreground = parseColor(style.color);
        } else if (!own('fill') && !shape.closest('g[fill]')) {
            kind = 'drawing';
            foreground = parseColor(getComputedStyle(shape).fill);
        } else {
            return null;
        }
    } else {
        foreground = parseColor(style.color);
    }
    // nothing to read, or made invisible on purpose
    if (!foreground || foreground.some(Number.isNaN) || foreground[3] < 0.15) return null;
    const backdrop = backdropOf(behind, cache);
    if (!backdrop) return null;
    let shown = foreground[3] < 1 ? over(foreground, backdrop) : foreground.slice(0, 3);
    let ratio = tools.contrast(shown, backdrop);
    if (other && tools.contrast(other, backdrop) < ratio) {
        shown = other;
        ratio = tools.contrast(other, backdrop);
    }
    const minimum = minimumFor(shown, backdrop);
    if (ratio >= minimum) return null;
    return {element, kind, foreground: shown, backdrop, ratio, minimum, target: kind === 'text' ? TARGET_TEXT : TARGET_SYMBOL};
};

const fix = problem => {
    const color = toHex(tools.ensureContrast(problem.foreground, [problem.backdrop], problem.target));
    const element = problem.element;
    if (problem.kind === 'text') correct(element, {color});
    else if (problem.kind === 'drawing') correct(element, {fill: color});
    else if (problem.kind === 'drawing-color') correct(element, {color});
    else if (problem.kind === 'mono') correct(element, {'background-color': color});
    else {
        correct(element, {'--text-primary': color, '--ui-accent-symbol': color});
        icons.refreshIcons(element);
    }
};

// looks at the elements (first as they would be without corrections) and returns what does not read
// A colour that fades (CSS transition) would be read half-way after a correction is taken back, look
// fine, and then fade on to the unreadable one. So fades are off on a corrected element from before
// its correction is taken back until the new one is drawn (thaw).
const frozen = [];
const freeze = element => {
    frozen.push([element, element.style.getPropertyValue('transition'), element.style.getPropertyPriority('transition')]);
    element.style.setProperty('transition', 'none', 'important');
};
const thaw = () => {
    for (const [element] of frozen) void getComputedStyle(element).color; // draw the result first
    for (const [element, value, priority] of frozen.splice(0)) {
        if (value) element.style.setProperty('transition', value, priority);
        else element.style.removeProperty('transition');
    }
};

const check = elements => {
    const redraw = [];
    for (const element of elements) {
        if (corrected.has(element)) {
            freeze(element);
            restore(element);
            if (element.tagName === 'IMG') redraw.push(element);
        }
    }
    for (const element of redraw) icons.refreshIcons(element);
    const cache = new Map();
    const problems = [];
    for (const element of elements) {
        const problem = examine(element, cache);
        if (problem) problems.push(problem);
    }
    return problems;
};

const run = () => {
    scheduled = false;
    if (!active) {
        queue.clear();
        return;
    }
    const elements = [];
    for (const root of Array.from(queue)) {
        queue.delete(root);
        for (const element of candidatesIn(root)) elements.push(element);
        if (elements.length >= PER_FRAME) break;
    }
    for (const problem of check(elements)) fix(problem);
    thaw();
    if (queue.size) schedule();
};
const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(run);
};
const look = root => {
    if (!active || !(root instanceof HTMLElement)) return;
    // a place already covered by a queued one needs no entry of its own
    for (const queued of queue) if (queued.contains(root)) return;
    queue.add(root);
    schedule();
};
const lookAtEverything = () => look(document.body);

// the nearest thing around the element that a hover or focus style is likely to be on
const around = element => {
    let best = element;
    for (let i = 0, e = element.parentElement; i < 3 && e && e !== document.body; i++, e = e.parentElement) {
        if (e.getElementsByTagName('*').length > 120) break;
        best = e;
    }
    return best;
};

const setActive = value => {
    if (active === value) {
        if (active) lookAtEverything();
        return;
    }
    active = value;
    if (active) {
        lookAtEverything();
    } else {
        for (const element of Array.from(corrected.keys())) restore(element);
        if (icons) icons.refreshIcons(null);
    }
};

let started = false;
const startContrastGuard = (colorTools, iconTools) => {
    if (started || typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;
    started = true;
    tools = colorTools;
    icons = iconTools;
    let begun = false;
    let wanted = false;
    document.addEventListener('pm-theme-colors-changed', event => {
        wanted = Boolean(event.detail && event.detail.custom);
        // after the new colours are applied and the icons redrawn
        if (begun) setTimeout(() => setActive(wanted), 30);
    });
    const begin = () => {
        new MutationObserver(records => {
            if (!active) return;
            for (const record of records) {
                const target = record.target;
                if (target instanceof SVGElement) continue;
                if (record.type === 'attributes') {
                    if (target === document.body) setTimeout(lookAtEverything, 50); // theme switched
                    else look(target);
                } else {
                    for (const node of record.addedNodes) {
                        if (node.nodeType === 1) look(node);
                        else if (node.nodeType === 3 && node.parentElement) look(node.parentElement);
                    }
                }
            }
        }).observe(document.body, {subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'theme']});
        // hover and focus change colours without changing the page; styles often fade in, so look twice
        const pointed = event => {
            if (!active || !(event.target instanceof HTMLElement)) return;
            const place = around(event.target);
            look(place);
            setTimeout(() => look(place), 260);
        };
        for (const type of ['pointerover', 'pointerout', 'focusin', 'focusout']) {
            document.addEventListener(type, pointed, {passive: true});
        }
        begun = true;
        if (wanted) setTimeout(() => setActive(wanted), 30);
        // for the local test
        const describe = p => ({
            kind: p.kind,
            what: (p.element.tagName === 'IMG' || p.element.tagName === 'svg' ? `<${p.element.tagName.toLowerCase()}>` :
                (p.element.value || p.element.textContent || '').trim().slice(0, 24)),
            cls: String(p.element.getAttribute('class') || p.element.tagName).slice(0, 60),
            foreground: toHex(p.foreground),
            backdrop: toHex(p.backdrop),
            ratio: Math.round(p.ratio * 100) / 100
        });
        window.pmContrastGuard = {
            // what does not read by the styles alone (corrections taken back first, then made again)
            audit: (root = document.body) => {
                const problems = check(Array.from(candidatesIn(root)));
                const report = problems.map(describe);
                if (active) for (const problem of problems) fix(problem);
                thaw();
                return report;
            },
            // what does not read as shown right now
            remaining: (root = document.body) => {
                const cache = new Map();
                return Array.from(candidatesIn(root)).map(element => examine(element, cache))
                    .filter(Boolean).map(describe);
            },
            corrected: () => corrected.size,
            isActive: () => active
        };
    };
    if (document.body) begin();
    else document.addEventListener('DOMContentLoaded', begin, {once: true});
};

export default startContrastGuard;

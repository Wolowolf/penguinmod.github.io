// Desktop fork (sections 219, 221): picture icons in the theme's colours.
// The editor's and costume editor's interface icons are SVG files drawn in the accent blue (#00c3ff,
// older #4c97ff / #00a3ff) and the text grey (#575e75), or only in black or only in white. Such an icon
// carries no meaning in its colour, so it is shown in the colours of the place it is in: the variables
// --ui-accent-symbol and --text-primary there (pm-theme-colors.js; every background sets its own).
//  - an icon of one colour ("mono") is drawn by CSS: its picture becomes a mask over a block of that
//    colour (pm-theme-uses.css, img[data-pm-mono]), so it follows hover, selection and theme at once;
//  - an icon of accent and grey together ("duo") is redrawn as a recoloured picture, and again when
//    the theme, its colours, or the state of what it is in change.
// Icons with any other colour (categories, warnings, pictures) and pictures that are not the editor's
// own files (costumes, library items) are left alone.

const ACCENT = ['00c3ff', '4c97ff', '00a3ff'];
const GREY = ['575e75'];
const BLACK = ['000', '000000', '231f20'];
const WHITE = ['fff', 'ffffff'];
const HEX = /#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3})\b/gi;
const NAMED = /(?:fill|stroke|stop-color|[^-]color)\s*[:=]\s*["']?\s*([a-z]+)\b/gi;

const sources = new Map(); // original src -> Promise<{mode, group, text} or null>
const state = new WeakMap(); // img -> {original, info, applied, key}
const duos = new Set(); // redrawn imgs

const isBundled = src => /(^|\/)static\/assets\/[^?#]*\.svg(\?|#|$)/i.test(src);
const isSvgSource = src => /^data:image\/svg\+xml/i.test(src) || /\.svg(\?|#|$)/i.test(src);

const groupOf = hex => {
    const lower = hex.toLowerCase();
    const rgb = lower.length === 8 ? lower.slice(0, 6) : lower;
    if (ACCENT.includes(rgb)) return 'accent';
    if (GREY.includes(rgb)) return 'grey';
    if (BLACK.includes(rgb)) return 'black';
    if (WHITE.includes(rgb)) return 'white';
    return null;
};

// what kind of icon the picture is, or null for "leave alone"
const loadSource = src => {
    if (!sources.has(src)) {
        sources.set(src, fetch(src)
            .then(response => (response.ok ? response.text() : null))
            .then(text => {
                if (!text || /rgba?\(|hsla?\(|<image\b/i.test(text)) return null;
                const groups = new Set();
                for (const match of text.matchAll(HEX)) {
                    const group = groupOf(match[1]);
                    if (!group) return null; // a colour of its own
                    groups.add(group);
                }
                // colours written as words; a shape that names none is drawn black
                for (const match of text.matchAll(NAMED)) {
                    const name = match[1].toLowerCase();
                    if (/^(none|transparent|inherit|url)$/.test(name)) continue;
                    if (name === 'black' || name === 'currentcolor') groups.add('black');
                    else if (name === 'white') groups.add('white');
                    else return null;
                }
                if (groups.size === 0) groups.add('black');
                const themed = groups.has('accent') || groups.has('grey');
                // only black or only white: an interface icon when it is one of the editor's own files
                if (!themed && !(groups.size === 1 && isBundled(src))) return null;
                if (groups.size === 1) return {mode: 'mono', group: groups.has('accent') ? 'accent' : 'text'};
                return {mode: 'duo', text};
            })
            .catch(() => null));
    }
    return sources.get(src);
};

// the colours where the icon is
const colorsAt = img => {
    const style = getComputedStyle(img);
    const get = (name, fallback) => (style.getPropertyValue(name).trim() || fallback).replace('#', '');
    return {
        accent: get('--ui-accent-symbol', '#00c3ff'),
        text: get('--text-primary', '#575e75')
    };
};

const recolor = (text, colors) => text.replace(HEX, (all, hex) => {
    const lower = hex.toLowerCase();
    const alpha = lower.length === 8 ? lower.slice(6) : '';
    const group = groupOf(lower);
    if (group === 'accent') return `#${colors.accent}${alpha}`;
    if (group === 'grey') return `#${colors.text}${alpha}`;
    return all;
});

const draw = (img, known) => {
    const colors = colorsAt(img);
    const key = `${colors.accent} ${colors.text}`;
    if (known.key === key) return;
    known.key = key;
    known.applied = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(recolor(known.info.text, colors))}`;
    img.src = known.applied;
};

const forget = img => {
    state.delete(img);
    duos.delete(img);
    img.removeAttribute('data-pm-themed');
    img.removeAttribute('data-pm-mono');
    img.style.removeProperty('--pm-icon');
};

const handle = img => {
    const src = img.getAttribute('src');
    if (!src) return;
    const known = state.get(img);
    if (known && (src === known.applied || (src === known.original && known.info.mode === 'mono'))) return;
    if (!isSvgSource(src)) {
        if (known) forget(img);
        return;
    }
    loadSource(src).then(info => {
        if (img.getAttribute('src') !== src) return; // changed meanwhile
        if (known) forget(img);
        if (!info) return;
        const entry = {original: src, info, applied: null, key: null};
        state.set(img, entry);
        img.setAttribute('data-pm-themed', '');
        img.style.setProperty('--pm-icon', `url("${src.replace(/"/g, '%22')}")`);
        if (info.mode === 'mono') {
            img.setAttribute('data-pm-mono', info.group);
        } else {
            duos.add(img);
            draw(img, entry);
        }
    });
};

// redraws the two-colour icons (inside the element, or all of them) whose colours changed
const refreshIcons = element => {
    for (const img of Array.from(duos)) {
        if (!img.isConnected) {
            duos.delete(img);
            continue;
        }
        if (element && !element.contains(img)) continue;
        const known = state.get(img);
        if (known) draw(img, known);
    }
};

// {mode, group} of a themed icon, for the contrast guard
const iconInfo = img => {
    const known = state.get(img);
    return known ? known.info : null;
};

const scan = root => {
    if (root.tagName === 'IMG') handle(root);
    else if (root.querySelectorAll) for (const img of root.querySelectorAll('img')) handle(img);
};

let started = false;
const startThemedIcons = () => {
    if (started || typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;
    started = true;
    // one redraw pass per frame, of the places that changed (or of everything when there are many)
    const pending = new Set();
    const later = element => {
        if (!pending.size) {
            requestAnimationFrame(() => {
                const targets = Array.from(pending);
                pending.clear();
                if (targets.length > 4 || targets.includes(document.body)) refreshIcons(null);
                else for (const target of targets) refreshIcons(target);
            });
        }
        pending.add(element);
    };
    const begin = () => {
        scan(document.body);
        new MutationObserver(records => {
            for (const record of records) {
                const target = record.target;
                if (record.type === 'attributes') {
                    if (record.attributeName === 'src') {
                        if (target.tagName === 'IMG') handle(target);
                    } else if (!(target instanceof SVGElement) && duos.size) {
                        // a state (selected, open…) or the theme changed: the colours inside may have too
                        later(target);
                    }
                    continue;
                }
                for (const node of record.addedNodes) {
                    // Blockly adds many SVG nodes: only HTML elements can hold <img>
                    if (node.nodeType === 1 && !(node instanceof SVGElement)) scan(node);
                }
            }
        }).observe(document.body, {
            subtree: true,
            childList: true,
            attributes: true,
            attributeFilter: ['src', 'theme', 'class']
        });
        document.addEventListener('pm-theme-colors-changed', () => later(document.body));
        // hover changes colours without changing the page: look at what the pointer entered and left
        const hover = event => {
            if (!duos.size || !(event.target instanceof HTMLElement)) return;
            const target = event.target;
            later(target.closest('button, a, label, li, [role="button"]') ||
                (target.parentElement && target.parentElement.parentElement) || target);
        };
        document.addEventListener('pointerover', hover, {passive: true});
        document.addEventListener('pointerout', hover, {passive: true});
    };
    if (document.body) begin();
    else document.addEventListener('DOMContentLoaded', begin, {once: true});
};

export {
    startThemedIcons as default,
    refreshIcons,
    iconInfo
};

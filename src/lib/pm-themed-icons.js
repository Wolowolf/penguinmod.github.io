// Desktop fork (section 219): picture icons in the theme's colours.
// The editor's and costume editor's interface icons are SVG files drawn in the accent blue (#00c3ff,
// older #4c97ff / #00a3ff) and the text grey (#575e75), sometimes with white or black details. Such an
// icon carries no meaning in its colour, so it is redrawn with the theme's accent-for-symbols and text
// colours (pm-theme-colors.js) and redrawn again whenever the theme or its colours change. Icons with
// any other colour (categories, warnings, pictures) are left alone.
// A redrawn <img> gets data-pm-themed and --pm-icon (its original picture as url()), so a style can
// also show it as a single colour with a CSS mask (see pm-theme-uses.css).

const ACCENT = ['00c3ff', '4c97ff', '00a3ff'];
const GREY = ['575e75'];
const NEUTRAL = ['fff', 'ffffff', '000', '000000', '231f20'];
const HEX = /#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3})\b/gi;

const sources = new Map(); // original src -> Promise<svg text or null>
const state = new WeakMap(); // img -> {original, applied}
const themed = new Set(); // imgs currently redrawn

const isSvgSource = src => /^data:image\/svg\+xml/i.test(src) || /\.svg(\?|#|$)/i.test(src);

// the SVG text of an icon that can be redrawn, or null
const loadSource = src => {
    if (!sources.has(src)) {
        sources.set(src, fetch(src)
            .then(response => (response.ok ? response.text() : null))
            .then(text => {
                if (!text) return null;
                let hasTheme = false;
                for (const match of text.matchAll(HEX)) {
                    const hex = match[1].toLowerCase();
                    const rgb = hex.length === 8 ? hex.slice(0, 6) : hex;
                    if (ACCENT.includes(rgb) || GREY.includes(rgb)) hasTheme = true;
                    else if (!NEUTRAL.includes(rgb)) return null;
                }
                // other ways of naming colours mean a picture with colours of its own
                if (/rgba?\(|hsla?\(/i.test(text)) return null;
                return hasTheme ? text : null;
            })
            .catch(() => null));
    }
    return sources.get(src);
};

let colors = null;
const readColors = () => {
    const style = getComputedStyle(document.documentElement);
    const get = (name, fallback) => (style.getPropertyValue(name).trim() || fallback).replace('#', '');
    colors = {
        accent: get('--ui-accent-symbol', '#00c3ff'),
        text: get('--text-primary', '#575e75')
    };
};

const recolor = text => text.replace(HEX, (all, hex) => {
    const lower = hex.toLowerCase();
    const rgb = lower.length === 8 ? lower.slice(0, 6) : lower;
    const alpha = lower.length === 8 ? lower.slice(6) : '';
    if (ACCENT.includes(rgb)) return `#${colors.accent}${alpha}`;
    if (GREY.includes(rgb)) return `#${colors.text}${alpha}`;
    return all;
});

const apply = (img, original, text) => {
    const applied = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(recolor(text))}`;
    state.set(img, {original, applied});
    themed.add(img);
    img.setAttribute('data-pm-themed', '');
    img.style.setProperty('--pm-icon', `url("${original.replace(/"/g, '%22')}")`);
    img.src = applied;
};

const handle = img => {
    const src = img.getAttribute('src');
    if (!src) return;
    const known = state.get(img);
    if (known && src === known.applied) return; // our own picture
    if (!isSvgSource(src)) {
        if (known) forget(img);
        return;
    }
    loadSource(src).then(text => {
        if (img.getAttribute('src') !== src) return; // changed meanwhile
        if (!text) {
            if (known) forget(img);
            return;
        }
        if (!colors) readColors();
        apply(img, src, text);
    });
};

const forget = img => {
    state.delete(img);
    themed.delete(img);
    img.removeAttribute('data-pm-themed');
    img.style.removeProperty('--pm-icon');
};

const refreshAll = () => {
    readColors();
    for (const img of Array.from(themed)) {
        if (!img.isConnected) {
            themed.delete(img);
            continue;
        }
        const known = state.get(img);
        loadSource(known.original).then(text => {
            if (text && state.get(img) === known) apply(img, known.original, text);
        });
    }
};

const scan = root => {
    if (root.tagName === 'IMG') handle(root);
    else if (root.querySelectorAll) for (const img of root.querySelectorAll('img')) handle(img);
};

let started = false;
const startThemedIcons = () => {
    if (started || typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;
    started = true;
    const begin = () => {
        scan(document.body);
        new MutationObserver(records => {
            for (const record of records) {
                if (record.type === 'attributes') {
                    if (record.target.tagName === 'IMG') handle(record.target);
                    else if (record.target === document.body) setTimeout(refreshAll); // theme switched
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
            attributeFilter: ['src', 'theme']
        });
        document.addEventListener('pm-theme-colors-changed', refreshAll);
    };
    if (document.body) begin();
    else document.addEventListener('DOMContentLoaded', begin, {once: true});
};

export default startThemedIcons;

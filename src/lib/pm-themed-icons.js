// Desktop fork (sections 219, 221, 222): picture icons in the theme's ink.
// The editor's and costume editor's interface icons are SVG files drawn in the old accent blue
// (#00c3ff, #4c97ff, #00a3ff) and text grey (#575e75), or only in black or only in white. Such an icon
// carries no meaning in its colour: an icon is something you read, like text, so it is drawn in the ink
// of the place it is in (--text-primary there; every background sets its own, pm-theme-colors.js).
// The accent is for what is selected or switched on: styles give an icon that colour where it applies
// (the selected tab), never the picture itself.
// How: the <img> keeps its picture, which CSS uses as a mask over a block of colour (pm-theme-uses.css,
// img[data-pm-mono]), so the icon follows hover, selection and theme at once. Details that were drawn
// in a second colour inside a shape become part of the silhouette.
// Icons with any other colour (categories, warnings, pictures) and pictures that are not the editor's
// own files (costumes, library items) are left alone.

const ACCENT = ['00c3ff', '4c97ff', '00a3ff'];
const GREY = ['575e75'];
const BLACK = ['000', '000000', '231f20'];
const WHITE = ['fff', 'ffffff'];
const HEX = /#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3})\b/gi;
const NAMED = /(?:fill|stroke|stop-color|[^-]color)\s*[:=]\s*["']?\s*([a-z]+)\b/gi;

const sources = new Map(); // src -> Promise<true (an interface icon) or false>
const themed = new WeakMap(); // img -> the src it was marked for

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

// whether the picture is an interface icon
const loadSource = src => {
    if (!sources.has(src)) {
        sources.set(src, fetch(src)
            .then(response => (response.ok ? response.text() : null))
            .then(text => {
                if (!text || /rgba?\(|hsla?\(|<image\b/i.test(text)) return false;
                const groups = new Set();
                for (const match of text.matchAll(HEX)) {
                    const group = groupOf(match[1]);
                    if (!group) return false; // a colour of its own
                    groups.add(group);
                }
                // colours written as words; a shape that names none is drawn black
                for (const match of text.matchAll(NAMED)) {
                    const name = match[1].toLowerCase();
                    if (/^(none|transparent|inherit|url)$/.test(name)) continue;
                    if (name === 'black' || name === 'currentcolor') groups.add('black');
                    else if (name === 'white') groups.add('white');
                    else return false;
                }
                if (groups.size === 0) groups.add('black');
                // only black or only white: an interface icon when it is one of the editor's own files
                return groups.has('accent') || groups.has('grey') || (groups.size === 1 && isBundled(src));
            })
            .catch(() => false));
    }
    return sources.get(src);
};

const forget = img => {
    themed.delete(img);
    img.removeAttribute('data-pm-themed');
    img.removeAttribute('data-pm-mono');
    img.style.removeProperty('--pm-icon');
};

const handle = img => {
    const src = img.getAttribute('src');
    if (!src || themed.get(img) === src) return;
    if (!isSvgSource(src)) {
        if (themed.has(img)) forget(img);
        return;
    }
    loadSource(src).then(isIcon => {
        if (img.getAttribute('src') !== src) return; // changed meanwhile
        if (!isIcon) {
            if (themed.has(img)) forget(img);
            return;
        }
        themed.set(img, src);
        img.setAttribute('data-pm-themed', '');
        img.setAttribute('data-pm-mono', 'text');
        img.style.setProperty('--pm-icon', `url("${src.replace(/"/g, '%22')}")`);
    });
};

// whether the contrast guard can judge this image (a themed icon is its background colour, masked)
const isThemedIcon = img => themed.has(img);

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
                    continue;
                }
                for (const node of record.addedNodes) {
                    // Blockly adds many SVG nodes: only HTML elements can hold <img>
                    if (node.nodeType === 1 && !(node instanceof SVGElement)) scan(node);
                }
            }
        }).observe(document.body, {subtree: true, childList: true, attributes: true, attributeFilter: ['src']});
    };
    if (document.body) begin();
    else document.addEventListener('DOMContentLoaded', begin, {once: true});
};

export {
    startThemedIcons as default,
    isThemedIcon
};

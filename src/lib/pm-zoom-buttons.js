// Desktop fork (section 217): the code area's zoom buttons are drawn as shapes coloured by the theme
// (ring: borders, face: buttons and tiles, symbol: dim text) instead of Blockly's fixed pictures.
// Section 288: small squares stacked with no gap (they share their border), in the bottom right corner.
// Each picture is moved into a group with the shapes and stays on top, invisible, so Blockly's own
// click handlers keep working. Addons that move or scale the buttons work on `.blocklyZoom > *`,
// which is now each group.

const SVG_NS = 'http://www.w3.org/2000/svg';

// the symbols of zoom-in.svg, zoom-out.svg and zoom-reset.svg (36 x 36)
const MAGNIFIER = [
    ['circle', {cx: 18, cy: 18, r: 7}],
    ['line', {x1: 23, y1: 23, x2: 26, y2: 26}],
    ['line', {x1: 16, y1: 18, x2: 20, y2: 18}]
];
const SYMBOLS = {
    'zoom-in.svg': MAGNIFIER.concat([['line', {x1: 18, y1: 16, x2: 18, y2: 20}]]),
    'zoom-out.svg': MAGNIFIER,
    'zoom-reset.svg': [
        ['rect', {x: 13, y: 14, width: 10, height: 2, rx: 1, ry: 1}],
        ['rect', {x: 13, y: 20, width: 10, height: 2, rx: 1, ry: 1}]
    ]
};
// button size in pixels and how much bigger the symbol is drawn than in the 36 x 36 pictures
const SIZE = 24;
const SYMBOL_ZOOM = 1.25;

const POSITIONS = ['x', 'cx', 'x1', 'x2'];
const LENGTHS = ['r', 'width', 'height', 'rx', 'ry'];

const shape = (tag, attributes, className, left, top, scale) => {
    const element = document.createElementNS(SVG_NS, tag);
    element.setAttribute('class', className);
    for (const name of Object.keys(attributes)) {
        let value = attributes[name] * scale;
        if (POSITIONS.includes(name)) value += left;
        else if (!LENGTHS.includes(name)) value += top;
        element.setAttribute(name, value);
    }
    return element;
};

const drawButton = image => {
    const href = image.getAttributeNS('http://www.w3.org/1999/xlink', 'href') || image.getAttribute('href') || '';
    const name = Object.keys(SYMBOLS).find(file => href.endsWith(file));
    if (!name || !image.parentNode) return;
    const left = Number(image.getAttribute('x')) || 0;
    const top = Number(image.getAttribute('y')) || 0;
    const size = Number(image.getAttribute('width')) || SIZE;
    const group = document.createElementNS(SVG_NS, 'g');
    group.setAttribute('class', 'pm-zoom-button');
    // a 1 px border (ring) around the face, whatever the size
    group.appendChild(shape('rect', {x: 0, y: 0, width: size, height: size}, 'pm-zoom-ring', left, top, 1));
    group.appendChild(shape('rect', {x: 1, y: 1, width: size - 2, height: size - 2}, 'pm-zoom-face', left, top, 1));
    // the symbol, centred
    const scale = (size / 36) * SYMBOL_ZOOM;
    const offset = (size / 2) - (18 * scale);
    for (const [tag, attributes] of SYMBOLS[name]) {
        group.appendChild(shape(tag, attributes, 'pm-zoom-glyph', left + offset, top + offset, scale));
    }
    for (const child of group.childNodes) child.style.pointerEvents = 'none';
    image.parentNode.insertBefore(group, image);
    group.appendChild(image);
    image.style.opacity = '0';
};

const patchZoomButtons = ScratchBlocks => {
    const ZoomControls = ScratchBlocks && ScratchBlocks.ZoomControls;
    if (!ZoomControls || ZoomControls.prototype.pmThemed) return;
    ZoomControls.prototype.pmThemed = true;
    // small squares, touching (the -1 makes neighbours share one border line), in the corner: the
    // code area has no visible scrollbars (pm-theme-uses.css), so their room is not kept free
    ZoomControls.prototype.WIDTH_ = SIZE;
    ZoomControls.prototype.MARGIN_BETWEEN_ = -1;
    ZoomControls.prototype.HEIGHT_ = (3 * SIZE) - 2;
    ZoomControls.prototype.MARGIN_BOTTOM_ = 0;
    ZoomControls.prototype.MARGIN_SIDE_ = -((ScratchBlocks.Scrollbar && ScratchBlocks.Scrollbar.scrollbarThickness) || 0);
    const originalCreateDom = ZoomControls.prototype.createDom;
    ZoomControls.prototype.createDom = function () {
        const svgGroup = originalCreateDom.apply(this, arguments);
        if (svgGroup) {
            for (const image of Array.from(svgGroup.querySelectorAll('image'))) drawButton(image);
        }
        return svgGroup;
    };
};

export default patchZoomButtons;

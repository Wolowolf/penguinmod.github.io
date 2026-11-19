// Desktop fork (section 217): the code area's zoom buttons are drawn as shapes coloured by the theme
// (border: lines, face: buttons and tiles, symbol: dim text) instead of Blockly's fixed pictures.
// Section 328: Blockly makes an invisible hit rect (class blocklyZoomHit, data-zoom = the old picture's
// name) instead of a picture, so no image is loaded; the face is one rect with a 1 px border.
// Section 288: small squares with no gap (they share their border), in the bottom right corner.
// Section 289: side by side (+, −, =), each as high as the ADD box under the categories (1.2rem).
// Each hit rect is moved into a group with the shapes and stays on top, so Blockly's own
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
        ['rect', {x: 13, y: 14, width: 10, height: 2}],
        ['rect', {x: 13, y: 20, width: 10, height: 2}]
    ]
};
// button size: the ADD box's height (gui.css .extension-button, 1.2rem), in pixels
const remPixels = () => {
    const size = parseFloat(getComputedStyle(document.documentElement).fontSize);
    return size > 0 ? size : 16;
};
const SIZE = 1.2 * remPixels();
// how much bigger the symbol is drawn than in the 36 x 36 pictures
const SYMBOL_ZOOM = 1.25;
// the row is three squares that share their borders
const ROW_WIDTH = (3 * SIZE) - 2;

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

const drawButton = hit => {
    const name = hit.getAttribute('data-zoom');
    if (!SYMBOLS[name] || !hit.parentNode) return;
    const left = Number(hit.getAttribute('x')) || 0;
    const top = Number(hit.getAttribute('y')) || 0;
    const size = Number(hit.getAttribute('width')) || SIZE;
    const group = document.createElementNS(SVG_NS, 'g');
    group.setAttribute('class', 'pm-zoom-button');
    // the face, with a 1 px border inside its edge whatever the size
    group.appendChild(shape('rect', {x: 0.5, y: 0.5, width: size - 1, height: size - 1}, 'pm-zoom-face', left, top, 1));
    // the symbol, centred
    const scale = (size / 36) * SYMBOL_ZOOM;
    const offset = (size / 2) - (18 * scale);
    for (const [tag, attributes] of SYMBOLS[name]) {
        group.appendChild(shape(tag, attributes, 'pm-zoom-glyph', left + offset, top + offset, scale));
    }
    for (const child of group.childNodes) child.style.pointerEvents = 'none';
    hit.parentNode.insertBefore(group, hit);
    group.appendChild(hit);
};

const patchZoomButtons = ScratchBlocks => {
    const ZoomControls = ScratchBlocks && ScratchBlocks.ZoomControls;
    if (!ZoomControls || ZoomControls.prototype.pmThemed) return;
    ZoomControls.prototype.pmThemed = true;
    // small squares, touching (the -1 makes neighbours share one border line), in the corner: the
    // code area has no visible scrollbars (pm-theme-uses.css), so their room is not kept free.
    // WIDTH_ is one button (Blockly sizes each picture with it); the row's width is added in position.
    ZoomControls.prototype.WIDTH_ = SIZE;
    ZoomControls.prototype.MARGIN_BETWEEN_ = -1;
    ZoomControls.prototype.HEIGHT_ = SIZE;
    const scrollbar = (ScratchBlocks.Scrollbar && ScratchBlocks.Scrollbar.scrollbarThickness) || 0;
    // section 289: Blockly also keeps the scrollbar's room free under them (init adds it)
    ZoomControls.prototype.MARGIN_BOTTOM_ = -scrollbar;
    ZoomControls.prototype.MARGIN_SIDE_ = -scrollbar;
    const originalCreateDom = ZoomControls.prototype.createDom;
    ZoomControls.prototype.createDom = function () {
        const svgGroup = originalCreateDom.apply(this, arguments);
        if (svgGroup) {
            for (const hit of Array.from(svgGroup.querySelectorAll('.blocklyZoomHit'))) {
                // Blockly stacks them (y); lay them out in a row instead (x)
                hit.setAttribute('x', hit.getAttribute('y') || 0);
                hit.setAttribute('y', 0);
                drawButton(hit);
            }
        }
        return svgGroup;
    };
    // Blockly keeps one button's width free at the right edge; the row needs the rest too
    const originalPosition = ZoomControls.prototype.position;
    ZoomControls.prototype.position = function () {
        originalPosition.apply(this, arguments);
        if (!this.svgGroup_ || !this.workspace_ || this.workspace_.RTL || typeof this.left_ !== 'number') return;
        this.left_ -= ROW_WIDTH - SIZE;
        this.svgGroup_.setAttribute('transform', `translate(${this.left_},${this.top_})`);
    };
};

export default patchZoomButtons;

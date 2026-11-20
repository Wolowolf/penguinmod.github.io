// Desktop fork (section 331): while typing in a text or number field, its block is drawn again at most
// once per frame instead of on every keystroke. scratch-blocks handles keypress, input and keyup of the
// field's editor and in Chrome draws the block on each of them (3 times per key), and drawing a block also
// draws every block above it in its script (a field 300 blocks down a script: 900 block drawings per key).
// The field's text (and the change event the VM listens to) is still set on every keystroke; only the
// drawing, the bumping of nearby scripts and the editor box's size wait for the next frame, and the text
// change events reach their listeners (the VM, the custom block editor) right after that drawing. Anything
// that can read the block's size first draws it at once: a pointer press anywhere (before clicks and drags),
// closing the editor (Enter, Esc, Tab, a click elsewhere), the block size functions (getHeightWidth,
// getBoundingRectangle) and any workspace event other than text changes.

/**
 * Make typing in fields draw at most once per frame (once).
 * @param {object} ScratchBlocks the blocks library
 */
export default function patchFieldTyping (ScratchBlocks) {
    const B = ScratchBlocks;
    const FieldTextInput = B.FieldTextInput;
    if (!FieldTextInput || FieldTextInput.prototype.pmTyping) return;
    FieldTextInput.prototype.pmTyping = true;

    let typing = null; // the field whose editor event is being handled
    const pending = new Set(); // fields whose block still has to be drawn
    let frame = 0;
    let timer = 0;
    let flushing = false;
    let fireLater = false; // workspace events held back until the block is drawn
    const resizeEditor = FieldTextInput.prototype.resizeEditor_;

    const flush = () => {
        if (flushing) return;
        if (pending.size) {
            flushing = true;
            try {
                const fields = Array.from(pending);
                pending.clear();
                for (const field of fields) {
                    const block = field.sourceBlock_;
                    if (!block || !block.workspace || !block.rendered) continue;
                    block.render();
                    field.pmDrawnText_ = field.text_;
                    block.bumpNeighbours_();
                    if (B.WidgetDiv.isVisible() && B.WidgetDiv.owner_ === field) resizeEditor.call(field);
                }
            } finally {
                flushing = false;
            }
        }
        if (fireLater) {
            fireLater = false;
            B.Events.fireNow_();
        }
    };
    const schedule = field => {
        pending.add(field);
        if (!frame) {
            frame = requestAnimationFrame(() => {
                frame = 0;
                flush();
            });
        }
        // a window that draws no frames (minimised) still gets its events
        if (!timer) {
            timer = setTimeout(() => {
                timer = 0;
                flush();
            }, 250);
        }
    };

    const onHtmlInputChange = FieldTextInput.prototype.onHtmlInputChange_;
    FieldTextInput.prototype.onHtmlInputChange_ = function (...args) {
        if (!B.pmFieldTyping.enabled || !this.sourceBlock_ || !this.sourceBlock_.rendered) {
            return onHtmlInputChange.apply(this, args);
        }
        const outer = typing;
        typing = this;
        try {
            return onHtmlInputChange.apply(this, args);
        } finally {
            typing = outer;
        }
    };
    // setText -> forceRerender: forget the field's width at once (getSize measures it again), draw later
    const forceRerender = B.Field.prototype.forceRerender;
    B.Field.prototype.forceRerender = function (...args) {
        if (typing === this) {
            this.size_.width = 0;
            schedule(this);
            return;
        }
        return forceRerender.apply(this, args);
    };
    // the extra draw scratch-blocks does in Chrome when a key did not change the text (keypress before the
    // text changes, keyup after): left out when the block already shows the field's text
    const render = B.BlockSvg.prototype.render;
    B.BlockSvg.prototype.render = function (...args) {
        if (typing && typing.sourceBlock_ === this) {
            if (pending.has(typing) || typing.pmDrawnText_ !== typing.text_) schedule(typing);
            return;
        }
        return render.apply(this, args);
    };
    // the editor box follows the field's size: done after the block is drawn
    FieldTextInput.prototype.resizeEditor_ = function (...args) {
        if (pending.has(this)) return;
        return resizeEditor.apply(this, args);
    };

    // everything that may read the block's size draws it first
    for (const type of ['pointerdown', 'mousedown', 'touchstart']) window.addEventListener(type, flush, true);
    const hide = B.WidgetDiv.hide;
    B.WidgetDiv.hide = function (...args) {
        flush();
        return hide.apply(this, args);
    };
    const maybeSaveEdit = FieldTextInput.prototype.maybeSaveEdit_;
    FieldTextInput.prototype.maybeSaveEdit_ = function (...args) {
        flush();
        return maybeSaveEdit.apply(this, args);
    };
    for (const name of ['getHeightWidth', 'getBoundingRectangle']) {
        const original = B.BlockSvg.prototype[name];
        B.BlockSvg.prototype[name] = function (...args) {
            if (pending.size) flush();
            return original.apply(this, args);
        };
    }
    // workspace events: listeners may read sizes (the custom block editor centres its block on every change).
    // Text changes alone wait for the drawing (at most a frame; then their listeners see the new size and
    // drawing stays once per frame); any other event draws first.
    const fieldChange = event => event.type === B.Events.CHANGE && event.element === 'field';
    const fireNow = B.Events.fireNow_;
    B.Events.fireNow_ = function (...args) {
        if (pending.size) {
            if (B.Events.FIRE_QUEUE_.every(fieldChange)) {
                fireLater = true;
                return;
            }
            flush();
        }
        return fireNow.apply(this, args);
    };

    // for tests: false draws on every keystroke again (as before section 331)
    ScratchBlocks.pmFieldTyping = {enabled: true, flush};
}

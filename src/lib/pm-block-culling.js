// Desktop fork (section 312): culling inside scripts. scratch-blocks already hides every script that is
// entirely off screen (BlockSvg.setIntersects, style display none on the script's group). This hides the
// off-screen parts of scripts that are partly on screen, so a long script costs only what is visible.
// Each off-screen block hides its own drawing (shape, texts, reporters in its inputs, icons): everything
// in its group except the groups of the blocks after it and in its C-block mouths, and the run/error bar.
// Groups that hold other blocks are never hidden: Chrome walks a group's whole subtree when its display
// changes, hidden parts included (the rest of a 1,000-block script: about 200 ms each time).
// While a stack is dragged, its part below the visible area is taken out of the page instead (a comment
// keeps its place): Chrome also walks every element of the drag surface on each move, hidden or not
// (1,000 dragged blocks: 35 ms per move). Everything is put back before the drag ends.
// Hiding uses the class pmCulled, which only takes effect inside the code area and the drag surface,
// so copies made for pictures (backpack, blocks2image) show every block. Drawing only: nothing about
// the blocks' sizes, positions or connections changes. Only the code area and other top-level
// workspaces; not the block palette (its scripts are short) or mutator workspaces.
// Section 331: cheaper checks while scrolling and zooming. A full check walks every visible script and
// remembers where each of its blocks sits inside the script (workspace units). Until a block is drawn
// again or a script changes shape, later checks only compare those remembered positions with the visible
// area and switch only the blocks whose state changes. scratch-blocks' own check reuses the script sizes
// it measured until then.

import log from './log';

const MARGIN = 40; // pixels beyond the visible area that stay drawn

/**
 * Add culling inside scripts to scratch-blocks (once).
 * @param {object} ScratchBlocks the blocks library
 */
export default function patchBlockCulling (ScratchBlocks) {
    const B = ScratchBlocks;
    if (!B.IntersectionObserver || B.IntersectionObserver.prototype.pmCulling) return;
    B.IntersectionObserver.prototype.pmCulling = true;

    const style = document.createElement('style');
    style.textContent = '.blocklySvg .pmCulled, .blocklyBlockDragSurface .pmCulled { display: none !important; }';
    document.head.appendChild(style);

    // section 331: moves whenever a block is drawn or connected / taken out, which is when a block's size
    // or a script's shape can change; everything remembered from an older value is worked out again
    let shapes = 0;
    let culled = new WeakMap(); // workspace -> Set of elements with pmCulled
    const culledBlocks = new Set(); // blocks whose own drawing is hidden; block.pmCulledEls_ lists the elements
    const layouts = new WeakMap(); // top block -> { shapes, blocks, y, h }: the script's blocks, workspace units
    let checked = new WeakMap(); // workspace -> value of shapes at its last full check
    const detached = new Map(); // element -> the comment in its place (drag only)
    const restore = el => {
        const placeholder = detached.get(el);
        detached.delete(el);
        if (placeholder && placeholder.parentNode) placeholder.parentNode.replaceChild(el, placeholder);
    };
    const restoreAll = () => {
        for (const el of Array.from(detached.keys())) restore(el);
    };
    const offsetY = block => B.utils.getRelativeXY(block.getSvgRoot()).y;
    // the groups inside a block's group that belong to other blocks (never hidden with it)
    const keptOf = block => {
        const next = block.getNextBlock();
        const keep = [next && next.getSvgRoot(), block.stackBar_];
        for (const input of block.inputList) {
            const target = input.type === B.NEXT_STATEMENT && input.connection && input.connection.targetBlock();
            if (target) keep.push(target.getSvgRoot());
        }
        return keep;
    };
    const view = ws => {
        const height = ws.getParentSvg().height.baseVal.value;
        const origin = ws.isDragSurfaceActive_ ?
            B.utils.getRelativeXY(ws.workspaceDragSurface_.SVG_) :
            B.utils.getRelativeXY(ws.getCanvas());
        return {scale: ws.scale, low: -MARGIN, high: height + MARGIN, originY: origin.y};
    };

    // full check: what should be hidden (want, wantBlocks) and taken out (wantDetached) in one workspace
    const compute = (ws, want, wantDetached, wantBlocks) => {
        const {scale, low, high, originY} = view(ws);
        const dragged = ws.blockDragSurface_ && ws.blockDragSurface_.getCurrentBlock();
        let dragging = false;
        let base = 0;
        let layout = null;
        // walk a block (rel workspace units below the top block), the blocks in its mouths and after it
        const chain = (first, startRel) => {
            let rel = startRel;
            for (let block = first; block;) {
                const root = block.getSvgRoot();
                const y = base + (rel * scale);
                if (dragging && y > high) {
                    wantDetached.add(root);
                    return;
                }
                if (layout) {
                    layout.blocks.push(block);
                    layout.y.push(rel);
                    layout.h.push(block.height);
                }
                const next = block.getNextBlock();
                const keep = keptOf(block);
                for (const input of block.inputList) {
                    const target = input.type === B.NEXT_STATEMENT && input.connection &&
                        input.connection.targetBlock();
                    if (target) chain(target, rel + offsetY(target));
                }
                if (y > high || y + (block.height * scale) < low) {
                    const list = [];
                    for (const child of root.children) {
                        if (!keep.includes(child)) {
                            want.add(child);
                            list.push(child);
                        }
                    }
                    wantBlocks.set(block, list);
                }
                if (!next) return;
                rel += offsetY(next);
                block = next;
            }
        };
        for (const top of ws.getTopBlocks(false)) {
            if (!top.rendered || top.intersects_ === false || !top.getSvgRoot()) continue;
            dragging = !!dragged && top.getSvgRoot() === dragged;
            // the dragged script may stop part way: not remembered
            layout = dragging ? null : {shapes, blocks: [], y: [], h: []};
            base = originY + (top.getRelativeToSurfaceXY().y * scale);
            chain(top, 0);
            if (layout) layouts.set(top, layout);
        }
    };

    // section 331, cheap check: only the remembered positions; false (nothing changed) when a full check is needed
    const fast = ws => {
        const els = culled.get(ws);
        if (!els) return false;
        const {scale, low, high, originY} = view(ws);
        const tops = [];
        for (const top of ws.getTopBlocks(false)) {
            if (!top.rendered || top.intersects_ === false || !top.getSvgRoot()) continue;
            const layout = layouts.get(top);
            if (!layout || layout.shapes !== shapes) return false;
            tops.push(top, layout);
        }
        for (let t = 0; t < tops.length; t += 2) {
            const {blocks, y, h} = tops[t + 1];
            const base = originY + (tops[t].getRelativeToSurfaceXY().y * scale);
            for (let i = 0; i < blocks.length; i++) {
                const blockY = base + (y[i] * scale);
                const hide = blockY > high || blockY + (h[i] * scale) < low;
                const block = blocks[i];
                if (hide === !!block.pmCulledEls_) continue;
                if (hide) {
                    const keep = keptOf(block);
                    const list = [];
                    for (const child of block.getSvgRoot().children) {
                        if (!keep.includes(child)) {
                            child.classList.add('pmCulled');
                            els.add(child);
                            list.push(child);
                        }
                    }
                    block.pmCulledEls_ = list;
                    culledBlocks.add(block);
                } else {
                    for (const el of block.pmCulledEls_) {
                        el.classList.remove('pmCulled');
                        els.delete(el);
                    }
                    block.pmCulledEls_ = null;
                    culledBlocks.delete(block);
                }
            }
        }
        return true;
    };

    const queued = new Set();
    const run = () => {
        const wantDetached = new Set();
        const workspaces = Array.from(queued);
        queued.clear();
        for (const ws of workspaces) {
            const dragging = ws.blockDragSurface_ && ws.blockDragSurface_.getCurrentBlock();
            try {
                if (B.pmCulling.fast && !dragging && !detached.size && checked.get(ws) === shapes && fast(ws)) {
                    continue;
                }
            } catch (e) {
                log.warn('block culling', e);
            }
            const had = culled.get(ws) || new Set();
            const want = new Set();
            const wantBlocks = new Map();
            try {
                if (ws.rendered && ws.intersectionObserver) compute(ws, want, wantDetached, wantBlocks);
                checked.set(ws, shapes);
            } catch (e) {
                want.clear(); // draw everything rather than hide the wrong things
                wantDetached.clear();
                wantBlocks.clear();
                checked.delete(ws);
                log.warn('block culling', e);
            }
            for (const el of had) if (!want.has(el)) el.classList.remove('pmCulled');
            for (const el of want) if (!had.has(el)) el.classList.add('pmCulled');
            culled.set(ws, want);
            for (const block of Array.from(culledBlocks)) {
                if ((block.workspace === ws || !block.workspace) && !wantBlocks.has(block)) {
                    block.pmCulledEls_ = null;
                    culledBlocks.delete(block);
                }
            }
            for (const [block, list] of wantBlocks) {
                block.pmCulledEls_ = list;
                culledBlocks.add(block);
            }
        }
        for (const el of Array.from(detached.keys())) if (!wantDetached.has(el)) restore(el);
        for (const el of wantDetached) {
            if (detached.has(el) || !el.parentNode) continue;
            const placeholder = document.createComment('pm-culled');
            el.parentNode.replaceChild(placeholder, el);
            detached.set(el, placeholder);
        }
    };
    const queue = ws => {
        if (!ws || ws.isFlyout || (ws.options && ws.options.parentWorkspace)) return;
        if (!queued.size) queueMicrotask(run);
        queued.add(ws);
    };

    const after = (proto, name, getWorkspace, changesShapes) => {
        const original = proto[name];
        proto[name] = function (...args) {
            if (changesShapes) shapes++;
            const result = original.apply(this, args);
            if (changesShapes) shapes++;
            queue(getWorkspace(this));
            return result;
        };
    };
    // any block drawn or connected / taken out, every drag move
    after(B.BlockSvg.prototype, 'render', block => block.workspace, true);
    after(B.BlockSvg.prototype, 'setParent', block => block.workspace, true);
    after(B.BlockDragger.prototype, 'dragBlock', dragger => dragger.workspace_);

    // scrolling, zooming, resizing: scratch-blocks' own check
    after(B.IntersectionObserver.prototype, 'checkForIntersections', o => o.workspace);
    // Section 331: a script's size (getHeightWidth: a walk down the whole script) is measured for every
    // script on each scroll step (scratch-blocks' check and the scroll area's size); reuse it until the
    // shapes change (a block's size is only set when it is drawn, the next block only by setParent)
    const sizes = new WeakMap(); // block -> { shapes, height, width }
    const getHeightWidth = B.BlockSvg.prototype.getHeightWidth;
    B.BlockSvg.prototype.getHeightWidth = function () {
        const known = sizes.get(this);
        if (known && known.shapes === shapes) return {height: known.height, width: known.width};
        const size = getHeightWidth.call(this);
        sizes.set(this, {shapes, height: size.height, width: size.width});
        return size;
    };

    const endBlockDrag = B.BlockDragger.prototype.endBlockDrag;
    B.BlockDragger.prototype.endBlockDrag = function (...args) {
        restoreAll();
        return endBlockDrag.apply(this, args);
    };
    ScratchBlocks.pmCulling = {
        // for tests: draw everything until the next check (scrolling, zooming, a block drawn, a drag move)
        showAll () {
            restoreAll();
            for (const el of document.querySelectorAll('.pmCulled')) el.classList.remove('pmCulled');
            for (const block of culledBlocks) block.pmCulledEls_ = null;
            culledBlocks.clear();
            culled = new WeakMap();
            checked = new WeakMap();
        },
        refresh (ws) {
            checked.delete(ws);
            queue(ws);
        },
        // section 331, for tests: false makes every check a full one (as before section 331)
        fast: true
    };
    // text can only be measured in the page: put taken-out blocks back first (the next check takes them out again)
    const getCachedWidth = B.Field.getCachedWidth;
    B.Field.getCachedWidth = function (textElement) {
        if (detached.size && !textElement.isConnected) restoreAll();
        return getCachedWidth.call(this, textElement);
    };
}

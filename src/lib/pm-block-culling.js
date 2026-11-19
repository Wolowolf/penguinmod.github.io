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

    let culled = new WeakMap(); // workspace -> Set of elements with pmCulled
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

    // what should be hidden (want) and taken out (wantDetached) in one workspace
    const compute = (ws, want, wantDetached) => {
        const scale = ws.scale;
        const height = ws.getParentSvg().height.baseVal.value;
        const origin = ws.isDragSurfaceActive_ ?
            B.utils.getRelativeXY(ws.workspaceDragSurface_.SVG_) :
            B.utils.getRelativeXY(ws.getCanvas());
        const dragged = ws.blockDragSurface_ && ws.blockDragSurface_.getCurrentBlock();
        const low = -MARGIN;
        const high = height + MARGIN;
        let dragging = false;
        // block starts at screen y (pixels); walk it, the blocks in its mouths and the blocks after it
        const chain = (first, startY) => {
            let y = startY;
            for (let block = first; block;) {
                const root = block.getSvgRoot();
                if (dragging && y > high) {
                    wantDetached.add(root);
                    return;
                }
                const next = block.getNextBlock();
                const keep = [next && next.getSvgRoot(), block.stackBar_];
                for (const input of block.inputList) {
                    const target = input.type === B.NEXT_STATEMENT && input.connection &&
                        input.connection.targetBlock();
                    if (target) {
                        keep.push(target.getSvgRoot());
                        chain(target, y + (offsetY(target) * scale));
                    }
                }
                if (y > high || y + (block.height * scale) < low) {
                    for (const child of root.children) {
                        if (!keep.includes(child)) want.add(child);
                    }
                }
                if (!next) return;
                y += offsetY(next) * scale;
                block = next;
            }
        };
        for (const top of ws.getTopBlocks(false)) {
            if (!top.rendered || top.intersects_ === false || !top.getSvgRoot()) continue;
            dragging = !!dragged && top.getSvgRoot() === dragged;
            chain(top, origin.y + (top.getRelativeToSurfaceXY().y * scale));
        }
    };

    const queued = new Set();
    const run = () => {
        const wantDetached = new Set();
        const workspaces = Array.from(queued);
        queued.clear();
        for (const ws of workspaces) {
            const had = culled.get(ws) || new Set();
            const want = new Set();
            try {
                if (ws.rendered && ws.intersectionObserver) compute(ws, want, wantDetached);
            } catch (e) {
                want.clear(); // draw everything rather than hide the wrong things
                wantDetached.clear();
                log.warn('block culling', e);
            }
            for (const el of had) if (!want.has(el)) el.classList.remove('pmCulled');
            for (const el of want) if (!had.has(el)) el.classList.add('pmCulled');
            culled.set(ws, want);
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

    const after = (proto, name, getWorkspace) => {
        const original = proto[name];
        proto[name] = function (...args) {
            const result = original.apply(this, args);
            queue(getWorkspace(this));
            return result;
        };
    };
    // scrolling, zooming, resizing (scratch-blocks' own check), any block drawn, every drag move
    after(B.IntersectionObserver.prototype, 'checkForIntersections', o => o.workspace);
    after(B.BlockSvg.prototype, 'render', block => block.workspace);
    after(B.BlockDragger.prototype, 'dragBlock', dragger => dragger.workspace_);

    const endBlockDrag = B.BlockDragger.prototype.endBlockDrag;
    B.BlockDragger.prototype.endBlockDrag = function (...args) {
        restoreAll();
        return endBlockDrag.apply(this, args);
    };
    // for tests: draw everything until the next check (scrolling, zooming, a block drawn, a drag move)
    ScratchBlocks.pmCulling = {
        showAll () {
            restoreAll();
            for (const el of document.querySelectorAll('.pmCulled')) el.classList.remove('pmCulled');
            culled = new WeakMap();
        },
        refresh: queue
    };
    // text can only be measured in the page: put taken-out blocks back first (the next check takes them out again)
    const getCachedWidth = B.Field.getCachedWidth;
    B.Field.getCachedWidth = function (textElement) {
        if (detached.size && !textElement.isConnected) restoreAll();
        return getCachedWidth.call(this, textElement);
    };
}

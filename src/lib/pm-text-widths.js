// Desktop fork (section 331): remembered text widths are never wrong. scratch-blocks remembers every
// measured block text width (key: text + class) for the whole session (Field.startCache at start without
// a stop), so blocks are not measured again on load or zoom. Widths measured before the block font had
// loaded or before the editor's styles were in place stayed wrong (after a normal start and a project
// load: 150 of 309 widths 0.5-6 px too small) and blocks drawn with them were too narrow for their text.
// When a font finishes loading or a style sheet changes, every remembered width is measured again; when
// some differ, the new widths replace the old ones and the blocks showing those texts are drawn again.

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Keep scratch-blocks' text width cache right when fonts load or styles change (once).
 * @param {object} ScratchBlocks the blocks library
 */
export default function patchTextWidths (ScratchBlocks) {
    const B = ScratchBlocks;
    if (!B.Field || B.Field.pmTextWidths) return;
    B.Field.pmTextWidths = true;

    // the blocks of rendered workspaces showing one of the changed texts, drawn again children first
    const redraw = changed => {
        let count = 0;
        for (const ws of Object.values(B.Workspace.WorkspaceDB_ || {})) {
            if (!ws.rendered) continue;
            const blocks = new Set();
            for (const block of ws.getAllBlocks(false)) {
                if (!block.rendered) continue;
                let hit = false;
                for (const input of block.inputList) {
                    for (const field of input.fieldRow) {
                        const text = field.textElement_;
                        if (text && changed.has(`${text.textContent}\n${text.className.baseVal}`)) {
                            field.size_.width = 0;
                            hit = true;
                        }
                    }
                }
                // with every block it sits in: their sizes follow
                for (let b = hit ? block : null; b && !blocks.has(b); b = b.getParent()) blocks.add(b);
            }
            if (!blocks.size) continue;
            const depth = b => {
                let d = 0;
                for (let p = b.getParent(); p; p = p.getParent()) d++;
                return d;
            };
            const order = Array.from(blocks, b => [depth(b), b]).sort((x, y) => y[0] - x[0]);
            for (const [, block] of order) block.render(false);
            for (const [, block] of order) if (!block.getParent()) block.bumpNeighbours_();
            if (ws.resizeContents) ws.resizeContents();
            count += blocks.size;
        }
        return count;
    };

    let timer = 0;
    const recheck = () => {
        timer = 0;
        const cache = B.Field.cacheWidths_;
        // measured inside a workspace in the page, with the styles blocks get
        const ws = Object.values(B.Workspace.WorkspaceDB_ || {}).find(w => w.rendered && !w.isFlyout &&
            w.getCanvas && w.getCanvas() && w.getCanvas().isConnected);
        const host = ws && ws.getCanvas();
        if (!cache || !host) return;
        // all texts in the page at once, then read: one layout for all of them
        const group = document.createElementNS(SVG_NS, 'g');
        const keys = Object.keys(cache);
        for (const key of keys) {
            const cut = key.lastIndexOf('\n');
            const text = document.createElementNS(SVG_NS, 'text');
            text.setAttribute('class', key.slice(cut + 1));
            text.textContent = key.slice(0, cut);
            group.appendChild(text);
        }
        host.appendChild(group);
        const fresh = {};
        const changed = new Set();
        try {
            keys.forEach((key, i) => {
                const width = group.childNodes[i].getComputedTextLength();
                fresh[key] = width || cache[key]; // 0: cannot be measured now, keep it
                if (width && Math.abs(width - cache[key]) > 0.01) changed.add(key);
            });
        } finally {
            group.remove();
        }
        if (!changed.size || B.Field.cacheWidths_ !== cache) return;
        B.Field.cacheWidths_ = fresh;
        B.pmTextWidths.last = {changed: changed.size, of: Object.keys(fresh).length, redrawn: redraw(changed)};
    };
    const queue = () => {
        if (!timer) timer = setTimeout(recheck, 50);
    };
    if (document.fonts) document.fonts.addEventListener('loadingdone', queue);
    // style sheets added, removed or edited, and the page's own style and class (theme and font variables)
    new MutationObserver(queue).observe(document.head, {childList: true, subtree: true, characterData: true});
    new MutationObserver(queue).observe(document.documentElement, {attributes: true, attributeFilter: ['style', 'class']});

    // for tests: run the check now; last: what the last check that found changes did
    ScratchBlocks.pmTextWidths = {recheck, last: null};
}

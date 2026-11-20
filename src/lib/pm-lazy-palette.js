// Desktop fork (section 332): the block palette builds only the categories near its visible part.
// scratch-blocks built every block of every category on each palette refresh (every sprite switch twice,
// every new variable, every added extension): with many extensions hundreds of blocks each time.
// Now the palette is split into its categories. Each category keeps its label and a reserved height (measured
// before, remembered across starts, or estimated from block sizes seen so far); only the categories in or
// near the visible part are built, the one a category click jumps to is built before the jump starts, and
// the rest are built while the editor is idle, nearest first. A category whose blocks (palette XML and,
// for extensions, block definitions) did not change since it was built keeps its built blocks: switching
// sprites rebuilds only the categories that differ (motion, looks, variables, …). When a built category
// is taller or shorter than reserved, everything below moves, and the view moves with it when the change is
// above it, so nothing visible jumps. buildAll() builds everything at once for code that reads every
// palette block (block search, pinned blocks).

const STORE_KEY = 'pm-palette-heights';

/**
 * Make the main block palette build its categories lazily and keep unchanged ones (once).
 * @param {object} ScratchBlocks the blocks library
 * @param {object} vm the virtual machine (extension block definitions)
 */
export default function patchLazyPalette (ScratchBlocks, vm) {
    const B = ScratchBlocks;
    const VF = B.VerticalFlyout;
    if (!VF || VF.prototype.pmLazy) return;
    VF.prototype.pmLazy = true;
    const stats = {shows: 0, built: 0, reused: 0, buildMs: 0};

    // ---- remembered heights (workspace units): per category content, per block type
    let store = {seg: {}, type: {}};
    try {
        const saved = JSON.parse(localStorage.getItem(STORE_KEY));
        if (saved && saved.seg && saved.type) store = saved;
    } catch (e) { /* none stored */ }
    let saveTimer = 0;
    const save = () => {
        if (saveTimer) return;
        saveTimer = setTimeout(() => {
            saveTimer = 0;
            try {
                if (Object.keys(store.seg).length > 3000) store.seg = {};
                localStorage.setItem(STORE_KEY, JSON.stringify(store));
            } catch (e) { /* storage full or blocked: only the estimates get worse */ }
        }, 3000);
    };
    const hash = text => {
        let h = 0x811c9dc5;
        for (let i = 0; i < text.length; i++) {
            h ^= text.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return (h >>> 0).toString(36) + text.length.toString(36);
    };

    // ---- extension block definitions: their text is not in the palette XML, so it is part of the comparison
    const defs = {};
    if (vm && vm.on) {
        const note = info => {
            if (!info || !info.id) return;
            try {
                defs[info.id] = hash(JSON.stringify([
                    (info.blocks || []).map(b => [b.json || null, b.xml || null]),
                    (info.menus || []).map(m => m.json || m)
                ]));
            } catch (e) {
                defs[info.id] = String(Math.random()); // not comparable: never kept
            }
        };
        vm.on('EXTENSION_ADDED', note);
        vm.on('BLOCKSINFO_UPDATE', note);
    }

    const START_HAT = () => B.BlockSvg.START_HAT_HEIGHT || 0;
    const alive = block => !!(block && block.workspace && block.getSvgRoot());
    const viewHeight = fl => (fl.height_ || 0) / fl.workspace_.scale;

    // ---- splitting the palette list into categories (gaps worked out exactly like Flyout.show)
    const parse = (fl, list) => {
        const items = [];
        const gaps = [];
        for (let i = 0; i < list.length; i++) {
            let xml = list[i];
            while (typeof xml === 'string') {
                const target = fl.workspace_.targetWorkspace;
                const more = target.getToolboxCategoryCallback(xml)(target) || [];
                list.splice(i, 1, ...more);
                xml = list[i];
            }
            if (!xml || !xml.tagName) continue;
            const tag = xml.tagName.toUpperCase();
            const gap = fl.horizontalLayout_ ? fl.GAP_X : fl.GAP_Y;
            if (tag === 'BLOCK') {
                items.push({xml, kind: 'block'});
                const own = parseInt(xml.getAttribute('gap'), 10);
                gaps.push(isNaN(own) ? gap : own);
            } else if (tag === 'SEP') {
                const own = parseInt(xml.getAttribute('gap'), 10);
                if (!isNaN(own) && gaps.length > 0) gaps[gaps.length - 1] = own;
                else gaps.push(gap);
            } else if (tag === 'LABEL' && xml.getAttribute('showStatusButton') === 'true') {
                items.push({xml, kind: 'header', category: xml.getAttribute('category-label') === 'true'});
                gaps.push(gap);
            } else if (tag === 'BUTTON' || tag === 'LABEL') {
                items.push({xml, kind: tag === 'LABEL' ? 'label' : 'button',
                    category: xml.getAttribute('category-label') === 'true'});
                gaps.push(gap);
            }
        }
        items.forEach((item, i) => {
            item.gap = gaps[i];
        });
        const segs = [];
        const seen = {};
        let seg = null;
        for (const item of items) {
            if (item.category) {
                const base = item.xml.getAttribute('id') || item.xml.getAttribute('text') || '';
                seen[base] = (seen[base] || 0) + 1;
                seg = {key: seen[base] > 1 ? `${base}#${seen[base]}` : base, id: base, labelItem: item, entries: []};
                segs.push(seg);
            } else {
                if (!seg) {
                    seg = {key: '\u0000head', id: null, labelItem: null, entries: []};
                    segs.push(seg);
                }
                seg.entries.push(item);
            }
        }
        for (const s of segs) {
            const parts = s.entries.map(e => `${e.xml.outerHTML}|${e.gap}`);
            s.sig = `${parts.join('')}#${s.id && defs[s.id] || ''}`;
            s.hash = hash(s.sig);
            s.labelSig = s.labelItem ? `${s.labelItem.xml.outerHTML}|${s.labelItem.gap}` : '';
        }
        return segs;
    };

    const estimate = (fl, seg) => {
        const stored = store.seg[seg.hash];
        if (typeof stored === 'number') return stored;
        const types = Object.values(store.type);
        const average = types.length ? types.reduce((a, b) => a + b, 0) / types.length : 48;
        let h = 0;
        for (const e of seg.entries) {
            if (e.kind === 'block') {
                const known = store.type[e.xml.getAttribute('type')];
                h += (typeof known === 'number' ? known : average) + e.gap;
            } else {
                h += 40 + e.gap;
            }
        }
        return h;
    };

    // ---- building, placing and removing one category's content
    const createButton = (fl, item) => {
        if (item.kind === 'header') return new B.FlyoutExtensionCategoryHeader(fl.workspace_, fl.targetWorkspace_, item.xml);
        return new B.FlyoutButton(fl.workspace_, fl.targetWorkspace_, item.xml, item.kind === 'label');
    };
    const errorButton = (fl, xml, error) => {
        const type = xml.getAttribute('type');
        console.error(`failed to load block "${type}" for toolbox;`, error);
        const label = document.createElementNS('http://www.w3.org/1999/xhtml', 'label');
        label.setAttribute('text', `ERR: Block type "${type}" failed to load`);
        return new B.FlyoutButton(fl.workspace_, fl.targetWorkspace_, label, true);
    };
    const placeButton = (fl, seg, button, y) => {
        const root = button.svgGroup_ || button.createDom();
        const width = fl.getWidth() / fl.workspace_.scale;
        if (fl.RTL) button.moveTo(width - fl.MARGIN - button.width, y);
        else button.moveTo(fl.MARGIN, y);
        button.show();
        seg.listeners.push(B.bindEventWithChecks_(root, 'mousedown', fl, fl.onMouseDown_));
    };

    const buildContent = (fl, seg) => {
        const t0 = performance.now();
        const reserved = seg.contentH;
        seg.items = [];
        seg.listeners = seg.listeners || [];
        fl.workspace_.setResizesEnabled(false);
        const saved = fl.listeners_;
        fl.listeners_ = seg.listeners;
        let y = seg.contentTop;
        try {
            const width = fl.getWidth() / fl.workspace_.scale;
            for (const entry of seg.entries) {
                let block = null;
                let button = null;
                if (entry.kind === 'block') {
                    try {
                        block = B.Xml.domToBlock(entry.xml, fl.workspace_);
                    } catch (e) {
                        button = errorButton(fl, entry.xml, e);
                    }
                } else {
                    button = createButton(fl, entry);
                }
                if (block) {
                    block.pmLazySeg_ = seg;
                    for (const d of block.getDescendants(false)) d.isInFlyout = true;
                    const root = block.getSvgRoot();
                    const hw = block.getHeightWidth();
                    let x = block.getRelativeToSurfaceXY().x;
                    x = fl.RTL ? width - fl.MARGIN - x : fl.MARGIN;
                    const item = {block, y};
                    if (block.hasCheckboxInFlyout()) {
                        fl.createCheckbox_(block, fl.MARGIN, y, hw);
                        item.cbX = fl.RTL ? width - (fl.CHECKBOX_SIZE + fl.CHECKBOX_MARGIN) : fl.MARGIN;
                        item.cbY = y + hw.height / 2 - fl.CHECKBOX_SIZE / 2;
                        x = fl.RTL ? x - (fl.CHECKBOX_SIZE + fl.CHECKBOX_MARGIN) : x + (fl.CHECKBOX_SIZE + fl.CHECKBOX_MARGIN);
                    }
                    const hat = block.startHat_ ? START_HAT() : 0;
                    block.moveBy(x, y + hat);
                    item.rect = fl.createRect_(block, fl.RTL ? x - hw.width : x, y, hw, 0);
                    fl.backgroundButtons_.length = 0; // the rectangles are kept per category instead
                    fl.addBlockListeners_(root, block, item.rect);
                    if (block.disabled) fl.permanentlyDisabled_.push(block);
                    store.type[block.type] = hw.height + hat;
                    seg.items.push(item);
                    y += hw.height + entry.gap + hat;
                } else {
                    placeButton(fl, seg, button, y);
                    seg.items.push({button, y});
                    y += button.height + entry.gap;
                }
            }
        } finally {
            fl.listeners_ = saved;
            fl.workspace_.setResizesEnabled(true);
        }
        seg.built = true;
        seg.contentH = y - seg.contentTop;
        store.seg[seg.hash] = seg.contentH;
        save();
        stats.built++;
        stats.buildMs += performance.now() - t0;
        return seg.contentH - reserved;
    };

    const moveContent = (seg, dy) => {
        for (const item of seg.items || []) {
            item.y += dy;
            if (item.block) {
                if (alive(item.block)) item.block.moveBy(0, dy);
                if (item.rect) item.rect.setAttribute('y', Number(item.rect.getAttribute('y')) + dy);
                if ('cbY' in item) {
                    item.cbY += dy;
                    const cb = item.block.flyoutCheckbox;
                    if (cb) cb.svgRoot.setAttribute('transform', `translate(${item.cbX}, ${item.cbY})`);
                }
            } else if (item.button && item.button.svgGroup_) {
                item.button.moveTo(item.button.getPosition().x, item.y);
            }
        }
    };

    const removeContent = (fl, seg) => {
        if (seg.listeners) {
            for (const l of seg.listeners) B.unbindEvent_(l);
            seg.listeners.length = 0;
        }
        for (const item of seg.items || []) {
            if (item.block) {
                const block = item.block;
                const cb = block.flyoutCheckbox;
                if (cb) {
                    if (cb.svgRoot && cb.svgRoot.parentNode) cb.svgRoot.parentNode.removeChild(cb.svgRoot);
                    if (fl.checkboxes_[block.id] === cb) delete fl.checkboxes_[block.id];
                    block.flyoutCheckbox = null;
                }
                if (item.rect && item.rect.parentNode) item.rect.parentNode.removeChild(item.rect);
                if (alive(block)) block.dispose(false, false);
            } else if (item.button) {
                item.button.dispose();
            }
        }
        if (seg.items && seg.items.length) {
            const gone = new Set(seg.items.map(i => i.block).filter(Boolean));
            fl.permanentlyDisabled_ = fl.permanentlyDisabled_.filter(b => !gone.has(b));
        }
        seg.items = [];
        seg.built = false;
    };

    const syncButtons = fl => {
        fl.buttons_.length = 0;
        for (const seg of fl.pmSegs_) {
            if (seg.label) fl.buttons_.push(seg.label);
            for (const item of seg.items || []) if (item.button) fl.buttons_.push(item.button);
        }
    };

    // a category got its real height: move everything below it, and the view when the change is above it
    const build = (fl, seg) => {
        if (seg.built) return;
        const index = fl.pmSegs_.indexOf(seg);
        const scrollTop = fl.getScrollPos();
        const wasBusy = fl.pmBusy_;
        fl.pmBusy_ = true;
        try {
            const dy = buildContent(fl, seg);
            seg.end = seg.contentTop + seg.contentH;
            if (dy) {
                B.Events.disable();
                try {
                    for (let i = index + 1; i < fl.pmSegs_.length; i++) {
                        const s = fl.pmSegs_[i];
                        s.top += dy;
                        s.contentTop += dy;
                        s.end += dy;
                        if (s.label) s.label.moveTo(s.label.getPosition().x, s.top);
                        if (s.built) moveContent(s, dy);
                    }
                } finally {
                    B.Events.enable();
                }
                fl.pmEnd_ += dy;
            }
            syncButtons(fl);
            fl.recordCategoryScrollPositions_();
            if (fl.scrollbar_) fl.scrollbar_.resize();
            if (dy && seg.contentTop < scrollTop - 0.5) fl.scrollbar_.set((scrollTop + dy) * fl.workspace_.scale);
        } finally {
            fl.pmBusy_ = wasBusy;
        }
    };

    // build every category that reaches into [top - margin, top + view height + margin]; top is read again
    // after each build because building can move it
    const ensure = (fl, getTop, margin) => {
        if (!fl.pmSegs_ || !fl.workspace_) return;
        for (let guard = 0; guard < 1000; guard++) {
            const top = getTop();
            const bottom = top + viewHeight(fl);
            const seg = fl.pmSegs_.find(s => !s.built && s.contentTop < bottom + margin && s.end > top - margin);
            if (!seg) return;
            build(fl, seg);
        }
    };
    const ensureView = fl => ensure(fl, () => fl.getScrollPos(), viewHeight(fl) / 2);

    const buildAll = fl => {
        if (!fl.pmSegs_) return;
        for (const seg of fl.pmSegs_.slice()) if (!seg.built) build(fl, seg);
    };

    // ---- the rest while idle, nearest to the view first; never while a jump animates or the palette is hidden
    const idle = window.requestIdleCallback ?
        cb => window.requestIdleCallback(cb) :
        cb => setTimeout(() => cb({timeRemaining: () => 8, didTimeout: true}), 50);
    const shown = fl => {
        const group = fl.svgGroup_;
        if (!group || !group.isConnected || !fl.isVisible()) return false;
        const rect = group.getBoundingClientRect();
        return rect.width > 0 || rect.height > 0;
    };
    const schedule = fl => {
        if (fl.pmIdle_ || !fl.pmSegs_) return;
        fl.pmIdle_ = true;
        idle(deadline => {
            fl.pmIdle_ = false;
            if (!fl.pmSegs_ || !fl.workspace_) return;
            if (!fl.pmSegs_.some(s => !s.built)) return;
            // a jump animates (its end schedules again) or the palette is hidden (the next show does)
            if (fl.scrollTarget !== null && typeof fl.scrollTarget !== 'undefined') return;
            if (!shown(fl)) return;
            do {
                const top = fl.getScrollPos();
                const middle = top + viewHeight(fl) / 2;
                let best = null;
                let bestDistance = Infinity;
                for (const s of fl.pmSegs_) {
                    if (s.built) continue;
                    const distance = s.end < middle ? middle - s.end : Math.max(0, s.contentTop - middle);
                    if (distance < bestDistance) {
                        best = s;
                        bestDistance = distance;
                    }
                }
                if (!best) return;
                build(fl, best);
            } while (deadline.timeRemaining() > 4);
            schedule(fl);
        });
    };

    // ---- the palette's own show, category by category
    const originalShow = B.Flyout.prototype.show;
    const lazyShow = function (list) {
        const t0 = performance.now();
        stats.shows++;
        this.pmBusy_ = true;
        this.workspace_.setResizesEnabled(false);
        this.hide();
        this.setVisible(true);
        const segs = parse(this, list);
        const old = new Map((this.pmSegs_ || []).map(s => [s.key, s]));
        const reuse = this.recyclingEnabled_ !== false;
        for (const seg of segs) {
            const before = old.get(seg.key);
            seg.listeners = [];
            seg.items = [];
            seg.built = false;
            if (before) {
                old.delete(seg.key);
                // the label stays when it is the same
                if (before.label && reuse && before.labelSig === seg.labelSig) {
                    seg.label = before.label;
                    seg.labelListener = before.labelListener;
                } else if (before.label) {
                    if (before.labelListener) B.unbindEvent_(before.labelListener);
                    before.label.dispose();
                }
                const intact = before.built && (before.items || []).every(i => !i.block || alive(i.block));
                if (reuse && intact && !before.dirty && before.sig === seg.sig) {
                    seg.items = before.items;
                    seg.listeners = before.listeners;
                    seg.built = true;
                    seg.contentH = before.contentH;
                    seg.placedTop = before.contentTop;
                    for (const item of seg.items) if (item.block) item.block.pmLazySeg_ = seg;
                    stats.reused++;
                } else {
                    removeContent(this, before);
                }
            }
        }
        for (const gone of old.values()) {
            removeContent(this, gone);
            if (gone.label) {
                if (gone.labelListener) B.unbindEvent_(gone.labelListener);
                gone.label.dispose();
            }
        }
        // blocks nobody owns: put into the palette by someone else (addons reload it to redraw)
        for (const block of this.workspace_.getTopBlocks(false)) {
            if (!block.pmLazySeg_ || segs.indexOf(block.pmLazySeg_) < 0) block.dispose(false, false);
        }
        for (const node of this.backgroundButtons_) if (node && node.parentNode) node.parentNode.removeChild(node);
        this.backgroundButtons_.length = 0;
        this.workspace_.getPotentialVariableMap().clear();
        this.pmSegs_ = segs;

        // place labels, kept content and reserved space, top to bottom
        B.Events.disable();
        try {
            let y = this.MARGIN;
            for (const seg of segs) {
                seg.top = y;
                if (seg.labelItem) {
                    if (!seg.label) {
                        seg.label = createButton(this, seg.labelItem);
                        const holder = {listeners: []};
                        placeButton(this, holder, seg.label, y);
                        seg.labelListener = holder.listeners[0];
                    } else {
                        const width = this.getWidth() / this.workspace_.scale;
                        seg.label.moveTo(this.RTL ? width - this.MARGIN - seg.label.width : this.MARGIN, y);
                    }
                    y += seg.label.height + seg.labelItem.gap;
                }
                seg.contentTop = y;
                if (seg.built) {
                    if (seg.placedTop !== y) moveContent(seg, y - seg.placedTop);
                    this.pmRefreshCheckboxes_(seg);
                } else {
                    seg.contentH = seg.entries.length ? estimate(this, seg) : 0;
                    if (!seg.entries.length) seg.built = true;
                }
                y += seg.contentH;
                seg.end = y;
            }
            this.pmEnd_ = y;
        } finally {
            B.Events.enable();
        }
        syncButtons(this);

        this.listeners_.push(B.bindEvent_(this.svgBackground_, 'mouseover', this, function () {
            for (const block of this.workspace_.getTopBlocks(false)) block.removeSelect();
        }));
        this.workspace_.setResizesEnabled(true);
        this.reflow();
        this.position();
        this.reflowWrapper_ = this.reflow.bind(this);
        this.workspace_.addChangeListener(this.reflowWrapper_);
        if (!this.pmChangeListener_) {
            // a palette block changed after it was built (sprite position, a typed value, a mutation):
            // its category is built again next time instead of being kept
            this.pmChangeListener_ = e => {
                if (e.type !== B.Events.CHANGE || e.element === 'checkbox' || !this.workspace_) return;
                const block = this.workspace_.getBlockById(e.blockId);
                const seg = block && block.getRootBlock().pmLazySeg_;
                if (seg) seg.dirty = true;
            };
            this.workspace_.addChangeListener(this.pmChangeListener_);
        }
        this.recordCategoryScrollPositions_();
        this.pmBusy_ = false;
        ensureView(this);
        schedule(this);
        stats.lastShowMs = performance.now() - t0;
    };
    B.Flyout.prototype.show = function (list) {
        const lazy = this.parentToolbox_ && !this.horizontalLayout_ && this instanceof VF && Array.isArray(list) &&
            list.some(x => x && x.tagName && x.tagName.toUpperCase() === 'LABEL' &&
                x.getAttribute('category-label') === 'true');
        if (!lazy) {
            if (this.pmSegs_) {
                for (const seg of this.pmSegs_) {
                    removeContent(this, seg);
                    if (seg.label) {
                        if (seg.labelListener) B.unbindEvent_(seg.labelListener);
                        seg.label.dispose();
                    }
                }
                this.pmSegs_ = null;
                this.buttons_.length = 0;
            }
            return originalShow.call(this, list);
        }
        return lazyShow.call(this, list);
    };

    // monitor checkboxes of kept blocks show the current sprite's monitors (no event: nothing changed)
    VF.prototype.pmRefreshCheckboxes_ = function (seg) {
        for (const item of seg.items) {
            const cb = item.block && item.block.flyoutCheckbox;
            if (!cb) continue;
            const state = VF.getCheckboxState(item.block.id, item.block.inputList);
            if (cb.clicked === state) continue;
            cb.clicked = state;
            if (state) B.utils.addClass(cb.svgRoot, 'checked');
            else B.utils.removeClass(cb.svgRoot, 'checked');
        }
    };
    VF.prototype.pmBuildAll = function () {
        buildAll(this);
    };

    // the reserved space counts as content, so the scroll bar does not change while categories get built
    const originalBox = VF.prototype.getContentBoundingBox_;
    VF.prototype.getContentBoundingBox_ = function () {
        const box = originalBox.call(this);
        if (this.pmSegs_ && this.pmEnd_ > box.y + box.height) box.height = this.pmEnd_ - box.y;
        return box;
    };

    // scrolling: build what comes into view; during a jump animation only its target (built before it starts)
    const originalSetMetrics = VF.prototype.setMetrics_;
    VF.prototype.setMetrics_ = function (ratio) {
        originalSetMetrics.call(this, ratio);
        if (!this.pmSegs_ || this.pmBusy_) return;
        if (this.scrollTarget !== null && typeof this.scrollTarget !== 'undefined') {
            if (!this.pmAfterJump_) {
                this.pmAfterJump_ = true;
                const check = () => {
                    if (!this.pmSegs_ || !this.workspace_) {
                        this.pmAfterJump_ = false;
                        return;
                    }
                    if (this.scrollTarget !== null && typeof this.scrollTarget !== 'undefined') {
                        requestAnimationFrame(check);
                        return;
                    }
                    this.pmAfterJump_ = false;
                    ensureView(this);
                    schedule(this);
                };
                requestAnimationFrame(check);
            }
            return;
        }
        ensureView(this);
    };

    // a category click: build the category and what will be visible with it, then jump
    const originalScrollTo = VF.prototype.scrollTo;
    VF.prototype.scrollTo = function (position) {
        if (this.pmSegs_ && !this.pmBusy_) {
            const target = this.pmSegs_.find(s => s.label && Math.abs(s.top - position) < 0.5);
            const top = () => {
                const at = target ? target.top : position;
                // at the end of the palette the view stops early and shows the categories above the target
                const metrics = this.getMetrics_();
                const last = metrics ? (metrics.contentHeight - metrics.viewHeight) / this.workspace_.scale : at;
                return Math.max(0, Math.min(at, last));
            };
            ensure(this, top, 20);
            if (target) position = target.top;
        }
        return originalScrollTo.call(this, position);
    };

    B.pmLazyPalette = {stats, buildAll, store: () => store};
}

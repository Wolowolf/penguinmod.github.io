// Category drag, part of the editor (was the addon "Draggable Categories in Block Palette" by SharkPool).
// Hold a box of the category menu for half a second, then drag it up or down: the held box follows the
// mouse and the others slide out of its way. The order is stored in a comment on the Stage (updated on
// every save) and is forgotten when a project without such a comment is opened.

const COMMENT_TRAPPER_ID = '--Category_Order_ADDON-config';
const ROW_SELECTOR = 'div[class*="scratchCategoryMenuRow"]';
const TOOLBOX_SELECTOR = 'div[class*="blocklyToolboxDiv"]';
const SOUP = '!#%()*+,-./:;=?@[]^_`{|}~ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

const STYLE = `
div[class="scratchCategoryMenuRow"][data-dragger="true"] > div {
    background: white;
    font-size: 0.65rem;
}
[theme="dark"] div[class="scratchCategoryMenuRow"][data-dragger="true"] > div {
    background: var(--ui-secondary);
}`;

const attached = new WeakSet();

const genUID = () => {
    const id = [];
    for (let i = 0; i < 20; i++) {
        id[i] = SOUP.charAt(Math.random() * SOUP.length);
    }
    return id.join('');
};

const extractCategoryID = classList => {
    for (const text of classList) {
        if (text.startsWith('scratchCategoryId-')) return text.replace('scratchCategoryId-', '');
    }
    return undefined;
};

const attachCategoryDrag = (ScratchBlocks, vm) => {
    if (attached.has(ScratchBlocks)) return;
    attached.add(ScratchBlocks);

    let categoryOrdering;

    const style = document.createElement('style');
    style.textContent = STYLE;
    document.head.appendChild(style);

    const createSep = () => {
        const sep = document.createElement('sep');
        sep.setAttribute('gap', '36');
        return sep;
    };

    // the menu is filled in the stored order: <sep> + <category> + <sep> + ... + <category> + <sep>
    const ogPopulate = ScratchBlocks.Toolbox.CategoryMenu.prototype.populate;
    ScratchBlocks.Toolbox.CategoryMenu.prototype.populate = function (...args) {
        if (!categoryOrdering) {
            ogPopulate.call(this, ...args);
            return;
        }

        const toolboxXml = args[0];
        const categories = Array.from(toolboxXml.children).filter(e => e.tagName === 'category');
        categories.sort((a, b) => {
            const aIndex = categoryOrdering.indexOf(a.getAttribute('id'));
            const bIndex = categoryOrdering.indexOf(b.getAttribute('id'));
            return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
        });

        while (toolboxXml.firstChild) toolboxXml.removeChild(toolboxXml.firstChild);
        toolboxXml.appendChild(createSep());
        categories.forEach(cat => {
            toolboxXml.appendChild(cat);
            toolboxXml.appendChild(createSep());
        });

        ogPopulate.call(this, ...args);
    };

    // the order is returned as the text of the comment's data line, or undefined (or true / false when
    // only the existence of the comment is asked)
    const findOrderingComment = optParse => {
        const stageTarget = vm.runtime.getTargetForStage();
        if (!stageTarget) return undefined;

        const comment = Object.values(stageTarget.comments).find(c => c.text.endsWith(COMMENT_TRAPPER_ID));
        if (!comment) return optParse ? undefined : false;
        if (!optParse) return true;

        const dataLine = comment.text.split('\n').find(i => i.endsWith(COMMENT_TRAPPER_ID));
        if (!dataLine) return undefined;
        return dataLine.substr(0, dataLine.length - COMMENT_TRAPPER_ID.length);
    };

    // keeps the stored comment up to date
    const updateOrderingComment = () => {
        const stageTarget = vm.runtime.getTargetForStage();
        if (!stageTarget) return;
        for (const comment of Object.values(stageTarget.comments)) {
            if (!comment.text.endsWith(COMMENT_TRAPPER_ID)) continue;
            const lines = comment.text.split('\n');
            const dataLine = lines.findIndex(line => line.endsWith(COMMENT_TRAPPER_ID));
            lines[dataLine] = JSON.stringify(categoryOrdering) + COMMENT_TRAPPER_ID;
            comment.text = lines.join('\n');
            return;
        }
    };

    const saveOrdering = () => {
        if (findOrderingComment()) {
            updateOrderingComment();
            return;
        }

        const stageTarget = vm.runtime.getTargetForStage();
        if (!stageTarget) return;

        const text = `Configuration for 'Category Ordering'\nYou can move, resize, and minimize this comment, but don't edit it by hand. This comment can be deleted to remove the stored settings.\n${JSON.stringify(categoryOrdering)}${COMMENT_TRAPPER_ID}`;
        stageTarget.createComment(genUID(), null, text, 50, 50, 350, 170, false);
        vm.runtime.emitProjectChanged();
    };

    const ogSaveJSON = vm.toJSON;
    vm.toJSON = function (...args) {
        if (categoryOrdering !== undefined) saveOrdering();
        return ogSaveJSON.call(this, ...args);
    };

    const forceRefreshToolbox = () => {
        const workspace = ScratchBlocks.getMainWorkspace();
        const toolbox = workspace.getToolbox();
        if (!toolbox) return;
        const categoryMenu = toolbox.categoryMenu_;
        if (!categoryMenu) return;
        if (categoryMenu.secondTable) return;

        categoryMenu.dispose();
        categoryMenu.createDom();
        toolbox.populate_(workspace.options.languageTree);
        toolbox.position();
    };

    const compileNewOrder = htmlCategoryList => {
        const orderedIDs = [];
        for (const cat of htmlCategoryList) {
            const id = extractCategoryID(cat.firstChild.classList);
            if (id) orderedIDs.push(id);
        }
        categoryOrdering = orderedIDs;
    };

    vm.runtime.on('PROJECT_LOADED', () => {
        const storedOrder = findOrderingComment(true);
        if (storedOrder) {
            try {
                categoryOrdering = JSON.parse(storedOrder);
                setTimeout(forceRefreshToolbox, 100);
            } catch {
                // Blockly might not be available, wait until it is
                vm.once('workspaceUpdate', () => {
                    try {
                        categoryOrdering = JSON.parse(storedOrder);
                        setTimeout(forceRefreshToolbox, 100);
                    } catch {
                        // not a stored order
                    }
                });
            }
            return;
        }

        // a project without a stored order must not keep the previous project's order. The menu's XML
        // is sorted in place, so rebuild the menu from the editor's own untouched copy of it.
        if (categoryOrdering === undefined) return;
        categoryOrdering = undefined;
        setTimeout(() => {
            const workspace = ScratchBlocks.getMainWorkspace();
            const toolboxXML = window.ReduxStore.getState().scratchGui.toolbox.toolboxXML;
            if (workspace && toolboxXML) workspace.updateToolbox(toolboxXML);
        }, 100);
    });

    // the held category box slides up and down, the others slide out of its way
    const initSlideDrag = (clickEvent, blocklyToolboxDiv) => {
        const draggedCat = clickEvent.target.closest('div[class="scratchCategoryMenuRow"]');
        if (!draggedCat) return;

        const rows = Array.from(blocklyToolboxDiv.querySelectorAll(ROW_SELECTOR));
        const from = rows.indexOf(draggedCat);
        if (from === -1) return;
        const last = rows.length - 1;

        // Positions are measured once, in "scrolled content" coordinates, before anything moves.
        const contentOrigin = () => blocklyToolboxDiv.getBoundingClientRect().top - blocklyToolboxDiv.scrollTop;
        const tops = rows.map(row => row.getBoundingClientRect().top - contentOrigin());
        const heights = rows.map(row => row.getBoundingClientRect().height);
        // how far the boxes below move when this box is taken out: its height plus the gap
        const pitch = rows.map((row, i) => (i < last ?
            tops[i + 1] - tops[i] :
            heights[i] + (parseFloat(getComputedStyle(row).marginBottom) || 0)));
        const minShift = tops[0] - tops[from];
        const maxShift = tops[last] + heights[last] - tops[from] - heights[from];

        const startY = clickEvent.clientY - contentOrigin();
        let mouseY = clickEvent.clientY;
        let target = from;
        let frame = 0;

        draggedCat.style.position = 'relative';
        draggedCat.style.zIndex = '2';
        for (const row of rows) {
            if (row !== draggedCat) row.style.transition = 'transform 0.15s ease';
        }

        const tick = () => {
            // scroll the menu when the box is held near its top or bottom edge
            const bounds = blocklyToolboxDiv.getBoundingClientRect();
            if (mouseY < bounds.top + 40) {
                blocklyToolboxDiv.scrollTop -= 6;
            } else if (mouseY > bounds.bottom - 40) {
                blocklyToolboxDiv.scrollTop += 6;
            }

            // the held box follows the mouse up and down, but stays inside the menu
            const shift = Math.max(minShift, Math.min(maxShift, mouseY - contentOrigin() - startY));
            draggedCat.style.transform = `translateY(${shift}px)`;

            // its new place = how many other boxes have their middle above its middle
            const middle = tops[from] + (heights[from] / 2) + shift;
            let place = 0;
            rows.forEach((row, i) => {
                if (i !== from && tops[i] + (heights[i] / 2) < middle) place++;
            });
            // the box can only reach the middle of the first / last box, not pass it, so
            // being pushed against the top or bottom end of the menu means the first / last place
            if (shift <= minShift + 1) place = 0;
            if (shift >= maxShift - 1) place = last;
            target = place;

            // boxes it has passed slide by one box height, the others stay where they are
            rows.forEach((row, i) => {
                if (i === from) return;
                let move = 0;
                if (target > from && i > from && i <= target) move = -pitch[from];
                if (target < from && i >= target && i < from) move = pitch[from];
                row.style.transform = move ? `translateY(${move}px)` : '';
            });

            frame = requestAnimationFrame(tick);
        };

        const onMouseMove = moveEvent => {
            mouseY = moveEvent.clientY;
        };
        const stopSelecting = selectEvent => selectEvent.preventDefault();
        const onMouseUp = () => {
            cancelAnimationFrame(frame);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('selectstart', stopSelecting);
            for (const row of rows) {
                row.style.transition = '';
                row.style.transform = '';
            }
            draggedCat.style.position = '';
            draggedCat.style.zIndex = '';

            // moved to a new place: save the new order and rebuild the menu
            if (target !== from) {
                const id = extractCategoryID(draggedCat.firstChild.classList);
                draggedCat.parentNode.insertBefore(draggedCat, target > from ? rows[target].nextSibling : rows[target]);
                compileNewOrder(blocklyToolboxDiv.querySelectorAll(ROW_SELECTOR));
                vm.runtime.emitProjectChanged(); // the project now has unsaved changes
                setTimeout(() => {
                    forceRefreshToolbox();
                    if (id) ScratchBlocks.mainWorkspace.toolbox_.setSelectedCategoryById(id);
                }, 100);
            }
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('selectstart', stopSelecting);
        frame = requestAnimationFrame(tick);
    };

    // a long (500 ms) press starts the drag, so selecting a category by a click stays a click
    document.addEventListener('mousedown', e => {
        const blocklyToolboxDiv = e.target.closest && e.target.closest(TOOLBOX_SELECTOR);
        if (!blocklyToolboxDiv) return;
        const longPressTimer = setTimeout(() => initSlideDrag(e, blocklyToolboxDiv), 500);
        const cancel = () => clearTimeout(longPressTimer);

        document.addEventListener('mouseup', cancel, {once: true});
        document.addEventListener('mouseleave', cancel, {once: true});
    });
};

export default attachCategoryDrag;

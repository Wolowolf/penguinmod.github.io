// Toolbox Category Drag
// By: SharkPool
export default async function ({ addon }) {
    // wait for scratchblocks to be defined
    await addon.tab.traps.getBlockly();

    const COMMENT_TRAPPER_ID = "--Category_Order_ADDON-config";
    const soup = "!#%()*+,-./:;=?@[]^_`{|}~ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    
    let categoryOrdering = undefined;
    
    const genUID = () => {
        const id = [];
        for (let i = 0; i < 20; i++) {
            id[i] = soup.charAt(Math.random() * soup.length);
        }
        return id.join("");
    }
    
    const createSep = () => {
        const sep = document.createElement("sep");
        sep.setAttribute("gap", "36");
        return sep;
    };
    
    const extractCategoryID = (classList) => {
        for (const text of classList) {
            if (text.startsWith("scratchCategoryId-")) return text.replace("scratchCategoryId-", "");
        }
        return undefined;
    }
    
    const ogPopulate = ScratchBlocks.Toolbox.CategoryMenu.prototype.populate;
    ScratchBlocks.Toolbox.CategoryMenu.prototype.populate = function (...args) {
        if (!categoryOrdering) {
            ogPopulate.call(this, ...args);
            return;
        }
        
        const toolboxXml = args[0];
        const children = Array.from(toolboxXml.children);
        const categories = children.filter(e => e.tagName === "category");
        
        /* sort categories based on categoryOrdering */
        categories.sort((a, b) => {
            const aIndex = categoryOrdering.indexOf(a.getAttribute("id"));
            const bIndex = categoryOrdering.indexOf(b.getAttribute("id"));
            return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
        });
        
        while (toolboxXml.firstChild) toolboxXml.removeChild(toolboxXml.firstChild);
        
        /* <sep> + <category> + <sep> + ... + <category> + <sep> */
        toolboxXml.appendChild(createSep());
        categories.forEach((cat) => {
            toolboxXml.appendChild(cat);
            toolboxXml.appendChild(createSep());
        });
        
        ogPopulate.call(this, ...args);
    };
    
    const ogSaveJSON = vm.toJSON;
    vm.toJSON = function (...args) {
        if (categoryOrdering !== undefined) saveOrdering();
        return ogSaveJSON.call(this, ...args);
    }
    
    vm.runtime.on("PROJECT_LOADED", () => {
        const storedOrder = findOrderingComment(true);
        if (storedOrder) {
            try {
                categoryOrdering = JSON.parse(storedOrder);
                setTimeout(forceRefreshToolbox, 100);
            } catch {
                // Blockly might not be availiable, wait until it is
                vm.once("workspaceUpdate", () => {
                    try {
                        categoryOrdering = JSON.parse(storedOrder);
                        setTimeout(forceRefreshToolbox, 100);
                    } catch {}
                });
            }
        }
    });
    
    function findOrderingComment(optParse) {
        const stageTarget = vm.runtime.getTargetForStage();
        if (!stageTarget) return undefined;
        
        let configComment;
        const comments = Object.values(stageTarget.comments);
        for (const comment of comments) {
            if (comment.text.endsWith(COMMENT_TRAPPER_ID)) {
                configComment = comment.text;
                break;
            }
        }
        
        if (configComment) {
            if (!optParse) return true;

            const dataLine = configComment.split("\n").find(i => i.endsWith(COMMENT_TRAPPER_ID));
            if (!dataLine) return undefined;
            return dataLine.substr(0, dataLine.length - COMMENT_TRAPPER_ID.length);
        }
        return optParse ? undefined : false;
    }
    
    function saveOrdering() {
        if (findOrderingComment()) { pmUpdateOrderingComment(); return; }
        
        const stageTarget = vm.runtime.getTargetForStage();
        if (!stageTarget) return;
        
        const text = `Configuration for 'Category Ordering' Addon\nYou can move, resize, and minimize this comment, but don't edit it by hand. This comment can be deleted to remove the stored settings.\n${JSON.stringify(categoryOrdering)}${COMMENT_TRAPPER_ID}`;
        stageTarget.createComment(genUID(), null, text, 50, 50, 350, 170, false);
        vm.runtime.emitProjectChanged();
    }
    
    function compileNewOrder(htmlCategoryList) {
        const orderedIDs = [];
        for (const cat of htmlCategoryList) {
            const id = extractCategoryID(cat.firstChild.classList);
            if (id) orderedIDs.push(id);
        }
        categoryOrdering = orderedIDs;
    }
    
    function forceRefreshToolbox() {
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
    }
    
    function initDragDroper(clickEvent, blocklyToolboxDiv) {
        const draggedCat = clickEvent.target.closest(`div[class="scratchCategoryMenuRow"]`);
        if (!draggedCat) return;
        
        const categoryList = blocklyToolboxDiv.querySelectorAll(`div[class*="scratchCategoryMenuRow"]`);
        
        const rect = draggedCat.getBoundingClientRect();
        const generalHeight = rect.height;
        const offsetX = clickEvent.clientX - rect.left;
        const offsetY = clickEvent.clientY - rect.top;
        
        const dragger = draggedCat.cloneNode(true);
        draggedCat.style.opacity = 0.5;
        
        dragger.setAttribute("style", `position: absolute; z-index: 99999; left: ${rect.left}px; top: ${rect.top}px; width: ${rect.width}px; pointer-events: none;`);
        dragger.firstChild.setAttribute("style", `box-shadow: #000 5px 5px 10px; border-radius: 8px;`);
        dragger.dataset.dragger = true;
        document.body.appendChild(dragger);
        
        let lastHovered = null;
        
        const onMouseMove = (moveEvent) => {
            /* drag visual */
            const newLeft = moveEvent.clientX - offsetX;
            const newTop = moveEvent.clientY - offsetY;
            dragger.style.left = `${newLeft}px`;
            dragger.style.top = `${newTop}px`;
            
            // auto scroll if dragger is near the top/bottom
            const scrollZoneSize = 40;
            const bounds = blocklyToolboxDiv.getBoundingClientRect();
            
            if (moveEvent.clientY < bounds.top + scrollZoneSize) {
                blocklyToolboxDiv.scrollTop -= 4;
            } else if (moveEvent.clientY > bounds.bottom - scrollZoneSize) {
                blocklyToolboxDiv.scrollTop += 4;
            }
            
            // check if we are near any category
            // if so, bump down everything below the dragger
            let target;
            for (const cat of categoryList) {
                if (cat === draggedCat) continue;
                const catRect = cat.getBoundingClientRect();
                const midpointY = catRect.top + catRect.height / 2;
                const midpointX = catRect.left + catRect.width / 2;
                
                const xDist = Math.abs(moveEvent.clientX - midpointX);
                const yCheck = moveEvent.clientY < midpointY;
                if (yCheck && xDist < 100) {
                    target = cat;
                    break;
                }
            }
            
            for (const cat of categoryList) cat.style.transform = "";
            if (target) {
                lastHovered = target;
                let shifter = target;
                while (shifter) {
                    if (shifter === draggedCat) return;
                    shifter.style.transform = `translateY(${generalHeight}px)`;
                    shifter = shifter.nextSibling;
                }
            } else {
                lastHovered = null;
            }
        };
        const onMouseUp = () => {
            /* cleanup */
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
            for (const cat of categoryList) cat.style.transform = "";
            draggedCat.style.opacity = "";
            dragger.remove();
            
            // if the category drag was valid, move the category
            if (lastHovered) {
                const id = extractCategoryID(draggedCat.firstChild.classList);
                draggedCat.parentNode.insertBefore(draggedCat, lastHovered);
                
                const newCatList = blocklyToolboxDiv.querySelectorAll(`div[class*="scratchCategoryMenuRow"]`);
                compileNewOrder(newCatList);
                setTimeout(() => {
                    forceRefreshToolbox();
                    if (id) ScratchBlocks.mainWorkspace.toolbox_.setSelectedCategoryById(id);
                }, 100);
            }
        };
        
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    }

    // PMDESKTOP_STAGE_PATCH: the held category box slides up and down, the others slide out of its way
    function pmInitSlideDrag(clickEvent, blocklyToolboxDiv) {
        const rowSelector = 'div[class*="scratchCategoryMenuRow"]';
        const draggedCat = clickEvent.target.closest('div[class="scratchCategoryMenuRow"]');
        if (!draggedCat) return;

        const rows = Array.from(blocklyToolboxDiv.querySelectorAll(rowSelector));
        const from = rows.indexOf(draggedCat);
        if (from === -1) return;
        const last = rows.length - 1;

        // Positions are measured once, in "scrolled content" coordinates, before anything moves.
        const contentOrigin = () => blocklyToolboxDiv.getBoundingClientRect().top - blocklyToolboxDiv.scrollTop;
        const tops = rows.map(row => row.getBoundingClientRect().top - contentOrigin());
        const heights = rows.map(row => row.getBoundingClientRect().height);
        // how far the boxes below move when this box is taken out: its height plus the gap
        const pitch = rows.map((row, i) => i < last ?
            tops[i + 1] - tops[i] :
            heights[i] + (parseFloat(getComputedStyle(row).marginBottom) || 0));
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
            draggedCat.style.transform = 'translateY(' + shift + 'px)';

            // its new place = how many other boxes have their middle above its middle
            const middle = tops[from] + heights[from] / 2 + shift;
            let place = 0;
            rows.forEach((row, i) => {
                if (i !== from && tops[i] + heights[i] / 2 < middle) place++;
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
                row.style.transform = move ? 'translateY(' + move + 'px)' : '';
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

            // moved to a new place: save the new order and rebuild the menu (as the addon does)
            if (target !== from) {
                const id = extractCategoryID(draggedCat.firstChild.classList);
                draggedCat.parentNode.insertBefore(draggedCat, target > from ? rows[target].nextSibling : rows[target]);
                compileNewOrder(blocklyToolboxDiv.querySelectorAll(rowSelector));
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
    }

    // PMDESKTOP_STAGE_PATCH: the order is stored in a comment on the Stage; keep that comment up to date
    function pmUpdateOrderingComment() {
        const stageTarget = vm.runtime.getTargetForStage();
        if (!stageTarget) return;
        for (const comment of Object.values(stageTarget.comments)) {
            if (!comment.text.endsWith(COMMENT_TRAPPER_ID)) continue;
            const lines = comment.text.split("\n");
            const dataLine = lines.findIndex(line => line.endsWith(COMMENT_TRAPPER_ID));
            lines[dataLine] = JSON.stringify(categoryOrdering) + COMMENT_TRAPPER_ID;
            comment.text = lines.join("\n");
            return;
        }
    }

    // PMDESKTOP_STAGE_PATCH: opening a project that has no stored order must not keep the previous project's
    // order. The addon sorts the menu's XML in place, so rebuild the menu from the editor's own
    // untouched copy of it (the same call the editor makes when its toolbox changes).
    vm.runtime.on("PROJECT_LOADED", () => {
        if (categoryOrdering === undefined || findOrderingComment(true)) return;
        categoryOrdering = undefined;
        setTimeout(() => {
            const workspace = ScratchBlocks.getMainWorkspace();
            const toolboxXML = ReduxStore.getState().scratchGui.toolbox.toolboxXML;
            if (workspace && toolboxXML) workspace.updateToolbox(toolboxXML);
        }, 100);
    });

    function activateBlocklyListener() {
        /* Check for Long (500ms) Presses to not confuse with Selecting Categories */
        const blocklyToolboxDiv = document.querySelector(`div[class*="blocklyToolboxDiv"`);
        if (!blocklyToolboxDiv) return;
        blocklyToolboxDiv.addEventListener("mousedown", (e) => {
            const longPressTimer = setTimeout(() => pmInitSlideDrag(e, blocklyToolboxDiv), 500);
            const cancel = () => clearTimeout(longPressTimer);

            document.addEventListener("mouseup", cancel, { once: true });
            document.addEventListener("mouseleave", cancel, { once: true });
        });
    }

    let wasInEditor, inEditor;
    ReduxStore.subscribe(() => {
        const state = ReduxStore.getState().scratchGui;

        wasInEditor = inEditor;
        inEditor = !state.mode.isPlayerOnly;
        if (inEditor && !wasInEditor) {
            wasInEditor = inEditor;
            queueMicrotask(activateBlocklyListener);
        }
    });
}

// Better Comments, part of the editor (was SharkPool's "Better Comments" extension V.2.0.14, MIT
// licence). Every comment in the code area shows its text with simple formatting (see HELP_TEXT)
// until it is clicked, and gets buttons to change its colour, opacity and font. The look is saved on
// the comment itself (`comment.style` in the VM, saved in the project file); projects saved with the
// old extension get their comment styles from its data when they are loaded (VM `sb3.js`).

const colorIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCIgaGVpZ2h0PSIyMCIgd2lkdGg9IjIwIj48cGF0aCBkPSJtMTQuMDQ1IDkuNjkzLS4wMTQtLjAxNGMtLjU5MS0uMzE1LTEuNTE0LS45ODktMi42MS0yLjA3OGExMyAxMyAwIDAgMS0uODc5LS45NDZsLjUyLS42NDVjLjMxNi4yNTguNjYyLjU3MyAxLjAyMy45MzIuMjMuMjI5LjQxOC40My42MDUuNjNhLjYuNiAwIDAgMCAuMTMuMTNjLjgwNy45MTcgMS4yODMgMS42NjIgMS40OTkgMi4wOTIgMCAuMDE0LjAxNC4wMjguMDE0LjA0My0uMDg2LS4wNDMtLjE4Ny0uMDg2LS4yODgtLjE0NG0tMy40NDUuMzczYy0uODY1LjQ3My0xLjY4Ny45MTctMi45ODQuNjE2LTEuNDQyLS4zMy0yLjEzMy0uOTE3LTIuNDIyLTEuMjZsMy4xMTQtNC4wMTRjLjIxNi40My41MzMuODc0Ljg2NSAxLjI5LS4zNDYuNTE2LS42Mi45NDYtLjc1IDEuMTQ3YS41NC41NCAwIDAgMCAuMTg4LjczLjUuNSAwIDAgMCAuMjczLjA4N2MuMTg4IDAgLjM2LS4xLjQ2Mi0uMjU4LjE1OC0uMjczLjM0Ni0uNTYuNTQ4LS44NDYuMzAyLjM0NC41NzYuNjE2Ljc2NC44MDMuNDE4LjQxNS44MzYuNzg4IDEuMjQgMS4xMTgtLjQ3Ni4xMjgtLjg5NC4zNzItMS4yOTguNTg3bS0uMzktNC43M2MtLjExNS4xNTgtLjI0NC4zMTYtLjM2LjQ1OS0uMzQ2LS40NTktLjU2Mi0uODMxLS42NzctMS4wOS4yNDUuMTAxLjU5LjMxNiAxLjAzOC42MzFtMy4zLTEuMjYxYy4xNiAwIC4zMzIuMDI5LjM2MS4xLjE3My4zMTYtLjI0NSAxLjMxOS0uODA3IDIuMjIybC0uMjE2LS4yMTVjLS4yMzEtLjIzLS42Mi0uNTg4LTEuMDY3LS45NzUuNjYzLS42NzMgMS4yNjgtMS4xMzIgMS43My0xLjEzMm0zLjA0MSA4LjA4NGE0LjcgNC43IDAgMCAwLS45NjUtMS40OS44LjggMCAwIDAtLjE2LS4xNDRjLjI0Ni0uNTMtLjE1OC0xLjI5LS41MDQtMS44MzVhMTAuNiAxMC42IDAgMCAwLTEuMDk1LTEuNDQ3Yy41NjItLjg2IDEuNTI4LTIuNTY2IDEuMDA5LTMuNTctLjE1OS0uMy0uNTE5LS42NzMtMS4zMjYtLjY3M2gtLjAxNWMtLjgyMSAwLTEuNzMuNjYtMi41NTEgMS41Mi0uOTIzLS42NzQtMS45MzItMS4yMDUtMi41MzctLjg2LS4wNTguMDI4LS4xMy4wNTctLjE3My4xMTQtLjAxNS4wMTQtLjA0My4wMjktLjA1OC4wNTdhLjIuMiAwIDAgMC0uMDQzLjA1OGwtLjAxNS4wMjhMNC4xMjggOS4wNWMtLjAxNSAwLS4wMTUgMC0uMDMuMDE0bC0uODkzIDEuMTYtLjA0My4wNDRhLjQuNCAwIDAgMC0uMDg3LjE0M3YuMDE0Yy0uNDQ3LjkxOCAxLjIxMSAyLjcxIDEuOTkgMy40OTguNjkxLjY4OCAyLjIyIDIuMDc4IDMuMTcgMi4wNzhhLjcuNyAwIDAgMCAuNTA1LS4xODZsNS41MjEtNC4yNTdjLjAzLS4wMTUuMDQ0LS4wNDMuMDcyLS4wNzIuMDMuMDI5LjA0NC4wNzIuMDU4LjEuMTczLjM0NC4yODguNzAzLjMwMyAxLjA5YTQuNiA0LjYgMCAwIDEtLjA0MyAxLjE3NXYuMDE0YTEuMyAxLjMgMCAwIDAgMCAuMzMgMS4xODEgMS4xODEgMCAwIDAgMi4zMzUtLjM1OGMtLjA4Ny0uNTYtLjIwMi0xLjEzMy0uNDMzLTEuNjc3IiBmaWxsPSIjNTc1RTc1IiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=';
const fontIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMi4xNzQiIGhlaWdodD0iMzIuNjY2IiB2aWV3Qm94PSIwIDAgMzIuMTc0IDMyLjY2NiI+PHRleHQgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNC4xMjIgMTQuMjIpc2NhbGUoLjMyNjc4KSIgZm9udC1zaXplPSI0MCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgZmlsbD0iIzU3NWU3NSIgc3Ryb2tlPSIjNTc1ZTc1IiBzdHJva2Utd2lkdGg9IjEuNSIgZm9udC1mYW1pbHk9IlNhbnMgU2VyaWYiIGZvbnQtd2VpZ2h0PSI0MDAiPjx0c3BhbiB4PSIwIiBkeT0iMCI+QTwvdHNwYW4+PC90ZXh0Pjx0ZXh0IHRyYW5zZm9ybT0idHJhbnNsYXRlKDEzLjEyMiAyMC43MilzY2FsZSguMjgzNDgpIiBmb250LXNpemU9IjQ1IiB4bWw6c3BhY2U9InByZXNlcnZlIiBmaWxsPSIjNTc1ZTc1IiBzdHJva2U9IiM1NzVlNzUiIHN0cm9rZS13aWR0aD0iMS40IiBmb250LWZhbWlseT0iQ29taWMgU2FucyBNcyIgZm9udC13ZWlnaHQ9IjQwMCI+PHRzcGFuIHg9IjAiIGR5PSIwIj5CPC90c3Bhbj48L3RleHQ+PHRleHQgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTkuNjIyIDI3LjcyKXNjYWxlKC4zMjE4MykiIGZvbnQtc2l6ZT0iNDAiIHhtbDpzcGFjZT0icHJlc2VydmUiIGZpbGw9IiM1NzVlNzUiIHN0cm9rZT0iIzU3NWU3NSIgc3Ryb2tlLXdpZHRoPSIxLjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC13ZWlnaHQ9IjQwMCI+PHRzcGFuIHg9IjAiIGR5PSIwIj5DPC90c3Bhbj48L3RleHQ+PHBhdGggZD0iTTAgMzIuNjY2Vi40OTJoMzIuMTc0djMyLjE3NHoiIGZpbGw9Im5vbmUiLz48L3N2Zz4=';
const helpIcon = `data:image/svg+xml;utf8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20">' +
    '<text x="10" y="15" text-anchor="middle" font-family="Arial" font-weight="700" font-size="14" ' +
    'fill="#575E75">?</text></svg>'
)}`;

const HELP_TEXT = [
    'Comment formatting\n',
    'Can be inlined:',
    'Bold → **text**', 'Italic → */text*/', 'Strike → ~~text~~',
    'Header 1 → #1text#1', 'Header 2 → #2text#2\n',
    'Cannot be inlined:',
    'Color → @c #ff0000: text@c', 'Highlight → @h #00ff00: text@h', 'Font → @f name: text@f',
    'Image → <i url i>', 'Audio → <a url a>', 'Video → <v url v>\n',
    'Click a comment to edit its text.'
].join('\n');

const markdownConsts = {
    '**': 'b', '*/': 'i', '~~': 's', '#1': 'h1', '#2': 'h2',
    '@c': 'span style="color: ---"', '@h': 'span style="background-color: ---"', '@f': 'span style="font-family: ---"',
    '<i': 'img', '<a': 'audio', '<v': 'video'
};

const xmlEscape = unsafe => String(unsafe).replace(/[&'"]/g, c => {
    switch (c) {
    case '&': return '&amp;';
    case '\'': return '&apos;';
    default: return '&quot;';
    }
});

// comment text -> HTML (same rules as the extension)
const txt2md = text => {
    const mdCache = [];
    let md = '';
    const txt = xmlEscape(text);
    for (let i = 0; i < txt.length; i++) {
        const lett = txt[i];
        const code = `${lett}${txt[i + 1]}`;
        if (!markdownConsts[code]) {
            md += lett === '<' ? '&lt;' : (lett === '>' ? '&gt;' : lett);
            continue;
        }
        const form = markdownConsts[code];
        const cacheInd = mdCache.indexOf(form);
        if (cacheInd === -1) {
            if (code === '@c' || code === '@h' || code === '@f') {
                const testString = txt.substring(i + 2, txt.length);
                const ind = testString.indexOf(':');
                if (testString.indexOf(code) > -1 && ind) {
                    const value = testString.substring(0, ind).replace(/[<>]/g, '');
                    md += `<${form.replace('---', value)}>`;
                    mdCache.push(form);
                    i += ind + 1;
                } else {
                    md += code;
                }
            } else if (form === 'img' || form === 'audio' || form === 'video') {
                const testString = txt.substring(i + 2, txt.length);
                const ind = testString.indexOf(`${form[0]}>`);
                if (ind === -1) {
                    md += `&lt;${form[0]}`;
                } else {
                    const src = testString.substring(0, ind).trim()
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;');
                    md += `<${form} width="auto" height="auto" ${form === 'img' ? '' : 'controls'} ` +
                        `crossorigin="Anonymous" src="${src}">`;
                    if (form !== 'img') md += `</${form}>`;
                    i += ind + 2;
                }
            } else {
                md += `<${form}>`;
                mdCache.push(form);
            }
        } else {
            md += `</${form}>`;
            mdCache.splice(cacheInd, 1);
        }
        i++;
    }
    // unclosed formatting: show the characters as they were typed
    const mdConstVals = Object.entries(markdownConsts);
    for (const form of mdCache) {
        const oldForm = (mdConstVals.find(([, v]) => v === form) || [])[0];
        const item = `<${form.replace(/---.*$/, '')}`;
        const lastInd = md.lastIndexOf(item);
        if (lastInd === -1) continue;
        const end = md.indexOf('>', lastInd);
        md = md.substring(0, lastInd) + oldForm + md.substring(end + 1);
    }
    return md.replace(/\n/g, '<br>');
};

const colorDarken = (hex, amt) => {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(char => char + char).join('');
    const bigint = parseInt(h.slice(0, 6), 16);
    return `#${[(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255]
        .map(part => Math.round(part * (1 - amt)).toString(16)
            .padStart(2, '0'))
        .join('')}`;
};

// "rgb(1, 2, 3)" -> "#010203" (for the starting values of the dialogs)
const cssToHex = (css, fallback) => {
    const m = /rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/.exec(css || '');
    if (!m) return fallback;
    return `#${m.slice(1, 4).map(n => Number(n).toString(16)
        .padStart(2, '0'))
        .join('')}`;
};

const createInputLabel = (id, labelText, includeMargins, optStyles) => {
    const label = document.createElement('label');
    label.setAttribute('for', id);
    label.textContent = labelText;
    label.setAttribute('style', `display: block; font-weight: 700;${optStyles || ''}`);
    if (!includeMargins) {
        label.style.marginTop = '10px';
        label.style.marginBottom = '-15px';
    }
    return label;
};

const createInput = (id, type, value, includePad, optStyles) => {
    const input = document.createElement('input');
    input.setAttribute('type', type);
    input.setAttribute('id', id);
    input.setAttribute('name', id);
    input.setAttribute('style', 'background: radial-gradient(#fff 50%, #b3b3b3); border: 2px solid white; ' +
        `width: 150px; text-align: center; border-radius: 8px; color: #000;${optStyles || ''}`);
    if (!includePad) input.style.padding = '2px';
    input[type === 'checkbox' ? 'checked' : 'value'] = value;
    return input;
};

const createSelect = (id, options, value) => {
    const select = document.createElement('select');
    select.setAttribute('id', id);
    select.setAttribute('name', id);
    select.setAttribute('style', 'background: radial-gradient(#fff 50%, #b3b3b3); border: 2px solid white; ' +
        'padding: 2px; width: 150px; text-align: center; border-radius: 8px; color: #000;');
    options.forEach(optionText => {
        const option = document.createElement('option');
        option.setAttribute('value', optionText);
        option.textContent = optionText.charAt(0).toUpperCase() + optionText.slice(1);
        select.appendChild(option);
    });
    select.value = value;
    return select;
};

const createButton = (id, buttonText) => {
    const button = document.createElement('button');
    button.setAttribute('id', id);
    button.setAttribute('style', 'font-size: 18px; margin-bottom: 15px; border: none; padding: 10px 15px; ' +
        'background-color: #4f4f4f; text-align: center; border-radius: 10px; font-weight: 700; color: #fff;');
    button.textContent = buttonText;
    return button;
};

// the customisation dialog ("color": colour + opacity, "txt": font); resolves with the values or undefined
const createModal = (type, data) => new Promise(resolve => {
    const modal = document.createElement('div');
    modal.setAttribute('style', 'width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); display: flex; ' +
        'justify-content: center; align-items: center; font-family: Arial; padding: 50px; color: white; ' +
        'position: fixed; z-index: 9999; top: 50%; left: 50%; transform: translate(-50%, -50%);');

    const modalContent = document.createElement('div');
    modalContent.setAttribute('style', 'width: 350px; height: auto; background-color: #262626; text-align: center; ' +
        'border-radius: 15px; box-shadow: rgba(125, 125, 125, 0.5) 0px 0px 0px 5px;');
    modal.appendChild(modalContent);

    const header = document.createElement('div');
    header.setAttribute('style', 'border-radius: 15px 15px 0px 0px; padding: 15px 5px; background-color: #00c3ff;');
    modalContent.appendChild(header);
    const h2 = document.createElement('h2');
    h2.textContent = 'Comment Customization';
    h2.style.margin = '0';
    header.appendChild(h2);

    if (type === 'txt') {
        modalContent.append(createInputLabel('font', 'Font'), document.createElement('br'));
        const fontInput = createInput('font', 'text', data.font);
        fontInput.addEventListener('input', () => {
            fontInput.style.fontFamily = fontInput.value;
        });
        modalContent.append(fontInput, document.createElement('br'));
        const formatDiv = document.createElement('div');
        formatDiv.style.display = 'inline';
        formatDiv.append(
            createInputLabel('bold', 'Bold', false, 'position: absolute; transform: translate(350%, 0%);'),
            createInput('bold', 'checkbox', data.bold, false,
                'width: 50px; position: absolute; transform: translate(-175%, 95%)'),
            createInputLabel('italic', 'Italic', false,
                'position: absolute; transform: translate(80%, 0%); display: inline;'),
            createInput('italic', 'checkbox', data.italic, false,
                'width: 50px; position: absolute; transform: translate(-15%, 95%)')
        );
        modalContent.append(formatDiv, document.createElement('br'), document.createElement('br'));

        modalContent.append(createInputLabel('alignment', 'Text Alignment'), document.createElement('br'));
        const alignmentSelect = createSelect('alignment', ['left', 'center', 'right'], data.textAlign || 'left');
        alignmentSelect.style.marginBottom = '90px';
        modalContent.appendChild(alignmentSelect);

        const textDiv1 = document.createElement('div');
        textDiv1.setAttribute('style', 'position: absolute; transform: translate(60%, -130%);');
        const textDiv2 = document.createElement('div');
        textDiv2.setAttribute('style', 'position: absolute; transform: translate(190%, -127%);');
        textDiv1.append(createInputLabel('fontSize', 'Font Size'), document.createElement('br'));
        const fontSizeInput = createInput('fontSize', 'number', data.fontSize, false, 'width: 100px;');
        fontSizeInput.setAttribute('min', '1');
        textDiv1.appendChild(fontSizeInput);
        textDiv2.append(createInputLabel('txtColor', 'Text Color'), document.createElement('br'),
            createInput('txtColor', 'color', data.txtColor, false, 'width: 100px;'));
        modalContent.append(textDiv1, textDiv2);
    } else {
        const colorDisplay = document.createElement('div');
        const colorInput = createInput('color', 'color', data.color, true,
            'width: 100px; transform: translate(40%, -130%);');
        const opacityInput = createInput('opacity', 'range', data.opacity, true,
            'width: 100px; transform: translate(40%, -130%);');
        const updateDisplay = () => {
            colorDisplay.style.backgroundColor = colorInput.value;
            colorDisplay.style.opacity = opacityInput.value / 100;
        };

        const colorDiv = document.createElement('div');
        colorDiv.setAttribute('style', 'position: absolute; display: inline; margin-right: 20px; margin-top: 15px;');
        modalContent.appendChild(colorDiv);

        const hueDiv = document.createElement('div');
        hueDiv.setAttribute('style', 'position: absolute; margin-top: 40px;');
        const colorLabel = createInputLabel('color', 'Color', true);
        colorLabel.style.transform = 'translate(-50%, -50%)';
        colorInput.addEventListener('input', updateDisplay);
        hueDiv.append(colorLabel, colorInput);
        colorDiv.appendChild(hueDiv);

        const opaDiv = document.createElement('div');
        opaDiv.setAttribute('style', 'position: absolute; margin-top: 80px;');
        opacityInput.setAttribute('max', 100);
        opacityInput.setAttribute('min', 10);
        opacityInput.value = data.opacity;
        opacityInput.addEventListener('input', updateDisplay);
        opaDiv.append(createInputLabel('opacity', 'Opacity', true, 'transform: translate(-50%, -50%);'), opacityInput);
        colorDiv.appendChild(opaDiv);

        const colorDisplayDiv = document.createElement('div');
        colorDisplayDiv.setAttribute('style', 'display: block; border-radius: 15px; border: 7px solid #4f4f4f; ' +
            'width: 85px; height: 85px; margin: 25px 10px 10px 30px;');
        colorDisplay.setAttribute('style', 'display: block; border-radius: 9px; width: 85px; height: 85px;');
        colorDisplayDiv.appendChild(colorDisplay);
        modalContent.appendChild(colorDisplayDiv);
        updateDisplay();
    }

    const cancelBtn = createButton('cancelBtn', 'Cancel');
    cancelBtn.style.marginRight = '10px';
    cancelBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
        resolve();
    });
    modalContent.append(document.createElement('br'), cancelBtn);

    const okayBtn = createButton('okayBtn', 'Okay');
    okayBtn.addEventListener('click', () => {
        const values = {};
        modalContent.querySelectorAll('input, select').forEach(input => {
            values[input.id] = input[input.type === 'checkbox' ? 'checked' : 'value'];
        });
        document.body.removeChild(modal);
        resolve(values);
    });
    modalContent.appendChild(okayBtn);
    document.body.appendChild(modal);
});

/**
 * Start Better Comments on the code area.
 * @param {object} ScratchBlocks The blocks library.
 * @param {object} workspace The main workspace.
 * @param {object} vm The VM (comment styles are kept on its comments).
 * @returns {{refreshAll: Function, detach: Function}} refreshAll after the workspace was reloaded.
 */
const attachBetterComments = (ScratchBlocks, workspace, vm) => {
    const getVMComment = comment => (vm.editingTarget ? vm.editingTarget.comments[comment.id] : null);
    const getStyle = comment => {
        const vmComment = getVMComment(comment);
        return (vmComment && vmComment.style) || {};
    };
    const setStyle = (comment, changes) => {
        const vmComment = getVMComment(comment);
        if (!vmComment) return;
        vmComment.style = Object.assign({}, vmComment.style, changes);
        vm.runtime.emitProjectChanged();
    };

    // the SVG group of the comment (block comments: only while their bubble is shown)
    const getSvg = comment => {
        if (comment.blockId) return comment.bubble_ ? comment.bubble_.bubbleBack_.parentNode : null;
        return comment.svgGroup_;
    };

    const renderText = comment => {
        const txtArea = comment.textarea_;
        if (!txtArea || !txtArea.parentNode) return;
        const old = txtArea.parentNode.querySelector('.pm-comment-formatted');
        if (old) old.remove();
        if (document.activeElement === txtArea) {
            txtArea.style.display = '';
            return;
        }

        const mdSpace = document.createElement('pre');
        mdSpace.className = `${txtArea.className} pm-comment-formatted`;
        mdSpace.setAttribute('style', `${(txtArea.getAttribute('style') || '').replace(/display:\s*none;?/, '')
        } white-space: pre-wrap; overflow-wrap: anywhere; overflow: auto; margin: 0; cursor: text;`);
        mdSpace.innerHTML = txt2md(txtArea.value);
        mdSpace.addEventListener('click', e => {
            txtArea.style.display = '';
            txtArea.focus();
            mdSpace.remove();
            e.stopPropagation();
        });
        txtArea.insertAdjacentElement('beforebegin', mdSpace);
        txtArea.style.display = 'none';

        if (!txtArea.pmFormattedBlur) {
            txtArea.pmFormattedBlur = true;
            txtArea.addEventListener('blur', () => renderText(comment));
        }
    };

    const applyStyle = comment => {
        const svg = getSvg(comment);
        const txt = comment.textarea_;
        if (!svg || !txt) return;
        const data = getStyle(comment);
        if (data.color) {
            const color2 = data.color2 || colorDarken(data.color, 0.2);
            const svgBar = svg.querySelector('rect.scratchWorkspaceCommentBorder') ||
                svg.querySelector('rect.scratchCommentRect');
            const svgText = svg.querySelector('body');
            if (svgBar) {
                svgBar.style.fill = data.color;
                svgBar.style.stroke = color2;
            }
            if (svgText) svgText.style.backgroundColor = data.color;
            txt.style.backgroundColor = data.color;
        }
        if (data.opacity !== undefined) svg.setAttribute('opacity', data.opacity / 100);
        if (data.font) txt.style.fontFamily = data.font;
        if (data.bold !== undefined) txt.style.fontWeight = data.bold ? 'bolder' : 'normal';
        if (data.italic !== undefined) txt.style.fontStyle = data.italic ? 'italic' : 'normal';
        if (data.textAlign) txt.style.textAlign = data.textAlign;
        if (data.fontSize) txt.style.fontSize = `${data.fontSize}px`;
        if (data.txtColor) txt.style.color = data.txtColor;
        renderText(comment);
    };

    const editColor = async comment => {
        const svg = getSvg(comment);
        if (!svg) return;
        const style = getStyle(comment);
        const bar = svg.querySelector('rect.scratchWorkspaceCommentBorder') ||
            svg.querySelector('rect.scratchCommentRect');
        const values = await createModal('color', {
            color: style.color || cssToHex(bar && getComputedStyle(bar).fill, '#fef49c'),
            opacity: style.opacity === undefined ? 100 : style.opacity
        });
        if (values === undefined) return;
        setStyle(comment, {
            color: values.color,
            color2: colorDarken(values.color, 0.2),
            opacity: Math.min(Math.max(Number(values.opacity) || 100, 10), 100)
        });
        applyStyle(comment);
    };

    const editText = async comment => {
        const txt = comment.textarea_;
        if (!txt) return;
        const style = getStyle(comment);
        const computed = getComputedStyle(txt);
        const values = await createModal('txt', {
            font: style.font || computed.fontFamily.split(',')[0].replace(/["']/g, '').trim(),
            bold: style.bold === undefined ? Number(computed.fontWeight) >= 600 : style.bold,
            italic: style.italic === undefined ? computed.fontStyle === 'italic' : style.italic,
            textAlign: style.textAlign || (['center', 'right'].includes(computed.textAlign) ? computed.textAlign : 'left'),
            fontSize: style.fontSize || Math.round(parseFloat(computed.fontSize)) || 12,
            txtColor: style.txtColor || cssToHex(computed.color, '#575e75')
        });
        if (values === undefined) return;
        setStyle(comment, {
            font: values.font, bold: values.bold, italic: values.italic, textAlign: values.alignment,
            fontSize: Math.min(Math.max(Number(values.fontSize) || 12, 1), 500), txtColor: values.txtColor
        });
        applyStyle(comment);
    };

    const showButtons = (comment, show) => {
        if (!comment.pmCommentButtons) return;
        for (const btn of comment.pmCommentButtons) btn.style.display = show ? 'inline' : 'none';
    };

    // the colour, font and help buttons in the comment's top bar
    const addButtons = comment => {
        if (comment.pmCommentButtons && comment.pmCommentButtons[0].isConnected) return;
        const arrow = comment.blockId ?
            (comment.bubble_ && comment.bubble_.minimizeArrow_) :
            comment.minimizeArrow_;
        if (!arrow) return;
        const make = (x, href, title, onClick) => {
            const btn = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            btn.setAttribute('x', x);
            btn.setAttribute('y', '1');
            btn.setAttribute('width', '32');
            btn.setAttribute('height', '32');
            btn.setAttribute('href', href);
            btn.style.cursor = 'pointer';
            const tip = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            tip.textContent = title;
            btn.appendChild(tip);
            btn.addEventListener('mousedown', e => e.stopPropagation());
            btn.addEventListener('click', e => {
                e.stopPropagation();
                onClick();
            });
            arrow.insertAdjacentElement('beforebegin', btn);
            return btn;
        };
        comment.pmCommentButtons = [
            make('25', colorIcon, 'Comment colour', () => editColor(comment)),
            make('60', fontIcon, 'Comment font', () => editText(comment)),
            make('95', helpIcon, 'Comment formatting', () => alert(HELP_TEXT)) // eslint-disable-line no-alert
        ];
        showButtons(comment, !comment.isMinimized_);
    };

    const setUp = comment => {
        if (!comment) return;
        addButtons(comment);
        applyStyle(comment);
    };

    const refreshAll = () => {
        if (!workspace.rendered) return;
        Object.values(workspace.commentDB_ || {}).forEach(setUp);
    };

    const Events = ScratchBlocks.Events;
    const listener = event => {
        if (event.workspaceId !== workspace.id) return;
        const comment = (workspace.commentDB_ || {})[event.commentId];
        if (!comment) return;
        if (event.type === Events.COMMENT_CREATE || event.type === Events.COMMENT_MOVE) {
            setUp(comment);
        } else if (event.type === Events.COMMENT_CHANGE) {
            const isMin = event.newContents_ && event.newContents_.minimized;
            if (isMin !== undefined) {
                addButtons(comment);
                showButtons(comment, !isMin);
            }
            if (!isMin) setUp(comment);
        }
    };
    workspace.addChangeListener(listener);
    refreshAll();

    return {
        refreshAll,
        detach: () => workspace.removeChangeListener(listener)
    };
};

export default attachBetterComments;

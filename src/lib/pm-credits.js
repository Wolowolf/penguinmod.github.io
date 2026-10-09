// PenguinMod Desktop (patch section 16): the "credit" sprite.
// As soon as the project uses an asset whose licence asks for credit (see pm-asset-sources.js),
// a hidden sprite named "credit" appears (a warning sign). Its local variable "credit" holds every
// credit the game must show and is rewritten whenever such an asset is added, removed or edited.
// The same text is drawn into its "credits text 1", "2", … costumes (no extension needed), sized to
// the stage, and redrawn when the credits or the stage size change. The sprite comes with a
// credits screen script (also put in the backpack) and a note explaining both. While credits are needed the sprite can't be deleted or renamed. When none are needed any
// more, the note says so and the sprite can be deleted. Before the packager opens, a warning
// appears if nothing in the sprite shows it (confirmPackaging, used by section 16 f).
import localBackpack from './tw-local-backpack-api';

const SPRITE_NAME = 'credit';
const VAR_NAME = 'credit';
const VAR_ID = 'pmDesktopCreditVariable';
const NOTE_ID = 'pmDesktopCreditsNote';
const SIGNATURE = 'this note updates itself'; // old credit notes and the "no credit needed" note
const NOTE_MARK = 'the local variable "credit" holds'; // the note (comment ids change when a project is saved)
const NOTE_TEXT = [
    'The local variable "credit" holds the mandatory credits for all the licensed work in this project: you must show them somewhere in your game. ' +
        'The "credits text" costumes show the same text and update themselves.',
    '',
    '(their authors cannot claim your game, and you can use everything, even commercially)',
    '',
    'You can use the script provided here (also stored in your backpack) or make your own kind of credit screen, as long as it complies with the licenses involved.'
].join('\n');
const NO_CREDIT_TEXT = 'No asset in this project needs credit right now, so you can delete this sprite. (This note updates itself.)';
// as wide as the line in parentheses (measured in the editor's comment font)
const NOTE = {x: 40, y: 40, width: 650, height: 250};
const BACKPACK_NAME = 'credits screen';
const END_MESSAGE = 'credits end';
const SCROLL_MESSAGE = 'credits scroll'; // used by the first no-extension version (upgraded when found)
const SPEED = 9; // seconds the text takes to cross the stage
const WARNING_TEXT = '⚠ ATTENTION! We detected that the mandatory credits stored in the "credit" sprite are never shown. ' +
    'We could be wrong, but if so, by continuing without proper attribution you accept the LEGAL RISK and responsibility. ⚠';

// Costumes: the button players click, the black screen (as big as the stage) and the text pages.
const BUTTON = 'warning';
const SCREEN = 'credits screen';
const PAGE = 'credits text '; // "credits text 1", "credits text 2", …
const OLD_TEXT = 'credits text'; // the empty costume of the Animated Text version (upgraded when found)
const isPageName = name => name.startsWith(PAGE) && /^\d+$/.test(name.slice(PAGE.length));
const WARNING_SVG = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="49.55819" height="49.55819" ' +
    'viewBox="0,0,49.55819,49.55819"><g transform="translate(-215.2209,-155.2209)"><g stroke="none" stroke-miterlimit="10">' +
    '<path d="M215.22091,155.2209h49.55819v49.55819h-49.55819z" fill="#000000"/><path d="M217.2858,198.58365l22.71382,' +
    '-39.23296l22.71382,39.23296zM241.47188,191.79635c0.39508,-0.39646 0.59262,-0.88721 0.59262,-1.47227c0,-0.58506 ' +
    '-0.19823,-1.07512 -0.59469,-1.4702c-0.39646,-0.39508 -0.88653,-0.59331 -1.4702,-0.59468c-0.58367,-0.00137 -1.07375,' +
    '0.19685 -1.4702,0.59468c-0.39646,0.39783 -0.59469,0.8879 -0.59469,1.4702c0,0.5823 0.19823,1.07306 0.59469,1.47227c0.39646,' +
    '0.39921 0.88653,0.59676 1.4702,0.59262c0.58367,-0.00413 1.07443,-0.20236 1.47226,-0.59469M237.93472,186.19429h4.12978v' +
    '-10.32446h-4.12978z" fill="#ffa200"/></g></g></svg>';
const fix = n => +n.toFixed(3);
const screenSvg = (width, height) => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" ` +
    `viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#000000"/></svg>`;

/* The text pages: white Sans Serif (the costume font every player has) at 1/25 of the stage height,
   wrapped to 95% of the stage width, so the text keeps its size relative to any stage size. Pages
   are at most one stage high, so the renderer keeps them sharp (it shrinks costume textures bigger
   than 2048 pixels). Each page has an empty margin of 16 units above and below the text: fencing
   keeps up to 15 units of a sprite on the stage, so only an empty margin is ever held there.
   Rotation centre = top of the text. */
const MARGIN = 16;
const escapeXml = text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const wrapLines = (text, maxWidth, measure) => {
    const lines = [];
    for (const paragraph of text.split('\n')) {
        let line = '';
        for (const word of paragraph.split(' ').filter(Boolean)) {
            const longer = line ? `${line} ${word}` : word;
            if (measure(longer) <= maxWidth) {
                line = longer;
                continue;
            }
            if (line) lines.push(line);
            line = word;
            while (line.length > 1 && measure(line) > maxWidth) { // a word longer than a line (a link): cut it
                let cut = line.length - 1;
                while (cut > 1 && measure(line.slice(0, cut)) > maxWidth) cut--;
                lines.push(line.slice(0, cut));
                line = line.slice(cut);
            }
        }
        lines.push(line);
    }
    return lines;
};
const pageSvgs = async (text, width, height) => {
    const lineHeight = height / 20; // 20 lines: a full page's text is exactly one stage high
    const fontSize = lineHeight / 1.25;
    const font = `${fix(fontSize)}px "Sans Serif"`;
    try {
        await document.fonts.load(font);
    } catch (e) {
        // measured with a fallback font
    }
    const context = document.createElement('canvas').getContext('2d');
    context.font = font;
    const lines = wrapLines(text, width * 0.95, line => context.measureText(line).width);
    const pages = [];
    for (let first = 0; first < lines.length; first += 20) {
        const pageLines = lines.slice(first, first + 20);
        const pageHeight = pageLines.length === 20 ? height + (MARGIN * 2) : fix((MARGIN * 2) + (pageLines.length * lineHeight));
        const texts = pageLines.map((line, k) => (line ? `<text x="${fix(width / 2)}" ` +
            `y="${fix(MARGIN + (k * lineHeight) + (lineHeight / 2) + (fontSize * 0.35))}" font-family="Sans Serif" ` +
            `font-size="${fix(fontSize)}" fill="#ffffff" text-anchor="middle" xml:space="preserve">${escapeXml(line)}</text>` : ''));
        pages.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${pageHeight}" ` +
            `viewBox="0 0 ${width} ${pageHeight}">${texts.join('')}</svg>`);
    }
    return pages;
};

const freeComments = target => Object.keys(target.comments || {})
    .map(id => target.comments[id]).filter(c => c && !c.blockId);
const isNote = c => typeof c.text === 'string' &&
    (c.text.toLowerCase().includes(SIGNATURE) || c.text.toLowerCase().includes(NOTE_MARK));

// The credit sprite: the one holding the note, or else the sprite named "credit".
const findCreditSprite = runtime => {
    const sprites = runtime.targets.filter(t => t.isOriginal && !t.isStage);
    return sprites.find(t => freeComments(t).some(isNote)) || sprites.find(t => t.getName() === SPRITE_NAME) || null;
};
const findNote = target => freeComments(target).find(isNote) || freeComments(target)[0] || null;

// Credit lines are as short as the licences allow: title, author (Iconify: the copyright holder,
// which MIT / Apache / BSD require), licence name, "modified" when changed, and the source link.
// The licence link is listed once at the bottom ("in any reasonable manner", CC BY 4.0 3(a)(2);
// CC BY 3.0 only asks for it with the copy), unless one licence name has several links.
const shortUrl = url => String(url || '').replace(/^https?:\/\//i, '');
const sameUrl = url => shortUrl(url).replace(/\/+$/, '').toLowerCase();

const changesText = c => {
    if (c.src === 'game-icons') return c.modified || c.changes === 'modified' ? 'modified' : (c.changes || 'recoloured');
    return c.modified ? 'modified' : '';
};

const creditLines = (c, licenceListed) => {
    const title = c.src === 'iconify' ? `"${c.title}" (${c.set})` : `"${c.title || 'Untitled'}"`;
    const by = c.src === 'iconify' ? `© ${c.by}` : [c.by, c.src === 'europeana' && c.institution].filter(Boolean).join(', ');
    const source = c.src === 'iconify' ? c.byUrl : c.url;
    return [
        [title, by, c.license || 'see source', changesText(c)].filter(Boolean).join(' - '),
        source && `(${shortUrl(source)})`,
        !licenceListed && c.licenseUrl && `(${shortUrl(c.licenseUrl)})`
    ].filter(Boolean).join('\n');
};

// Every credit record the project needs, as [{...record, modified}]
const collectCredits = runtime => {
    const credits = [];
    for (const target of runtime.targets) {
        if (!target.isOriginal) continue;
        const assets = target.getCostumes().concat(target.getSounds ? target.getSounds() : []);
        for (const asset of assets) {
            if (!asset || !asset.pmCredit) continue;
            // an icon made in the studio can also carry the credit of the badge on it (`extra`)
            for (const c of [asset.pmCredit].concat(asset.pmCredit.extra || [])) {
                if (c && c.needsCredit) credits.push(Object.assign({}, c, c === asset.pmCredit ? {} : {modified: asset.pmCredit.modified}));
            }
        }
    }
    return credits;
};

// The value of the "credit" variable: one paragraph per asset, then the licence links.
const creditText = credits => {
    if (!credits.length) return '';
    // licence name -> its links (a name with one link goes into the list at the bottom)
    const links = new Map();
    for (const c of credits) {
        if (!c.license || !c.licenseUrl) continue;
        if (!links.has(c.license)) links.set(c.license, new Map());
        links.get(c.license).set(sameUrl(c.licenseUrl), shortUrl(c.licenseUrl));
    }
    const listed = new Map(Array.from(links).filter(([, urls]) => urls.size === 1)
        .map(([name, urls]) => [name, Array.from(urls.values())[0]]));
    const sorted = list => Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));
    return [
        ...sorted(credits.map(c => creditLines(c, listed.has(c.license)))).join('\n\n').split('\n'),
        ...(listed.size ? ['', 'Licences:', ...sorted(Array.from(listed).map(([name, url]) => `${name}: ${url}`))] : [])
    ].join('\n');
};

/* The credits screen script (sb3 blocks, no extension). Clicking the sprite makes a clone that fades
   in to black ("credits screen" costume, as big as the stage) and makes a clone for page 1. Each
   page starts with the top of its text at the bottom of the stage, glides up one stage height
   (its text is at most that high), makes the next page there and glides on until its text has left
   the stage. A new clone's script runs in the frame it is made, so the next page starts gliding in
   the same frame as the one above it: they stay exactly one stage height apart. The last page
   broadcasts "credits end": the black clone fades out. Sizes come from the costumes ("height of
   costume"), so the script works for any stage size. */
const NUMBER_INPUTS = /^(NUM\d?|X|Y|SECS|SIZE|VALUE|CHANGE|WIDTH|DURATION|TIMES)$/;
const SHADOW_TYPES = {TIMES: 6, DURATION: 5, DIRECTION: 8};
const BOOLEAN_OPS = /^operator_(not|and|or|equals|lt|gt)$/;
const buildBlocks = (scripts, prefix) => {
    const blocks = {};
    const comments = {};
    let count = 0;
    const block = (spec, parent, shadow) => {
        const id = `${prefix}${++count}`;
        const b = blocks[id] = {opcode: spec.op, next: null, parent, inputs: {}, fields: {}, shadow: !!shadow, topLevel: !parent};
        for (const [name, value] of Object.entries(spec.f || {})) b.fields[name] = Array.isArray(value) ? value : [value, null];
        for (const [name, value] of Object.entries(spec.i || {})) b.inputs[name] = input(name, value, id);
        if (spec.comment) {
            const commentId = `${id}c`;
            comments[commentId] = Object.assign({blockId: id, minimized: false}, spec.comment);
            b.comment = commentId;
        }
        return id;
    };
    const stack = (list, parent) => {
        let first = null;
        let previous = null;
        for (const spec of list) {
            const id = block(spec, previous || parent);
            if (previous) blocks[previous].next = id;
            else first = id;
            previous = id;
        }
        return first;
    };
    const input = (name, value, parent) => {
        if (typeof value === 'number') return [1, [SHADOW_TYPES[name] || 4, String(value)]];
        if (typeof value === 'string') return [1, [10, value]];
        if (Array.isArray(value)) return [2, stack(value, parent)];
        if (value.literal) return [1, value.literal];
        if (value.menu) return [1, block(value, parent, true)];
        if (BOOLEAN_OPS.test(value.op)) return [2, block(value, parent)];
        return [3, block(value, parent), NUMBER_INPUTS.test(name) ? [SHADOW_TYPES[name] || 4, ''] : [10, '']];
    };
    for (const {x, y, script} of scripts) {
        const top = blocks[stack(script, null)];
        top.x = x;
        top.y = y;
    }
    return {blocks, comments};
};

const creditScripts = (endId, prefix) => {
    const costumeName = {op: 'looks_costumenumbername', f: {NUMBER_NAME: 'name'}};
    const contains = text => ({op: 'operator_contains', i: {STRING1: costumeName, STRING2: text}});
    const not = condition => ({op: 'operator_not', i: {OPERAND: condition}});
    const isPage = contains(PAGE);
    const math = op => (a, b) => ({op: `operator_${op}`, i: {NUM1: a, NUM2: b}});
    const [plus, minus, times, divide] = ['add', 'subtract', 'multiply', 'divide'].map(math);
    const costumeMenu = name => ({menu: true, op: 'looks_costume', f: {COSTUME: name}});
    const height = costume => ({op: 'looks_getinputofcostume', i: {
        INPUT: {menu: true, op: 'looks_getinput_menu', f: {INPUT: 'height'}}, COSTUME: costume
    }});
    const stageHeight = height(costumeMenu(SCREEN));
    const textHeight = minus(height(costumeName), MARGIN * 2); // this page's text, without the empty margins
    const yPosition = {op: 'motion_yposition'};
    const glide = (secs, y, comment) => ({op: 'motion_glidesecstoxy', i: {SECS: secs, X: 0, Y: y}, comment});
    const wearCostume = name => ({op: 'looks_switchcostumeto', i: {COSTUME: costumeMenu(name)}});
    const cloneMyself = {op: 'control_create_clone_of', i: {CLONE_OPTION: {menu: true, op: 'control_create_clone_of_menu', f: {CLONE_OPTION: '_myself_'}}}};
    const ghost = (op, value) => ({op, i: {[op === 'looks_seteffectto' ? 'VALUE' : 'CHANGE']: value}, f: {EFFECT: 'GHOST'}});
    const repeat = (count, body) => ({op: 'control_repeat', i: {TIMES: count, SUBSTACK: body}});
    const front = {op: 'looks_gotofrontback', f: {FRONT_BACK: 'front'}};
    const note = (x, y, width, h, text) => ({x, y, width, height: h, text});
    return buildBlocks([{x: 40, y: 330, script: [
        {op: 'event_whenthisspriteclicked'},
        // the clones are clickable too: only the button starts the credits
        {op: 'control_if', i: {CONDITION: not(contains('credits')), SUBSTACK: [cloneMyself]}}
    ]}, {x: 40, y: 540, script: [
        {op: 'control_start_as_clone'},
        {op: 'control_if_else', i: {
            CONDITION: isPage,
            SUBSTACK: [ // a text page
                {op: 'motion_gotoxy', i: {X: 0, Y: minus(0, divide(stageHeight, 2))}, comment: note(1550, 600, 330, 150,
                    'Each page starts just below the stage (the top of its text), glides up one stage height, ' +
                    'makes the next page below itself, then glides on until its text has left the stage.')},
                front,
                glide(SPEED, plus(yPosition, stageHeight), note(1550, 770, 330, 110,
                    `Scroll speed: change the ${SPEED} in both glide blocks (seconds the text takes to cross the stage, smaller = faster).`)),
                {op: 'looks_nextcostume'},
                {op: 'control_if', i: {CONDITION: isPage, SUBSTACK: [cloneMyself]}},
                {op: 'looks_previouscostume'},
                glide(times(divide(textHeight, stageHeight), SPEED), plus(yPosition, textHeight)),
                {op: 'looks_nextcostume'},
                {op: 'control_if', i: {CONDITION: not(isPage), SUBSTACK: [
                    {op: 'event_broadcast', i: {BROADCAST_INPUT: {literal: [11, END_MESSAGE, endId]}}}
                ]}},
                {op: 'control_delete_this_clone'}
            ],
            SUBSTACK2: [ // the black screen: fades in, then makes the first page
                wearCostume(SCREEN),
                {op: 'looks_cleargraphiceffects'},
                ghost('looks_seteffectto', 100),
                {op: 'motion_pointindirection', i: {DIRECTION: 90}},
                {op: 'looks_setsizeto', i: {SIZE: 100}},
                {op: 'motion_gotoxy', i: {X: 0, Y: 0}},
                front,
                repeat(10, [ghost('looks_changeeffectby', -10)]),
                wearCostume(`${PAGE}1`),
                cloneMyself,
                wearCostume(SCREEN)
            ]
        }}
    ]}, {x: 1000, y: 40, script: [
        {op: 'event_whenbroadcastreceived', f: {BROADCAST_OPTION: [END_MESSAGE, endId]}},
        {op: 'control_if', i: {
            CONDITION: {op: 'operator_equals', i: {OPERAND1: costumeName, OPERAND2: SCREEN}},
            SUBSTACK: [repeat(10, [ghost('looks_changeeffectby', 10)]), {op: 'control_delete_this_clone'}]
        }}
    ]}], prefix);
};

const svgCostume = (storage, name, svg, centerX, centerY) => {
    const asset = storage.createAsset(storage.AssetType.ImageVector, storage.DataFormat.SVG,
        new TextEncoder().encode(svg), null, true);
    storage.builtinHelper._store(storage.AssetType.ImageVector, storage.DataFormat.SVG, asset.data, asset.assetId);
    return {name, bitmapResolution: 1, dataFormat: 'svg', assetId: asset.assetId, md5ext: `${asset.assetId}.svg`,
        rotationCenterX: centerX, rotationCenterY: centerY};
};

// The script also goes into the backpack (once), with the warning sign as its picture.
const backpackThumbnail = () => new Promise(resolve => {
    const image = new Image();
    image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 96;
        canvas.getContext('2d').drawImage(image, 0, 0, 96, 96);
        resolve(canvas.toDataURL('image/png').replace('data:image/png;base64,', ''));
    };
    image.onerror = () => resolve('');
    image.src = `data:image/svg+xml;base64,${btoa(WARNING_SVG)}`;
});
const addToBackpack = async blocks => {
    try {
        const items = await localBackpack.getBackpackContents({limit: 1000, offset: 0});
        const old = items.find(item => item.type === 'script' && item.name === BACKPACK_NAME);
        if (old) {
            // older versions (Animated Text, "credits scroll") are replaced
            const body = new TextDecoder().decode(old.bodyData);
            if (!body.includes('"text_') && !body.includes(SCROLL_MESSAGE)) return;
            await localBackpack.deleteBackpackObject({id: old.id});
        }
        const blockObjects = Object.values(blocks._blocks).map(b => {
            const copy = JSON.parse(JSON.stringify(b));
            delete copy.comment;
            return copy;
        });
        const json = JSON.stringify(blockObjects);
        await localBackpack.saveBackpackObject({
            type: 'script', mime: 'application/json', name: BACKPACK_NAME,
            body: btoa(unescape(encodeURIComponent(json))), thumbnail: await backpackThumbnail()
        });
    } catch (e) {
        console.warn('Could not put the credits screen script in the backpack', e);
    }
};

// A sprite made by an older version: blank costume, no scripts (it gets replaced by a new one)
const isOldSprite = sprite => sprite.getCostumes().length === 1 && sprite.getCostumes()[0].name === 'blank' &&
    Object.keys(sprite.blocks._blocks).length === 0;
// A sprite made by an older version (Animated Text, or the first version without it, which used the
// message "credits scroll"): its credits scripts (they use the costumes "credits screen" / "credits
// text") are replaced, the user's other scripts stay.
const needsUpgrade = sprite => sprite.getCostumeIndexByName(OLD_TEXT) >= 0 || Object.values(sprite.blocks._blocks)
    .some(b => b.opcode === 'event_whenbroadcastreceived' && b.fields.BROADCAST_OPTION &&
        b.fields.BROADCAST_OPTION.value === SCROLL_MESSAGE);
const isOldScript = (blocks, topId) => {
    const top = blocks.getBlock(topId);
    if (!['event_whenthisspriteclicked', 'control_start_as_clone', 'event_whenbroadcastreceived'].includes(top.opcode)) return false;
    return Object.values(blocks._blocks).some(b => {
        let first = b;
        while (first.parent) first = blocks.getBlock(first.parent);
        return first === top && (b.opcode.startsWith('text_') ||
            Object.values(b.fields).some(field => field.value === SCREEN || field.value === OLD_TEXT));
    });
};
const generated = costume => costume.name === SCREEN || costume.name === OLD_TEXT || isPageName(costume.name);

/* Packager check: is the credit sprite shown by a script (a "show" block under a hat block)? */
const SHOW_OPCODES = ['looks_show', 'looks_changeVisibilityOfSprite', 'looks_changeVisibilityOfSpriteShow'];
const inputValue = (blocks, block, name) => {
    if (block.fields[name]) return block.fields[name].value;
    const input = block.inputs[name];
    const shadow = input && blocks.getBlock(input.block);
    if (!shadow || !shadow.shadow) return null; // a reporter: can't know
    const field = Object.values(shadow.fields)[0];
    return field ? field.value : null;
};
const showsCredits = (runtime, sprite) => {
    const blocks = sprite.blocks;
    return Object.keys(blocks._blocks).some(id => {
        const block = blocks.getBlock(id);
        if (!SHOW_OPCODES.includes(block.opcode)) return false;
        if (block.opcode !== 'looks_show') {
            const option = inputValue(blocks, block, 'VISIBLE_OPTION');
            if (option !== null && option !== '_myself_' && option !== sprite.getName()) return false;
            const type = block.opcode === 'looks_changeVisibilityOfSprite' ? inputValue(blocks, block, 'VISIBLE_TYPE') : 'show';
            if (type !== null && String(type).toLowerCase() !== 'show') return false;
        }
        let top = block;
        while (top.parent) top = blocks.getBlock(top.parent);
        return runtime.getIsHat(top.opcode); // not orphaned
    });
};
const askToContinue = () => new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,0.6);' +
        'display:flex;align-items:center;justify-content:center;';
    const box = document.createElement('div');
    box.setAttribute('role', 'alertdialog');
    box.style.cssText = 'max-width:480px;margin:16px;padding:20px;background:#ffffff;color:#222222;' +
        'border:3px solid #ffa200;font:15px/1.5 Helvetica, Arial, sans-serif;';
    const text = document.createElement('p');
    text.textContent = WARNING_TEXT;
    text.style.cssText = 'margin:0 0 16px;white-space:pre-wrap;';
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:8px;justify-content:flex-end;';
    const button = (label, primary, ok) => {
        const b = document.createElement('button');
        b.textContent = label;
        b.style.cssText = `padding:6px 14px;font:inherit;cursor:pointer;border:1px solid #888888;` +
            (primary ? 'background:#ffa200;color:#000000;font-weight:bold;' : 'background:#eeeeee;color:#222222;');
        b.onclick = () => close(ok);
        row.appendChild(b);
        return b;
    };
    const onKey = e => {
        if (e.key === 'Escape') close(false);
    };
    const close = ok => {
        overlay.remove();
        document.removeEventListener('keydown', onKey, true);
        resolve(ok);
    };
    const back = button('Go back', true, false);
    button('Continue anyway', false, true);
    box.append(text, row);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    document.addEventListener('keydown', onKey, true);
    back.focus();
});
export const confirmPackaging = vm => {
    const runtime = vm && vm.runtime;
    const sprite = runtime && findCreditSprite(runtime);
    if (!sprite || !collectCredits(runtime).length || showsCredits(runtime, sprite)) return Promise.resolve(true);
    return askToContinue();
};

export default function installCredits (vm) {
    if (vm.pmCreditsInstalled) return;
    vm.pmCreditsInstalled = true;
    const runtime = vm.runtime;
    let timer = null;
    let busy = false;
    const originalDelete = vm.deleteSprite;

    const creditsNeeded = () => collectCredits(runtime).length > 0;
    const button = () => svgCostume(runtime.storage, BUTTON, WARNING_SVG, 24.779095, 24.779095);

    // The black screen and the text pages for this text and stage size (made once, copied on each use
    // because loading a costume adds fields to it).
    let made = {key: null, costumes: null};
    const stageCostumes = async text => {
        const {stageWidth: width, stageHeight: height, storage} = runtime;
        const key = `${width}x${height}\n${text}`;
        if (made.key !== key) {
            const pages = await pageSvgs(text || ' ', width, height);
            made = {key, costumes: [svgCostume(storage, SCREEN, screenSvg(width, height), width / 2, height / 2)]
                .concat(pages.map((svg, k) => svgCostume(storage, `${PAGE}${k + 1}`, svg, width / 2, MARGIN)))};
        }
        return made.costumes.map(costume => Object.assign({}, costume));
    };

    const scripts = () => {
        const stage = runtime.getTargetForStage();
        const messageId = name => {
            const existing = stage.lookupBroadcastByInputValue(name);
            if (existing) return existing.id;
            const id = `pmDesktopCredits${name.replace(/\W/g, '')}${Date.now().toString(36)}`;
            stage.createVariable(id, name, 'broadcast_msg');
            return id;
        };
        return creditScripts(messageId(END_MESSAGE), `pmcr${Date.now().toString(36)}_`);
    };
    const restoreEditingTarget = previous => {
        if (previous && runtime.getTargetById(previous)) vm.setEditingTarget(previous);
        else vm.emitWorkspaceUpdate();
    };

    const createSprite = async credits => {
        const previous = vm.editingTarget && vm.editingTarget.id;
        const {blocks, comments} = scripts();
        comments[NOTE_ID] = Object.assign({blockId: null, minimized: false, text: NOTE_TEXT}, NOTE);
        const text = creditText(credits);
        await vm.addSprite(JSON.stringify({
            isStage: false, name: SPRITE_NAME,
            variables: {[VAR_ID]: [VAR_NAME, text]}, lists: {}, broadcasts: {},
            blocks, comments, currentCostume: 0, extensions: [],
            costumes: [button()].concat(await stageCostumes(text)),
            sounds: [], volume: 100, visible: false, x: 0, y: 0, size: 100, direction: 90,
            draggable: false, rotationStyle: 'all around'
        }));
        const sprite = vm.editingTarget;
        restoreEditingTarget(previous);
        addToBackpack(sprite.blocks);
    };

    // Animated Text version -> this one: its credits scripts are swapped for the new ones, which are
    // read from a short-lived sprite (the VM turns the sb3 blocks into its own format there).
    const upgradeScripts = async sprite => {
        for (const topId of sprite.blocks.getScripts().slice()) {
            if (isOldScript(sprite.blocks, topId)) sprite.blocks.deleteBlock(topId);
        }
        for (const [id, comment] of Object.entries(sprite.comments)) {
            if (comment.blockId && !sprite.blocks.getBlock(comment.blockId)) delete sprite.comments[id];
        }
        const previous = vm.editingTarget && vm.editingTarget.id;
        const {blocks, comments} = scripts();
        await vm.addSprite(JSON.stringify({
            isStage: false, name: `${SPRITE_NAME} scripts`, variables: {}, lists: {}, broadcasts: {},
            blocks, comments, currentCostume: 0, extensions: [], costumes: [button()],
            sounds: [], volume: 100, visible: false, x: 0, y: 0, size: 100, direction: 90,
            draggable: false, rotationStyle: 'all around'
        }));
        const temporary = vm.editingTarget;
        for (const block of Object.values(temporary.blocks._blocks)) {
            sprite.blocks.createBlock(JSON.parse(JSON.stringify(block)));
        }
        for (const c of Object.values(temporary.comments)) {
            sprite.createComment(c.id, c.blockId, c.text, c.x, c.y, c.width, c.height, c.minimized);
        }
        addToBackpack(temporary.blocks);
        originalDelete.call(vm, temporary.id);
        // Animated Text came with the old script: it goes when no block uses it (projects save every loaded extension)
        const usesText = runtime.targets.some(t => Object.values(t.blocks._blocks).some(b => b.opcode.startsWith('text_')));
        if (!usesText && vm.extensionManager.isExtensionLoaded('text')) vm.extensionManager.removeExtension('text');
        restoreEditingTarget(previous);
    };

    // Puts the black screen and the text pages for the current text and stage size into the sprite.
    const updateCostumes = async (sprite, text) => {
        const wanted = await stageCostumes(text);
        const have = sprite.getCostumes().filter(generated);
        if (have.length === wanted.length && wanted.every((costume, k) =>
            have[k].name === costume.name && have[k].assetId === costume.assetId)) return false;
        const wearing = sprite.getCostumes()[sprite.currentCostume].name;
        if (sprite.getCostumes().every(generated)) {
            const extra = button();
            await vm.addCostume(extra.md5ext, extra, sprite.id); // a sprite keeps at least one costume
        }
        for (let k = sprite.getCostumes().length - 1; k >= 0; k--) {
            if (generated(sprite.getCostumes()[k])) sprite.deleteCostume(k);
        }
        for (const costume of wanted) await vm.addCostume(costume.md5ext, costume, sprite.id);
        sprite.setCostume(Math.max(0, sprite.getCostumeIndexByName(wearing)));
        return true;
    };

    const sync = async () => {
        timer = null;
        if (busy) return schedule();
        busy = true;
        try {
            await update();
        } finally {
            busy = false;
        }
    };
    const update = async () => {
        const credits = collectCredits(runtime);
        const sprite = findCreditSprite(runtime);
        if (credits.length && (!sprite || isOldSprite(sprite))) {
            if (sprite) originalDelete.call(vm, sprite.id);
            await createSprite(credits);
            return;
        }
        if (!sprite) return;
        let changed = false;
        if (needsUpgrade(sprite)) {
            await upgradeScripts(sprite);
            changed = true;
        }
        const text = credits.length ? NOTE_TEXT : NO_CREDIT_TEXT;
        const note = findNote(sprite);
        if (!note) {
            sprite.createComment(NOTE_ID, null, text, NOTE.x, NOTE.y, NOTE.width, NOTE.height, false);
            changed = true;
        } else if (note.text !== text) {
            note.text = text;
            note.width = NOTE.width;
            note.height = NOTE.height;
            changed = true;
        }
        const value = creditText(credits);
        let variable = sprite.lookupVariableByNameAndType(VAR_NAME, '', true);
        if (!variable && credits.length) {
            sprite.createVariable(sprite.variables[VAR_ID] ? `${VAR_ID}${Date.now()}` : VAR_ID, VAR_NAME, '');
            variable = sprite.lookupVariableByNameAndType(VAR_NAME, '', true);
        }
        if (variable && variable.value !== value) {
            variable.value = value;
            changed = true;
        }
        if (await updateCostumes(sprite, value)) changed = true;
        if (!changed) return;
        runtime.emitProjectChanged();
        if (vm.editingTarget === sprite) vm.emitWorkspaceUpdate();
    };
    const schedule = () => {
        if (!timer) timer = setTimeout(sync, 250);
    };

    vm.on('targetsUpdate', schedule); // sprites, costumes or sounds were added, removed or loaded
    runtime.on('STAGE_SIZE_CHANGED', schedule); // the pages are made for the stage size

    // Editing a credited asset marks it as modified (licences like CC BY ask you to say so).
    const markModified = list => index => {
        const asset = list()[index];
        if (asset && asset.pmCredit && !asset.pmCredit.modified) {
            asset.pmCredit = Object.assign({}, asset.pmCredit, {modified: true}); // copies share the record
            schedule();
        }
    };
    const costumes = () => (vm.editingTarget ? vm.editingTarget.getCostumes() : []);
    const sounds = () => (vm.editingTarget && vm.editingTarget.sprite ? vm.editingTarget.sprite.sounds : []);
    for (const [method, list] of [['updateSvg', costumes], ['updateBitmap', costumes], ['updateSoundBuffer', sounds]]) {
        const original = vm[method];
        const mark = markModified(list);
        vm[method] = function (index, ...rest) {
            mark(index);
            return original.call(this, index, ...rest);
        };
    }

    // The credit sprite can't be deleted or renamed while credits are needed.
    vm.deleteSprite = function (targetId) {
        const target = runtime.getTargetById(targetId);
        if (target && target === findCreditSprite(runtime) && creditsNeeded()) {
            // eslint-disable-next-line no-alert
            alert('The "credit" sprite lists the credits your game needs, so it can\'t be deleted ' +
                'while the project uses assets that need credit.');
            return () => Promise.resolve();
        }
        return originalDelete.call(this, targetId);
    };
    const originalRename = vm.renameSprite;
    vm.renameSprite = function (targetId, newName) {
        const target = runtime.getTargetById(targetId);
        if (target && target === findCreditSprite(runtime) && newName !== SPRITE_NAME && creditsNeeded()) {
            // eslint-disable-next-line no-alert
            alert('The "credit" sprite keeps its name while the project uses assets that need credit.');
            vm.emitTargetsUpdate();
            return;
        }
        return originalRename.call(this, targetId, newName);
    };
}

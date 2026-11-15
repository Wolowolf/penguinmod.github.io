// The topic categories of the extension library, in the order the list shows them (most useful for a
// beginner making games first). Each extension is listed once, under its key: the id of a built-in
// extension, or the part of a gallery address after the host (without "extensions/" or
// "extension-code/"). Inside a category the list follows the order below: the most used first,
// extensions that work together next to each other. An extension with no entry gets no topic tag.
export const categories = [
    { tag: 'cat_expansions', label: 'Block Expansions' },
    { tag: 'cat_sprites', label: 'Sprites | Physics' },
    { tag: 'cat_effects', label: 'Animation | Effects' },
    { tag: 'cat_pen', label: 'Pen | Colors' },
    { tag: 'cat_camera', label: 'Camera | Screen | Device' },
    { tag: 'cat_input', label: 'Input | Controls' },
    { tag: 'cat_sound', label: 'Sound | Video' },
    { tag: 'cat_text', label: 'Text | Popups' },
    { tag: 'cat_storage', label: 'Saving | Files' },
    { tag: 'cat_math', label: 'Math | Time | 3D' },
    { tag: 'cat_network', label: 'Online | Encoding' }
];

const keysByTag = {
    // more blocks for the built-in categories, in the editor's category order (Variables, My Blocks
    // included), then a mixed collection of small extras for several of them
    cat_expansions: [
        'pmMotionExpansion',
        'Lily/LooksPlus.js',
        'pmEventsExpansion',
        'pmControlsExpansion',
        'Extra-Controls.js',
        'pmSensingExpansion',
        'Hyper-Sense-V2.js',
        'pmOperatorsExpansion',
        'Variables-Expanded.js',
        'Temporary-Variables.js',
        'My-Blocks-Plus.js',
        'jwProto',
        'Sharktilities.js'
    ],
    // clones, sprites that follow or group with others, grids, then touching and physics
    cat_sprites: [
        'Lily/ClonesPlus.js',
        'Sprite-Parenting.js',
        'jgTailgating',
        'SharkPool/Tile-Grids.js',
        'Lazy-Collisions.js',
        'Rigidbodies.js',
        'pooiod/Box2D.js'
    ],
    // moving and animating sprites, then how sprites and the stage look
    cat_effects: [
        'jgTween',
        'Animations.js',
        'MubiLop/spritesheeter.js',
        'SVG-Spritesheets.js',
        'GIF-Manager.js',
        'Particle-Engine.js',
        'Sprite-Effects-V2.js',
        'Turbo-Skins.js',
        'Xeltalliv/clippingblending.js',
        'TheShovel/CanvasEffects.js',
        'Gen1x/lighting.js'
    ],
    cat_pen: [
        'pen',
        'Pen-Papers.js',
        'Layer-Control.js',
        'obviousAlexC/penPlus.js',
        'Color-Master.js',
        'TheShovel/ColorPicker.js'
    ],
    // the game camera, the stage size and frame rate, the app window, and the device it runs on
    cat_camera: [
        'pmCamera',
        'DogeisCut/Resolution.js',
        'runtime-options.js',
        'CubesterYT/WindowControls.js',
        'navigator.js',
        'Geolocation.js'
    ],
    cat_input: [
        'KeysPlusV2.js',
        'Gamepad-Expanded.js',
        'cursor.js',
        'obviousAlexC/SensingPlus.js',
        'gaimerI17/DeviceMotion.js',
        'veggiecan/mobilekeyboard.js',
        'electricfuzzball_pm/MIDI.js'
    ],
    // sound, music and speech, then video and the camera
    cat_sound: [
        'Lily/SoundExpanded.js',
        'music',
        'Tune-Shark-V3.js',
        'SharkPool/Sound-Waves.js',
        'Gen1x/beat_sync.js',
        'MIDI-Tools.js',
        'Recording-V2.js',
        'PuzzlingGGG/ttsrV2.js',
        'pooiod/Dictation.js',
        'Lily/Video.js',
        'lab/face-sensing.js',
        'pooiod/VideoSharing.js'
    ],
    // working with text, text shown on the stage, popups, and copied or pasted text
    cat_text: [
        'text.js',
        'Gen1x/iris-text.js',
        'SharkPool/Font-Manager.js',
        'Speech-Bubbles.js',
        'Embin/embintranslation.js',
        'Popup-Phoenix.js',
        'MubiLop/toastnotifs.js',
        'clipboard.js'
    ],
    // saving progress, save states (scenes), files, imported assets and image data, printing
    cat_storage: [
        'local-storage.js',
        'Scenes.js',
        'Files-Expanded.js',
        'CST1229/zip.js',
        'TheShovel/ShovelUtils.js',
        'jgPrism',
        'sharkpoolPrinting'
    ],
    // numbers, then time, then 3D (vectors and 3D rendering)
    cat_math: [
        'true-fantom/math.js',
        'Gen1x/random_utils.js',
        'MubiLop/numutils.js',
        'NOname-awa/graphics2d.js',
        'qxsck/big-decimal.js',
        'bitwise.js',
        'steve0greatness/timers.js',
        'XeroName/Deltatime.js',
        'Time-Calculation.js',
        'ObviousAlexC/3DMath.js',
        'Xeltalliv/simple3D.js'
    ],
    // connections, web requests and online accounts, then encoding and encryption for sending data
    cat_network: [
        'true-fantom/network.js',
        'cloudlink.js',
        'godslayerakp/ws.js',
        'MikeDev101/webrtc.js',
        'MubiLop/penguinhook.js',
        'Ikelene/googleAuthExtension.js',
        'steamworks.js',
        'itchio.js',
        'encoding.js',
        'gaimerI17/crypto.js',
        'QR-Codes.js'
    ]
};

const tagByKey = {};
const positionByKey = {};
for (const tag of Object.keys(keysByTag)) {
    keysByTag[tag].forEach((key, position) => {
        tagByKey[key] = tag;
        positionByKey[key] = position;
    });
}

// the key of an extension id or gallery address (also used by extension-difficulty.js)
export const extensionKeyOf = extensionId => {
    if (typeof extensionId !== 'string') return null;
    const match = extensionId.match(/^https:\/\/[^/]+\/(?:extensions\/|extension-code\/)?(.*)$/);
    return match ? match[1] : extensionId;
};

export const categoryTagOf = extensionId => tagByKey[extensionKeyOf(extensionId)] || null;

// the place inside its category (extensions without a category: after the others)
export const categoryPositionOf = extensionId => {
    const position = positionByKey[extensionKeyOf(extensionId)];
    return typeof position === 'number' ? position : Infinity;
};

// The topic categories of the extension library, in the order the list shows them (most useful for a
// beginner making games first). Each extension is listed once, under its key: the id of a built-in
// extension, or the part of a gallery address after the host (without "extensions/" or
// "extension-code/"). Inside a category the list follows the order below: the most used first,
// extensions that work together next to each other. An extension with no entry gets no topic tag.
export const categories = [
    { tag: 'cat_expansions', label: 'Block Expansions' },
    { tag: 'cat_sprites', label: 'Sprites / Clones' },
    { tag: 'cat_animation', label: 'Animation' },
    { tag: 'cat_effects', label: 'Visual Effects' },
    { tag: 'cat_pen', label: 'Pen / Colors' },
    { tag: 'cat_camera', label: 'Camera / Screen' },
    { tag: 'cat_physics', label: 'Physics / Collisions' },
    { tag: 'cat_input', label: 'Input / Controls' },
    { tag: 'cat_sound', label: 'Sound / Music' },
    { tag: 'cat_text', label: 'Text / Fonts' },
    { tag: 'cat_ui', label: 'Popups / Notifications' },
    { tag: 'cat_storage', label: 'Saving / Scenes / Files' },
    { tag: 'cat_data', label: 'Variables / Lists' },
    { tag: 'cat_math', label: 'Math / Random' },
    { tag: 'cat_time', label: 'Time / Timers' },
    { tag: 'cat_threed', label: '3D' },
    { tag: 'cat_video', label: 'Video / Webcam' },
    { tag: 'cat_utility', label: 'Utility Collections' },
    { tag: 'cat_network', label: 'Online / Multiplayer' },
    { tag: 'cat_services', label: 'Web Services' },
    { tag: 'cat_browser', label: 'Browser / Device' },
    { tag: 'cat_encoding', label: 'Encoding / Security' },
    { tag: 'cat_programming', label: 'Custom Blocks / Code' }
];

const keysByTag = {
    // more blocks for the built-in categories, in the editor's category order
    cat_expansions: [
        'pmMotionExpansion',
        'Lily/LooksPlus.js',
        'pmEventsExpansion',
        'Messages-Plus.js',
        'pmControlsExpansion',
        'Extra-Controls.js',
        'pmSensingExpansion',
        'obviousAlexC/SensingPlus.js',
        'Hyper-Sense-V2.js',
        'pmOperatorsExpansion'
    ],
    cat_sprites: [
        'Lily/ClonesPlus.js',
        'Sprite-Parenting.js',
        'jgTailgating',
        'SharkPool/Tile-Grids.js'
    ],
    cat_animation: [
        'jgTween',
        'Animations.js',
        'MubiLop/spritesheeter.js',
        'SVG-Spritesheets.js',
        'GIF-Manager.js'
    ],
    cat_effects: [
        'Sprite-Effects-V2.js',
        'Particle-Engine.js',
        'stretch.js',
        'Turbo-Skins.js',
        'Gen1x/lighting.js',
        'TheShovel/CanvasEffects.js',
        'Xeltalliv/clippingblending.js'
    ],
    cat_pen: [
        'pen',
        'obviousAlexC/penPlus.js',
        'Layer-Control.js',
        'Pen-Papers.js',
        'Color-Master.js',
        'jwColor',
        'TheShovel/ColorPicker.js'
    ],
    // the game camera, the window, and the project's frame rate and stage size
    cat_camera: [
        'pmCamera',
        'DogeisCut/Resolution.js',
        'CubesterYT/WindowControls.js',
        'runtime-options.js'
    ],
    cat_physics: [
        'box2d.js',
        'Lazy-Collisions.js',
        'Rigidbodies.js',
        'pooiod/Box2D.js'
    ],
    cat_input: [
        'KeysPlusV2.js',
        'Gamepad-Expanded.js',
        'cursor.js',
        'pointerlock.js',
        'veggiecan/mobilekeyboard.js',
        'gaimerI17/DeviceMotion.js',
        'CubesterYT/KeySimulation.js',
        'electricfuzzball_pm/MIDI.js'
    ],
    cat_sound: [
        'Lily/SoundExpanded.js',
        'music',
        'Tune-Shark-V3.js',
        'SharkPool/Sound-Waves.js',
        'Gen1x/beat_sync.js',
        'MIDI-Tools.js',
        'Recording-V2.js',
        'PuzzlingGGG/ttsrV2.js',
        'pooiod/Dictation.js'
    ],
    // working with text, and text shown on the stage
    cat_text: [
        'text.js',
        'Gen1x/iris-text.js',
        'SharkPool/Font-Manager.js',
        'Speech-Bubbles.js',
        'Medericoder/textcase.js',
        'Embin/embintranslation.js'
    ],
    cat_ui: [
        'Popup-Phoenix.js',
        'MubiLop/toastnotifs.js',
        'mdwalters/notifications.js',
        'TheShovel/CustomStyles.js'
    ],
    // saving progress, save states (scenes) and files
    cat_storage: [
        'local-storage.js',
        'Scenes.js',
        'Files-Expanded.js',
        'CST1229/zip.js'
    ],
    cat_data: [
        'Variables-Expanded.js',
        'qxsck/var-and-list.js',
        'Lily/ListTools.js',
        'Temporary-Variables.js'
    ],
    cat_math: [
        'true-fantom/math.js',
        'Gen1x/random_utils.js',
        'iygPerlin',
        'MubiLop/numutils.js',
        'NOname-awa/graphics2d.js',
        'Skyhigh173/bigint.js',
        'qxsck/big-decimal.js',
        'true-fantom/base.js',
        'bitwise.js'
    ],
    cat_time: [
        'steve0greatness/timers.js',
        'XeroName/Deltatime.js',
        'Time-Calculation.js'
    ],
    cat_threed: [
        'Xeltalliv/simple3D.js',
        'ObviousAlexC/3DMath.js',
        'Div/divVecQuat.js'
    ],
    cat_video: [
        'Lily/Video.js',
        'videoSensing',
        'Camera-Sensing-Plus.js',
        'lab/video-sprites.js',
        'lab/face-sensing.js',
        'pooiod/VideoSharing.js'
    ],
    cat_utility: [
        'utilities.js',
        'Lily/lmsutils.js',
        'TheShovel/ShovelUtils.js',
        'Sharktilities.js',
        'jgPrism'
    ],
    cat_network: [
        'cloudlink.js',
        'godslayerakp/ws.js',
        'MikeDev101/webrtc.js',
        'true-fantom/network.js',
        'MubiLop/penguinhook.js'
    ],
    cat_services: [
        'steamworks.js',
        'itchio.js',
        'NotHouse/DiscordAuth.js',
        'Ikelene/googleAuthExtension.js',
        'Geolocation.js'
    ],
    cat_browser: [
        'clipboard.js',
        'XmerOriginals/closecontrol.js',
        'DNin/wake-lock.js',
        'sharkpoolPrinting',
        'navigator.js',
        'battery.js'
    ],
    cat_encoding: [
        'encoding.js',
        'shovellzcompresss',
        'QR-Codes.js',
        'Clay/htmlEncode.js',
        'gaimerI17/crypto.js',
        'MikeDev101/e2ee.js'
    ],
    cat_programming: [
        'My-Blocks-Plus.js',
        'jwProto'
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

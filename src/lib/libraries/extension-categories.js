// The topic categories of the extension library, in the order the list shows them (most useful for a
// beginner making games first). Each extension is listed once, under its key: the id of a built-in
// extension, or the part of a gallery address after the host (without "extensions/" or
// "extension-code/"). Inside a category the list follows the order below: the most used first,
// extensions that work together next to each other. An extension with no entry gets no topic tag.
export const categories = [
    { tag: 'cat_expansions', label: 'Block Expansions' },
    { tag: 'cat_sprites', label: 'Sprites / Clones' },
    { tag: 'cat_looks', label: 'Costumes / Effects' },
    { tag: 'cat_animation', label: 'Animation / Particles' },
    { tag: 'cat_pen', label: 'Pen / Drawing / Colors' },
    { tag: 'cat_camera', label: 'Camera / Screen' },
    { tag: 'cat_physics', label: 'Physics / Collisions' },
    { tag: 'cat_threed', label: '3D / AR' },
    { tag: 'cat_input', label: 'Input / Controls' },
    { tag: 'cat_sound', label: 'Sound / Music / Speech' },
    { tag: 'cat_video', label: 'Video / Webcam' },
    { tag: 'cat_ui', label: 'Text Display / Popups' },
    { tag: 'cat_flow', label: 'Pause / Scenes / Runtime' },
    { tag: 'cat_storage', label: 'Saving / Files' },
    { tag: 'cat_data', label: 'Variables / Lists / Data' },
    { tag: 'cat_math', label: 'Math / Numbers / Random' },
    { tag: 'cat_time', label: 'Time / Timers' },
    { tag: 'cat_text', label: 'Text / Strings' },
    { tag: 'cat_utility', label: 'Utility Collections' },
    { tag: 'cat_network', label: 'Multiplayer / Web Requests' },
    { tag: 'cat_services', label: 'Web Services / Accounts' },
    { tag: 'cat_browser', label: 'Browser / Device' },
    { tag: 'cat_encoding', label: 'Encoding / Security' },
    { tag: 'cat_programming', label: 'Custom Blocks / Programming' },
    { tag: 'cat_debug', label: 'Debugging / Editor Tools' }
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
        'SharkPool/Tile-Grids.js',
        'Lily/Assets.js',
        'jwTargets'
    ],
    cat_looks: [
        'Sprite-Effects-V2.js',
        'stretch.js',
        'MubiLop/spritesheeter.js',
        'SVG-Spritesheets.js',
        'GIF-Manager.js',
        'Turbo-Skins.js',
        'TheShovel/CanvasEffects.js',
        'Gen1x/lighting.js',
        'Xeltalliv/clippingblending.js',
        'CST1229/images.js',
        'Image-Editor.js'
    ],
    cat_animation: [
        'jgTween',
        'Animations.js',
        'Particle-Engine.js'
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
    cat_camera: [
        'pmCamera',
        'DogeisCut/Resolution.js',
        'CubesterYT/WindowControls.js'
    ],
    cat_physics: [
        'box2d.js',
        'Lazy-Collisions.js',
        'Rigidbodies.js',
        'pooiod/Box2D.js',
        'NishiOwO/ode.js'
    ],
    cat_threed: [
        'Xeltalliv/simple3D.js',
        'ObviousAlexC/3DMath.js',
        'Div/divVecQuat.js',
        'ar.js'
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
        'Newgrounds-Audio.js',
        'SharkPool/Sound-Waves.js',
        'Gen1x/beat_sync.js',
        'MIDI-Tools.js',
        'Recording-V2.js',
        'PuzzlingGGG/ttsrV2.js',
        'pooiod/Dictation.js'
    ],
    cat_video: [
        'Lily/Video.js',
        'YouTube-Operations.js',
        'videoSensing',
        'Camera-Sensing-Plus.js',
        'lab/video-sprites.js',
        'lab/face-sensing.js',
        'pooiod/VideoSharing.js'
    ],
    cat_ui: [
        'Gen1x/iris-text.js',
        'SharkPool/Font-Manager.js',
        'Speech-Bubbles.js',
        'Popup-Phoenix.js',
        'MubiLop/toastnotifs.js',
        'mdwalters/notifications.js',
        'TheShovel/CustomStyles.js'
    ],
    cat_flow: [
        'Pause.js',
        'Scenes.js',
        'runtime-options.js',
        'jgRuntime',
        'Runtime-Events.js',
        'jgScripts',
        'Script-Control.js'
    ],
    cat_storage: [
        'local-storage.js',
        'Gen1x/storage_plus.js',
        'Ikelene/serverStorageExtension.js',
        'Files-Expanded.js',
        'Anonymous_cat1/updateFile.js',
        'CST1229/zip.js',
        '0832/rxFS2.js'
    ],
    cat_data: [
        'Variables-Expanded.js',
        'qxsck/var-and-list.js',
        'Lily/ListTools.js',
        'Temporary-Variables.js',
        'MrRedstonia/counterplusplus.js',
        'Skyhigh173/json.js',
        'JSON-Array.js',
        'vercte/dictionaries.js',
        'skyhigh173/object.js',
        'jwArray',
        'DogeisCut/dogeiscutObject.js',
        'DogeisCut/dogeiscutSet.js',
        'Div/divIterators.js',
        'jwXML',
        'AndrewGaming587/agBuffer.js'
    ],
    cat_math: [
        'true-fantom/math.js',
        'Gen1x/random_utils.js',
        'iygPerlin',
        'MubiLop/numutils.js',
        'DogeisCut/FormatNumbers.js',
        'jwVector',
        'NOname-awa/graphics2d.js',
        'Skyhigh173/bigint.js',
        'qxsck/big-decimal.js',
        'true-fantom/base.js',
        'bitwise.js'
    ],
    cat_time: [
        'steve0greatness/timers.js',
        'XeroName/Deltatime.js',
        '-SIPC-/time.js',
        'ddededodediamante/dateFormatV2.js',
        'Time-Calculation.js'
    ],
    cat_text: [
        'text.js',
        'Medericoder/textcase.js',
        'DogeisCut/YetAnotherStringExtension.js',
        'Embin/embintranslation.js',
        'true-fantom/regexp.js'
    ],
    cat_utility: [
        'utilities.js',
        'Lily/lmsutils.js',
        'TheShovel/ShovelUtils.js',
        'Sharktilities.js',
        'jgPrism',
        'Lily/McUtils.js'
    ],
    cat_network: [
        'cloudlink.js',
        'godslayerakp/ws.js',
        'MikeDev101/webrtc.js',
        'godslayerakp/http.js',
        'fetch.js',
        'Fetch-Progress.js',
        'true-fantom/network.js',
        'NamelessCat/corsproxy.js',
        'CubesterYT/Webhooks.js',
        'MubiLop/penguinhook.js',
        'Codefoxy/cfupload.js',
        'MubiLop/yeetyourfiles.js'
    ],
    cat_services: [
        'steamworks.js',
        'itchio.js',
        'NotHouse/DiscordAuth.js',
        'Ikelene/googleAuthExtension.js',
        'bop_tw/Twitch.js',
        'Spotify.js',
        'SoundCloud-API.js',
        'RubyDevs/turboweather.js',
        'Geolocation.js',
        'bruhbeast-pixel/CockatielLocation.js',
        'veggiecan/LongmanDictionary.js'
    ],
    cat_browser: [
        'clipboard.js',
        'XmerOriginals/closecontrol.js',
        'DNin/wake-lock.js',
        'sharkpoolPrinting',
        'navigator.js',
        'battery.js',
        'iframe.js',
        'jgIframe',
        'ZXMushroom63/searchApi.js',
        'pooiod/WindowHasher.js',
        'DOM-Selector.js'
    ],
    cat_encoding: [
        'encoding.js',
        'Lily/Cast.js',
        'numerical-encoding-2.js',
        'shovellzcompresss',
        'QR-Codes.js',
        'Clay/htmlEncode.js',
        'gaimerI17/crypto.js',
        'MikeDev101/e2ee.js'
    ],
    cat_programming: [
        'My-Blocks-Plus.js',
        'Dropdown-Maker.js',
        'jwLambda',
        'jwScope',
        'jwPointer',
        'jwProto',
        'Lily/AllMenus.js',
        'SPjavascriptV2',
        'TheShovel/extexp.js'
    ],
    cat_debug: [
        'Better-Comments.js',
        'TheShovel/shoveldebugger.js',
        '-SIPC-/consoles.js',
        'Sprite-Panel.js'
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

const keyOf = extensionId => {
    if (typeof extensionId !== 'string') return null;
    const match = extensionId.match(/^https:\/\/[^/]+\/(?:extensions\/|extension-code\/)?(.*)$/);
    return match ? match[1] : extensionId;
};

export const categoryTagOf = extensionId => tagByKey[keyOf(extensionId)] || null;

// the place inside its category (extensions without a category: after the others)
export const categoryPositionOf = extensionId => {
    const position = positionByKey[keyOf(extensionId)];
    return typeof position === 'number' ? position : Infinity;
};

// The 21 topic categories of the extension library. Each extension is listed once, under its key:
// the id of a built-in extension, or the part of a gallery address after the host (without
// "extensions/" or "extension-code/"). An extension with no entry here gets no topic tag.
export const categories = [
    { tag: 'cat_expansions', label: 'Block Category Expansions' },
    { tag: 'cat_sprites', label: 'Sprites, Costumes & Clones' },
    { tag: 'cat_animation', label: 'Animation & Motion' },
    { tag: 'cat_graphics', label: 'Graphics & Rendering' },
    { tag: 'cat_threed', label: '3D & Vectors' },
    { tag: 'cat_physics', label: 'Physics & Collisions' },
    { tag: 'cat_sound', label: 'Sound, Music & Speech' },
    { tag: 'cat_camera', label: 'Camera, Video & Face' },
    { tag: 'cat_input', label: 'Input & Controls' },
    { tag: 'cat_ui', label: 'UI, Popups & Notifications' },
    { tag: 'cat_control', label: 'Project & Script Control' },
    { tag: 'cat_data', label: 'Variables, Lists & Data' },
    { tag: 'cat_text', label: 'Text & Strings' },
    { tag: 'cat_math', label: 'Math, Numbers & Random' },
    { tag: 'cat_time', label: 'Time & Dates' },
    { tag: 'cat_storage', label: 'Storage & Files' },
    { tag: 'cat_encoding', label: 'Encoding, Conversion & Security' },
    { tag: 'cat_network', label: 'Network & Web Services' },
    { tag: 'cat_browser', label: 'Browser, Window & Device' },
    { tag: 'cat_programming', label: 'Programming & Developer Tools' },
    { tag: 'cat_utility', label: 'Utility Collections' }
];

const keysByTag = {
    cat_expansions: [
        'pmMotionExpansion',
        'pmEventsExpansion',
        'pmControlsExpansion',
        'pmSensingExpansion',
        'pmOperatorsExpansion',
        'obviousAlexC/SensingPlus.js',
        'Lily/LooksPlus.js',
        'Hyper-Sense-V2.js',
        'Extra-Controls.js',
        'Messages-Plus.js'
    ],
    cat_sprites: [
        'Lily/ClonesPlus.js',
        'jwTargets',
        'Sprite-Parenting.js',
        'Turbo-Skins.js',
        'MubiLop/spritesheeter.js',
        'SVG-Spritesheets.js',
        'GIF-Manager.js',
        'Lily/Assets.js',
        'SharkPool/Tile-Grids.js'
    ],
    cat_animation: [
        'jgTween',
        'Animations.js',
        'TheShovel/qoan-renderer.js',
        'jgTailgating'
    ],
    cat_graphics: [
        'pen',
        'obviousAlexC/penPlus.js',
        'Pen-Papers.js',
        'pmCamera',
        'Layer-Control.js',
        'Renderer-Control.js',
        'stretch.js',
        'Xeltalliv/clippingblending.js',
        'TheShovel/CanvasEffects.js',
        'Longboost/color_channels.js',
        'Sprite-Effects-V2.js',
        'Particle-Engine.js',
        'Gen1x/lighting.js',
        'CST1229/images.js',
        'Image-Editor.js',
        'jwColor',
        'Color-Master.js',
        'TheShovel/ColorPicker.js'
    ],
    cat_threed: [
        'Xeltalliv/simple3D.js',
        'ObviousAlexC/3DMath.js',
        'Div/divVecQuat.js',
        'jwVector',
        'ar.js'
    ],
    cat_physics: [
        'box2d.js',
        'pooiod/Box2D.js',
        'NishiOwO/ode.js',
        'Rigidbodies.js',
        'Lazy-Collisions.js'
    ],
    cat_sound: [
        'music',
        'jgExtendedAudio',
        'Tune-Shark-V3.js',
        'SharkPool/Sound-Waves.js',
        'Lily/SoundExpanded.js',
        'MIDI-Tools.js',
        'NishiOwO/libxmp.js',
        'Recording-V2.js',
        'Newgrounds-Audio.js',
        'Gen1x/beat_sync.js',
        'PuzzlingGGG/ttsrV2.js',
        'pooiod/Dictation.js'
    ],
    cat_camera: [
        'videoSensing',
        'lab/face-sensing.js',
        'Camera-Sensing-Plus.js',
        'lab/video-sprites.js',
        'Lily/Video.js',
        'pooiod/VideoSharing.js'
    ],
    cat_input: [
        'KeysPlusV2.js',
        'Gamepad-Expanded.js',
        'CubesterYT/KeySimulation.js',
        'pointerlock.js',
        'cursor.js',
        'veggiecan/mobilekeyboard.js',
        'electricfuzzball_pm/MIDI.js',
        'gaimerI17/DeviceMotion.js'
    ],
    cat_ui: [
        'LordCat0/ProjectInterfaces.js',
        'Popup-Phoenix.js',
        'Speech-Bubbles.js',
        'Sty-Lists.js',
        'TheShovel/CustomStyles.js',
        'NexusKitten/controlcontrols.js',
        'mdwalters/notifications.js',
        'MubiLop/toastnotifs.js',
        'Gen1x/iris-text.js'
    ],
    cat_control: [
        'Pause.js',
        'Scenes.js',
        'Script-Control.js',
        'Runtime-Events.js',
        'jgScripts',
        'jgRuntime',
        'runtime-options.js'
    ],
    cat_data: [
        'jwArray',
        'DogeisCut/dogeiscutObject.js',
        'DogeisCut/dogeiscutSet.js',
        'Div/divIterators.js',
        'AndrewGaming587/agBuffer.js',
        'jwXML',
        'JSON-Array.js',
        'Skyhigh173/json.js',
        'skyhigh173/object.js',
        'vercte/dictionaries.js',
        'qxsck/var-and-list.js',
        'Lily/ListTools.js',
        'Temporary-Variables.js',
        'Variables-Expanded.js'
    ],
    cat_text: [
        'text.js',
        'Medericoder/textcase.js',
        'DogeisCut/YetAnotherStringExtension.js',
        'true-fantom/regexp.js',
        'SharkPool/Font-Manager.js',
        'Embin/embintranslation.js',
        'MrRedstonia/counterplusplus.js'
    ],
    cat_math: [
        'true-fantom/math.js',
        'Skyhigh173/bigint.js',
        'qxsck/big-decimal.js',
        'MubiLop/numutils.js',
        'DogeisCut/FormatNumbers.js',
        'NOname-awa/graphics2d.js',
        'iygPerlin',
        'Seeds.js',
        'Gen1x/random_utils.js'
    ],
    cat_time: [
        '-SIPC-/time.js',
        'ddededodediamante/dateFormatV2.js',
        'Time-Calculation.js',
        'XeroName/Deltatime.js',
        'steve0greatness/timers.js'
    ],
    cat_storage: [
        'Files-Expanded.js',
        'CST1229/zip.js',
        '0832/rxFS2.js',
        'local-storage.js',
        'Gen1x/storage_plus.js',
        'Ikelene/serverStorageExtension.js',
        'Anonymous_cat1/updateFile.js'
    ],
    cat_encoding: [
        'encoding.js',
        'true-fantom/base.js',
        'bitwise.js',
        'Lily/Cast.js',
        'numerical-encoding-2.js',
        'Clay/htmlEncode.js',
        'shovellzcompresss',
        'gaimerI17/crypto.js',
        'MikeDev101/e2ee.js',
        'QR-Codes.js'
    ],
    cat_network: [
        'fetch.js',
        'Fetch-Progress.js',
        'godslayerakp/http.js',
        'godslayerakp/ws.js',
        'MikeDev101/webrtc.js',
        'CubesterYT/Webhooks.js',
        'MubiLop/penguinhook.js',
        'true-fantom/network.js',
        'cloudlink.js',
        'NamelessCat/corsproxy.js',
        'Codefoxy/cfupload.js',
        'MubiLop/yeetyourfiles.js',
        'SammerLOL/pangapi.js',
        'bop_tw/Twitch.js',
        'YouTube-Operations.js',
        'Spotify.js',
        'SoundCloud-API.js',
        'Google-Spreadsheets.js',
        'veggiecan/LongmanDictionary.js',
        'RubyDevs/turboweather.js',
        'bruhbeast-pixel/CockatielLocation.js',
        'Geolocation.js',
        'steamworks.js',
        'itchio.js',
        'Ikelene/googleAuthExtension.js',
        'NotHouse/DiscordAuth.js'
    ],
    cat_browser: [
        'DogeisCut/Resolution.js',
        'CubesterYT/WindowControls.js',
        'veggiecan/browserfullscreen.js',
        'XmerOriginals/closecontrol.js',
        'DNin/wake-lock.js',
        'navigator.js',
        'battery.js',
        'clipboard.js',
        'ZXMushroom63/searchApi.js',
        'pooiod/WindowHasher.js',
        'DOM-Selector.js',
        'jgIframe',
        'iframe.js',
        'sharkpoolPrinting'
    ],
    cat_programming: [
        'SPjavascriptV2',
        'jwLambda',
        'jwScope',
        'jwPointer',
        'Div/divAlgEffects.js',
        'jwProto',
        'My-Blocks-Plus.js',
        'Dropdown-Maker.js',
        'Lily/AllMenus.js',
        'Better-Comments.js',
        'Sprite-Panel.js',
        '-SIPC-/consoles.js',
        'TheShovel/shoveldebugger.js',
        'TheShovel/extexp.js'
    ],
    cat_utility: [
        'utilities.js',
        'TheShovel/ShovelUtils.js',
        'Lily/lmsutils.js',
        'Sharktilities.js',
        'jgPrism',
        'true-fantom/couplers.js',
        'Lily/McUtils.js'
    ]
};

const tagByKey = {};
for (const tag of Object.keys(keysByTag)) {
    for (const key of keysByTag[tag]) tagByKey[key] = tag;
}

export const categoryTagOf = extensionId => {
    if (typeof extensionId !== 'string') return null;
    const match = extensionId.match(/^https:\/\/[^/]+\/(?:extensions\/|extension-code\/)?(.*)$/);
    return tagByKey[match ? match[1] : extensionId] || null;
};

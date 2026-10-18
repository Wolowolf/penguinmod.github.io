import {extensionKeyOf} from './extension-categories.js';

// How easy each extension of the library is to use and understand, shown as a coloured number on its
// picture: 1 a few plain blocks that work at once, 2 more blocks or one new idea, 3 needs some
// understanding (data formats, physics, services, many blocks), 4 advanced (3D, shaders, networking,
// JavaScript, encryption). Keys as in extension-categories.js. No entry: no badge.
const difficultyByKey = {
    // Block Expansions
    'pmMotionExpansion': 1,
    'Lily/LooksPlus.js': 2,
    'pmEventsExpansion': 2,
    'Messages-Plus.js': 2,
    'pmControlsExpansion': 2,
    'Extra-Controls.js': 3,
    'pmSensingExpansion': 1,
    'obviousAlexC/SensingPlus.js': 2,
    'Hyper-Sense-V2.js': 2,
    'pmOperatorsExpansion': 2,
    // Sprites / Clones
    'Lily/ClonesPlus.js': 2,
    'Sprite-Parenting.js': 2,
    'jgTailgating': 2,
    'SharkPool/Tile-Grids.js': 2,
    // Costumes / Effects
    'Sprite-Effects-V2.js': 3,
    'stretch.js': 1,
    'MubiLop/spritesheeter.js': 2,
    'SVG-Spritesheets.js': 3,
    'GIF-Manager.js': 2,
    'Turbo-Skins.js': 2,
    'TheShovel/CanvasEffects.js': 1,
    'Gen1x/lighting.js': 3,
    'Xeltalliv/clippingblending.js': 3,
    // Animation / Particles
    'jgTween': 2,
    'Animations.js': 2,
    'Particle-Engine.js': 3,
    // Pen / Drawing / Colors
    'pen': 1,
    'obviousAlexC/penPlus.js': 4,
    'Layer-Control.js': 2,
    'Pen-Papers.js': 2,
    'Color-Master.js': 2,
    'jwColor': 3,
    'TheShovel/ColorPicker.js': 1,
    // Camera / Screen
    'pmCamera': 2,
    'DogeisCut/Resolution.js': 2,
    'CubesterYT/WindowControls.js': 1,
    // Physics / Collisions
    'box2d.js': 3,
    'Lazy-Collisions.js': 2,
    'Rigidbodies.js': 3,
    'pooiod/Box2D.js': 4,
    // 3D
    'Xeltalliv/simple3D.js': 4,
    'ObviousAlexC/3DMath.js': 4,
    'Div/divVecQuat.js': 4,
    // Input / Controls
    'KeysPlusV2.js': 2,
    'Gamepad-Expanded.js': 2,
    'cursor.js': 1,
    'pointerlock.js': 1,
    'veggiecan/mobilekeyboard.js': 2,
    'gaimerI17/DeviceMotion.js': 2,
    'CubesterYT/KeySimulation.js': 2,
    'electricfuzzball_pm/MIDI.js': 3,
    // Sound / Music / Speech
    'Lily/SoundExpanded.js': 1,
    'music': 1,
    'Tune-Shark-V3.js': 3,
    'SharkPool/Sound-Waves.js': 2,
    'Gen1x/beat_sync.js': 3,
    'MIDI-Tools.js': 4,
    'Recording-V2.js': 2,
    'PuzzlingGGG/ttsrV2.js': 1,
    'pooiod/Dictation.js': 1,
    // Video / Webcam
    'Lily/Video.js': 2,
    'videoSensing': 1,
    'Camera-Sensing-Plus.js': 2,
    'lab/video-sprites.js': 2,
    'lab/face-sensing.js': 2,
    'pooiod/VideoSharing.js': 3,
    // Text Display / Popups
    'Gen1x/iris-text.js': 3,
    'SharkPool/Font-Manager.js': 2,
    'Speech-Bubbles.js': 2,
    'Popup-Phoenix.js': 3,
    'MubiLop/toastnotifs.js': 2,
    'mdwalters/notifications.js': 1,
    // Pause / Scenes / Runtime
    'Scenes.js': 3,
    'runtime-options.js': 2,
    // Saving / Files
    'local-storage.js': 1,
    'Files-Expanded.js': 2,
    'CST1229/zip.js': 3,
    // Variables / Lists / Data
    'Variables-Expanded.js': 2,
    'qxsck/var-and-list.js': 2,
    'Lily/ListTools.js': 2,
    'Temporary-Variables.js': 2,
    // Math / Numbers / Random
    'true-fantom/math.js': 2,
    'Gen1x/random_utils.js': 1,
    'iygPerlin': 2,
    'MubiLop/numutils.js': 1,
    'NOname-awa/graphics2d.js': 2,
    'Skyhigh173/bigint.js': 2,
    'qxsck/big-decimal.js': 2,
    'true-fantom/base.js': 2,
    'bitwise.js': 3,
    // Time / Timers
    'steve0greatness/timers.js': 1,
    'XeroName/Deltatime.js': 2,
    'Time-Calculation.js': 2,
    // Text / Strings
    'text.js': 1,
    'Medericoder/textcase.js': 1,
    'Embin/embintranslation.js': 2,
    // Utility Collections
    'utilities.js': 1,
    'Lily/lmsutils.js': 2,
    'TheShovel/ShovelUtils.js': 2,
    'Sharktilities.js': 3,
    'jgPrism': 2,
    // Multiplayer / Web Requests
    'cloudlink.js': 4,
    'godslayerakp/ws.js': 4,
    'MikeDev101/webrtc.js': 4,
    'true-fantom/network.js': 3,
    'MubiLop/penguinhook.js': 3,
    // Web Services / Accounts
    'steamworks.js': 3,
    'itchio.js': 3,
    'NotHouse/DiscordAuth.js': 3,
    'Ikelene/googleAuthExtension.js': 3,
    'Geolocation.js': 2,
    // Browser / Device
    'clipboard.js': 1,
    'DNin/wake-lock.js': 1,
    'sharkpoolPrinting': 2,
    'navigator.js': 1,
    'battery.js': 1,
    // Encoding / Security
    'encoding.js': 2,
    'shovellzcompresss': 2,
    'QR-Codes.js': 1,
    'Clay/htmlEncode.js': 2,
    'gaimerI17/crypto.js': 3,
    'MikeDev101/e2ee.js': 4,
    // Custom Blocks / Programming
    'My-Blocks-Plus.js': 3,
    'jwProto': 3
};

export const difficultyOf = extensionId => difficultyByKey[extensionKeyOf(extensionId)] || null;

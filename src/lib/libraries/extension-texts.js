import {extensionKeyOf} from './extension-categories.js';

// Rewritten title and description of every extension of the library: a plain name, a few-word summary
// (shown in the normal text color) and the details, everything the blocks can do (shown in light grey),
// written from the blocks themselves. The library shows these unless the "Show original titles" button in
// its side bar is used. Keys as in extension-categories.js.
const textsByKey = {
    // Block Expansions
    'pmMotionExpansion': ['More Motion', 'Extra movement blocks.', 'Move steps toward or a percentage of the way to a point, home position, touching a point or rectangle, direction and distance to a point, rotation style, sprite and costume width and height, manual fencing.'],
    'Lily/LooksPlus.js': ['More Looks', 'Control any sprite\'s looks.', 'Layer and effects of other sprites, costume count and details (size, rotation center, SVG, data URI), replace or restore costume images, recolor SVGs.'],
    'pmEventsExpansion': ['More Events', 'New hats and broadcasts.', 'Broadcasts with data, to one sprite, or waiting for an answer; hats for conditions, changed values, key hit or release, every N frames, clicks, dragging, clones, costume switches, fullscreen and saving; sprite clicked check; force-run a hat.'],
    'pmControlsExpansion': ['More Control', 'Else-if and script restarts.', 'If / else if / else, run blocks as a separate script (with data), restart the script from the top.'],
    'Extra-Controls.js': ['Advanced Control', 'Powerful loops, threads and functions.', 'Wait until a value changes, loops with counts, time limits and conditions, loop index and timer, run blocks at once, in new threads or step by step, branches by ID, act as other sprites or clones, functions, force hats on or off, key rebinding.'],
    'pmSensingExpansion': ['More Sensing', 'Extra keyboard, mouse and device info.', 'Keys held and how long, last key, mouse buttons, color at a point, loudness, layer count, sprite name, milliseconds, page address and its parts, vibration, packaged, in-frame and changed checks, text checks, operating system and browser.'],
    'obviousAlexC/SensingPlus.js': ['Touch & Device Sensing', 'Multi-touch and motion sensors.', 'Several touch fingers (position, speed, touching), gyroscope and accelerometer.'],
    'Hyper-Sense-V2.js': ['Advanced Sensing', 'Detailed input, touching and ask boxes.', 'Scroll distance and speed on both axes, real mouse position and speed, key blocking, pointing at or touching clones by variable, sprites touching or near another, colors under a sprite, ask boxes for passwords, numbers, colors or dropdowns, displayed stage size.'],
    'pmOperatorsExpansion': ['More Operators', 'Extra math, logic and text operators.', 'Integer, prime, even, multiple and range checks, solve equations, ratios, π, e, ∞, truncate, atan2, shuffle text, text before or after, exact equals, text replacers, sound speed and pitch.'],
    // Sprites / Clones
    'Lily/ClonesPlus.js': ['More Clones', 'Tell clones apart by variable.', 'Create clones with a variable set, then find, count, stop or delete clones by variable, read and set variables of clones or the main sprite, touching clones or the main sprite.'],
    'Sprite-Parenting.js': ['Sprite Families', 'Sprites that follow a parent.', 'Group sprites under a parent; children follow its position, direction, size, effects or visibility; add, remove and list members.'],
    'jgTailgating': ['Follow Behind', 'Sprites trailing another sprite.', 'Record a sprite\'s past positions so other sprites or clones follow it at a distance, like RPG party members.'],
    'SharkPool/Tile-Grids.js': ['Tile Grids', 'Place sprites on grids.', 'Grids with a tile size and offset; place or snap sprites onto tiles.'],
    // Costumes / Effects
    'Sprite-Effects-V2.js': ['Image Filters', 'Filters for sprites and the stage.', 'Turn sprites or images into SVGs with tint, blur, blending, shadows, glow, pixelation, wave, glitch, VHS, mosaic, dither, distortion, lights, patterns, masks or skew; filters on the whole stage.'],
    'MubiLop/spritesheeter.js': ['Spritesheets', 'Animate from spritesheet images.', 'Cut a spritesheet into frames by size or XML, step through frames, read frame names, sizes and images, set a sprite\'s costume to a frame.'],
    'SVG-Spritesheets.js': ['SVG Spritesheets', 'Pack SVGs into one sheet.', 'Compress SVGs, combine several into one sheet and take them out again, split an SVG into its groups.'],
    'GIF-Manager.js': ['GIFs', 'Make and split GIFs.', 'Build GIFs from images with size, colors, dithering and frame delays, export them; read the frames of a GIF.'],
    'Turbo-Skins.js': ['Skins', 'Any image as a sprite\'s look.', 'Show an image, costume or another sprite on any sprite as a skin with its own rotation center and hitbox.'],
    'TheShovel/CanvasEffects.js': ['Stage Effects', 'Effects on the whole stage.', 'Blur, contrast, saturation, color shift, brightness, invert, sepia, transparency, scale, skew, offset, rotation, borders, rounded corners; render size and pixelated scaling.'],
    'Gen1x/lighting.js': ['Lighting', 'Lights and shadows over the stage.', 'Point, spot and area lights with ambient light, shadows and bloom; sprites left out or touching lights; pixelation, contrast, color temperature; follow the camera.'],
    'Xeltalliv/clippingblending.js': ['Clipping & Blending', 'Crop sprites and blend colors.', 'Hide a sprite outside a rectangle; draw it with additive, subtract, multiply, invert, mask or erase blending.'],
    // Animation / Particles
    'jgTween': ['Tweening', 'Smooth eased animations.', 'Change variables, position or other properties over time with easing styles; eased values between two numbers.'],
    'Animations.js': ['Costume Animations', 'Animations and keyframes.', 'Animations from costumes with pauses and speed; play, loop or stop them; keyframes for position, direction, scale and stretch.'],
    'Particle-Engine.js': ['Particles', 'Particle effects without clones.', 'Emitters on any sprite: texture or shape, amount, lifetime, speed, gravity, spin, size, stretch, color and fade over time, waves, blend modes, trails; save and load settings.'],
    // Pen / Drawing / Colors
    'pen': ['Pen', 'Draw on the stage.', 'Lines and stamps with color and size; squares, triangles, polygons, images (resized, cropped, rotated) and text with font, size, color and outline; pen in front or behind.'],
    'obviousAlexC/penPlus.js': ['Pen Plus', 'Fast advanced drawing.', 'Draws on the graphics card: dots, lines, textured squares and triangles, an image library with pixel editing, custom shaders, cubemaps, drawing from lists, render textures, depth.'],
    'Layer-Control.js': ['Layer Control', 'Reorder pen, video and sprites.', 'Put the pen, camera video, backdrop or any sprite on any layer, swap layers, list layers and their owners.'],
    'Pen-Papers.js': ['Pen Layers', 'Several pen layers.', 'Create, switch, show or hide layers, save one as an image, touching checks.'],
    'Color-Master.js': ['Color Tools', 'Mix, convert and blend colors.', 'Mix, invert, adjust, compare and randomize hex colors; convert between hex, RGB, HSV and decimal; linear, radial and conic gradients.'],
    'TheShovel/ColorPicker.js': ['Color Picker', 'The system color picker.', 'Open it at a position, read the chosen color as hex or RGB, hat when it changes.'],
    // Camera / Screen
    'pmCamera': ['Camera', 'A movable stage camera.', 'Move, turn and zoom a camera over the stage; several cameras; bind sprites, the mouse or the backdrop to one.'],
    'DogeisCut/Resolution.js': ['Screen Resolution', 'Adapt to any window size.', 'Pixel ratio, suggested stage size, hat when the window resizes, edge and anchor positions for any stage size.'],
    'CubesterYT/WindowControls.js': ['Window Controls', 'Control the app window.', 'Move, resize, rename, close or make it fullscreen; screen size, focus and screen-edge checks.'],
    // Physics / Collisions
    'Lazy-Collisions.js': ['Box Collisions', 'Quick side-by-side checks.', 'Is a sprite on, near or past a side of another; put a sprite against a side; find clones by variable.'],
    'Rigidbodies.js': ['Collision Shapes', 'Fast math-based hitboxes.', 'Square, circle and polygon shapes on sprites: touching, points, distances, bounding boxes, position, direction, scale, debug outline.'],
    'pooiod/Box2D.js': ['Physics Objects & Joints', 'Physics with joints and springs.', 'Box2D with named circles, boxes, polygons or costume shapes, and sprites that follow them: forces, velocity, collision layers, impacts, springs, sliders, pins and other joints, gravity, wind, slow motion.'],
    // 3D / AR
    'Xeltalliv/simple3D.js': ['3D Graphics', 'Real 3D rendering.', 'On the graphics card: meshes with colors, textures (costume, text, URL, video), instances and bones, OBJ and OFF models, perspective and transforms, render to textures, fog, blending, culling.'],
    'ObviousAlexC/3DMath.js': ['3D Math', 'Build 3D from sprites.', '2D and 3D vectors and quaternions and their math, a 3D camera that projects points to the screen, 3D position and size for sprites, 3D triangles with Pen Plus.'],
    // Input / Controls
    'KeysPlusV2.js': ['Keys Plus', 'Key combos, keybindings and simulated input.', 'Key-combination presses, hits and hold times, details of the current key, mouse button hats, clicks and hold times, named actions bound to keys, key tags, save and load bindings; simulated key presses, mouse clicks and mouse moves.'],
    'Gamepad-Expanded.js': ['Gamepad', 'Game controller input.', 'Buttons, triggers and sticks (direction, strength, deadzones), press and move hats, rumble.'],
    'cursor.js': ['Mouse Cursor', 'Change or lock the mouse cursor.', 'Use a system cursor or the current costume, or hide it; lock the pointer in the stage so mouse x and y report movement, for mouse-look games.'],
    'veggiecan/mobilekeyboard.js': ['Mobile Keyboard', 'On-screen keyboard on phones.', 'Show it (text, number, email, web, search) without a popup; read and edit the typed text and selection. Android only.'],
    'gaimerI17/DeviceMotion.js': ['Device Motion', 'Phone and tablet movement.', 'Acceleration, rotation rate, direction, tilt, shaking, calibration.'],
    'electricfuzzball_pm/MIDI.js': ['MIDI Keyboard', 'Play with a MIDI keyboard.', 'Notes pressed and released with velocity and channel, drum pads, pitch bend, mod wheel, note sequences, devices.'],
    // Sound / Music / Speech
    'Lily/SoundExpanded.js': ['More Sound', 'Looping and sound control.', 'Loop sounds or parts of them, play from or between times, stop, pause and resume, length, channels, sample rate, data, effects of other sprites, project volume.'],
    'music': ['Music', 'Instruments and drums.', 'Play drums and notes, rests and tempo.'],
    'Tune-Shark-V3.js': ['Audio Engine', 'Advanced sound with effects.', 'Load sounds from URLs or the project and play them looped, reversed, cropped or joined, with pitch, speed, pan, 3D pan, reverb, delay, distortion, filters, tremolo, flanger, compressor, equalizer, bitcrush; loudness, BPM and frequencies.'],
    'SharkPool/Sound-Waves.js': ['Synth Notes', 'Generate tones.', 'Play sine, square, sawtooth or triangle notes for a time or until stopped, with volume and pitch per note; keyboard keys as notes.'],
    'Gen1x/beat_sync.js': ['Beat Sync', 'Sync to a musical beat.', 'BPM and measures, beat and measure numbers, wait for beats, hats on beats, steps and measures.'],
    'MIDI-Tools.js': ['MIDI Files', 'Play and read MIDI songs.', 'Load from a URL, file, list or base64; play with speed, transpose and track muting; note hats, notes at a time, BPM, note names and frequencies.'],
    'Recording-V2.js': ['Microphone Recording', 'Record the microphone.', 'Loudness, save the recording as a sound or download it.'],
    'PuzzlingGGG/ttsrV2.js': ['Text to Speech', 'Speak text aloud, offline.', 'Pocket TTS (6 languages) and Supertonic 3 (31 languages) voices made on this computer: speak, stop, speaking?, voice and language, speed, pitch, voice cloning; "Make a speech sound" also with Loudkit; credits added.'],
    'pooiod/Dictation.js': ['Speech to Text', 'Type with your voice, offline.', 'Speech in 40 languages turned into text on this computer (Moonshine for English, Whisper for others): listen, live text, "When I hear" hat, language, high accuracy (Parakeet). Mic on only while listening; credits.'],
    // Video / Webcam
    'Lily/Video.js': ['Video Player', 'Play videos on sprites.', 'Load videos from URLs onto sprites or the stage: play, pause, loop, seek, volume, speed, time, size, screenshots.'],
    'lab/face-sensing.js': ['Camera Sensing', 'Camera motion, faces and frames.', 'Turn the camera on, flipped or off, its transparency, show it on sprites; motion and direction on sprites or the stage, motion hat; go to the nose, eyes, ears, mouth or head, face tilt and size, hats for tilting and touching parts; video frames as images at any size.'],
    'pooiod/VideoSharing.js': ['Screen Share', 'Capture the screen or camera.', 'Get frames as PNG, JPEG, WEBP or hex at any resolution; show an image.'],
    // Text Display / Popups
    'Gen1x/iris-text.js': ['Rich Text', 'Styled, animated text on sprites.', 'Fonts, colors, gradients, shadows, borders, backgrounds and markup; typewriter effect; move, rotate, scale, color, animate and mask single characters; size limits and spacing.'],
    'SharkPool/Font-Manager.js': ['Fonts', 'Add custom fonts.', 'From URLs or the system; remove and list them, font details, hat when fonts change.'],
    'Speech-Bubbles.js': ['Speech Bubbles', 'Custom speech bubbles.', 'On any sprite, with font, size, alignment, width, colors, image, arrow, offset, glow and effects.'],
    'Popup-Phoenix.js': ['Popups', 'Custom popup windows.', 'Labels, text, number, slider and dropdown inputs and button rows; position, fonts, borders, shadows, effects; wait for and read answers.'],
    'MubiLop/toastnotifs.js': ['Notifications', 'Pop-up and system notifications.', 'Toasts with title, image, position, custom style and sound; operating-system notifications after asking permission.'],
    // Pause / Scenes / Runtime
    'Scenes.js': ['Scenes', 'Save and switch project states.', 'Save the whole project state as named scenes and switch between them; hat on switch.'],
    'runtime-options.js': ['Runtime Options', 'Change project settings.', 'Turbo mode, frame rate, stage size, username, hat when they change. Clone limit, fencing, limits, pen quality and interpolation are fixed in this app.'],
    // Saving / Files
    'local-storage.js': ['Local Storage', 'Save data on this computer.', 'Values that stay after closing; separate namespaces; hat when another window changes them.'],
    'Files-Expanded.js': ['Files', 'Open and save files.', 'Open files or folders as text, data URL, base64 or hex, download text or URLs as files, keep stored files, sizes and dates, styled file picker.'],
    'CST1229/zip.js': ['Zip Files', 'Make and edit zip files.', 'Create, open and edit archives (also .sb3): files, folders, renaming, copying, details, comments, compression.'],
    // Variables / Lists / Data
    'Variables-Expanded.js': ['Variables & Lists', 'Variables, lists and their monitors.', 'Read, set, swap, create and delete variables by name; add, delete, replace, find, count, sort, join, copy and repeat list items; variables or lists as JSON; monitor visibility, position, type, slider range, buttons, display name, font and effects.'],
    'Temporary-Variables.js': ['Temporary Variables', 'Short-lived variables.', 'Variables that exist only for a script, a sprite, the project run or a block of code.'],
    // Math / Numbers / Random
    'true-fantom/math.js': ['More Math', 'Extra math operators.', 'Negative, approximate comparisons, exact contains, sign, map range, trigonometry in radians, safe number and fraction checks.'],
    'Gen1x/random_utils.js': ['Random Tools', 'More kinds of randomness.', 'Seeded random numbers, random strings, colors and chances; Perlin and random noise with seeds and octaves, for terrain and clouds.'],
    'MubiLop/numutils.js': ['Number Format', 'Pretty-print numbers.', 'By language, decimals, significant figures, exponent, short (K, M, B), currency or percent; round to a multiple, finite check.'],
    'NOname-awa/graphics2d.js': ['Geometry', '2D shape math.', 'Distance and direction between points, perpendicular check, area and perimeter of triangles, quadrilaterals, polygons and circles.'],
    'qxsck/big-decimal.js': ['Big Decimals', 'Precise and huge numbers.', 'Chosen precision: arithmetic, powers, remainder, comparisons, functions, bitwise operations, rounding, random numbers; whole numbers of any size at full speed.'],
    'bitwise.js': ['Bitwise', 'Work with binary bits.', 'Shifts, rotations, and, or, xor, not.'],
    // Time / Timers
    'steve0greatness/timers.js': ['Timers', 'Extra timers.', 'Start, pause, stop, restart and add time, in seconds, milliseconds or minutes; hat when one passes a time.'],
    'XeroName/Deltatime.js': ['Delta Time', 'Frame timing.', 'Time since the last frame and frames in the last second.'],
    'Time-Calculation.js': ['Time Math', 'Date and time calculations.', 'Differences between dates in any unit, countdowns, seconds to readable time, days in a month.'],
    // Text / Strings
    'text.js': ['Text Tools', 'Edit and search text.', 'Split, repeat, reverse, trim, letter cases (find, check and convert: capitalized, sentence, title, mixed, inverted and more), glitch text, regular expressions: replace, find and count matches.'],
    'Embin/embintranslation.js': ['Translations', 'Projects in several languages.', 'Translation keys per language with values and placeholders, user and current language, JSON import and export.'],
    // Utility Collections
    'TheShovel/ShovelUtils.js': ['Shovel Utilities', 'Import assets and edit the project.', 'Import images, sounds, sprites, projects or extensions from URLs; delete sprites or costumes; choose the edited sprite; color brightness.'],
    'Sharktilities.js': ['Sharktilities', 'Mixed sprite and text utilities.', 'What a sprite says, set another sprite\'s costume or effects, unclamped sound effects, broadcast and repeat while waiting, smoothing, SVG shapes, text, rounding, random and multi-join tools, pen layer image.'],
    'jgPrism': ['Prism', 'Image data helpers.', 'Stage screenshot, data URLs of costumes and images, data URL and array buffer conversion.'],
    // Multiplayer / Web Requests
    'cloudlink.js': ['CloudLink', 'Online multiplayer.', 'Through your own CloudLink server: connect, usernames, rooms, global, private and direct messages and variables, listeners, packet queues.'],
    'godslayerakp/ws.js': ['WebSocket', 'Live server connections.', 'Connect to a WebSocket server, send and receive messages; hats and checks for connecting, errors and closing.'],
    'MikeDev101/webrtc.js': ['WebRTC', 'Peer-to-peer connections.', 'Your own STUN/TURN servers, offers, answers, ICE candidates, data channels, sending and receiving.'],
    'true-fantom/network.js': ['Network', 'Web requests and connection info.', 'Get, post, put, patch and delete with headers and forms; response text, JSON, status and headers; online and connection speed; open links.'],
    'MubiLop/penguinhook.js': ['Webhooks', 'Post to Discord and webhooks.', 'Messages, embeds or raw JSON.'],
    // Web Services / Accounts
    'steamworks.js': ['Steam', 'Steam features for games.', 'User name, level, country and ID, achievements, DLC check, Steam overlay.'],
    'itchio.js': ['itch.io', 'itch.io pages and game data.', 'Open pages; a game\'s details, price, sale, rewards and sub-products.'],
    'Ikelene/googleAuthExtension.js': ['Sign-in', 'Log in with Google or Discord.', 'Through your own Google client or Discord application: name, username, ID, picture; email if asked. Shows your privacy policy first.'],
    'Geolocation.js': ['Geolocation', 'Where the user is.', 'Device position (with permission) or location from an IP, watch for changes, country names, real-world distances.'],
    // Browser / Device
    'clipboard.js': ['Clipboard', 'Copy and paste events.', 'The last pasted text, empty the clipboard, copy and paste hats.'],
    'sharkpoolPrinting': ['Printing', 'Print to paper.', 'Text, images, the stage or HTML with fonts, colors, positions and backgrounds.'],
    'navigator.js': ['Device Info', 'Device, screen and battery.', 'Device memory, dark mode, reduced motion and contrast preferences; keep the screen awake; battery level, charging and time left, hats when they change.'],
    // Encoding / Security
    'encoding.js': ['Encoding', 'Encode, compress and convert.', 'Encode and decode base64, URLs, HTML-safe text or numbers for cloud variables; compress text (lz-string) or byte lists (deflate); convert numbers between bases 2 to 36.'],
    'QR-Codes.js': ['QR Codes', 'Make and read QR codes.', 'Create them as images with size and colors; read them from images.'],
    'gaimerI17/crypto.js': ['Cryptography', 'Hashing, encryption and key exchange.', 'SHA and MD5 hashes, HMAC signing, AES encryption, RSA signatures, ECDH key exchange for a shared AES key, random UUIDs and values.'],
    // Custom Blocks / Programming
    'My-Blocks-Plus.js': ['Custom Blocks Plus', 'Better custom blocks.', 'Colors, menus, images and branches, reporters, global blocks for all sprites, settable parameters, stop the caller.'],
    'jwProto': ['Labels & Placeholders', 'Comment and placeholder blocks.', 'Comment labels for blocks and empty placeholder blocks.']
};

export const newTextOf = extensionId => {
    const entry = textsByKey[extensionKeyOf(extensionId)];
    if (!entry) return null;
    // description: both parts as plain text (used by search); the tile shows them in two colors
    return {
        name: entry[0],
        description: `${entry[1]} ${entry[2]}`,
        descriptionSummary: entry[1],
        descriptionDetails: entry[2]
    };
};

import {extensionKeyOf} from './extension-categories.js';

// Rewritten title and description of every extension of the library: a plain name, a few-word summary
// (shown in the normal text color) and the details, everything the blocks can do (shown in light grey),
// written from the blocks themselves. The library shows these unless the "Show original titles" button in
// its side bar is used. Keys as in extension-categories.js.
const textsByKey = {
    // Block Expansions
    'pmMotionExpansion': ['More Motion', 'Extra movement blocks.', 'Move steps toward or a percentage of the way to a point, home position, touching a point or rectangle, direction and distance to a point, rotation style, sprite and costume width and height, manual fencing.'],
    'Lily/LooksPlus.js': ['More Looks', 'Control any sprite\'s looks.', 'Show, hide, layer and read effects of other sprites, costume count and details (size, rotation center, SVG, data URI), replace or restore costume images, recolor SVGs, stage snapshot.'],
    'pmEventsExpansion': ['More Events', 'New hats and broadcasts.', 'Broadcasts with data, to one sprite, or waiting for an answer; hats for conditions, changed values, key hit or release, every N frames, clicks, dragging, clones, costume switches, fullscreen and saving; force-run a hat.'],
    'Messages-Plus.js': ['More Broadcasts', 'Targeted broadcasts with data.', 'Broadcast to chosen sprites or clones, wait or continue, reply with a value, any-broadcast hat, received and waiting checks, list of receivers, restart, overlap and multiple-reply settings.'],
    'pmControlsExpansion': ['More Control', 'Else-if and script restarts.', 'If / else if / else, run blocks as a separate script (with data), restart the script from the top.'],
    'Extra-Controls.js': ['Advanced Control', 'Powerful loops, threads and functions.', 'Waits and loops with time limits and conditions, loop index and timer, skip or break loops, run blocks at once or in new threads, act as other sprites or clones, callable functions, force hats on or off, key rebinding.'],
    'pmSensingExpansion': ['More Sensing', 'Extra keyboard, mouse and device info.', 'Keys held and how long, last key, mouse buttons, scroll distance, color at a point, loudness, delta time, milliseconds, page address, language, battery, vibration, username, packaged and changed checks.'],
    'obviousAlexC/SensingPlus.js': ['Touch & Device Sensing', 'Multi-touch, motion sensors, speech.', 'Several touch fingers (position, speed, touching), touching originals or clones, other sprites\' lists, own effects, layer and visibility, clipboard, speech recognition, gyroscope and accelerometer.'],
    'Hyper-Sense-V2.js': ['Advanced Sensing', 'Detailed input, touching and ask boxes.', 'Scroll wheel, mouse buttons, real position and speed, key hold times and blocking, touching between any sprites or clones, neighbors in range, colors, dragging, ask boxes for passwords, numbers, colors or dropdowns, screen size.'],
    'pmOperatorsExpansion': ['More Operators', 'Extra math, logic and text operators.', 'Bitwise operations, integer, prime, even, multiple and range checks, solve equations, ratios, π, e, ∞, truncate, atan2, reverse or shuffle text, text before or after, exact equals, text replacers, sound speed and pitch.'],
    // Sprites / Clones
    'Lily/ClonesPlus.js': ['More Clones', 'Tell clones apart by variable.', 'Create clones with a variable set, then find, count, stop or delete clones by variable, read and set variables of clones or the main sprite, touching clones or the main sprite.'],
    'Sprite-Parenting.js': ['Sprite Families', 'Sprites that follow a parent.', 'Group sprites under a parent; children follow its position, direction, size, effects or visibility; add, remove and list members.'],
    'jgTailgating': ['Follow Behind', 'Sprites trailing another sprite.', 'Record a sprite\'s past positions so other sprites or clones follow it at a distance, like RPG party members.'],
    'SharkPool/Tile-Grids.js': ['Tile Grids', 'Place sprites on grids.', 'Grids with a tile size and offset; place or snap sprites onto tiles.'],
    // Costumes / Effects
    'Sprite-Effects-V2.js': ['Image Filters', 'Filters for sprites and the stage.', 'Turn sprites or images into SVGs with tint, blur, blending, shadows, glow, pixelation, wave, glitch, VHS, mosaic, dither, distortion, lights, patterns, masks or skew; filters on the whole stage.'],
    'stretch.js': ['Stretch', 'Stretch sprites.', 'Set, change and read the horizontal and vertical stretch.'],
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
    'jwColor': ['Color Values', 'Colors as values.', 'From RGB, HSV or hex, add, subtract, multiply, blend, read or set channels, to decimal or hex.'],
    'TheShovel/ColorPicker.js': ['Color Picker', 'The system color picker.', 'Open it at a position, read the chosen color as hex or RGB, hat when it changes.'],
    // Camera / Screen
    'pmCamera': ['Camera', 'A movable stage camera.', 'Move, turn and zoom a camera over the stage; several cameras; bind sprites, the mouse or the backdrop to one.'],
    'DogeisCut/Resolution.js': ['Screen Resolution', 'Adapt to any window size.', 'Window and screen size, pixel ratio, suggested stage size, hat when the window resizes, edge and anchor positions for any stage size.'],
    'CubesterYT/WindowControls.js': ['Window Controls', 'Control the app window.', 'Move, resize, rename, close or make it fullscreen; screen size, focus and screen-edge checks.'],
    // Physics / Collisions
    'box2d.js': ['Physics', 'Realistic physics for sprites.', 'Box2D: gravity, stage walls, velocity, forces, spin, density, friction, bounce, fixed or pinned sprites, touching list, scrolling world.'],
    'Lazy-Collisions.js': ['Box Collisions', 'Quick side-by-side checks.', 'Is a sprite on, near or past a side of another; put a sprite against a side; find clones by variable.'],
    'Rigidbodies.js': ['Collision Shapes', 'Fast math-based hitboxes.', 'Square, circle and polygon shapes on sprites: touching, points, distances, bounding boxes, position, direction, scale, debug outline.'],
    'pooiod/Box2D.js': ['Physics Objects & Joints', 'Physics with joints and springs.', 'Box2D with named circles, boxes, polygons or costume shapes: forces, velocity, collision layers, impacts, springs, sliders, pins and other joints, gravity, wind, slow motion.'],
    // 3D / AR
    'Xeltalliv/simple3D.js': ['3D Graphics', 'Real 3D rendering.', 'On the graphics card: meshes with colors, textures (costume, text, URL, video), instances and bones, OBJ and OFF models, perspective and transforms, render to textures, fog, blending, culling.'],
    'ObviousAlexC/3DMath.js': ['3D Math', 'Build 3D from sprites.', '2D and 3D vectors and their math, a 3D camera that projects points to the screen, 3D position and size for sprites, 3D triangles with Pen Plus.'],
    'Div/divVecQuat.js': ['Vectors & Quaternions', '3D vectors and rotations.', 'Vector math (dot, cross, length, projection) and quaternions: from axis and angle, apply, combine, invert, exp and log.'],
    // Input / Controls
    'KeysPlusV2.js': ['Keys Plus', 'Key combos and keybindings.', 'Key and key-combination presses, hits and hold times, mouse buttons and scrolling, named actions bound to keys, key tags, save and load bindings.'],
    'Gamepad-Expanded.js': ['Gamepad', 'Game controller input.', 'Buttons, triggers and sticks (direction, strength, deadzones), press and move hats, rumble.'],
    'cursor.js': ['Mouse Cursor', 'Change the mouse cursor.', 'Use a system cursor or the current costume, or hide it.'],
    'pointerlock.js': ['Pointer Lock', 'Lock the mouse in the stage.', 'Mouse x and y then report movement, for mouse-look games.'],
    'veggiecan/mobilekeyboard.js': ['Mobile Keyboard', 'On-screen keyboard on phones.', 'Show it (text, number, email, web, search) without a popup; read and edit the typed text and selection. Android only.'],
    'gaimerI17/DeviceMotion.js': ['Device Motion', 'Phone and tablet movement.', 'Acceleration, rotation rate, direction, tilt, shaking, calibration.'],
    'CubesterYT/KeySimulation.js': ['Simulate Input', 'Fake key presses and clicks.', 'Press keys, click mouse buttons at a point and move the mouse, as the project sees them.'],
    'electricfuzzball_pm/MIDI.js': ['MIDI Keyboard', 'Play with a MIDI keyboard.', 'Notes pressed and released with velocity and channel, drum pads, pitch bend, mod wheel, note sequences, devices.'],
    // Sound / Music / Speech
    'Lily/SoundExpanded.js': ['More Sound', 'Looping and sound control.', 'Loop sounds or parts of them, play from or between times, stop, pause and resume, playing check, length, channels, sample rate, data, effects, project volume.'],
    'music': ['Music', 'Instruments and drums.', 'Play drums and notes, rests and tempo.'],
    'Tune-Shark-V3.js': ['Audio Engine', 'Advanced sound with effects.', 'Load sounds from URLs or the project and play them looped, reversed, cropped or joined, with pitch, speed, pan, 3D pan, reverb, delay, distortion, filters, tremolo, flanger, compressor, equalizer, bitcrush; loudness, BPM and frequencies.'],
    'SharkPool/Sound-Waves.js': ['Synth Notes', 'Generate tones.', 'Play sine, square, sawtooth or triangle notes for a time or until stopped, with volume and pitch per note; keyboard keys as notes.'],
    'Gen1x/beat_sync.js': ['Beat Sync', 'Sync to a musical beat.', 'BPM and measures, beat and measure numbers, wait for beats, hats on beats, steps and measures.'],
    'MIDI-Tools.js': ['MIDI Files', 'Play and read MIDI songs.', 'Load from a URL, file, list or base64; play with speed, transpose and track muting; note hats, notes at a time, BPM, note names and frequencies.'],
    'Recording-V2.js': ['Microphone Recording', 'Record the microphone.', 'Loudness, save the recording as a sound or download it.'],
    'PuzzlingGGG/ttsrV2.js': ['Text to Speech', 'Speak text aloud.', 'Chosen voices, speed and pitch (online service), wait until done, cache, audio data.'],
    'pooiod/Dictation.js': ['Speech to Text', 'Type with your voice.', 'Turn spoken words into text and wait for them.'],
    // Video / Webcam
    'Lily/Video.js': ['Video Player', 'Play videos on sprites.', 'Load videos from URLs onto sprites or the stage: play, pause, loop, seek, volume, speed, time, size, screenshots.'],
    'videoSensing': ['Video Sensing', 'Detect camera motion.', 'Motion and direction on sprites or the stage, motion hat, show the camera with transparency.'],
    'Camera-Sensing-Plus.js': ['Camera Plus', 'Camera on sprites and photos.', 'Show the camera on sprites, take photos, front or back camera, resolution.'],
    'lab/video-sprites.js': ['Video Sprites', 'Live camera inside sprites.', 'Fill a sprite or one of its colors with the camera; zoom.'],
    'lab/face-sensing.js': ['Face Sensing', 'Track a face with the camera.', 'Go to the nose, eyes, ears, mouth or head, face tilt and size, hats for tilting and touching parts.'],
    'pooiod/VideoSharing.js': ['Screen Share', 'Capture the screen or camera.', 'Get frames as PNG, JPEG, WEBP or hex at any resolution; show an image.'],
    // Text Display / Popups
    'Gen1x/iris-text.js': ['Rich Text', 'Styled, animated text on sprites.', 'Fonts, colors, gradients, shadows, borders, backgrounds and markup; typewriter effect; move, rotate, scale, color, animate and mask single characters; size limits and spacing.'],
    'SharkPool/Font-Manager.js': ['Fonts', 'Add custom fonts.', 'From URLs or the system; remove and list them, font details, hat when fonts change.'],
    'Speech-Bubbles.js': ['Speech Bubbles', 'Custom speech bubbles.', 'On any sprite, with font, size, alignment, width, colors, image, arrow, offset, glow and effects.'],
    'Popup-Phoenix.js': ['Popups', 'Custom popup windows.', 'Labels, text, number, slider and dropdown inputs and button rows; position, fonts, borders, shadows, effects; wait for and read answers.'],
    'MubiLop/toastnotifs.js': ['Toasts', 'Small pop-up messages.', 'Title, image, position, custom style and sound.'],
    'mdwalters/notifications.js': ['System Notifications', 'Desktop notifications.', 'Ask permission, then show or close operating-system notifications.'],
    'TheShovel/CustomStyles.js': ['Monitor Styles', 'Restyle monitors and ask boxes.', 'Colors, gradients, images, borders and roundness of variable and list monitors and the ask box; monitor positions; list scrolling.'],
    // Pause / Scenes / Runtime
    'Scenes.js': ['Scenes', 'Save and switch project states.', 'Save the whole project state as named scenes and switch between them; hat on switch.'],
    'runtime-options.js': ['Runtime Options', 'Change project settings.', 'Turbo mode, frame rate, stage size, username, run the green flag, hat when they change. Clone limit, fencing, limits, pen quality and interpolation are fixed in this app.'],
    // Saving / Files
    'local-storage.js': ['Local Storage', 'Save data on this computer.', 'Values that stay after closing; separate namespaces; hat when another window changes them.'],
    'Files-Expanded.js': ['Files', 'Open and save files.', 'Open files or folders as text, data URL, base64 or hex, download text or URLs as files, keep stored files, sizes and dates, styled file picker.'],
    'CST1229/zip.js': ['Zip Files', 'Make and edit zip files.', 'Create, open and edit archives (also .sb3): files, folders, renaming, copying, details, comments, compression.'],
    // Variables / Lists / Data
    'Variables-Expanded.js': ['More Variables', 'Variable tools and monitor styles.', 'Create, delete, swap, show or hide variables by name; monitor position, type, slider range, display name, font, colors, effects and buttons.'],
    'qxsck/var-and-list.js': ['Variables & Lists by Name', 'Use variables by their name.', 'Read and set variables and lists by name, item positions, copy lists, export variables or lists as JSON.'],
    'Lily/ListTools.js': ['List Tools', 'Sort, filter and loop lists.', 'Delete ranges or matching items, replace all, repeat, join, count, sort, reverse, shuffle, combine and copy lists, for-each loops, arrays.'],
    'Temporary-Variables.js': ['Temporary Variables', 'Short-lived variables.', 'Variables that exist only for a script, a sprite, the project run or a block of code.'],
    // Math / Numbers / Random
    'true-fantom/math.js': ['More Math', 'Extra math operators.', 'Powers, roots, logarithms, ≥ ≤ ≠, ranges, approximate and exact comparisons, nand, nor, xor, xnor, sign, clamp, map range, truncate, multiple and number-type checks, π, e, ∞.'],
    'Gen1x/random_utils.js': ['Random Tools', 'More kinds of randomness.', 'Seeded random numbers, random strings, colors and chances.'],
    'iygPerlin': ['Noise', 'Smooth random noise.', 'Perlin, simplex and random noise in 3D with seeds and octaves, for terrain and clouds.'],
    'MubiLop/numutils.js': ['Number Format', 'Pretty-print numbers.', 'By language, decimals, significant figures, exponent, short (K, M, B), currency or percent; round to a multiple, clamp, integer and finite checks.'],
    'NOname-awa/graphics2d.js': ['Geometry', '2D shape math.', 'Distance and direction between points, perpendicular check, area and perimeter of triangles, quadrilaterals, polygons and circles.'],
    'Skyhigh173/bigint.js': ['Big Integers', 'Huge whole numbers.', 'Exact arithmetic, powers, remainder, comparisons and bitwise operations at any size.'],
    'qxsck/big-decimal.js': ['Big Decimals', 'Precise decimal math.', 'Chosen precision: arithmetic, powers, remainder, comparisons, functions, rounding, random numbers.'],
    'true-fantom/base.js': ['Number Bases', 'Binary, hex and other bases.', 'Convert numbers between bases and check them.'],
    'bitwise.js': ['Bitwise', 'Work with binary bits.', 'Binary conversion, shifts, rotations, and, or, xor, not.'],
    // Time / Timers
    'steve0greatness/timers.js': ['Timers', 'Extra timers.', 'Start, pause, stop, restart and add time, in seconds, milliseconds or minutes; hat when one passes a time.'],
    'XeroName/Deltatime.js': ['Delta Time', 'Frame timing.', 'Time since the last frame and frames per second.'],
    'Time-Calculation.js': ['Time Math', 'Date and time calculations.', 'Differences between dates in any unit, countdowns, seconds to readable time, days in a month.'],
    // Text / Strings
    'text.js': ['Text Tools', 'Edit and search text.', 'Parts of text, split, count, find, replace, repeat, reverse, trim, letter case, starts and ends with, Unicode, regular expressions.'],
    'Medericoder/textcase.js': ['Letter Case', 'Upper, lower and other cases.', 'Convert and detect case (inverted, capitalized words or sentences...), exact or loose compare, glitch text.'],
    'Embin/embintranslation.js': ['Translations', 'Projects in several languages.', 'Translation keys per language with values and placeholders, user and current language, JSON import and export.'],
    // Utility Collections
    'utilities.js': ['Utilities', 'Handy small blocks.', 'Exact compare, ≤ ≥, power, π, if-then-else value, parts of text, clamp, milliseconds, fetch a URL, JSON values, newline, regex replace.'],
    'Lily/lmsutils.js': ['Lily\'s Toolbox', 'A big mixed toolbox.', 'Condition and key hats, inline if, logic, comparisons, text tools, math, effect and clone info, device and window info.'],
    'TheShovel/ShovelUtils.js': ['Shovel Utilities', 'Import assets and edit the project.', 'Import images, sounds, sprites, projects or extensions from URLs; delete sprites or costumes; set a list from an array; restart; choose the edited sprite; color brightness; FPS.'],
    'Sharktilities.js': ['Sharktilities', 'Mixed sprite and text utilities.', 'What a sprite says, costume details, unclamped effects, changed-value hats, broadcast and repeat while waiting, smoothing, SVG shapes, text, rounding, random and multi-join tools, pen layer image.'],
    'jgPrism': ['Prism', 'Audio, images and encoding helpers.', 'Play audio from URLs (loop, speed, position, volume), stage screenshot, data URLs of costumes and images, mouse scroll, base64, character codes, compression, number encoding.'],
    // Multiplayer / Web Requests
    'cloudlink.js': ['CloudLink', 'Online multiplayer.', 'Through your own CloudLink server: connect, usernames, rooms, global, private and direct messages and variables, listeners, packet queues.'],
    'godslayerakp/ws.js': ['WebSocket', 'Live server connections.', 'Connect to a WebSocket server, send and receive messages; hats and checks for connecting, errors and closing.'],
    'MikeDev101/webrtc.js': ['WebRTC', 'Peer-to-peer connections.', 'Your own STUN/TURN servers, offers, answers, ICE candidates, data channels, sending and receiving.'],
    'true-fantom/network.js': ['Network', 'Web requests and connection info.', 'Get, post, put, patch and delete with headers and forms; response text, JSON, status and headers; online and connection speed; open links.'],
    'MubiLop/penguinhook.js': ['Webhooks', 'Post to Discord and webhooks.', 'Messages, embeds or raw JSON.'],
    // Web Services / Accounts
    'steamworks.js': ['Steam', 'Steam features for games.', 'User name, level, country and ID, achievements, DLC check, Steam overlay.'],
    'itchio.js': ['itch.io', 'itch.io pages and game data.', 'Open pages; a game\'s details, price, sale, rewards and sub-products.'],
    'NotHouse/DiscordAuth.js': ['Discord Login', 'Sign in with Discord through your own app.', 'Username, display name, ID, avatar; email if asked. Shows your privacy policy first.'],
    'Ikelene/googleAuthExtension.js': ['Google Login', 'Sign in with Google through your own client ID.', 'Name, picture, ID; email if asked. Shows your privacy policy first.'],
    'Geolocation.js': ['Geolocation', 'Where the user is.', 'Device position (with permission) or location from an IP, watch for changes, country names, real-world distances.'],
    // Browser / Device
    'clipboard.js': ['Clipboard', 'Copy and paste text.', 'Copy text, read the clipboard and the last pasted text, copy and paste hats.'],
    'XmerOriginals/closecontrol.js': ['Confirm Close', 'Ask before closing.', 'Ask before the window is closed.'],
    'DNin/wake-lock.js': ['Keep Awake', 'Keep the screen on.', 'Stop the screen from going to sleep.'],
    'sharkpoolPrinting': ['Printing', 'Print to paper.', 'Text, images, the stage or HTML with fonts, colors, positions and backgrounds.'],
    'navigator.js': ['Device Info', 'System and user preferences.', 'Operating system, browser, memory, and dark mode, reduced motion and contrast preferences.'],
    'battery.js': ['Battery', 'Battery status.', 'Level, charging and time left; hats when they change.'],
    // Encoding / Security
    'encoding.js': ['Encoding', 'Convert text formats.', 'Encode and decode Unicode, base64, URLs or numbers for cloud variables, MD5 hash, character codes, random strings.'],
    'shovellzcompresss': ['Text Compression', 'Make text shorter.', 'Compress and decompress text (lz-string).'],
    'QR-Codes.js': ['QR Codes', 'Make and read QR codes.', 'Create them as images with size and colors; read them from images.'],
    'Clay/htmlEncode.js': ['HTML Escape', 'Safe text for HTML.', 'Escape text so it can go inside HTML.'],
    'gaimerI17/crypto.js': ['Cryptography', 'Hashing and encryption.', 'SHA hashes, HMAC signing, AES encryption, RSA signatures, random UUIDs and values.'],
    'MikeDev101/e2ee.js': ['End-to-End Encryption', 'Private messages between users.', 'Make a key pair, a shared secret with another user\'s key, encrypt and decrypt with it.'],
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

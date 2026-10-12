import {extensionKeyOf} from './extension-categories.js';

// Rewritten title and description of every extension of the library: plain names, and a short list of
// everything the blocks can do (written from the blocks themselves). The library shows these unless the
// "Show original titles" button in its side bar is used. Keys as in extension-categories.js.
const textsByKey = {
    // Block Expansions
    'pmMotionExpansion': ['More Motion', 'Move steps toward or a percentage of the way to a point, home position, touching a point or rectangle, direction and distance to a point, rotation style, sprite and costume width and height, manual fencing.'],
    'Lily/LooksPlus.js': ['More Looks', 'Show, hide, layer and read effects of any sprite, costume count and details (size, rotation center, SVG, data URI), replace or restore costume images, recolor SVGs, stage snapshot.'],
    'pmEventsExpansion': ['More Events', 'Broadcasts with data, to one sprite, or waiting for an answer; hats for conditions, changed values, key hit or release, every N frames, clicks, dragging, clones, costume switches, fullscreen and saving; force-run a hat.'],
    'Messages-Plus.js': ['More Broadcasts', 'Broadcast with data to chosen sprites or clones, wait or continue, reply with a value, any-broadcast hat, received and waiting checks, list of receivers, restart, overlap and multiple-reply settings.'],
    'pmControlsExpansion': ['More Control', 'If / else if / else, run blocks as a separate script (with data), restart the script from the top.'],
    'Extra-Controls.js': ['Advanced Control', 'Waits and loops with time limits and conditions, loop index and timer, skip or break loops, run blocks at once or in new threads, act as other sprites or clones, callable functions, force hats on or off, key rebinding.'],
    'pmSensingExpansion': ['More Sensing', 'Keys held and how long, last key, mouse buttons, scroll distance, color at a point, loudness, delta time, milliseconds, page address, language, battery, vibration, username, packaged and changed checks.'],
    'obviousAlexC/SensingPlus.js': ['Touch & Device Sensing', 'Several touch fingers (position, speed, touching), touching originals or clones, other sprites\' lists, own effects, layer and visibility, clipboard, speech recognition, gyroscope and accelerometer.'],
    'Hyper-Sense-V2.js': ['Advanced Sensing', 'Scroll wheel, mouse buttons, real position and speed, key hold times and blocking, touching between any sprites or clones, neighbors in range, colors, dragging, ask boxes for passwords, numbers, colors or dropdowns, screen size.'],
    'pmOperatorsExpansion': ['More Operators', 'Bitwise operations, integer, prime, even, multiple and range checks, solve equations, ratios, π, e, ∞, truncate, atan2, reverse or shuffle text, text before or after, exact equals, text replacers, sound speed and pitch.'],
    // Sprites / Clones
    'Lily/ClonesPlus.js': ['More Clones', 'Create clones with a variable set, then find, count, stop or delete clones by variable, read and set variables of clones or the main sprite, touching clones or the main sprite.'],
    'Sprite-Parenting.js': ['Sprite Families', 'Group sprites under a parent; children follow its position, direction, size, effects or visibility; add, remove and list members.'],
    'jgTailgating': ['Follow Behind', 'Record a sprite\'s past positions so other sprites or clones follow it at a distance, like RPG party members.'],
    'SharkPool/Tile-Grids.js': ['Tile Grids', 'Grids with a tile size and offset; place or snap sprites onto tiles.'],
    // Costumes / Effects
    'Sprite-Effects-V2.js': ['Image Filters', 'Turn sprites or images into SVGs with filters: tint, blur, blending, shadows, glow, pixelation, wave, glitch, VHS, mosaic, dither, distortion, lights, patterns, masks, skew; also on the whole stage.'],
    'stretch.js': ['Stretch', 'Stretch sprites horizontally and vertically.'],
    'MubiLop/spritesheeter.js': ['Spritesheets', 'Cut a spritesheet image into frames by size or XML, step through frames, read frame names, sizes and images, set a sprite\'s costume to a frame.'],
    'SVG-Spritesheets.js': ['SVG Spritesheets', 'Compress SVGs, combine several into one sheet and take them out again, split an SVG into its groups.'],
    'GIF-Manager.js': ['GIFs', 'Make GIFs from images with size, colors, dithering and frame delays, export them; read the frames of a GIF.'],
    'Turbo-Skins.js': ['Skins', 'Show an image, costume or another sprite on any sprite as a skin with its own rotation center and hitbox.'],
    'TheShovel/CanvasEffects.js': ['Stage Effects', 'Effects on the whole stage: blur, contrast, saturation, color shift, brightness, invert, sepia, transparency, scale, skew, offset, rotation, borders, rounded corners; render size and pixelated scaling.'],
    'Gen1x/lighting.js': ['Lighting', 'Point, spot and area lights over the stage with ambient light, shadows and bloom; sprites left out or touching lights; pixelation, contrast, color temperature; follow the camera.'],
    'Xeltalliv/clippingblending.js': ['Clipping & Blending', 'Hide a sprite outside a rectangle; draw it with additive, subtract, multiply, invert, mask or erase blending.'],
    // Animation / Particles
    'jgTween': ['Tweening', 'Smoothly change variables, position or other properties over time with easing styles; eased values between two numbers.'],
    'Animations.js': ['Costume Animations', 'Animations from costumes with pauses and speed; play, loop or stop them; keyframes for position, direction, scale and stretch.'],
    'Particle-Engine.js': ['Particles', 'Particle emitters on any sprite without clones: texture or shape, amount, lifetime, speed, gravity, spin, size, stretch, color and fade over time, waves, blend modes, trails; save and load settings.'],
    // Pen / Drawing / Colors
    'pen': ['Pen', 'Draw lines and stamps with color and size; squares, triangles, polygons, images (resized, cropped, rotated) and text with font, size, color and outline; pen in front or behind.'],
    'obviousAlexC/penPlus.js': ['Pen Plus', 'Fast drawing on the graphics card: dots, lines, textured squares and triangles, an image library with pixel editing, custom shaders, cubemaps, drawing from lists, render textures, depth.'],
    'Layer-Control.js': ['Layer Control', 'Put the pen, camera video, backdrop or any sprite on any layer, swap layers, list layers and their owners.'],
    'Pen-Papers.js': ['Pen Layers', 'Several pen layers: create, switch, show or hide, save as image, touching checks.'],
    'Color-Master.js': ['Color Tools', 'Mix, invert, adjust, compare and randomize hex colors; convert between hex, RGB, HSV and decimal; linear, radial and conic gradients.'],
    'jwColor': ['Color Values', 'A color value type: from RGB, HSV or hex, add, subtract, multiply, blend, read or set channels, to decimal or hex.'],
    'TheShovel/ColorPicker.js': ['Color Picker', 'Open the system color picker at a position; read the chosen color as hex or RGB; hat when it changes.'],
    // Camera / Screen
    'pmCamera': ['Camera', 'Move, turn and zoom a camera over the stage; several cameras; bind sprites, the mouse or the backdrop to one.'],
    'DogeisCut/Resolution.js': ['Screen Resolution', 'Window and screen size, pixel ratio, suggested stage size, hat when the window resizes, edge and anchor positions for any stage size.'],
    'CubesterYT/WindowControls.js': ['Window Controls', 'Move, resize, rename, close or make the window fullscreen; screen size, focus and screen-edge checks.'],
    // Physics / Collisions
    'box2d.js': ['Physics', 'Box2D physics for sprites: gravity, stage walls, velocity, forces, spin, density, friction, bounce, fixed or pinned sprites, touching list, scrolling world.'],
    'Lazy-Collisions.js': ['Box Collisions', 'Is a sprite on, near or past a side of another; put a sprite against a side; find clones by variable.'],
    'Rigidbodies.js': ['Collision Shapes', 'Square, circle and polygon shapes on sprites computed with math: touching, points, distances, bounding boxes, position, direction, scale, debug outline.'],
    'pooiod/Box2D.js': ['Physics Objects & Joints', 'Box2D physics with named circles, boxes, polygons or costume shapes: forces, velocity, collision layers, impacts, springs, sliders, pins and other joints, gravity, wind, slow motion.'],
    // 3D / AR
    'Xeltalliv/simple3D.js': ['3D Graphics', '3D on the graphics card: meshes with colors, textures (costume, text, URL, video), instances and bones, OBJ and OFF models, perspective and transforms, render to textures, fog, blending, culling.'],
    'ObviousAlexC/3DMath.js': ['3D Math', '2D and 3D vectors and their math, a 3D camera that projects points to the screen, 3D position and size for sprites, 3D triangles with Pen Plus.'],
    'Div/divVecQuat.js': ['Vectors & Quaternions', '3D vector math (dot, cross, length, projection) and quaternions for rotations: from axis and angle, apply, combine, invert, exp and log.'],
    // Input / Controls
    'KeysPlusV2.js': ['Keys Plus', 'Key and key-combination presses, hits and hold times, mouse buttons and scrolling, named actions bound to keys, key tags, save and load bindings.'],
    'Gamepad-Expanded.js': ['Gamepad', 'Gamepad buttons, triggers and sticks (direction, strength, deadzones), press and move hats, rumble.'],
    'cursor.js': ['Mouse Cursor', 'Change the mouse cursor to a system cursor or the current costume, or hide it.'],
    'pointerlock.js': ['Pointer Lock', 'Lock the mouse inside the stage; mouse x and y then report movement.'],
    'veggiecan/mobilekeyboard.js': ['Mobile Keyboard', 'Show the on-screen keyboard (text, number, email, web, search) without a popup; read and edit the typed text and selection. Android only.'],
    'gaimerI17/DeviceMotion.js': ['Device Motion', 'Phone or tablet movement: acceleration, rotation rate, direction, tilt, shaking, calibration.'],
    'CubesterYT/KeySimulation.js': ['Simulate Input', 'Press keys, click mouse buttons at a point and move the mouse, as the project sees them.'],
    'electricfuzzball_pm/MIDI.js': ['MIDI Keyboard', 'Notes pressed and released on a MIDI keyboard with velocity and channel, drum pads, pitch bend, mod wheel, note sequences, devices.'],
    // Sound / Music / Speech
    'Lily/SoundExpanded.js': ['More Sound', 'Loop sounds or parts of them, play from or between times, stop, pause and resume, playing check, length, channels, sample rate, data, effects, project volume.'],
    'music': ['Music', 'Play drums and instrument notes, rests and tempo.'],
    'Tune-Shark-V3.js': ['Audio Engine', 'Load sounds from URLs or the project and play them looped, reversed, cropped or joined, with pitch, speed, pan, 3D pan, reverb, delay, distortion, filters, tremolo, flanger, compressor, equalizer, bitcrush; loudness, BPM and frequencies.'],
    'Newgrounds-Audio.js': ['Newgrounds Music', 'Fetch a Newgrounds track by ID: playable URL, name, author, cover, rating, length and other details.'],
    'SharkPool/Sound-Waves.js': ['Synth Notes', 'Play sine, square, sawtooth or triangle notes for a time or until stopped, with volume and pitch per note; keyboard keys as notes.'],
    'Gen1x/beat_sync.js': ['Beat Sync', 'Keep a beat with BPM and measures: beat and measure numbers, wait for beats, hats on beats, steps and measures.'],
    'MIDI-Tools.js': ['MIDI Files', 'Load MIDI songs from a URL, file, list or base64 and play them with speed, transpose and track muting; note hats, notes at a time, BPM, note names and frequencies.'],
    'Recording-V2.js': ['Microphone Recording', 'Record the microphone, loudness, save the recording as a sound or download it.'],
    'PuzzlingGGG/ttsrV2.js': ['Text to Speech', 'Speak text with chosen voices, speed and pitch (online service), wait until done, cache, audio data.'],
    'pooiod/Dictation.js': ['Speech to Text', 'Turn spoken words into text and wait for them.'],
    // Video / Webcam
    'Lily/Video.js': ['Video Player', 'Load videos from URLs onto sprites or the stage: play, pause, loop, seek, volume, speed, time, size, screenshots.'],
    'YouTube-Operations.js': ['YouTube', 'Video and channel details, search, play YouTube videos in a box over the stage.'],
    'videoSensing': ['Video Sensing', 'Camera motion and direction on sprites or the stage, motion hat, show the camera with transparency.'],
    'Camera-Sensing-Plus.js': ['Camera Plus', 'Show the camera on sprites, take photos, front or back camera, resolution, remove or replace colors, cut out shapes.'],
    'lab/video-sprites.js': ['Video Sprites', 'Fill a sprite or one of its colors with the live camera; zoom.'],
    'lab/face-sensing.js': ['Face Sensing', 'Find a face with the camera: go to the nose, eyes, ears, mouth or head, face tilt and size, hats for tilting and touching parts.'],
    'pooiod/VideoSharing.js': ['Screen Share', 'Share the screen or camera and get frames as PNG, JPEG, WEBP or hex at any resolution; show an image.'],
    // Text Display / Popups
    'Gen1x/iris-text.js': ['Rich Text', 'Text on sprites with fonts, colors, gradients, shadows, borders, backgrounds and markup; typewriter effect; move, rotate, scale, color, animate and mask single characters; size limits and spacing.'],
    'SharkPool/Font-Manager.js': ['Fonts', 'Add fonts from URLs or the system, remove and list them, font details, hat when fonts change.'],
    'Speech-Bubbles.js': ['Speech Bubbles', 'Speech bubbles on any sprite with font, size, alignment, width, colors, image, arrow, offset, glow and effects.'],
    'Popup-Phoenix.js': ['Popups', 'Popups with labels, text, number, slider and dropdown inputs and button rows; position, fonts, borders, shadows, effects; wait for and read answers.'],
    'MubiLop/toastnotifs.js': ['Toasts', 'Small pop-up messages with title, image, position, custom style and sound.'],
    'mdwalters/notifications.js': ['System Notifications', 'Ask permission, then show or close operating-system notifications.'],
    'TheShovel/CustomStyles.js': ['Monitor Styles', 'Colors, gradients, images, borders and roundness of variable and list monitors and the ask box; monitor positions; list scrolling.'],
    // Pause / Scenes / Runtime
    'Scenes.js': ['Scenes', 'Save the whole project state as named scenes and switch between them; hat on switch.'],
    'runtime-options.js': ['Runtime Options', 'Turbo mode, frame rate, stage size, username, run the green flag, hat when they change. Clone limit, fencing, limits, pen quality and interpolation are fixed in this app.'],
    // Saving / Files
    'local-storage.js': ['Local Storage', 'Save values on this computer that stay after closing; separate namespaces; hat when another window changes them.'],
    'Files-Expanded.js': ['Files', 'Open files or folders as text, data URL, base64 or hex, download text or URLs as files, keep stored files, sizes and dates, styled file picker.'],
    'CST1229/zip.js': ['Zip Files', 'Create, open and edit zip archives (also .sb3): files, folders, renaming, copying, details, comments, compression.'],
    // Variables / Lists / Data
    'Variables-Expanded.js': ['More Variables', 'Create, delete, swap, show or hide variables by name; monitor position, type, slider range, display name, font, colors, effects and buttons.'],
    'qxsck/var-and-list.js': ['Variables & Lists by Name', 'Read and set variables and lists by name, item positions, copy lists, export variables or lists as JSON.'],
    'Lily/ListTools.js': ['List Tools', 'Delete ranges or matching items, replace all, repeat, join, count, sort, reverse, shuffle, combine and copy lists, for-each loops, arrays.'],
    'Temporary-Variables.js': ['Temporary Variables', 'Variables that exist only for a script, a sprite, the project run or a block of code.'],
    // Math / Numbers / Random
    'true-fantom/math.js': ['More Math', 'Powers, roots, logarithms, ≥ ≤ ≠, ranges, approximate and exact comparisons, nand, nor, xor, xnor, sign, clamp, map range, truncate, multiple and number-type checks, π, e, ∞.'],
    'Gen1x/random_utils.js': ['Random Tools', 'Seeded and true random numbers, UUIDs, random strings, colors and chances.'],
    'iygPerlin': ['Noise', 'Perlin, simplex and random noise in 3D with seeds and octaves, for terrain and clouds.'],
    'MubiLop/numutils.js': ['Number Format', 'Format numbers by language, decimals, significant figures, exponent, short (K, M, B), currency or percent; round to a multiple, clamp, integer and finite checks.'],
    'NOname-awa/graphics2d.js': ['Geometry', 'Distance and direction between points, perpendicular check, area and perimeter of triangles, quadrilaterals, polygons and circles.'],
    'Skyhigh173/bigint.js': ['Big Integers', 'Exact math on whole numbers of any size: arithmetic, powers, remainder, comparisons, bitwise operations.'],
    'qxsck/big-decimal.js': ['Big Decimals', 'Precise decimal math with chosen precision: arithmetic, powers, remainder, comparisons, functions, rounding, random numbers.'],
    'true-fantom/base.js': ['Number Bases', 'Convert numbers between bases (binary, decimal, hex and others) and check them.'],
    'bitwise.js': ['Bitwise', 'Binary conversion, shifts, rotations, and, or, xor, not.'],
    // Time / Timers
    'steve0greatness/timers.js': ['Timers', 'Extra timers to start, pause, stop, restart and add time to, in seconds, milliseconds or minutes; hat when one passes a time.'],
    'XeroName/Deltatime.js': ['Delta Time', 'Time since the last frame and frames per second.'],
    'Time-Calculation.js': ['Time Math', 'Differences between dates in any unit, countdowns, seconds to readable time, days in a month.'],
    // Text / Strings
    'text.js': ['Text Tools', 'Parts of text, split, count, find, replace, repeat, reverse, trim, letter case, starts and ends with, Unicode, regular expressions.'],
    'Medericoder/textcase.js': ['Letter Case', 'Convert and detect letter case (upper, lower, inverted, capitalized words or sentences), exact or loose compare, glitch text.'],
    'Embin/embintranslation.js': ['Translations', 'Translation keys per language with values and placeholders, user and current language, JSON import and export.'],
    // Utility Collections
    'utilities.js': ['Utilities', 'Exact compare, ≤ ≥, power, π, if-then-else value, parts of text, clamp, milliseconds, fetch a URL, JSON values, newline, regex replace.'],
    'Lily/lmsutils.js': ['Lily\'s Toolbox', 'Condition and key hats, inline if, logic, comparisons, text tools, encoding, math, color, angle, matrix and note values, runtime variables, costume SVGs, alerts, clipboard, links, device info, console, comments.'],
    'TheShovel/ShovelUtils.js': ['Shovel Utilities', 'Import images, sounds, sprites, projects or extensions from URLs; delete sprites or costumes; set a list from an array; restart; choose the edited sprite; color brightness; FPS.'],
    'Sharktilities.js': ['Sharktilities', 'What a sprite says, costume details, unclamped effects, changed-value hats, broadcast and repeat while waiting, smoothing, SVG shapes, text, rounding, random and multi-join tools, pen layer image.'],
    'jgPrism': ['Prism', 'Play audio from URLs (loop, speed, position, volume), stage screenshot, data URLs of costumes and images, mouse scroll, base64, character codes, compression, number encoding.'],
    'Lily/McUtils.js': ['McUtils', 'Joke blocks about working in fast food.'],
    // Multiplayer / Web Requests
    'cloudlink.js': ['CloudLink', 'Multiplayer through CloudLink servers: connect, usernames, rooms, global, private and direct messages and variables, listeners, packet queues; JSON and web requests.'],
    'godslayerakp/ws.js': ['WebSocket', 'Connect to a WebSocket server, send and receive messages; hats and checks for connecting, errors and closing.'],
    'MikeDev101/webrtc.js': ['WebRTC', 'Direct peer-to-peer connections: offers, answers, ICE candidates, data channels, sending and receiving.'],
    'true-fantom/network.js': ['Network', 'Web requests (get, post, put, patch, delete) with headers and forms, response text, JSON, status and headers, online and connection speed, open links.'],
    'NamelessCat/corsproxy.js': ['CORS Proxy', 'Fetch web pages through a chosen public proxy.'],
    'MubiLop/penguinhook.js': ['Webhooks', 'Send messages, embeds or JSON to Discord or other webhooks.'],
    'Codefoxy/cfupload.js': ['File Upload', 'Upload data as a file to a URL or upload service with form fields and headers; read the response.'],
    'MubiLop/yeetyourfiles.js': ['YeetYourFiles', 'Upload files to the YeetYourFiles service and get their link.'],
    // Web Services / Accounts
    'steamworks.js': ['Steam', 'Steam user name, level, country and ID, achievements, DLC check, Steam overlay.'],
    'itchio.js': ['itch.io', 'Open itch.io pages; a game\'s details, price, sale, rewards and sub-products.'],
    'NotHouse/DiscordAuth.js': ['Discord Login', 'Log in with Discord; the user\'s ID, name, avatar and other profile details.'],
    'Ikelene/googleAuthExtension.js': ['Google Login', 'Log in with Google; name, email, picture, ID and language.'],
    'bop_tw/Twitch.js': ['Twitch Chat', 'Show a Twitch channel\'s chat over the stage; text and image overlays.'],
    'Spotify.js': ['Spotify', 'Song, artist, album and playlist details; play song previews.'],
    'SoundCloud-API.js': ['SoundCloud', 'Track and artist details, comments, followers, search, MP3 links. Needs a client ID.'],
    'RubyDevs/turboweather.js': ['Weather', 'Weather and place for coordinates or the user\'s location, time in a timezone, JSON helpers.'],
    'Geolocation.js': ['Geolocation', 'Device position (with permission) or location from an IP, watch for changes, country names, real-world distances.'],
    'bruhbeast-pixel/CockatielLocation.js': ['IP Location', 'Your IP address and its location, timezone and VPN check, distance between IPs.'],
    'veggiecan/LongmanDictionary.js': ['Dictionary', 'Definitions of English words from the Longman Dictionary.'],
    // Browser / Device
    'clipboard.js': ['Clipboard', 'Copy text, read the clipboard and the last pasted text, copy and paste hats.'],
    'XmerOriginals/closecontrol.js': ['Confirm Close', 'Ask before the window is closed.'],
    'DNin/wake-lock.js': ['Keep Awake', 'Stop the screen from going to sleep.'],
    'sharkpoolPrinting': ['Printing', 'Print text, images, the stage or HTML with fonts, colors, positions and backgrounds.'],
    'navigator.js': ['Device Info', 'Operating system, browser, memory, and dark mode, reduced motion and contrast preferences.'],
    'battery.js': ['Battery', 'Battery level, charging and time left; hats when they change.'],
    'iframe.js': ['Web Page Overlay', 'Show a website or HTML over the stage: position, size, interaction, messages to and from it.'],
    'jgIframe': ['Web Page Frame', 'A website frame over the stage to move, size, rotate, color and apply effects to; hat when it loads.'],
    'ZXMushroom63/searchApi.js': ['URL Parameters', 'Read and change the parameters after "?" in the page address.'],
    'pooiod/WindowHasher.js': ['URL Hash', 'Read and set the part after "#" in the page address; hat when it changes.'],
    'DOM-Selector.js': ['Page Elements', 'Find elements of the page, read or change their properties and attributes, sizes, event listeners.'],
    // Encoding / Security
    'encoding.js': ['Encoding', 'Encode and decode Unicode, base64, URLs or numbers for cloud variables, MD5 hash, character codes, random strings.'],
    'shovellzcompresss': ['Text Compression', 'Compress and decompress text (lz-string).'],
    'QR-Codes.js': ['QR Codes', 'Make QR codes as images with size and colors; read QR codes from images.'],
    'Clay/htmlEncode.js': ['HTML Escape', 'Make text safe to put inside HTML.'],
    'gaimerI17/crypto.js': ['Cryptography', 'SHA hashes, HMAC signing, AES encryption, RSA signatures, random UUIDs and values.'],
    'MikeDev101/e2ee.js': ['End-to-End Encryption', 'Make a key pair, a shared secret with another user\'s key, encrypt and decrypt with it.'],
    // Custom Blocks / Programming
    'My-Blocks-Plus.js': ['Custom Blocks Plus', 'Custom blocks with colors, menus, images and branches, reporters, global blocks for all sprites, settable parameters, stop the caller.'],
    'jwProto': ['Labels & Placeholders', 'Comment labels for blocks and empty placeholder blocks.'],
    'SPjavascriptV2': ['JavaScript', 'Run JavaScript with data and return values; global or local JavaScript functions.']
};

export const newTextOf = extensionId => {
    const entry = textsByKey[extensionKeyOf(extensionId)];
    return entry ? {name: entry[0], description: entry[1]} : null;
};

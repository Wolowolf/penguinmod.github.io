import {extensionKeyOf} from './extension-categories.js';

// Which extensions of the library use the internet, shown as a coloured wi-fi symbol on their picture
// (between the favorite star and the difficulty number). Checked in each extension's code (Session 84):
// - 'required' (red): does nothing useful without the internet (online services, servers, web pages);
// - 'partial' (orange): some blocks or parts need the internet, the others work without it;
// - 'optional' (green): works fully without the internet; web addresses are only one thing its
//   inputs accept (data: addresses and the app's offline example files work too).
// Not counted: help / documentation links. The app answers extensions.turbowarp.org,
// extensions.penguinmod.com and the SharkPool gallery from its own folders, and the TurboWarp gallery
// build embeds the files Box2D, Face Sensing and Zip used to load from a CDN, so they need no internet.
// Keys as in extension-categories.js. No entry: no internet use, no symbol.
const networkByKey = {
    // red: needs the internet
    'cloudlink.js': 'required',
    'godslayerakp/ws.js': 'required',
    'MikeDev101/webrtc.js': 'required',
    'MubiLop/penguinhook.js': 'required',
    'itchio.js': 'required',
    'NotHouse/DiscordAuth.js': 'required',
    'Ikelene/googleAuthExtension.js': 'required',
    // orange: partly needs the internet
    'obviousAlexC/SensingPlus.js': 'partial', // speech recognition blocks
    'obviousAlexC/penPlus.js': 'partial', // custom shader editor is a web page
    'utilities.js': 'partial', // fetch block
    'true-fantom/network.js': 'partial', // web requests; browser and connection info work offline
    'jgPrism': 'partial', // data URL of an image at a web address goes through a web proxy
    'Geolocation.js': 'partial', // location and IP lookups; distance works offline
    'steamworks.js': 'partial', // opens web pages in the Steam overlay
    // green: can use the internet, works without it
    'pen': 'optional',
    'Sprite-Effects-V2.js': 'optional',
    'MubiLop/spritesheeter.js': 'optional',
    'GIF-Manager.js': 'optional',
    'Turbo-Skins.js': 'optional',
    'Particle-Engine.js': 'optional',
    'Xeltalliv/simple3D.js': 'optional',
    'Tune-Shark-V3.js': 'optional',
    'MIDI-Tools.js': 'optional',
    'Lily/Video.js': 'optional',
    'pooiod/VideoSharing.js': 'optional',
    'Gen1x/iris-text.js': 'optional',
    'SharkPool/Font-Manager.js': 'optional',
    'Speech-Bubbles.js': 'optional',
    'MubiLop/toastnotifs.js': 'optional',
    'Files-Expanded.js': 'optional',
    'CST1229/zip.js': 'optional',
    'Variables-Expanded.js': 'optional',
    'TheShovel/ShovelUtils.js': 'optional',
    'sharkpoolPrinting': 'optional',
    'QR-Codes.js': 'optional'
};

export const networkOf = extensionId => networkByKey[extensionKeyOf(extensionId)] || null;

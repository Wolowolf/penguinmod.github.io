/* eslint-disable import/no-commonjs */

// The costume fonts (Section 117). Arial, Verdana and Comic Sans MS are Windows fonts: costumes
// name them but they are not bundled (their licences do not allow it).
const AtkinsonHyperlegibleNext = require('./AtkinsonHyperlegibleNext.ttf');
const AtkinsonHyperlegibleMono = require('./AtkinsonHyperlegibleMono.ttf');
const Lexend = require('./Lexend.ttf');
const OpenDyslexic = require('./OpenDyslexic-Regular.otf');

// Every weight and style of these fonts (and Lexend's widths) for the editor's own text
require('./app-fonts.css');

const log = require('../log').default;

const fontSource = {
    'Atkinson Hyperlegible Next': AtkinsonHyperlegibleNext,
    'Atkinson Hyperlegible Mono': AtkinsonHyperlegibleMono,
    'Lexend': Lexend,
    'OpenDyslexic': OpenDyslexic
};

const fontData = {};

const fetchFonts = () => {
    const promises = [];
    for (const fontName of Object.keys(fontSource)) {
        promises.push(fetch(fontSource[fontName])
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Cannot load font: ${fontName} (invalid HTTP response)`);
                }
                return res.blob();
            })
            .then(blob => new Promise((resolve, reject) => {
                const fr = new FileReader();
                fr.onload = () => resolve(fr.result);
                fr.onerror = () => reject(new Error(`Cannot load font: ${fontName} (could not read)`));
                fr.readAsDataURL(blob);
            }))
            .then(url => {
                fontData[fontName] = `@font-face{font-family:"${fontName}";src:url("${url}");}`;
            })
            .catch(err => {
                log.error(err);
            })
        );
    }
    return Promise.all(promises);
};

const addFontsToDocument = () => {
    if (document.getElementById('scratch-font-styles')) {
        return;
    }
    let css = '';
    for (const fontName of Object.keys(fontSource)) {
        const fontCSS = fontData[fontName];
        if (fontCSS) {
            css += fontCSS;
        }
    }
    const documentStyleTag = document.createElement('style');
    documentStyleTag.id = 'scratch-font-styles';
    documentStyleTag.textContent = css;
    document.body.insertBefore(documentStyleTag, document.body.firstChild);
};

const waitForFontsToLoad = () => {
    const promises = [];
    if (document.fonts && document.fonts.load) {
        for (const fontName in fontData) {
            promises.push(document.fonts.load(`12px ${fontName}`));
        }
    }
    return Promise.all(promises);
};

const loadFonts = () => fetchFonts()
    .then(() => {
        addFontsToDocument();
        return waitForFontsToLoad();
    })
    .catch(err => {
        log.error(err);
    });

const getFonts = () => fontData;

// We have to use legacy module.exports as some parts of Scratch expect require('scratch-render-font') to be a function
module.exports = getFonts;
module.exports.loadFonts = loadFonts;
module.exports.FONTS = fontData;

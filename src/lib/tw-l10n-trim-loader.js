/**
 * @fileoverview
 * Webpack loader that leaves some interface languages out of the editor's build.
 * It trims the files of @turbowarp/scratch-l10n (the language list, the number/date data and every
 * translation file) as they are bundled, so the languages are neither in the menu nor in the app.
 * To bring a language back, delete its code from REMOVED.
 */

// Rapa Nui, Aragonese, Abkhaz, Asturian, Occitan, Scottish Gaelic, Frisian, Esperanto,
// Japanese Hiragana, Northern Sotho
// Welsh, Irish, Maori, Norwegian Nynorsk, Galician, Catalan, Basque, Quechua, Belarusian, Afrikaans,
// Icelandic, Tswana, Filipino
// Slovak, Croatian, Estonian, Latvian, Lithuanian, Xhosa, Azerbaijani, Uzbek, Kazakh, Mongolian,
// Danish, Latin American Spanish
const REMOVED = [
    'rap', 'an', 'ab', 'ast', 'oc', 'gd', 'fy', 'eo', 'ja-Hira', 'nso',
    'cy', 'ga', 'mi', 'nn', 'gl', 'ca', 'eu', 'qu', 'be', 'af', 'is', 'tn', 'fil',
    'sk', 'hr', 'et', 'lv', 'lt', 'xh', 'az', 'uz', 'kk', 'mn', 'da', 'es-419'
];

const escape = code => code.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');

module.exports = function (source) {
    const file = this.resourcePath.replace(/\\/g, '/');

    // locales/*-msgs.js and interface-msgs.js: "export default {JSON};"
    if (/\/locales\/[^/]+\.js$/.test(file)) {
        const start = source.indexOf('export default ');
        const end = source.lastIndexOf('}');
        if (start === -1 || end === -1) throw new Error(`Unexpected format: ${file}`);
        const data = JSON.parse(source.slice(start + 'export default '.length, end + 1));
        for (const code of REMOVED) delete data[code];
        return `${source.slice(0, start)}export default ${JSON.stringify(data)};\n`;
    }

    // src/supported-locales.js: the menu list, and customLocales (Occitan, Rapa Nui, ...)
    if (file.endsWith('/src/supported-locales.js')) {
        for (const code of REMOVED) {
            const c = escape(code);
            source = source
                .replace(new RegExp(`^[ \\t]*'${c}': \\{name: [^\\n]*\\},?[ \\t]*\\n`, 'm'), '')
                .replace(new RegExp(`^[ \\t]*'${c}': '[^'\\n]*',?[ \\t]*\\n`, 'm'), '')
                .replace(
                    new RegExp(`(?:^[ \\t]*//[^\\n]*\\n)?^[ \\t]*'${c}': \\{\\n[^}]*\\},?[ \\t]*\\n`, 'm'), '');
        }
        return source;
    }

    // src/locale-data.js: number and date data, one import and one list entry per language
    if (file.endsWith('/src/locale-data.js')) {
        for (const code of REMOVED) {
            const c = escape(code);
            source = source
                .replace(new RegExp(`^import ${c} from '\\./locale-data/${c}';\\n`, 'm'), '')
                .replace(new RegExp(`^[ \\t]+${c},\\n`, 'm'), '');
        }
        return source;
    }

    return source;
};

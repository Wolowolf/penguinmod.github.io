// The three extension galleries (PenguinMod, TurboWarp, SharkPool), shown as normal items in the
// extension library instead of opening their websites. The desktop app serves their offline copies
// at these addresses. A gallery whose list can't be read is left out.
import turbowarpIcon from './penguinmod/extensions/turbowarp_icon.svg';

const PM = 'https://extensions.penguinmod.com';
const TW = 'https://extensions.turbowarp.org';
const SP = 'https://sharkpools-extensions.vercel.app';

const fetchJSON = url => fetch(url).then(res => {
    if (!res.ok) throw new Error(`${url}: ${res.status}`);
    return res.json();
});

const penguinmod = () => fetchJSON(`${PM}/generated-extension-list.json`)
    .then(list => list.map(ext => ({
        name: ext.name,
        description: ext.description,
        extensionId: `${PM}/extensions/${ext.code}`,
        iconURL: `${PM}/images/${ext.banner}`,
        extDeveloper: ext.creator,
        extensionWarningOnImport: String(ext.unstable) === 'true',
        tags: ['pmgallery'],
        featured: true
    })));

const turbowarp = () => fetchJSON(`${TW}/generated-metadata/extensions-v0.json`)
    .then(data => data.extensions.map(ext => ({
        name: ext.name,
        description: ext.description,
        extensionId: `${TW}/${ext.slug}.js`,
        iconURL: `${TW}/${ext.image || 'images/unknown.svg'}`,
        insetIconURL: turbowarpIcon,
        extDeveloper: (ext.by || []).map(person => person.name).join(', ') || undefined,
        tags: ['twgallery'],
        featured: true
    })));

const sharkpool = () => fetchJSON(`${SP}/Gallery%20Files/Extension-Keys.json`)
    .then(data => Object.entries(data.extensions)
        // "Example" is the list's template, which the gallery's own page hides too
        .filter(([key, ext]) => key !== 'Example' && !ext.isDeprecated)
        .map(([key, ext]) => ({
            name: key.replace(/-/g, ' '),
            description: ext.desc,
            extensionId: `${SP}/extension-code/${ext.url}`,
            iconURL: `${SP}/extension-thumbs/${ext.banner}`,
            extDeveloper: ext.creator,
            tags: ['spgallery'],
            featured: true
        })));

let cached = null;
const loadGalleryExtensions = () => {
    if (!cached) {
        cached = Promise.all([penguinmod, turbowarp, sharkpool].map(load => load().catch(err => {
            console.warn('Extension gallery not loaded:', err);
            return [];
        }))).then(lists => [].concat(...lists));
    }
    return cached;
};

export default loadGalleryExtensions;

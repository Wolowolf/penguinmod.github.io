import messages from './tag-messages.js';
import { categories } from './extension-categories.js';
export default [
    { tag: 'penguinmod', intlLabel: messages.penguinmod },
    { tag: 'turbowarp', intlLabel: messages.turbowarp },
    { tag: 'scratch', intlLabel: messages.scratch },
    { tag: 'divider4', intlLabel: messages.scratch, type: 'divider' },
    // the three extension galleries, listed here instead of opening their websites
    { tag: 'pmgallery', intlLabel: 'PenguinMod Extra Extensions' },
    { tag: 'twgallery', intlLabel: 'TurboWarp Gallery' },
    { tag: 'spgallery', intlLabel: 'SharkPool\'s Collection' },
    { tag: 'divider2', intlLabel: messages.scratch, type: 'divider' },
    // topic categories
    ...categories.map(category => ({ tag: category.tag, intlLabel: category.label })),
    { tag: 'divider3', intlLabel: messages.scratch, type: 'divider' },
    { tag: 'divider1', intlLabel: 'Actions', type: 'title' },
    { tag: 'custom', intlLabel: messages.customextension, type: 'custom', func: (library) => {
        library.select(''); // selects custom extension since it's id is ''
    } },
];

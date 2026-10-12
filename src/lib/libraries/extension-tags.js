import messages from './tag-messages.js';
import { categories } from './extension-categories.js';
// 'jump' entries are shortcuts that scroll the list to that heading (see library.jsx); they are hidden when empty
export default [
    { tag: 'cat_favorites', intlLabel: 'Favorites', type: 'jump' },
    ...categories.map(category => ({ tag: category.tag, intlLabel: category.label, type: 'jump' })),
    { tag: 'divider3', intlLabel: messages.scratch, type: 'divider' },
    { tag: 'columns', intlLabel: 'Columns', type: 'columns' },
    { tag: 'difficulty', intlLabel: 'Difficulty', type: 'difficulty' },
    { tag: 'difficultyBadges', intlLabel: 'Hide difficulty level', type: 'difficultyBadges' }
];

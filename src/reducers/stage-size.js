import {STAGE_DISPLAY_SIZES} from '../lib/layout-constants.js';
import {DEFAULT_STAGE_BOX_WIDTH} from '../lib/screen-utils.js';

const SET_STAGE_SIZE = 'scratch-gui/StageSize/SET_STAGE_SIZE';
const SET_STAGE_BOX_WIDTH = 'scratch-gui/StageSize/SET_STAGE_BOX_WIDTH';
const STORAGE_KEY = 'pmdesktop:stageBoxWidth';

const loadBoxWidth = function () {
    try {
        const saved = Number(localStorage.getItem(STORAGE_KEY));
        if (isFinite(saved) && saved > 0) return saved;
    } catch (e) {
        // storage not available, use the default
    }
    return DEFAULT_STAGE_BOX_WIDTH;
};

const saveStageBoxWidth = function (width) {
    try {
        localStorage.setItem(STORAGE_KEY, String(width));
    } catch (e) {
        // storage not available, the size just won't be remembered
    }
};

const initialState = {
    stageSize: STAGE_DISPLAY_SIZES.large,
    boxWidth: loadBoxWidth()
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case SET_STAGE_SIZE:
        return Object.assign({}, state, {
            stageSize: action.stageSize
        });
    case SET_STAGE_BOX_WIDTH:
        return Object.assign({}, state, {
            boxWidth: action.boxWidth
        });
    default:
        return state;
    }
};

const setStageSize = function (stageSize) {
    return {
        type: SET_STAGE_SIZE,
        stageSize: stageSize
    };
};

const setStageBoxWidth = function (boxWidth) {
    return {
        type: SET_STAGE_BOX_WIDTH,
        boxWidth: boxWidth
    };
};

export {
    reducer as default,
    initialState as stageSizeInitialState,
    setStageSize,
    setStageBoxWidth,
    saveStageBoxWidth
};

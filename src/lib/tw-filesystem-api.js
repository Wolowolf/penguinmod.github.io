import { isApiAvailable, isTypeFilterAvailable } from './pm-mature-fs-available';

const available = isApiAvailable;

// pm: Some bad mobile devices block any file type (iOS), so these funcs should allow all files on mobile
const showSaveFilePicker = fileName => window.showSaveFilePicker({
    suggestedName: fileName,
    ...(!isTypeFilterAvailable() ? {} : {
        types: [
            {
                description: '2DC Project',
                accept: {
                    'application/x-2dc': '.2DC'
                }
            }
        ],
        excludeAcceptAllOption: true
    }),
});

const showOpenFilePicker = async () => {
    const [handle] = await window.showOpenFilePicker({
        multiple: false,
        ...(!isTypeFilterAvailable() ? {} : {
            types: [
                {
                    description: '2DC Project',
                    accept: {
                        'application/x-2dc': ['.2DC']
                    }
                }
            ]
        }),
    });
    return handle;
};

const showDirectoryPicker = async (optId, optStartIn) => {
    const handle = await window.showDirectoryPicker({
        id: optId || "pm-directory-picker",
        mode: "readwrite",
        startIn: optStartIn || "documents",
    });
    return handle;
};

export default {
    available,
    showOpenFilePicker,
    showSaveFilePicker,
    showDirectoryPicker
};

import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import VM from 'scratch-vm';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import log from '../lib/log';
import { manuallyTrustExtension } from './tw-security-manager.jsx';

import extensionLibraryContent from '../lib/libraries/extensions/index.jsx';
import extensionTags from '../lib/libraries/extension-tags';
import {categoryTagOf, categoryPositionOf} from '../lib/libraries/extension-categories';
import loadGalleryExtensions from '../lib/libraries/extensions/galleries.js';

import LibraryComponent from '../components/library/library.jsx';
import extensionIcon from '../components/action-menu/icon--sprite.svg';

const messages = defineMessages({
    extensionTitle: {
        defaultMessage: 'Choose an Extension',
        description: 'Heading for the extension library',
        id: 'gui.extensionLibrary.chooseAnExtension'
    },
    // extensionUrl: {
    //     defaultMessage: 'Enter the URL of the extension',
    //     description: 'Prompt for unoffical extension url',
    //     id: 'gui.extensionLibrary.extensionUrl'
    // },
    incompatible: {
        // eslint-disable-next-line max-len
        defaultMessage: 'This extension is incompatible with Scratch. Projects made with it cannot be uploaded to the Scratch website. Are you sure you want to enable it?',
        description: 'Confirm loading Scratch-incompatible extension',
        id: 'tw.confirmIncompatibleExtension'
    },
    extensionWarning: {
        // eslint-disable-next-line max-len
        defaultMessage: 'This extension is not recommended for real projects. It may be unstable and cause problems with your project later on. Are you sure you want to enable it?',
        description: 'Confirm loading buggy and unstable extension',
        id: 'pm.confirmBuggyUnstableExtension'
    },
    libraryHeader: {
        defaultMessage: 'Extensions',
        description: 'Header for the extension picker',
        id: 'pm.costumeLibrary.extensionsHeader'
    }
});

// Only trust loading extension links from these origins.
// For user-made libraries.
const TRUSTED_LOADEXT_ORIGINS = [
    'https://studio.penguinmod.com', // for development
    'https://extensions.penguinmod.com',
    'https://extensions.turbowarp.org', // the offline TurboWarp gallery ("Open Extension")
    'https://sharkpools-extensions.vercel.app',
    'https://raw.githubusercontent.com/SharkPool-SP/SharkPools-Extensions/main', // Some people cant connect to vercel
    'https://pen-group.github.io',
    'http://localhost:5173', // for development
    'http://localhost:3000', // for development
];

class ExtensionLibrary extends React.PureComponent {
    constructor(props) {
        super(props);
        bindAll(this, [
            'handleItemSelect',
            'wrapperEventHandler'
        ]);
        this.state = {galleryItems: []};
    }

    componentDidMount() {
        window.addEventListener('message', this.wrapperEventHandler);
        loadGalleryExtensions().then(galleryItems => {
            if (!this.unmounted) this.setState({galleryItems});
        });
    }
    componentWillUnmount() {
        this.unmounted = true;
        window.removeEventListener('message', this.wrapperEventHandler);
    }
    async wrapperEventHandler(e) {
        // Don't recursively try to run this event.
        if (e.origin === window.origin) {
            return;
        }

        // Only trust loading extension links from these origins.
        let foundTrustedOrigin = false;
        for (const trustedOrigin of TRUSTED_LOADEXT_ORIGINS) {
            if (e.origin.startsWith(trustedOrigin)) {
                foundTrustedOrigin = true;
                break;
            }
        }
        if (!foundTrustedOrigin) {
            console.log(e.origin);
            e.source.postMessage({
                p4: {
                    type: 'error',
                    error: 'not_trusted'
                }
            }, e.origin);
            return;
        }

        if (!e.data.loadExt) {
            e.source.postMessage({
                p4: {
                    type: 'error',
                    error: 'no_loadExt'
                }
            }, e.origin);
            return;
        }

        const extensionId = e.data.loadExt;
        if (typeof extensionId !== 'string') {
            e.source.postMessage({
                p4: {
                    type: 'error',
                    error: 'not_string'
                }
            }, e.origin);
            return;
        }
        // load the extension like any other custom extension url (this means sandboxing for some urls)
        console.log("Received request to load", extensionId, "from", e.origin);
        if (this.props.vm.extensionManager.isExtensionLoaded(extensionId)) {
            this.props.onCategorySelected(extensionId);
            // i mean, technically we succeeded
            e.source.postMessage({
                p4: {
                    type: 'success',
                    extensionId
                }
            }, e.origin);
        } else {
            this.props.vm.extensionManager.loadExtensionURL(extensionId)
                .then(() => {
                    this.props.onCategorySelected(extensionId);
                    // succeeded
                    e.source.postMessage({
                        p4: {
                            type: 'success',
                            extensionId
                        }
                    }, e.origin);
                })
                .catch(err => {
                    log.error(err);
                    // The source website is expected to display the error
                    e.source.postMessage({
                        p4: {
                            type: 'error',
                            error: 'couldnt_load',
                            pmerror: String(err.stack ? err.stack : err)
                        }
                    }, e.origin);
                });
        }
    }

    async handleItemSelect(item) {
        // eslint-disable-next-line no-alert
        if (item.extensionWarningOnImport && !confirm(this.props.intl.formatMessage(messages.extensionWarning))) {
            return;
        }

        // const id = item.extensionId;
        // let url = item.extensionURL ? item.extensionURL : id;
        // const isCustomURL = !item.disabled && !id;
        // if (isCustomURL) {
        //     // eslint-disable-next-line no-alert
        //     url = prompt(this.props.intl.formatMessage(messages.extensionUrl));
        // }
        
        const extensionId = item.extensionId;
        const isCustomURL = !item.disabled && !extensionId;
        if (isCustomURL) {
            this.props.onOpenCustomExtensionModal();
            return;
        }
        if (extensionId === 'special_penguinmodExtensionLibrary') {
            window.open('https://extensions.penguinmod.com/?editor=true');
            return;
        }
        const url = (item.extensionURL ? item.extensionURL : extensionId);
        if (item._unsandboxed) {
            if (url.startsWith("data:")) {
                manuallyTrustExtension(url);
            } else {
                await this.props.vm.securityManager.canLoadExtensionFromProject(url);
            }
        }
        if (!item.disabled) {
            if (this.props.vm.extensionManager.isExtensionLoaded(extensionId)) {
                this.props.onCategorySelected(extensionId);
            } else {
                this.props.vm.extensionManager.loadExtensionURL(url)
                    .then(() => {
                        this.props.onCategorySelected(extensionId);
                        // if (isCustomURL) {
                        //     let newUrl = location.pathname;
                        //     if (location.search) {
                        //         newUrl += location.search;
                        //         newUrl += '&';
                        //     } else {
                        //         newUrl += '?';
                        //     }
                        //     newUrl += `extension=${encodeURIComponent(url)}`;
                        //     history.replaceState('', '', newUrl);
                        // }
                    })
                    .catch(err => {
                        log.error(err);
                        // eslint-disable-next-line no-alert
                        alert(err);
                    });
            }
        }
    }
    render() {
        // Gallery extensions already listed here only get the gallery's tag, the others are added.
        const galleryTags = {};
        const listedIds = new Set();
        for (const extension of extensionLibraryContent) {
            listedIds.add(extension.extensionId);
            if (extension.extensionURL) listedIds.add(extension.extensionURL);
        }
        const galleryOnly = this.state.galleryItems.filter(item => {
            if (!listedIds.has(item.extensionId)) return true;
            galleryTags[item.extensionId] = (galleryTags[item.extensionId] || []).concat(item.tags);
            return false;
        });
        // Extensions in the project: IDs of loaded ones, and the URLs custom ones were loaded from.
        const extensionManager = this.props.vm.extensionManager;
        const used = new Set(extensionManager._loadedExtensions.keys());
        for (const url of Object.values(extensionManager.getExtensionURLs())) used.add(url);
        const extensionLibraryThumbnailData = extensionLibraryContent.concat(galleryOnly).map(extension => {
            const extraTags = galleryTags[extension.extensionId] || galleryTags[extension.extensionURL];
            return {
                rawURL: extension.iconURL || extensionIcon,
                disabled: extension.disabled && !this.props.liveTest,
                ...extension,
                tags: (extraTags ? (extension.tags || []).concat(extraTags) : (extension.tags || []))
                    .concat(categoryTagOf(extension.extensionId) || []),
                categoryPosition: categoryPositionOf(extension.extensionId),
                used: !!extension.extensionId &&
                    (used.has(extension.extensionId) || used.has(extension.extensionURL))
            };
        });
        return (
            <LibraryComponent
                data={extensionLibraryThumbnailData}
                filterable={true}
                tags={extensionTags}
                id="extensionLibrary"
                actor="ExtensionLibrary"
                header={this.props.intl.formatMessage(messages.libraryHeader)}
                title={this.props.intl.formatMessage(messages.extensionTitle)}
                visible={this.props.visible}
                onItemSelected={this.handleItemSelect}
                onRequestClose={this.props.onRequestClose}
            />
        );
    }
}

ExtensionLibrary.propTypes = {
    intl: intlShape.isRequired,
    onCategorySelected: PropTypes.func,
    onOpenCustomExtensionModal: PropTypes.func,
    onRequestClose: PropTypes.func,
    visible: PropTypes.bool,
    vm: PropTypes.instanceOf(VM).isRequired // eslint-disable-line react/no-unused-prop-types
};

export default injectIntl(ExtensionLibrary);

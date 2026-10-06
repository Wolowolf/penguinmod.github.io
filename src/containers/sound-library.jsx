// PMDESKTOP_STAGE_PATCH (section 16): the original library was removed; this opens the new asset libraries.
import React from 'react';
import AssetBrowser from '../components/pm-asset-browser/pm-asset-browser.jsx';

const SoundLibrary = props => <AssetBrowser kind="sound" {...props} />;
export default SoundLibrary;

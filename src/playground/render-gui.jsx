import React from 'react';
import GUI from '../containers/gui.jsx';

// PMDESKTOP_STAGE_PATCH: no cloud server (cloud variables removed)
const cloudHost = null;

const RenderGUI = props => (
    <GUI
        cloudHost={cloudHost}
        canSave={false}
        basePath={process.env.ROOT}
        canEditTitle
        enableCommunity
        {...props}
    />
);

export default RenderGUI;

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import VM from 'scratch-vm';

import Box from '../box/box.jsx';
import {STAGE_DISPLAY_SIZES} from '../../lib/layout-constants.js';
import StageHeader from '../../containers/stage-header.jsx';
import Stage from '../../containers/stage.jsx';
import Loader from '../loader/loader.jsx';
import FrameMeter from '../pm-profiler/pm-frame-meter.jsx';

import styles from './stage-wrapper.css';

const StageWrapperComponent = function (props) {
    const {
        isEmbedded,
        isFullScreen,
        isRtl,
        isRendererSupported,
        loading,
        stageSize,
        vm
    } = props;

    return (
        <Box
            className={classNames(
                styles.stageWrapper,
                {[styles.embedded]: isEmbedded},
                {[styles.fullScreen]: isFullScreen},
            )}
            dir={isRtl ? 'rtl' : 'ltr'}
        >
            {new URLSearchParams(location.search).has('stage-only') 
                ? null 
                : (
                <Box className={styles.stageMenuWrapper}>
                    <StageHeader
                        stageSize={stageSize}
                        vm={vm}
                    />
                </Box>
            )}
            <Box className={styles.stageCanvasWrapper}>
                <div className={styles.meterAnchor}>
                    <FrameMeter vm={vm} />
                    {
                        isRendererSupported ?
                            <Stage
                                stageSize={stageSize}
                                vm={vm}
                            /> :
                            null
                    }
                </div>
            </Box>
            {loading ? (
                <Loader isFullScreen={isFullScreen} />
            ) : null}
        </Box>
    );
};

StageWrapperComponent.propTypes = {
    isEmbedded: PropTypes.bool,
    isFullScreen: PropTypes.bool,
    isRendererSupported: PropTypes.bool.isRequired,
    isRtl: PropTypes.bool.isRequired,
    loading: PropTypes.bool,
    stageSize: PropTypes.oneOf(Object.keys(STAGE_DISPLAY_SIZES)).isRequired,
    vm: PropTypes.instanceOf(VM).isRequired
};

export default StageWrapperComponent;

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

import GreenFlag from '../green-flag/green-flag.jsx';
import PauseButton from '../pause-button/pause-button.jsx';
import StopAll from '../stop-all/stop-all.jsx';
import TurboMode from '../turbo-mode/turbo-mode.jsx';

import styles from './controls.css';

const messages = defineMessages({
    goTitle: {
        id: 'gui.controls.go',
        defaultMessage: 'Go',
        description: 'Green flag button title'
    },
    pauseTitle: {
        id: 'pm.controls.pause',
        defaultMessage: 'Pause',
        description: 'Pause button title'
    },
    stopTitle: {
        id: 'gui.controls.stop',
        defaultMessage: 'Stop',
        description: 'Stop button title'
    }
});

const Controls = function (props) {
    const {
        active,
        paused,
        className,
        intl,
        onGreenFlagClick,
        onPauseButtonClick,
        onStopAllClick,
        turbo,
        isSmall,
        ...componentProps
    } = props;
    return (
        <div
            className={classNames(styles.controlsContainer, className)}
            {...componentProps}
        >
            <GreenFlag
                active={active && !paused}
                title={intl.formatMessage(messages.goTitle)}
                onClick={onGreenFlagClick}
            />
            <PauseButton
                running={active && !paused}
                paused={paused}
                title={intl.formatMessage(messages.pauseTitle)}
                onClick={onPauseButtonClick}
            />
            <StopAll
                active={active || paused}
                title={intl.formatMessage(messages.stopTitle)}
                onClick={onStopAllClick}
            />
            {turbo ? (
                <TurboMode isSmall={isSmall} />
            ) : null}
        </div>
    );
};

Controls.propTypes = {
    active: PropTypes.bool,
    paused: PropTypes.bool,
    className: PropTypes.string,
    intl: intlShape.isRequired,
    onGreenFlagClick: PropTypes.func.isRequired,
    onPauseButtonClick: PropTypes.func.isRequired,
    onStopAllClick: PropTypes.func.isRequired,
    isSmall: PropTypes.bool,
    turbo: PropTypes.bool
};

Controls.defaultProps = {
    active: false,
    turbo: false,
    isSmall: false
};

export default injectIntl(Controls);

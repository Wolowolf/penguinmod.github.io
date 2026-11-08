import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import pauseIcon from '../stage-header/stagecontrols/pause.svg';
import playIcon from '../stage-header/stagecontrols/play.svg';
import styles from './pause-button.css';

const PauseButtonComponent = function (props) {
    const {
        disabled,
        paused,
        className,
        onClick,
        title,
        ...componentProps
    } = props;
    return (
        <img
            className={classNames(
                className,
                styles.pauseBtn,
                {
                    [styles.isActive]: paused,
                    [styles.isDisabled]: disabled
                }
            )}
            aria-disabled={disabled}
            draggable={false}
            src={paused ? playIcon : pauseIcon}
            title={title}
            onClick={onClick}
            // tw: also fire click when opening context menu (right click on all systems and alt+click on chromebooks)
            onContextMenu={onClick}
            {...componentProps}
        />
    );
};
PauseButtonComponent.propTypes = {
    disabled: PropTypes.bool,
    paused: PropTypes.bool,
    className: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    title: PropTypes.string
};
PauseButtonComponent.defaultProps = {
    disabled: false,
    paused: false,
    title: 'Pause'
};
export default PauseButtonComponent;

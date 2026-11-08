import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './pause-button.css';

const PauseButtonComponent = function (props) {
    const {
        running,
        paused,
        className,
        onClick,
        title,
        ...componentProps
    } = props;
    return (
        <svg
            className={classNames(
                className,
                styles.pauseBtn,
                {
                    [styles.isRunning]: running
                }
            )}
            viewBox="0 0 20 20"
            onClick={onClick}
            // tw: also fire click when opening context menu (right click on all systems and alt+click on chromebooks)
            onContextMenu={onClick}
            {...componentProps}
        >
            <title>{title}</title>
            {paused ? (
                <polygon
                    className={styles.hollow}
                    points="4,5 4,15 12.66,10"
                />
            ) : (
                <React.Fragment>
                    <rect
                        x="3"
                        y="2"
                        width="5"
                        height="16"
                    />
                    <rect
                        x="12"
                        y="2"
                        width="5"
                        height="16"
                    />
                </React.Fragment>
            )}
        </svg>
    );
};
PauseButtonComponent.propTypes = {
    running: PropTypes.bool,
    paused: PropTypes.bool,
    className: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    title: PropTypes.string
};
PauseButtonComponent.defaultProps = {
    running: false,
    paused: false,
    title: 'Pause'
};
export default PauseButtonComponent;

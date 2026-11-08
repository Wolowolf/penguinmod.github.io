import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './stop-all.css';

const StopAllComponent = function (props) {
    const {
        active,
        className,
        onClick,
        title,
        ...componentProps
    } = props;
    return (
        <svg
            className={classNames(
                className,
                styles.stopAll,
                {
                    [styles.isActive]: active
                }
            )}
            viewBox="0 0 20 20"
            onClick={onClick}
            {...componentProps}
        >
            <title>{title}</title>
            <rect
                x="3"
                y="3"
                width="14"
                height="14"
            />
        </svg>
    );
};

StopAllComponent.propTypes = {
    active: PropTypes.bool,
    className: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    title: PropTypes.string
};

StopAllComponent.defaultProps = {
    active: false,
    title: 'Stop'
};

export default StopAllComponent;

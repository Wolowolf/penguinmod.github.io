import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './green-flag.css';

const GreenFlagComponent = function (props) {
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
                styles.greenFlag,
                {
                    [styles.isActive]: active
                }
            )}
            viewBox="0 0 20 20"
            onClick={onClick}
            {...componentProps}
        >
            <title>{title}</title>
            <polygon points="3.07,2 3.07,18 16.93,10" />
        </svg>
    );
};
GreenFlagComponent.propTypes = {
    active: PropTypes.bool,
    className: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    title: PropTypes.string
};
GreenFlagComponent.defaultProps = {
    active: false,
    title: 'Go'
};
export default GreenFlagComponent;

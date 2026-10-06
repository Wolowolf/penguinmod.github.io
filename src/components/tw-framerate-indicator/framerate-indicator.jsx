import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import styles from './framerate-indicator.css';

const FramerateIndicator = ({framerate}) => (
    <React.Fragment>
        {/* 0 is technically a valid framerate that means "at monitor refresh rate" */}
        {/* we won't display anything for that yet because we don't know how to explain it */}
        {framerate !== 30 && framerate !== 0 && (
            <div className={styles.framerateContainer}>
                <div className={styles.framerateLabel}>
                    <FormattedMessage
                        defaultMessage="{framerate} FPS"
                        description="Label to indicate custom framerate"
                        id="tw.fps"
                        values={{
                            framerate: framerate
                        }}
                    />
                </div>
            </div>
        )}
    </React.Fragment>
);

FramerateIndicator.propTypes = {
    framerate: PropTypes.number
};

export default FramerateIndicator;

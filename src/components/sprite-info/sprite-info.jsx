import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Box from 'scratch-paint/src/components/box/box.jsx';
import Label from '../forms/label.jsx';
import Input from '../forms/input.jsx';
import BufferedInputHOC from 'scratch-paint/src/components/forms/buffered-input-hoc.jsx';
import DirectionPicker from '../../containers/direction-picker.jsx';

import {injectIntl, intlShape, FormattedMessage} from 'react-intl';

import {STAGE_DISPLAY_SIZES} from '../../lib/layout-constants.js';
import {isWideLocale} from '../../lib/locale-utils.js';

import styles from './sprite-info.css';

import xIcon from './icon--x.svg';
import yIcon from './icon--y.svg';

const BufferedInput = BufferedInputHOC(Input);

// desktop: the name box and the show/hide eye sit on each sprite tile (sprite-selector-item.jsx)
class SpriteInfo extends React.Component {
    shouldComponentUpdate (nextProps) {
        return (
            this.props.rotationStyle !== nextProps.rotationStyle ||
            this.props.disabled !== nextProps.disabled ||
            this.props.stageSize !== nextProps.stageSize ||
            // Only update these if rounded value has changed
            Math.round(this.props.direction) !== Math.round(nextProps.direction) ||
            Math.round(this.props.size) !== Math.round(nextProps.size) ||
            Math.round(this.props.x) !== Math.round(nextProps.x) ||
            Math.round(this.props.y) !== Math.round(nextProps.y)
        );
    }
    render () {
        const {
            stageSize
        } = this.props;

        const sizeLabel = (
            <FormattedMessage
                defaultMessage="Size"
                description="Sprite info size label"
                id="gui.SpriteInfo.size"
            />
        );

        const labelAbove = isWideLocale(this.props.intl.locale);

        const xPosition = (
            <div className={styles.group}>
                <Label text="x">
                    <BufferedInput
                        small
                        disabled={this.props.disabled}
                        placeholder="x"
                        tabIndex="0"
                        type="text"
                        value={this.props.disabled ? '' : Math.round(this.props.x)}
                        onSubmit={this.props.onChangeX}
                    />
                </Label>
            </div>
        );

        const yPosition = (
            <div className={styles.group}>
                <Label text="y">
                    <BufferedInput
                        small
                        disabled={this.props.disabled}
                        placeholder="y"
                        tabIndex="0"
                        type="text"
                        value={this.props.disabled ? '' : Math.round(this.props.y)}
                        onSubmit={this.props.onChangeY}
                    />
                </Label>
            </div>
        );

        if (stageSize === STAGE_DISPLAY_SIZES.small) {
            return (
                <Box className={styles.spriteInfo}>
                    <div className={styles.row}>
                        <div className={styles.pair}>
                            {xPosition}
                            {yPosition}
                        </div>
                    </div>
                </Box>
            );
        }

        return (
            <Box className={styles.spriteInfo}>
                <div className={styles.row}>
                    <div className={styles.pair}>
                        {xPosition}
                        {yPosition}
                    </div>
                    <div className={styles.pair}>
                        <div className={classNames(styles.group, styles.largerInput)}>
                            <Label
                                secondary
                                above={labelAbove}
                                text="⇪"
                            >
                                <BufferedInput
                                    small
                                    disabled={this.props.disabled}
                                    label={sizeLabel}
                                    tabIndex="0"
                                    type="text"
                                    value={this.props.disabled ? '' : Math.round(this.props.size)}
                                    onSubmit={this.props.onChangeSize}
                                />
                            </Label>
                        </div>
                        <div className={classNames(styles.group, styles.largerInput)}>
                            <DirectionPicker
                                direction={Math.round(this.props.direction)}
                                disabled={this.props.disabled}
                                labelAbove={labelAbove}
                                rotationStyle={this.props.rotationStyle}
                                onChangeDirection={this.props.onChangeDirection}
                                onChangeRotationStyle={this.props.onChangeRotationStyle}
                            />
                        </div>
                    </div>
                </div>
            </Box>
        );
    }
}

SpriteInfo.propTypes = {
    direction: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    disabled: PropTypes.bool,
    intl: intlShape,
    onChangeDirection: PropTypes.func,
    onChangeRotationStyle: PropTypes.func,
    onChangeSize: PropTypes.func,
    onChangeX: PropTypes.func,
    onChangeY: PropTypes.func,
    rotationStyle: PropTypes.string,
    size: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    stageSize: PropTypes.oneOf(Object.keys(STAGE_DISPLAY_SIZES)).isRequired,
    x: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    y: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ])
};

export default injectIntl(SpriteInfo);

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import styles from './fonts-modal.css';
import VanillaFonts from 'scratch-paint/src/lib/fonts';
import bindAll from 'lodash.bindall';
import classNames from 'classnames';

class FontFallbackButton extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleClick'
        ]);
    }

    handleClick () {
        this.props.onClick(this.props.family);
    }

    formatName () {
        return this.props.family;
    }

    render () {
        return (
            <button
                className={classNames(styles.fallbackButton, {[styles.fallbackButtonSelected]: this.props.selected})}
                onClick={this.handleClick}
                style={{
                    fontFamily: this.props.family
                }}
            >
                {this.formatName()}
            </button>
        );
    }
}

FontFallbackButton.propTypes = {
    family: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    selected: PropTypes.bool.isRequired
};

const FontFallback = props => (
    <div className={styles.fallbackContainer}>
        <div className={styles.fallbackLabel}>
            <FormattedMessage
                defaultMessage="Choose a fallback font to use if the font fails to load or is deleted:"
                description="Part of font management modal."
                id="tw.fonts.fallback"
            />
        </div>

        <div className={styles.fallbackList}>
            {Object.values(VanillaFonts).map(family => (
                <FontFallbackButton
                    key={family}
                    family={family}
                    onClick={props.onChange}
                    selected={props.fallback === family}
                />
            ))}
        </div>
    </div>
);

FontFallback.DEFAULT = VanillaFonts.ATKINSON_NEXT;

FontFallback.propTypes = {
    fallback: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
};

export default FontFallback;

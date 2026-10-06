import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {DEFAULT_STAGE_BOX_WIDTH, getEffectiveStageBoxWidth, getStageDimensions} from '../../lib/screen-utils';
import {setStageBoxWidth, saveStageBoxWidth} from '../../reducers/stage-size';

import styles from './stage-resize-handle.css';

class StageResizeHandle extends React.Component {
    constructor (props) {
        super(props);
        this.state = {active: false};
        this.dragging = false;
        this.startX = 0;
        this.startWidth = DEFAULT_STAGE_BOX_WIDTH;
        this.slope = 1;
        this.currentWidth = getEffectiveStageBoxWidth(props.boxWidth);
        this.nudgePending = false;
        this.handlePointerDown = this.handlePointerDown.bind(this);
        this.handlePointerMove = this.handlePointerMove.bind(this);
        this.handlePointerUp = this.handlePointerUp.bind(this);
        this.handleDoubleClick = this.handleDoubleClick.bind(this);
        this.handleWindowResize = this.handleWindowResize.bind(this);
    }
    componentDidMount () {
        window.addEventListener('resize', this.handleWindowResize);
    }
    componentWillUnmount () {
        window.removeEventListener('resize', this.handleWindowResize);
    }
    // Tell the block workspace that the space available to it changed.
    nudgeLayout () {
        if (this.nudgePending) return;
        this.nudgePending = true;
        requestAnimationFrame(() => {
            this.nudgePending = false;
            window.dispatchEvent(new Event('resize'));
        });
    }
    applyWidth (width) {
        this.currentWidth = getEffectiveStageBoxWidth(width);
        this.props.onChange(this.currentWidth);
        this.nudgeLayout();
    }
    handleWindowResize () {
        // A smaller window may force a smaller stage (and a bigger one gives it back).
        const effective = getEffectiveStageBoxWidth(this.props.boxWidth);
        if (effective !== this.currentWidth) {
            this.currentWidth = effective;
            this.props.onChange(this.props.boxWidth);
            this.nudgeLayout();
        }
    }
    handlePointerDown (e) {
        if (e.button !== undefined && e.button !== 0) return;
        e.preventDefault();
        this.dragging = true;
        this.startX = e.clientX;
        this.startWidth = getEffectiveStageBoxWidth(this.props.boxWidth);
        // Tall stages are narrower than the box, so the column grows slower than the box does.
        // Compensate so the handle keeps following the mouse.
        const dims = getStageDimensions('large', this.props.customStageSize, false, this.startWidth);
        this.slope = Math.max(0.3, Math.min(1, dims.width / this.startWidth)) || 1;
        try {
            e.currentTarget.setPointerCapture(e.pointerId);
        } catch (err) {
            // not fatal, dragging still works while the pointer stays over the handle
        }
        this.setState({active: true});
    }
    handlePointerMove (e) {
        if (!this.dragging) return;
        const dx = e.clientX - this.startX;
        // The stage column is on the right, so dragging left makes the stage bigger.
        // (In right-to-left languages the column is on the left, so it is reversed.)
        const delta = this.props.isRtl ? dx : -dx;
        this.applyWidth(this.startWidth + (delta / this.slope));
    }
    handlePointerUp (e) {
        if (!this.dragging) return;
        this.dragging = false;
        try {
            e.currentTarget.releasePointerCapture(e.pointerId);
        } catch (err) {
            // ignore
        }
        saveStageBoxWidth(this.currentWidth);
        this.setState({active: false});
    }
    handleDoubleClick () {
        this.applyWidth(DEFAULT_STAGE_BOX_WIDTH);
        saveStageBoxWidth(this.currentWidth);
    }
    render () {
        return (
            <div
                aria-orientation="vertical"
                className={classNames(styles.handle, {[styles.active]: this.state.active})}
                role="separator"
                title="Drag to resize the stage (double-click to reset)"
                onDoubleClick={this.handleDoubleClick}
                onPointerCancel={this.handlePointerUp}
                onPointerDown={this.handlePointerDown}
                onPointerMove={this.handlePointerMove}
                onPointerUp={this.handlePointerUp}
            >
                <div className={styles.grip} />
            </div>
        );
    }
}

StageResizeHandle.propTypes = {
    boxWidth: PropTypes.number,
    customStageSize: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number
    }),
    isRtl: PropTypes.bool,
    onChange: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    boxWidth: state.scratchGui.stageSize.boxWidth,
    customStageSize: state.scratchGui.customStageSize
});

const mapDispatchToProps = dispatch => ({
    onChange: width => dispatch(setStageBoxWidth(width))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(StageResizeHandle);

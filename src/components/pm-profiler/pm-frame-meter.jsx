// PenguinMod Desktop (section 36): the on-screen frame-time meter. A small box in the corner of the
// stage with the frame time, frames per second, how long a step takes and a word for how it is going
// (not only a colour). It is only listening while it is on. A screen reader is told when the word
// changes (at most every 10 seconds) instead of every number.
/* eslint-disable react/no-multi-comp */
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import VM from 'scratch-vm';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import {openProfilerModal} from '../../reducers/modals';
import {acquire, release, onTick, snapshot, isMeterOn, setMeterOn, onMeterChange} from '../../lib/pm-frame-stats';
import headerStyles from '../stage-header/stage-header.css';
import meterIcon from '../stage-header/icon--meter.svg';
import styles from './pm-profiler.css';

const messages = defineMessages({
    label: {
        defaultMessage: 'Frame-time meter',
        description: 'Name of the on-screen frame-time meter',
        id: 'pm.frameMeter.label'
    },
    smooth: {
        defaultMessage: 'Smooth',
        description: 'Frame-time meter: the project keeps up with its frame rate',
        id: 'pm.frameMeter.smooth'
    },
    busy: {
        defaultMessage: 'Busy',
        description: 'Frame-time meter: the project keeps up but uses most of each frame',
        id: 'pm.frameMeter.busy'
    },
    slow: {
        defaultMessage: 'Slow',
        description: 'Frame-time meter: the project cannot keep up with its frame rate',
        id: 'pm.frameMeter.slow'
    },
    waiting: {
        defaultMessage: 'Measuring…',
        description: 'Frame-time meter: the first second after it is switched on, or no steps yet',
        id: 'pm.frameMeter.waiting'
    },
    openProfiler: {
        defaultMessage: 'Profiler',
        description: 'Button on the frame-time meter that opens the profiler window',
        id: 'pm.frameMeter.openProfiler'
    },
    announce: {
        defaultMessage: 'Frame time {status}: {fps} frames per second, aiming for {target}.',
        description: 'Spoken by screen readers when the frame-time status changes',
        id: 'pm.frameMeter.announce'
    },
    announceOn: {
        defaultMessage: 'Frame-time meter on.',
        description: 'Spoken by screen readers when the frame-time meter is switched on',
        id: 'pm.frameMeter.on'
    }
});

const GLYPH = {smooth: '✓', busy: '!', slow: '✕'};
const ms = n => (n < 100 ? n.toFixed(1) : String(Math.round(n)));
const BARS = 40;
const BAR_W = 2;
const BAR_H = 16;

// The last steps as thin bars: the taller, the longer the step took to come round (full height = twice
// the project's frame time). A line marks the frame time the project aims for.
const Bars = ({recent, target}) => {
    const bars = recent.map((s, i) => {
        const h = Math.max(1, Math.min(BAR_H, (Math.max(s.interval, s.work) / (target * 2)) * BAR_H));
        const late = s.interval > target * 1.5;
        return (
            <rect
                className={late ? styles.barLate : styles.bar}
                height={h}
                key={i}
                width={BAR_W - 0.5}
                x={(BARS - recent.length + i) * BAR_W}
                y={BAR_H - h}
            />
        );
    });
    return (
        <svg
            aria-hidden="true"
            className={styles.bars}
            focusable="false"
            height={BAR_H}
            viewBox={`0 0 ${BARS * BAR_W} ${BAR_H}`}
            width={BARS * BAR_W}
        >
            {bars}
            <line
                className={styles.targetLine}
                x1="0"
                x2={BARS * BAR_W}
                y1={BAR_H / 2}
                y2={BAR_H / 2}
            />
        </svg>
    );
};
Bars.propTypes = {
    recent: PropTypes.arrayOf(PropTypes.shape({interval: PropTypes.number, work: PropTypes.number})),
    target: PropTypes.number
};

class FrameMeter extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, ['handleTick', 'handlePref', 'handleOpen']);
        this.state = {on: isMeterOn(), snap: null, announcement: ''};
        this.lastStatus = null;
        this.lastAnnounce = 0;
        this.held = false;
    }
    componentDidMount () {
        this.stopPref = onMeterChange(this.handlePref);
        if (this.state.on) this.hold();
    }
    componentWillUnmount () {
        this.stopPref();
        this.drop();
    }
    hold () {
        if (this.held) return;
        this.held = true;
        acquire(this.props.vm);
        this.stopTick = onTick(this.handleTick);
    }
    drop () {
        if (!this.held) return;
        this.held = false;
        this.stopTick();
        release();
    }
    handlePref (on) {
        if (on) {
            this.lastStatus = null;
            this.hold();
            this.setState({
                on,
                announcement: this.props.intl.formatMessage(messages.announceOn)
            });
        } else {
            this.drop();
            this.setState({on, snap: null, announcement: ''});
        }
    }
    handleTick () {
        const snap = snapshot(this.props.vm);
        const update = {snap};
        if (snap.hasData && snap.status !== this.lastStatus) {
            const now = Date.now();
            if (this.lastStatus === null || now - this.lastAnnounce > 10000) {
                const {intl} = this.props;
                update.announcement = intl.formatMessage(messages.announce, {
                    status: intl.formatMessage(messages[snap.status]),
                    fps: snap.fps,
                    target: Math.round(snap.targetFps)
                });
                this.lastStatus = snap.status;
                this.lastAnnounce = now;
            }
        }
        this.setState(update);
    }
    handleOpen () {
        this.props.onOpenProfiler();
    }
    render () {
        if (!this.state.on) return null;
        const {intl} = this.props;
        const snap = this.state.snap;
        const live = snap && snap.hasData;
        const status = live ? snap.status : 'waiting';
        const statusText = intl.formatMessage(messages[status]);
        return (
            <div
                aria-label={intl.formatMessage(messages.label)}
                className={classNames(styles.meter, styles[`status-${status}`])}
                role="group"
            >
                {live ? <Bars
                    recent={snap.recent}
                    target={snap.target}
                /> : null}
                <span className={styles.readout}>
                    {live ? (
                        <React.Fragment>
                            <span className={styles.number}>{ms(snap.avgInterval)}{' ms'}</span>
                            {' · '}
                            <span className={styles.number}>{snap.fps}{' FPS'}</span>
                            {' · '}
                            <span>{'work '}<span className={styles.number}>{ms(snap.avgWork)}{' ms'}</span></span>
                            {' · '}
                        </React.Fragment>
                    ) : null}
                    <span className={styles.statusWord}>
                        <span aria-hidden="true">{live ? `${GLYPH[status]} ` : ''}</span>
                        {statusText}
                    </span>
                </span>
                <button
                    className={styles.meterButton}
                    type="button"
                    onClick={this.handleOpen}
                >
                    {intl.formatMessage(messages.openProfiler)}
                </button>
                <span
                    aria-live="polite"
                    className={styles.visuallyHidden}
                    role="status"
                >
                    {this.state.announcement}
                </span>
            </div>
        );
    }
}

FrameMeter.propTypes = {
    intl: intlShape,
    onOpenProfiler: PropTypes.func,
    vm: PropTypes.instanceOf(VM).isRequired
};

const mapDispatchToProps = dispatch => ({
    onOpenProfiler: () => dispatch(openProfilerModal())
});

export default injectIntl(connect(null, mapDispatchToProps)(FrameMeter));

// The button in the stage header that switches the meter on and off.
const toggleMessages = defineMessages({
    toggle: {
        defaultMessage: 'Frame-time meter',
        description: 'Button in the stage header that shows or hides the frame-time meter',
        id: 'pm.frameMeter.toggle'
    }
});

class FrameMeterToggleComponent extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, ['handleChange', 'handleClick']);
        this.state = {on: isMeterOn()};
    }
    componentDidMount () {
        this.stopPref = onMeterChange(this.handleChange);
    }
    componentWillUnmount () {
        this.stopPref();
    }
    handleChange (on) {
        this.setState({on});
    }
    handleClick () {
        setMeterOn(!this.state.on);
    }
    render () {
        const label = this.props.intl.formatMessage(toggleMessages.toggle);
        return (
            <button
                aria-label={label}
                aria-pressed={this.state.on}
                className={classNames(headerStyles.stageButton, styles.stageToggle)}
                title={label}
                type="button"
                onClick={this.handleClick}
            >
                <img
                    alt=""
                    className={headerStyles.stageButtonIcon}
                    draggable={false}
                    src={meterIcon}
                />
            </button>
        );
    }
}
FrameMeterToggleComponent.propTypes = {
    intl: intlShape
};
export const FrameMeterToggle = injectIntl(FrameMeterToggleComponent);

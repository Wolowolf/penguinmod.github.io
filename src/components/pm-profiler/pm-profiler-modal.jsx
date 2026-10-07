// PenguinMod Desktop (section 36): the profiler window. Shows what the engine's own profiler
// (runtime.profiler) records while the window is open: how long a step takes, how much of that is
// running scripts and drawing the stage, and how often each block ran. It is a real table with
// sortable column buttons; the numbers are held still while the keyboard focus is inside the table
// so they can be read, and "Pause" stops them for good.
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import VM from 'scratch-vm';
import bindAll from 'lodash.bindall';
import Modal from '../../containers/modal.jsx';
import {closeProfilerModal} from '../../reducers/modals';
import {
    acquire, release, onTick, snapshot,
    startProfiler, stopProfiler, setCollecting, resetProfiler, profilerReport
} from '../../lib/pm-frame-stats';
import styles from './pm-profiler.css';

const messages = defineMessages({
    title: {
        defaultMessage: 'Profiler',
        description: 'Title of the profiler window',
        id: 'pm.profiler.title'
    },
    intro: {
        defaultMessage: 'Times what the engine does in each step while this window is open. ' +
            'Timing makes the project a little slower.',
        description: 'Profiler window: short explanation',
        id: 'pm.profiler.intro'
    },
    summary: {
        defaultMessage: '{steps} steps recorded. A step takes {step} ms on average. Last second: {fps} FPS, ' +
            'aiming for {target}.',
        description: 'Profiler window: summary line',
        id: 'pm.profiler.summary'
    },
    pause: {
        defaultMessage: 'Pause',
        description: 'Profiler window: stop recording',
        id: 'pm.profiler.pause'
    },
    resume: {
        defaultMessage: 'Resume',
        description: 'Profiler window: go on recording',
        id: 'pm.profiler.resume'
    },
    reset: {
        defaultMessage: 'Reset',
        description: 'Profiler window: clear the recorded numbers',
        id: 'pm.profiler.reset'
    },
    caption: {
        defaultMessage: 'Time per step, by part of the engine and by block',
        description: 'Profiler window: table caption',
        id: 'pm.profiler.caption'
    },
    colPart: {
        defaultMessage: 'Part',
        description: 'Profiler window: column of names',
        id: 'pm.profiler.colPart'
    },
    colCalls: {
        defaultMessage: 'Calls per step',
        description: 'Profiler window: column, how often it ran in a step',
        id: 'pm.profiler.colCalls'
    },
    colTotal: {
        defaultMessage: 'Time per step (ms)',
        description: 'Profiler window: column, milliseconds per step including what it calls',
        id: 'pm.profiler.colTotal'
    },
    colSelf: {
        defaultMessage: 'Own time per step (ms)',
        description: 'Profiler window: column, milliseconds per step without what it calls',
        id: 'pm.profiler.colSelf'
    },
    notTimed: {
        defaultMessage: 'not timed',
        description: 'Profiler window: a row that is only counted',
        id: 'pm.profiler.notTimed'
    },
    nothing: {
        defaultMessage: 'Nothing recorded yet. The numbers appear once the project runs.',
        description: 'Profiler window: before any step',
        id: 'pm.profiler.nothing'
    },
    paused: {
        defaultMessage: 'Recording paused.',
        description: 'Profiler window: said when recording is paused',
        id: 'pm.profiler.pausedNote'
    },
    resumed: {
        defaultMessage: 'Recording resumed.',
        description: 'Profiler window: said when recording goes on',
        id: 'pm.profiler.resumedNote'
    },
    wasReset: {
        defaultMessage: 'Numbers cleared.',
        description: 'Profiler window: said after Reset',
        id: 'pm.profiler.resetNote'
    },
    blocksNote: {
        defaultMessage: 'Blocks are only counted for scripts the engine runs one block at a time. ' +
            'Scripts it has compiled show up in the time of "Running scripts" only.',
        description: 'Profiler window: why a script may have no block rows',
        id: 'pm.profiler.blocksNote'
    },
    stepName: {
        defaultMessage: 'Whole step',
        description: 'Profiler row: everything the engine does in one step',
        id: 'pm.profiler.part.step'
    },
    threadsName: {
        defaultMessage: 'Running scripts',
        description: 'Profiler row: time spent running scripts',
        id: 'pm.profiler.part.threads'
    },
    drawName: {
        defaultMessage: 'Drawing the stage',
        description: 'Profiler row: time spent drawing',
        id: 'pm.profiler.part.draw'
    },
    innerName: {
        defaultMessage: 'Passes over all scripts',
        description: 'Profiler row: a pass over every running script',
        id: 'pm.profiler.part.inner'
    },
    threadName: {
        defaultMessage: 'Script turns',
        description: 'Profiler row: how often a script got a turn',
        id: 'pm.profiler.part.thread'
    },
    executeName: {
        defaultMessage: 'Block stacks run',
        description: 'Profiler row: how often a stack of blocks was run',
        id: 'pm.profiler.part.execute'
    },
    blockName: {
        defaultMessage: 'Block {opcode}',
        description: 'Profiler row: one kind of block',
        id: 'pm.profiler.part.block'
    }
});

const KNOWN = {
    'Runtime._step': 'stepName',
    'Sequencer.stepThreads': 'threadsName',
    'RenderWebGL.draw': 'drawName',
    'Sequencer.stepThreads#inner': 'innerName',
    'Sequencer.stepThread': 'threadName',
    'execute': 'executeName'
};

const COLUMNS = ['name', 'calls', 'total', 'self'];
const MAX_ROWS = 200;
const num = n => (n < 10 ? n.toFixed(2) : n < 100 ? n.toFixed(1) : String(Math.round(n)));

class ProfilerModal extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, ['handleTick', 'handlePause', 'handleReset', 'handleFocus', 'handleBlur', 'handleSort']);
        this.state = {
            report: {steps: 0, rows: []},
            snap: null,
            sortBy: 'total',
            descending: true,
            paused: false,
            note: ''
        };
        this.focusInside = false;
    }
    componentDidMount () {
        acquire(this.props.vm);
        startProfiler(this.props.vm);
        this.stopTick = onTick(this.handleTick);
        this.handleTick();
    }
    componentWillUnmount () {
        this.stopTick();
        stopProfiler();
        release();
    }
    handleTick () {
        if (this.focusInside) return;
        this.setState({report: profilerReport(), snap: snapshot(this.props.vm)});
    }
    handlePause () {
        const paused = !this.state.paused;
        setCollecting(!paused);
        this.setState({
            paused,
            note: this.props.intl.formatMessage(paused ? messages.paused : messages.resumed)
        });
    }
    handleReset () {
        resetProfiler();
        this.setState({
            report: profilerReport(),
            note: this.props.intl.formatMessage(messages.wasReset)
        });
    }
    handleFocus () {
        this.focusInside = true;
    }
    handleBlur () {
        this.focusInside = false;
    }
    handleSort (e) {
        const column = e.currentTarget.dataset.column;
        this.setState(state => ({
            sortBy: column,
            descending: state.sortBy === column ? !state.descending : column !== 'name'
        }));
    }
    rows () {
        const {intl} = this.props;
        const steps = Math.max(1, this.state.report.steps);
        const out = this.state.report.rows.map(r => {
            let label;
            if (r.name === 'blockFunction') {
                label = intl.formatMessage(messages.blockName, {opcode: r.arg});
            } else if (KNOWN[r.name]) {
                label = intl.formatMessage(messages[KNOWN[r.name]]);
            } else {
                label = r.arg ? `${r.name} ${r.arg}` : r.name;
            }
            return {
                key: `${r.name}\u0000${r.arg}`,
                name: label,
                detail: r.name === 'blockFunction' || !KNOWN[r.name] ? '' : r.name,
                timed: r.timed,
                calls: r.count / steps,
                total: r.timed ? r.total / steps : -1,
                self: r.timed ? r.self / steps : -1
            };
        });
        const {sortBy, descending} = this.state;
        const dir = descending ? -1 : 1;
        out.sort((a, b) => {
            if (sortBy === 'name') return dir * a.name.localeCompare(b.name);
            return dir * (a[sortBy] - b[sortBy]) || a.name.localeCompare(b.name);
        });
        return out.slice(0, MAX_ROWS);
    }
    render () {
        const {intl} = this.props;
        const {snap, report, paused, sortBy, descending} = this.state;
        const stepRow = report.rows.find(r => r.name === 'Runtime._step');
        const stepMs = stepRow && report.steps ? stepRow.total / report.steps : 0;
        const rows = this.rows();
        const heads = {
            name: messages.colPart,
            calls: messages.colCalls,
            total: messages.colTotal,
            self: messages.colSelf
        };
        return (
            <Modal
                className={styles.modalContent}
                contentLabel={intl.formatMessage(messages.title)}
                id="profilerModal"
                onRequestClose={this.props.onClose}
            >
                <div className={styles.body}>
                    <p className={styles.intro}>{intl.formatMessage(messages.intro)}</p>
                    <p className={styles.summary}>
                        {intl.formatMessage(messages.summary, {
                            steps: report.steps,
                            step: num(stepMs),
                            fps: snap ? snap.fps : 0,
                            target: snap ? Math.round(snap.targetFps) : 0
                        })}
                    </p>
                    <div className={styles.toolbar}>
                        <button
                            className={styles.toolButton}
                            type="button"
                            onClick={this.handlePause}
                        >
                            {intl.formatMessage(paused ? messages.resume : messages.pause)}
                        </button>
                        <button
                            className={styles.toolButton}
                            type="button"
                            onClick={this.handleReset}
                        >
                            {intl.formatMessage(messages.reset)}
                        </button>
                    </div>
                    <span
                        aria-live="polite"
                        className={styles.visuallyHidden}
                        role="status"
                    >
                        {this.state.note}
                    </span>
                    <div
                        className={styles.tableWrap}
                        onBlur={this.handleBlur}
                        onFocus={this.handleFocus}
                    >
                        <table className={styles.table}>
                            <caption className={styles.visuallyHidden}>
                                {intl.formatMessage(messages.caption)}
                            </caption>
                            <thead>
                                <tr>
                                    {COLUMNS.map(column => {
                                        const sorted = sortBy === column;
                                        return (
                                            <th
                                                aria-sort={sorted ? (descending ? 'descending' : 'ascending') : 'none'}
                                                className={column === 'name' ? styles.nameCell : styles.numHead}
                                                key={column}
                                                scope="col"
                                            >
                                                <button
                                                    className={styles.sortButton}
                                                    data-column={column}
                                                    type="button"
                                                    onClick={this.handleSort}
                                                >
                                                    {intl.formatMessage(heads[column])}
                                                    <span aria-hidden="true">
                                                        {sorted ? (descending ? ' ▼' : ' ▲') : ''}
                                                    </span>
                                                </button>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map(r => (
                                    <tr key={r.key}>
                                        <th
                                            className={styles.nameCell}
                                            scope="row"
                                        >
                                            {r.name}
                                            {r.detail ? <span className={styles.detail}>{r.detail}</span> : null}
                                        </th>
                                        <td className={styles.numCell}>{num(r.calls)}</td>
                                        <td className={styles.numCell}>
                                            {r.timed ? num(r.total) : intl.formatMessage(messages.notTimed)}
                                        </td>
                                        <td className={styles.numCell}>
                                            {r.timed ? num(r.self) : intl.formatMessage(messages.notTimed)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {rows.length === 0 ? (
                            <p className={styles.empty}>{intl.formatMessage(messages.nothing)}</p>
                        ) : null}
                    </div>
                    <p className={styles.note}>{intl.formatMessage(messages.blocksNote)}</p>
                </div>
            </Modal>
        );
    }
}

ProfilerModal.propTypes = {
    intl: intlShape,
    onClose: PropTypes.func,
    vm: PropTypes.instanceOf(VM).isRequired
};

const mapDispatchToProps = dispatch => ({
    onClose: () => dispatch(closeProfilerModal())
});

export default injectIntl(connect(null, mapDispatchToProps)(ProfilerModal));

// PenguinMod Desktop (patch section 20): the sound editor's waveform, drawn like the sound library's
// (pm-waveforms.js): one column per screen pixel from the lowest to the highest sample, coloured by
// how bright that moment sounds (its spectral centroid) from blue (low) over green and yellow to red
// (high). As only one sound is shown and it is large, it is drawn at the screen's full resolution and
// also shows the loudness (RMS) of each column as a darker core.
// Section 83: a long sound's columns are worked out in the background worker (editorWaveInWorker), so
// adding or editing a song does not freeze the editor; short ones stay here, where that is quicker.
import React from 'react';
import PropTypes from 'prop-types';
import {analyseWave, paintWave, editorWave, editorWaveInWorker} from '../../lib/pm-waveforms.js';

// from this many samples (the engine resamples to the sound card: ~10 s at 96 kHz, ~23 s at 44.1 kHz;
// ~15 ms of work here) the worker does it
const WORKER_MIN_SAMPLES = 1000000;

class PMSoundWave extends React.PureComponent {
    constructor (props) {
        super(props);
        this.setCanvas = this.setCanvas.bind(this);
        this.scheduleDraw = this.scheduleDraw.bind(this);
        this.draw = this.draw.bind(this);
        this.canvas = null;
        this.frame = 0;
        this.wave = null; // the analysed columns, kept while the sound and width stay the same
        this.drawn = null;
        this.pending = null; // the worker job for the sound and width being worked out
    }
    componentDidMount () {
        if (typeof ResizeObserver !== 'undefined' && this.canvas) {
            this.observer = new ResizeObserver(this.scheduleDraw);
            this.observer.observe(this.canvas);
        }
        this.draw();
    }
    componentDidUpdate () {
        this.draw();
    }
    componentWillUnmount () {
        if (this.observer) this.observer.disconnect();
        cancelAnimationFrame(this.frame);
        this.pending = null;
    }
    setCanvas (canvas) {
        this.canvas = canvas;
    }
    // resizing: once per frame at most
    scheduleDraw () {
        cancelAnimationFrame(this.frame);
        this.frame = requestAnimationFrame(this.draw);
    }
    draw () {
        const canvas = this.canvas;
        if (!canvas) return;
        const {samples, sampleRate} = this.props;
        const ratio = window.devicePixelRatio || 1;
        const w = Math.max(1, Math.round(canvas.clientWidth * ratio));
        const h = Math.max(1, Math.round(canvas.clientHeight * ratio));
        const d = this.drawn;
        if (d && d.samples === samples && d.w === w && d.h === h) return;
        if (!this.wave || this.wave.samples !== samples || this.wave.w !== w) {
            if (samples.length >= WORKER_MIN_SAMPLES) {
                const p = this.pending;
                if (!p || p.samples !== samples || p.w !== w) this.startWorkerJob(samples, sampleRate, w);
                // another sound: empty until its waveform arrives; same sound, new width: keep the old one
                if (!this.wave || this.wave.samples !== samples) {
                    canvas.width = w;
                    canvas.height = h;
                    this.drawn = null;
                }
                return;
            }
            this.pending = null;
            this.wave = Object.assign(editorWave(analyseWave, samples, sampleRate, w), {samples, w});
        }
        canvas.width = w;
        canvas.height = h;
        paintWave(this.wave, canvas);
        // the loudness core, inside each column's lowest and highest sample
        const ctx = canvas.getContext('2d');
        const mid = h / 2;
        const amp = (h - 4) / 2;
        const {min, max, rms} = this.wave;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        for (let x = 0; x < w; x++) {
            const top = mid - Math.min(max[x], rms[x]) * amp;
            const bottom = mid - Math.max(min[x], -rms[x]) * amp;
            if (bottom - top >= 1) ctx.fillRect(x, top, 1, bottom - top);
        }
        this.drawn = {samples, w, h};
    }
    // the same columns as editorWave's here, worked out by the worker (or here when it can't run)
    startWorkerJob (samples, sampleRate, w) {
        const job = {samples, w};
        this.pending = job;
        const done = wave => {
            if (this.pending !== job) return; // replaced by another sound or width, or closed
            this.pending = null;
            this.wave = Object.assign(wave, {samples, w});
            this.draw();
        };
        editorWaveInWorker(samples, sampleRate, w).then(done, () => {
            if (this.pending === job) done(editorWave(analyseWave, samples, sampleRate, w));
        });
    }
    render () {
        return (
            <canvas
                ref={this.setCanvas}
                style={{display: 'block', width: '100%', aspectRatio: '600 / 160'}}
            />
        );
    }
}

PMSoundWave.propTypes = {
    sampleRate: PropTypes.number.isRequired,
    samples: PropTypes.instanceOf(Float32Array).isRequired
};

export default PMSoundWave;

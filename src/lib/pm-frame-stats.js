// PenguinMod Desktop (section 36): collects frame times for the on-screen frame-time meter and the
// profiler window. The engine already has a profiler (runtime.profiler, see scratch-vm's
// src/engine/profiler.js); nothing in the editor showed it.
//
// Two separate things, so the meter costs almost nothing:
//   * the meter only listens to the runtime's RUNTIME_STEP_START / RUNTIME_STEP_END events and
//     keeps the last few seconds of step times (acquire / release, counted: it listens while at least
//     one user holds it);
//   * the profiler window also switches the engine's own profiler on (startProfiler / stopProfiler),
//     which times Runtime._step, Sequencer.stepThreads, RenderWebGL.draw and counts blocks.

const PREF = 'pmdesktop:frameMeter';
const SAMPLES = 300; // about 5 s at 60 steps a second
const TICK = 250; // ms between snapshots handed to listeners

const readPref = () => {
    try {
        return localStorage.getItem(PREF) === '1';
    } catch (e) {
        return false;
    }
};

let meterOn = readPref();
const prefListeners = new Set();

export const isMeterOn = () => meterOn;
export const setMeterOn = on => {
    meterOn = !!on;
    try {
        localStorage.setItem(PREF, meterOn ? '1' : '0');
    } catch (e) { /* only remembered until the app closes */ }
    prefListeners.forEach(fn => fn(meterOn));
};
export const onMeterChange = fn => {
    prefListeners.add(fn);
    return () => prefListeners.delete(fn);
};

// ---- step times ----
const starts = new Float64Array(SAMPLES);
const intervals = new Float64Array(SAMPLES);
const works = new Float64Array(SAMPLES);
let written = 0; // samples ever written; the newest is at (written - 1) % SAMPLES
let stepBegan = 0;
let firstAt = 0; // when the first step was recorded
let holders = 0;
let attached = null; // {runtime, onStart, onEnd}
let timer = null;
const tickListeners = new Set();

const onStart = () => {
    const now = performance.now();
    if (written === 0) firstAt = now;
    const i = written % SAMPLES;
    const prev = written > 0 ? starts[(written - 1) % SAMPLES] : 0;
    starts[i] = now;
    intervals[i] = written > 0 ? now - prev : 0;
    stepBegan = now;
};
const onEnd = () => {
    // the step's own sample was started in onStart; its work time is known only now
    const i = written % SAMPLES;
    works[i] = performance.now() - stepBegan;
    written++;
};

const percent = (a, b) => (b > 0 ? a / b : 0);

// The numbers for the last second or so. `target` is the project's frame time in ms (1000 / FPS).
export const snapshot = vm => {
    const runtime = vm.runtime;
    const target = runtime.currentStepTime || (1000 / 30);
    const now = performance.now();
    const count = Math.min(written, SAMPLES);
    let steps = 0;
    let sumInterval = 0;
    let sumWork = 0;
    let worst = 0;
    const recent = [];
    for (let n = 0; n < count; n++) {
        const i = (written - 1 - n) % SAMPLES;
        const age = now - starts[i];
        if (age > 5000) break;
        if (age < 1000) {
            steps++;
            sumInterval += intervals[i];
            sumWork += works[i];
        }
        if (intervals[i] > worst) worst = intervals[i];
        if (recent.length < 40) recent.unshift({interval: intervals[i], work: works[i]});
    }
    const fps = steps; // steps started in the last second
    const avgInterval = steps > 1 ? sumInterval / steps : 0;
    const avgWork = steps ? sumWork / steps : 0;
    const targetFps = 1000 / target;
    // Smooth: keeps up with the project's frame rate and uses little of each frame.
    // Busy: keeps up but uses most of the frame. Slow: misses the project's frame rate.
    let status = 'smooth';
    if (fps < targetFps * 0.8 || avgWork > target * 1.1) {
        status = 'slow';
    } else if (fps < targetFps * 0.95 || avgWork > target * 0.7) {
        status = 'busy';
    }
    return {
        running: runtime.frameLoop && runtime.frameLoop.running,
        fps,
        avgInterval,
        avgWork,
        worst,
        target,
        targetFps,
        status,
        recent,
        hasData: steps > 0 && now - firstAt >= 1100,
        load: percent(avgWork, target)
    };
};

const startTimer = () => {
    timer = setInterval(() => tickListeners.forEach(fn => fn()), TICK);
};

// Start listening to the steps of `vm` (a count: pair every call with one `release`).
export const acquire = vm => {
    holders++;
    if (!attached || attached.vm !== vm) {
        if (attached) {
            attached.runtime.removeListener('RUNTIME_STEP_START', onStart);
            attached.runtime.removeListener('RUNTIME_STEP_END', onEnd);
        }
        attached = {vm, runtime: vm.runtime};
        attached.runtime.on('RUNTIME_STEP_START', onStart);
        attached.runtime.on('RUNTIME_STEP_END', onEnd);
        written = 0;
    }
    if (!timer) startTimer();
};
export const release = () => {
    holders = Math.max(0, holders - 1);
    if (holders === 0) {
        if (attached) {
            attached.runtime.removeListener('RUNTIME_STEP_START', onStart);
            attached.runtime.removeListener('RUNTIME_STEP_END', onEnd);
            attached = null;
        }
        clearInterval(timer);
        timer = null;
        written = 0;
    }
};
export const onTick = fn => {
    tickListeners.add(fn);
    return () => tickListeners.delete(fn);
};

// ---- the engine's profiler ----
const rows = new Map(); // key -> {name, arg, timed, count, total, self}
let steps = 0;
let profiled = null; // the runtime whose profiler is on
let collecting = true;

const STEP = 'Runtime._step';
const onFrame = frame => {
    if (!collecting) return;
    const name = profiled.profiler.nameById(frame.id) || `#${frame.id}`;
    const arg = frame.arg === null || typeof frame.arg === 'undefined' ? '' : String(frame.arg);
    const key = `${name}\u0000${arg}`;
    let row = rows.get(key);
    if (!row) {
        row = {name, arg, timed: frame.depth >= 0, count: 0, total: 0, self: 0};
        rows.set(key, row);
    }
    row.count += frame.count;
    if (row.timed) {
        row.total += frame.totalTime;
        row.self += frame.selfTime;
    }
    if (name === STEP) steps++;
};

export const startProfiler = vm => {
    if (profiled) return;
    profiled = vm.runtime;
    rows.clear();
    steps = 0;
    collecting = true;
    profiled.enableProfiling(onFrame);
};
export const stopProfiler = () => {
    if (!profiled) return;
    profiled.disableProfiling();
    profiled = null;
};
export const setCollecting = on => {
    collecting = !!on;
};
export const isCollecting = () => collecting;
export const resetProfiler = () => {
    rows.clear();
    steps = 0;
};

// What the profiler recorded since it was started or reset: {steps, rows: [{name, arg, timed, count,
// total (ms), self (ms)}]}. Rows are copies.
export const profilerReport = () => ({
    steps,
    rows: Array.from(rows.values()).map(r => Object.assign({}, r))
});

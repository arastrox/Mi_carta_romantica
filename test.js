const fs = require('fs');
const code = fs.readFileSync('app.js', 'utf8');

const mockElement = {
    addEventListener: () => {},
    classList: { add: () => {}, remove: () => {} },
    style: {},
    appendChild: () => {},
    getContext: () => ({
        clearRect: () => {}, save: () => {}, restore: () => {},
        beginPath: () => {}, arc: () => {}, fill: () => {}, translate: () => {},
        rotate: () => {}, scale: () => {}, moveTo: () => {}, bezierCurveTo: () => {},
        quadraticCurveTo: () => {}, stroke: () => {}
    })
};

global.document = {
    addEventListener: (evt, cb) => {
        if(evt === 'DOMContentLoaded') setTimeout(cb, 10);
    },
    getElementById: (id) => {
        return {
            ...mockElement,
            id: id,
            width: 1000,
            height: 1000
        };
    },
    createElement: () => ({ style: {}, classList: {} }),
    body: { classList: { add: () => {}, remove: () => {} } }
};
global.window = {
    innerWidth: 1000,
    innerHeight: 1000,
    addEventListener: () => {}
};
global.requestAnimationFrame = () => {};
global.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({ date: '2026-05-19' }) });

try {
    eval(code);
    setTimeout(() => {
        console.log("DOMContentLoaded executed without throwing!");
    }, 50);
} catch (e) {
    console.error("Runtime error:", e);
}

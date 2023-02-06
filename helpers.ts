const clamp = (min, value, max) => Math.max(min, Math.min(value, max));
const inRange = (from, value, to) =>
    Math.min(from, to) <= value && Math.max(from, to) >= value;

export {
    clamp,
    inRange
};
'use strict';

// Mock manuel pour react-native-reanimated 4.x
// Pas de require('react-native') pour éviter de charger react-native-css-interop
// (non transformé par Jest) via la chaîne de dépendances.

const React = require('react');

const NOOP = () => {};
const ID = (v) => v;

const layoutAnim = {
  duration: function () { return this; },
  delay: function () { return this; },
  springify: function () { return this; },
  damping: function () { return this; },
};

const Easing = {
  linear: ID, ease: ID, quad: ID, cubic: ID, sin: ID,
  circle: ID, exp: ID, bounce: ID,
  poly: () => ID, elastic: () => ID, back: () => ID,
  bezier: () => ID, in: ID, out: ID, inOut: ID,
};

// createAnimatedComponent retourne le composant sans transformation
// Les props animatedProps sont fusionnées pour le rendu en test
function createAnimatedComponent(Component) {
  const Wrapped = function (props) {
    const { animatedProps, ...rest } = props;
    return React.createElement(Component, Object.assign({}, rest, animatedProps));
  };
  Wrapped.displayName = `Animated(${Component.displayName || Component.name || 'Component'})`;
  return Wrapped;
}

module.exports = {
  __esModule: true,
  default: { createAnimatedComponent },
  createAnimatedComponent,
  useSharedValue: (v) => ({ value: v }),
  useAnimatedStyle: () => ({}),
  useAnimatedProps: () => ({}),
  useDerivedValue: (fn) => ({ value: fn() }),
  useAnimatedRef: () => ({ current: null }),
  useAnimatedScrollHandler: () => NOOP,
  withTiming: ID,
  withSpring: ID,
  withDecay: NOOP,
  withSequence: (...args) => args[args.length - 1],
  withDelay: (_delay, v) => v,
  withRepeat: ID,
  cancelAnimation: NOOP,
  runOnJS: (fn) => fn,
  runOnUI: (fn) => fn,
  scrollTo: NOOP,
  measure: NOOP,
  Easing,
  FadeIn: layoutAnim,
  FadeOut: layoutAnim,
  SlideInRight: layoutAnim,
  SlideOutLeft: layoutAnim,
  SlideInLeft: layoutAnim,
  ZoomIn: layoutAnim,
  ZoomOut: layoutAnim,
  Extrapolation: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
  interpolate: (_v, _input, output) => (output ? output[0] : 0),
  ReduceMotion: { System: 'system', Always: 'always', Never: 'never' },
};

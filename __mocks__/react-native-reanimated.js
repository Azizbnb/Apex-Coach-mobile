'use strict';

/**
 * Mock manuel pour react-native-reanimated 4.x (compatible SDK 55).
 *
 * Raison d'être : Jest ne peut pas transformer react-native-reanimated en mode
 * managé Expo car le package dépend de react-native-css-interop (non transformé
 * par le preset Jest). Ce mock reproduit fidèlement la surface publique utilisée
 * dans les tests sans déclencher la chaîne de dépendances native.
 *
 * Symboles exposés :
 *   Hooks  : useSharedValue, useAnimatedStyle, useAnimatedProps,
 *            useDerivedValue, useAnimatedRef, useAnimatedScrollHandler
 *   Drivers : withTiming, withSpring, withDecay, withSequence,
 *             withDelay, withRepeat, cancelAnimation
 *   Thread  : runOnJS, runOnUI
 *   Impératif : scrollTo, measure
 *   Utilitaires : interpolate, Easing, Extrapolation, ReduceMotion
 *   Entrées  : FadeIn, FadeOut, SlideInRight, SlideOutLeft, SlideInLeft,
 *              ZoomIn, ZoomOut
 *   HOC     : createAnimatedComponent (fusionne animatedProps pour le rendu)
 */

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

// Composants animés prêts à l'emploi (Animated.View / Animated.Text / ...).
// On strippe les props d'animation de layout (entering/exiting/layout) qui ne
// concernent que le runtime natif, pour rendre un composant RN simple en test.
const RN = require('react-native');

function makeAnimatedComponent(Component) {
  const Wrapped = function (props) {
    const { entering, exiting, layout, animatedProps, ...rest } = props;
    return React.createElement(Component, Object.assign({}, rest, animatedProps));
  };
  Wrapped.displayName = `Animated(${Component.displayName || Component.name || 'Component'})`;
  return Wrapped;
}

const AnimatedView = makeAnimatedComponent(RN.View);
const AnimatedText = makeAnimatedComponent(RN.Text);
const AnimatedScrollView = makeAnimatedComponent(RN.ScrollView);
const AnimatedImage = makeAnimatedComponent(RN.Image);

module.exports = {
  __esModule: true,
  default: {
    createAnimatedComponent,
    View: AnimatedView,
    Text: AnimatedText,
    ScrollView: AnimatedScrollView,
    Image: AnimatedImage,
  },
  createAnimatedComponent,
  View: AnimatedView,
  Text: AnimatedText,
  ScrollView: AnimatedScrollView,
  Image: AnimatedImage,
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

'use strict';

/**
 * Mock manuel pour react-native-svg.
 *
 * Raison : react-native-svg dépend de modules natifs (Skia/RN) incompatibles
 * avec le renderer Jest. Ce mock remplace les composants SVG par des stubs
 * React Native compatibles (View) pour les tests unitaires.
 */

const React = require('react');
const { View } = require('react-native');

const stub = (props) => React.createElement(View, props);

module.exports = {
  __esModule: true,
  default: stub,
  Svg: stub,
  Circle: stub,
  G: stub,
  Path: stub,
  Rect: stub,
  Line: stub,
  Text: stub,
  Defs: stub,
  ClipPath: stub,
};

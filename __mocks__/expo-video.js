// Mock de expo-video pour les tests Jest
const React = require('react');
const { View } = require('react-native');

module.exports = {
  useVideoPlayer: jest.fn(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    loop: false,
  })),
  VideoView: View,
  isPictureInPictureSupported: jest.fn(() => false),
};

import React from 'react';
import {Composition} from 'remotion';
import {PosShowcase} from './Showcase';
import {FPS, TOTAL_FRAMES} from './storyboard';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import '@fontsource/dm-sans/latin-700.css';
import '@fontsource/fraunces/latin-600.css';
import './style.css';

export const VideoRoot = () => (
  <Composition
    id="PosShowcase"
    component={PosShowcase}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={1920}
    height={1080}
  />
);

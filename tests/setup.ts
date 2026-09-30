import { afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
// jsdom has no AnimationEvent; React otherwise selects a vendor-prefixed listener.
Object.defineProperty(window, 'AnimationEvent', { value: Event, configurable: true });
Object.defineProperty(window, 'TransitionEvent', { value: Event, configurable: true });
const stylesheet = document.createElement('style');
stylesheet.textContent = readFileSync('src/styles.css', 'utf8');
document.head.append(stylesheet);
const { cleanup } = await import('@testing-library/react');
afterEach(() => { cleanup(); window.history.replaceState(null, '', '/'); });

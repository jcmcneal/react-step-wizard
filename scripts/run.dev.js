#!/usr/bin/env node

const { spawn } = require('child_process');

// Start Component Webpack
spawn('yarn', ['dev'], { shell: true, stdio: 'inherit' });

// Start Dev App
spawn('yarn', ['app:dev'], { shell: true, stdio: 'inherit' });

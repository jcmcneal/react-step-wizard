#!/usr/bin/env node

import { spawn } from 'child_process';

// Start Component Webpack
spawn('npm', ['run', 'dev'], { shell: true, stdio: 'inherit' });

// Start Dev App
spawn('npm', ['run', 'app:dev'], { shell: true, stdio: 'inherit' });

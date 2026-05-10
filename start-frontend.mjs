import { spawn } from 'child_process';

const next = spawn('npx', ['next', 'dev', '-p', '3000'], {
  cwd: '/home/ev3lynx/dev/project-s3',
  stdio: 'inherit',
  shell: true
});

process.on('SIGTERM', () => next.kill());
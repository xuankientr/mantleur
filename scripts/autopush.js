const chokidar = require('chokidar');
const simpleGit = require('simple-git');
const path = require('path');

const git = simpleGit();

async function pushChanges(reason) {
  try {
    await git.add('.');
    const status = await git.status();
    if (status.staged.length === 0) return;
    const msg = `chore(auto): ${reason} at ${new Date().toISOString()}`;
    await git.commit(msg);
    await git.push('origin', 'main');
    console.log(`[autopush] Pushed: ${msg}`);
  } catch (err) {
    console.error('[autopush] Error:', err.message);
  }
}

console.log('[autopush] Watching for changes...');

const watcher = chokidar.watch('.', {
  ignored: [
    /(^|[/\\])\../, // dotfiles
    'node_modules',
    '.git',
    'backend/node_modules',
    'frontend/node_modules',
    'backend/prisma/dev.db',
  ],
  ignoreInitial: true,
  persistent: true,
});

let timer = null;
const debounce = (fn, delay = 1500) => {
  clearTimeout(timer);
  timer = setTimeout(fn, delay);
};

watcher.on('all', (event, filePath) => {
  const rel = path.relative(process.cwd(), filePath);
  console.log(`[autopush] ${event}: ${rel}`);
  debounce(() => pushChanges(`${event} ${rel}`));
});

process.on('SIGINT', () => {
  console.log('\n[autopush] Stopped');
  process.exit(0);
});



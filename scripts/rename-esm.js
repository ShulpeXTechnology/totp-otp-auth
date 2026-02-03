const fs = require('fs');
const path = require('path');

const esmDir = path.join(__dirname, '..', 'dist', 'esm');

function renameFiles(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      renameFiles(filePath);
    } else if (file.endsWith('.js')) {
      const newPath = filePath.replace(/\.js$/, '.mjs');
      fs.renameSync(filePath, newPath);
      console.log(`Renamed: ${file} -> ${file.replace('.js', '.mjs')}`);
    }
  });
}

if (fs.existsSync(esmDir)) {
  renameFiles(esmDir);

  const indexMjs = path.join(esmDir, 'index.mjs');
  const distIndex = path.join(__dirname, '..', 'dist', 'index.mjs');

  if (fs.existsSync(indexMjs)) {
    fs.copyFileSync(indexMjs, distIndex);
    console.log('Copied index.mjs to dist root');
  }
}

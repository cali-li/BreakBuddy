const fs = require('fs');

const path = require('path');

 

console.log('🔍 Analyzing node_modules for unused dependencies...\n');

 

// Your actual dependencies

const usedDependencies = {

  'electron': true,           // Core Electron framework

  'electron-store': true,     // Used in main.js for settings

  'play-sound': false,        // NOT used - you're using Web Audio API instead

  'esbuild': true,           // Used for build process

  'electron-builder': true    // Used for distribution

};

 

// Check what's actually installed

const nodeModulesPath = path.join(__dirname, 'node_modules');

const installedModules = fs.readdirSync(nodeModulesPath).filter(name => {

  return !name.startsWith('.') && fs.statSync(path.join(nodeModulesPath, name)).isDirectory();

});

 

console.log('📦 Currently installed modules:');

installedModules.forEach(module => {

  const isUsed = usedDependencies[module] !== undefined;

  const status = isUsed ? '✅ Used' : '❌ Unused';

  console.log(`  ${module}: ${status}`);

});

 

console.log('\n🗑️  Modules that can be safely removed:');

const unusedModules = installedModules.filter(module => !usedDependencies[module]);

unusedModules.forEach(module => {

  console.log(`  - ${module}`);

});

 

console.log('\n💡 Recommendations:');

console.log('1. Remove play-sound from package.json (you use Web Audio API)');

console.log('2. Move esbuild and electron-builder to devDependencies (already done)');

console.log('3. Consider using npm prune to remove unused dependencies');

 

console.log('\n📊 Size analysis:');

const getFolderSize = (folderPath) => {

  let size = 0;

  const files = fs.readdirSync(folderPath);

  files.forEach(file => {

    const filePath = path.join(folderPath, file);

    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {

      size += getFolderSize(filePath);

    } else {

      size += stat.size;

    }

  });

  return size;

};

 

unusedModules.forEach(module => {

  const modulePath = path.join(nodeModulesPath, module);

  const size = getFolderSize(modulePath);

  const sizeMB = (size / 1024 / 1024).toFixed(2);

  console.log(`  ${module}: ${sizeMB} MB`);

});

 

console.log('\n🚀 To clean up, run: npm prune');
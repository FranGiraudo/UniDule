const fs = require('fs');
const path = require('path');

const viewsDir = 'src/views';
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
  const content = fs.readFileSync(path.join(viewsDir, file), 'utf8');
  const lines = content.split('\n');
  const missing = [];
  
  lines.forEach(line => {
    const match = line.match(/^window\.(\w+)\s*=\s*(\w+);/);
    if (match) {
      const funcName = match[2];
      // Search for "function funcName" or "const funcName =" or "let funcName ="
      const regex = new RegExp(`(function\\s+${funcName}\\s*\\(|const\\s+${funcName}\\s*=|let\\s+${funcName}\\s*=)`);
      if (!regex.test(content)) {
        missing.push(funcName);
      }
    }
  });
  
  if (missing.length > 0) {
    console.log(`${file}: missing ${missing.join(', ')}`);
  }
});

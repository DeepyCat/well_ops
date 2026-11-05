const fs = require('fs');
const path = require('path');
 
const root = path.join(__dirname, 'md');
fs.mkdirSync(root, { recursive: true });   
const out = [];
 
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (/\.md$/i.test(e.name)) out.push(path.relative(root, full).split(path.sep).join('/'));
  }
})(root);
 
out.sort((a, b) => a.localeCompare(b, 'cs', { numeric: true }));
fs.writeFileSync(path.join(root, 'index.json'), JSON.stringify(out, null, 2));
console.log(`md/index.json: ${out.length} souborů`);
 

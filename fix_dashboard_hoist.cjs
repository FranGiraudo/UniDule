const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const blocksMatch = content.match(/const getBlocksForDay = \([\s\S]*?return blocks\.sort\(\(a, b\) => t2m\(a\.sc\.startTime\) - t2m\(b\.sc\.startTime\)\);\n  \};/);
if (blocksMatch) {
  content = content.replace(blocksMatch[0], '');
  content = content.replace(
    /const getNextClass = \(\) => {/,
    blocksMatch[0] + '\n\n  const getNextClass = () => {'
  );
  fs.writeFileSync('src/pages/Dashboard.tsx', content);
} else {
  console.log("No match found for getBlocksForDay");
}

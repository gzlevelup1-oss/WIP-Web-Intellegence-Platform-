const fs = require('fs');

const path = 'apps/browser-lab/src/components/FileViewer.tsx';
let content = fs.readFileSync(path, 'utf8');

const startIndex = content.indexOf("{mode === 'diff' && (");
const lastDivIndex = content.indexOf(")}", startIndex); 
// Wait, )} is tricky because there are many )} in the react code.
// Let's use a simpler approach. I will just split by the exact string of the block.

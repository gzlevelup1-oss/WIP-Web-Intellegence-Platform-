const fs = require('fs');
function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/\\"opacity\\":\\s\*\[0-9.eE\+-\]\+/g, '\\"opacity\\":\\s*[^,\\n}]+');
    content = content.replace(/graphJson = graphJson\.replace\(\/\\"opacity\\":\\s\*\[\^"\]\+\\"\/g, \`"opacity": "0"\`\);/, '');
    
    // Instead of doing multiple, let's just make one regex that handles everything for opacity:
    let matchStr = "graphJson = graphJson.replace(/\\\"opacity\\\":\\s*\\\"?[^\\\"\\n,}]+\\\"?/g, `\\\"opacity\\\": \\\"0\\\"`);";
    
    // remove existing ones
    content = content.replace(/graphJson = graphJson\.replace\(\/\\"opacity[^;]+/g, '');
    
    // add it after x|y|width
    content = content.replace(/(graphJson = graphJson\.replace\(.*?viewportHeight\).*?;)/g, `$1\n            ${matchStr}`);
    
    fs.writeFileSync(filePath, content, 'utf8');
}
fixFile('packages/e2e-tests/tests/real-world.test.ts');
fixFile('packages/e2e-tests/tests/real-world.test.js');

const fs = require('fs');

const path = 'apps/browser-lab/src/components/FileViewer.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace standard variables
content = content.replace(
  "const { currentUrl, isLoading, screenshotUrl, logs, graph } = useLab();",
  "const { currentUrl, isLoading, screenshotBase64, logs, graph, validationResult, validateSnapshot } = useLab();"
);

// Replace screenshotUrl with screenshotBase64 if present, else default
content = content.replace(/screenshotUrl/g, "screenshotBase64");

// Fix image tag src
content = content.replace(/<img src=\{screenshotBase64\}/g, "<img src={`data:image/png;base64,${screenshotBase64}`}");

fs.writeFileSync(path, content);

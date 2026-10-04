/**
 * Detect programming language from file extension
 */
function detectLanguage(fileName = "") {
  const ext = fileName.split(".").pop().toLowerCase();
  const map = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    html: "html",
    css: "css",
    scss: "css",
    json: "json",
    md: "markdown",
    py: "python",
    java: "java",
    c: "c",
    cpp: "cpp",
    h: "c",
    hpp: "cpp",
    sql: "sql",
    sh: "shell",
    bash: "shell",
    xml: "xml",
    yaml: "yaml",
    yml: "yaml",
    txt: "text",
  };
  return map[ext] || "text";
}

/**
 * Basic line-by-line diff computation
 */
function computeLineDiff(oldContent = "", newContent = "") {
  const oldLines = oldContent ? oldContent.split("\n") : [];
  const newLines = newContent ? newContent.split("\n") : [];

  let additions = 0;
  let deletions = 0;
  const lines = [];

  const oldSet = new Set(oldLines);
  const newSet = new Set(newLines);

  // Simple line diff visualization
  oldLines.forEach((l) => {
    if (!newSet.has(l)) {
      deletions++;
      lines.push({ type: "deletion", line: `- ${l}` });
    }
  });

  newLines.forEach((l) => {
    if (!oldSet.has(l)) {
      additions++;
      lines.push({ type: "addition", line: `+ ${l}` });
    } else {
      lines.push({ type: "context", line: `  ${l}` });
    }
  });

  return { additions, deletions, lines };
}

module.exports = {
  detectLanguage,
  computeLineDiff,
};

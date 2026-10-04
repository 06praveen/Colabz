/**
 * Normalize file/folder relative paths
 * - Removes leading / trailing slashes
 * - Resolves double slashes
 * - Trims whitespace
 */
function normalizePath(filePath = "") {
  if (!filePath) return "";
  return filePath
    .trim()
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/")
    .replace(/^\//, "")
    .replace(/\/$/, "");
}

/**
 * Get parent path of a normalized path
 */
function getParentPath(normalizedPath = "") {
  if (!normalizedPath || !normalizedPath.includes("/")) return "";
  const parts = normalizedPath.split("/");
  parts.pop();
  return parts.join("/");
}

/**
 * Get base name of a path
 */
function getBaseName(normalizedPath = "") {
  if (!normalizedPath) return "";
  const parts = normalizedPath.split("/");
  return parts[parts.length - 1];
}

module.exports = {
  normalizePath,
  getParentPath,
  getBaseName,
};

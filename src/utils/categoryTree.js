export function buildCategoryTree(categories = []) {
  if (!Array.isArray(categories)) return [];

  const map   = {};
  const roots = [];
  const seen  = new Set();

  categories.forEach((cat) => {
    if (!cat?._id || seen.has(cat._id)) return;
    seen.add(cat._id);
    map[cat._id] = { ...cat, children: [] };
  });

  categories.forEach((cat) => {
    if (!cat?._id || !map[cat._id]) return;
    const parentId = cat.parent?._id || cat.parent;
    if (parentId && map[parentId] && parentId !== cat._id) {
      map[parentId].children.push(map[cat._id]);
    } else {
      roots.push(map[cat._id]);
    }
  });

  return roots;
}

export function flattenTree(tree) {
  if (!Array.isArray(tree)) return [];
  const result = [];
  function walk(nodes) {
    nodes.forEach((n) => {
      result.push(n);
      if (Array.isArray(n.children)) walk(n.children);
    });
  }
  walk(tree);
  return result;
}
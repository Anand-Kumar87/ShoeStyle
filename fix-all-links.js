const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern 1: <Link href="..."><a ...>content</a></Link>
  const pattern1 = /<Link\s+href=["']([^"']+)["']>\s*<a([^>]*)>([\s\S]*?)<\/a>\s*<\/Link>/g;
  if (pattern1.test(content)) {
    content = content.replace(pattern1, (match, href, aAttrs, innerContent) => {
      const className = aAttrs.match(/className=["']([^"']+)["']/);
      const classStr = className ? ` className="${className[1]}"` : '';
      return `<Link href="${href}"${classStr}>${innerContent}</Link>`;
    });
    modified = true;
  }

  // Pattern 2: <Link href="...">...<a>content</a>...</Link>
  content = content.replace(/<Link([^>]+)>([\s\S]*?)<\/Link>/g, (match, linkAttrs, linkContent) => {
    if (linkContent.includes('<a')) {
      // Remove <a> tags but keep content
      const cleaned = linkContent.replace(/<a[^>]*>/g, '').replace(/<\/a>/g, '');
      modified = true;
      return `<Link${linkAttrs}>${cleaned}</Link>`;
    }
    return match;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  }
  return false;
}

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.next')) {
      walkDir(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

console.log('🔍 Searching for problematic Link components...\n');

const files = walkDir('./src');
let fixedCount = 0;

files.forEach(file => {
  if (fixFile(file)) {
    fixedCount++;
  }
});

console.log(`\n✨ Done! Fixed ${fixedCount} files.`);
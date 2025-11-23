const fs = require('fs');
const path = require('path');

function fixLinksInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Pattern: <Link href="..."><a>content</a></Link>
  // Replace with: <Link href="...">content</Link>
  
  const pattern = /<Link\s+href=["']([^"']+)["']>\s*<a[^>]*>([\s\S]*?)<\/a>\s*<\/Link>/g;
  
  if (pattern.test(content)) {
    content = content.replace(pattern, (match, href, innerContent) => {
      return `<Link href="${href}">${innerContent}</Link>`;
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules')) {
      walkDir(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      fixLinksInFile(filePath);
    }
  });
}

walkDir('./src');
console.log('Done!');
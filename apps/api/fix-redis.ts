import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
// Read existing file
let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

// Update or Append REDIS_URL
if (content.includes('REDIS_URL=')) {
    content = content.replace(/REDIS_URL=.*/g, 'REDIS_URL="redis://localhost:6380"');
} else {
    content += '\nREDIS_URL="redis://localhost:6380"';
}

fs.writeFileSync(envPath, content);
console.log('Updated REDIS_URL in .env');

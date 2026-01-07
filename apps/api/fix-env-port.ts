import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

if (!content.includes('PORT=')) {
    fs.appendFileSync(envPath, '\nPORT=3000');
    console.log('Added PORT=3000 to .env');
} else {
    console.log('PORT already defined in .env');
}

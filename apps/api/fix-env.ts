import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const newConfig = `
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=serleb2000@gmail.com
SMTP_PASS="mxpz ttiw fvyc bopu"
NOTIFY_FROM_EMAIL="Finly App" <serleb2000@gmail.com>
`;

fs.appendFileSync(envPath, newConfig);
console.log('Appended config to .env');

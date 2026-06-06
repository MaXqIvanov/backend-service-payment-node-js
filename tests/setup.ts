import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

console.log('[jest-setup]: Test environment variables successfully preloaded.');

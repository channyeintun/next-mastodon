import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MESSAGES_DIR = path.join(__dirname, '../src/messages');
const SOURCE_LOCALE = 'en.json';

async function syncLocales() {
    const sourcePath = path.join(MESSAGES_DIR, SOURCE_LOCALE);
    const sourceContent = JSON.parse(await fs.readFile(sourcePath, 'utf8'));

    const files = await fs.readdir(MESSAGES_DIR);
    const localeFiles = files.filter(f => f.endsWith('.json') && f !== SOURCE_LOCALE);

    for (const file of localeFiles) {
        const filePath = path.join(MESSAGES_DIR, file);
        const content = JSON.parse(await fs.readFile(filePath, 'utf8'));

        const synced = syncObject(sourceContent, content);

        // Sort keys for consistency
        const sorted = sortObject(synced);

        await fs.writeFile(filePath, JSON.stringify(sorted, null, 2) + '\n');
        console.log(`✓ Synchronized ${file}`);
    }
}

function syncObject(source, target) {
    const result = {};

    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = syncObject(source[key], target[key] || {});
        } else if (target[key] !== undefined) {
            // Keep existing translation
            result[key] = target[key];
        } else {
            // Add missing key with source value
            result[key] = source[key];
        }
    }

    return result;
}

function sortObject(obj) {
    return Object.keys(obj)
        .sort()
        .reduce((acc, key) => {
            const value = obj[key];
            acc[key] = (value && typeof value === 'object' && !Array.isArray(value))
                ? sortObject(value)
                : value;
            return acc;
        }, {});
}

syncLocales().catch(console.error);

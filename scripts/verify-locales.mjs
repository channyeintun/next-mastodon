#!/usr/bin/env node
/**
 * Script to verify that all locale JSON files are synchronized with en.json
 * 
 * Usage: node scripts/verify-locales.mjs
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const messagesDir = join(rootDir, 'src/messages');
const sourceOfTruth = 'en.json';

function getKeys(obj, prefix = '') {
    let keys = [];
    for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            keys = keys.concat(getKeys(obj[key], fullKey));
        } else {
            keys.push(fullKey);
        }
    }
    return keys;
}

function verify() {
    console.log('Verifying locale synchronization...\n');

    const enPath = join(messagesDir, sourceOfTruth);
    let enContent;
    try {
        enContent = JSON.parse(readFileSync(enPath, 'utf-8'));
    } catch (error) {
        console.error(`Error reading ${sourceOfTruth}: ${error.message}`);
        process.exit(1);
    }

    const enKeys = getKeys(enContent).sort();
    const files = readdirSync(messagesDir).filter(f => f.endsWith('.json') && f !== sourceOfTruth);

    let hasErrors = false;

    for (const file of files) {
        const filePath = join(messagesDir, file);
        let content;
        try {
            content = JSON.parse(readFileSync(filePath, 'utf-8'));
        } catch (error) {
            console.error(`Error reading ${file}: ${error.message}`);
            hasErrors = true;
            continue;
        }

        const keys = getKeys(content).sort();

        const missingKeys = enKeys.filter(k => !keys.includes(k));
        const extraKeys = keys.filter(k => !enKeys.includes(k));

        if (missingKeys.length > 0 || extraKeys.length > 0) {
            hasErrors = true;
            console.log(`✗ ${file}:`);
            if (missingKeys.length > 0) {
                console.log(`  Missing keys (${missingKeys.length}):`);
                missingKeys.forEach(k => console.log(`    - ${k}`));
            }
            if (extraKeys.length > 0) {
                console.log(`  Extra keys (${extraKeys.length}):`);
                extraKeys.forEach(k => console.log(`    + ${k}`));
            }
            console.log('');
        } else {
            console.log(`✓ ${file}: Synchronized`);
        }
    }

    if (hasErrors) {
        console.log('\nVerification failed! Please fix the discrepancies above.');
        process.exit(1);
    } else {
        console.log('\nAll locale files are synchronized!');
        process.exit(0);
    }
}

verify();

#!/usr/bin/env node
/**
 * Script to convert Mastodon YAML locale files to JSON for next-intl
 * 
 * Usage: node scripts/convert-locales.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Locales to convert
const LOCALES = ['en', 'de', 'fr', 'es', 'ja', 'zh-CN', 'ko'];

// Source and destination directories
const sourceDir = join(rootDir, 'mastodon/config/locales');
const destDir = join(rootDir, 'src/messages');

// Simple YAML parser for Mastodon locale files
function parseYaml(content) {
    const result = {};
    const lines = content.split('\n');
    const stack = [{ obj: result, indent: -2 }];

    for (const line of lines) {
        if (!line.trim() || line.trim().startsWith('#') || line.trim() === '---') {
            continue;
        }

        const match = line.match(/^(\s*)(.+)$/);
        if (!match) continue;

        const indent = match[1].length;
        const lineContent = match[2];

        const kvMatch = lineContent.match(/^([^:]+):\s*(.*)$/);
        if (!kvMatch) continue;

        let key = kvMatch[1].trim();
        let value = kvMatch[2].trim();

        if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
            key = key.slice(1, -1);
        }

        while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
            stack.pop();
        }

        const parent = stack[stack.length - 1].obj;

        if (value === '' || value === null) {
            parent[key] = {};
            stack.push({ obj: parent[key], indent });
        } else {
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            value = value.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\'/g, "'");
            parent[key] = value;
        }
    }

    return result;
}

function extractLocaleContent(parsed, locale) {
    const localeKey = Object.keys(parsed).find(k => k === locale || k === locale.replace('-', '_'));
    if (localeKey && typeof parsed[localeKey] === 'object') {
        return parsed[localeKey];
    }
    return parsed;
}

function flattenObject(obj, prefix = '') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            Object.assign(result, flattenObject(value, newKey));
        } else {
            result[newKey] = value;
        }
    }
    return result;
}

function convertPlaceholders(messages) {
    const converted = {};
    for (const [key, value] of Object.entries(messages)) {
        if (typeof value === 'string') {
            converted[key] = value.replace(/%\{([^}]+)\}/g, '{$1}');
        } else {
            converted[key] = value;
        }
    }
    return converted;
}

mkdirSync(destDir, { recursive: true });

console.log('Converting locale files...\n');

for (const locale of LOCALES) {
    const sourceFile = join(sourceDir, `${locale}.yml`);
    const destFile = join(destDir, `${locale}.json`);

    try {
        const content = readFileSync(sourceFile, 'utf-8');
        const parsed = parseYaml(content);
        const localeContent = extractLocaleContent(parsed, locale);
        const flattened = flattenObject(localeContent);
        const converted = convertPlaceholders(flattened);

        writeFileSync(destFile, JSON.stringify(converted, null, 2));
        console.log(`✓ Converted ${locale}.yml -> ${locale}.json (${Object.keys(converted).length} keys)`);
    } catch (error) {
        console.error(`✗ Failed to convert ${locale}: ${error.message}`);
    }
}

console.log('\nDone!');

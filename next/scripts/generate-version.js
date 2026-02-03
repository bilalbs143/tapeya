#!/usr/bin/env node

// Cross-platform version generator
import fs from 'fs';
import path from 'path';

// Generate version based on timestamp
const version = Date.now().toString();

// Path to .env.local
const envPath = path.join(process.cwd(), '.env.local');

// Read existing content or create empty string
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

// Update or add the NEXT_PUBLIC_APP_VERSION key
const versionKey = 'NEXT_PUBLIC_APP_VERSION';
const versionLine = `${versionKey}=${version}`;

// Split into lines
const lines = envContent.split('\n');

// Find if the key already exists
let keyFound = false;
const updatedLines = lines.map((line) => {
  if (line.startsWith(`${versionKey}=`)) {
    keyFound = true;
    return versionLine;
  }
  return line;
});

// If key wasn't found, add it
if (!keyFound) {
  updatedLines.push(versionLine);
}

// Join back and ensure single trailing newline
const newContent = updatedLines.join('\n').replace(/\n+$/, '\n');

// Write back to file
fs.writeFileSync(envPath, newContent);

console.log(`Generated version: ${version}`);
console.log(`Updated ${versionKey} in: ${envPath}`);

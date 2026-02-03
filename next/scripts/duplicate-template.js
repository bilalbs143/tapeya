#!/usr/bin/env node

/**
 * Template Duplication Script
 * Duplicates a source template to create a new template with all files, configurations, and references updated
 *
 * Usage: npm run duplicate-template <sourceTemplate> <targetTemplate>
 * Example: npm run duplicate-template template8 template9
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('❌ Error: Missing required arguments');
  console.log(
    '\nUsage: npm run duplicate-template <sourceTemplate> <targetTemplate>',
  );
  console.log('Example: npm run duplicate-template template8 template9');
  process.exit(1);
}

const sourceTemplate = args[0].toLowerCase();
const targetTemplate = args[1].toLowerCase();

// Validate template names
if (!sourceTemplate.match(/^template\d+$/)) {
  console.error(
    `❌ Error: Invalid source template name "${sourceTemplate}". Must be in format "template{NUMBER}"`,
  );
  process.exit(1);
}

if (!targetTemplate.match(/^template\d+$/)) {
  console.error(
    `❌ Error: Invalid target template name "${targetTemplate}". Must be in format "template{NUMBER}"`,
  );
  process.exit(1);
}

if (sourceTemplate === targetTemplate) {
  console.error('❌ Error: Source and target templates cannot be the same');
  process.exit(1);
}

// Extract template numbers
const sourceNumber = sourceTemplate.replace('template', '');
const targetNumber = targetTemplate.replace('template', '');

// Generate constant names (TEMPLATE1, TEMPLATE2, etc.)
const sourceConstant = `TEMPLATE${sourceNumber.toUpperCase()}`;
const targetConstant = `TEMPLATE${targetNumber.toUpperCase()}`;

// Generate component names (Template1Layout, Template2Layout, etc.)
const sourceComponentName = `Template${sourceNumber}Layout`;
const targetComponentName = `Template${targetNumber}Layout`;

// Generate import prefixes (T1_, T2_, etc.)
const sourcePrefix = `T${sourceNumber}_`;
const targetPrefix = `T${targetNumber}_`;

console.log(`\n🚀 Duplicating template: ${sourceTemplate} → ${targetTemplate}`);
console.log(`   Source constant: ${sourceConstant}`);
console.log(`   Target constant: ${targetConstant}`);
console.log(`   Component: ${sourceComponentName} → ${targetComponentName}`);
console.log(`   Import prefix: ${sourcePrefix} → ${targetPrefix}\n`);

// Helper function to check if file/directory exists
function exists(filePath) {
  try {
    return (
      fs.statSync(filePath).isFile() || fs.statSync(filePath).isDirectory()
    );
  } catch {
    return false;
  }
}

// Helper function to read file
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`❌ Error reading file ${filePath}:`, error.message);
    return null;
  }
}

// Helper function to write file
function writeFile(filePath, content) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error(`❌ Error writing file ${filePath}:`, error.message);
    return false;
  }
}

// Helper function to copy directory recursively
function copyDirectory(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`❌ Source directory does not exist: ${src}`);
    return false;
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }

  return true;
}

// Replace content in file
function replaceInFile(filePath, replacements) {
  let content = readFile(filePath);
  if (!content) return false;

  for (const [search, replace] of replacements) {
    // Use global replace for all occurrences
    const regex = new RegExp(escapeRegex(search), 'g');
    content = content.replace(regex, replace);
  }

  return writeFile(filePath, content);
}

// Escape special regex characters
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Get all page components from a template directory
function getPageComponents(templatePath) {
  const pages = [];
  const pageDirs = [
    'home',
    'slots',
    'live-casino',
    'about',
    'contact-us',
    'cookie-policy',
    'disclaimer',
    'faq',
    'privacy-policy',
    'responsible-gambling',
    'terms-of-use',
    'announcements',
    'slot-providers',
  ];

  for (const dir of pageDirs) {
    const fullPath = path.join(templatePath, dir);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
      const files = fs.readdirSync(fullPath);
      const pageFile = files.find(
        (f) => f.endsWith('Page.jsx') || f.endsWith('Page.js'),
      );
      if (pageFile) {
        pages.push({ dir, file: pageFile });
      }
    }
  }

  return pages;
}

// Page import name mapping
const pageImportMap = {
  home: 'Home',
  slots: 'Slots',
  'live-casino': 'LiveCasino',
  about: 'About',
  'contact-us': 'Contact',
  'cookie-policy': 'CookiePolicy',
  disclaimer: 'Disclaimer',
  faq: 'Faq',
  'privacy-policy': 'PrivacyPolicy',
  'responsible-gambling': 'ResponsibleGambling',
  'terms-of-use': 'TermsOfUse',
  announcements: 'Announcements',
  'slot-providers': 'SlotProviders',
};

const dashboardImportMap = {
  BettingManagementPage: 'BettingManagement',
  CouponsPage: 'Coupons',
  CustomerInquiryPage: 'DashboardCustomerInquiry',
  DepositPage: 'Deposit',
  ExchangePage: 'Exchange',
  FaqsPage: 'Faqs',
  NotePage: 'Note',
  PointsPage: 'Points',
  ProfilePage: 'Profile',
  ReferralsPage: 'Referrals',
  WithdrawalPage: 'Withdrawal',
};

// Step 1: Copy dynamic components directory
console.log('📁 Step 1: Copying dynamic components...');
const sourceComponentsPath = path.join(
  projectRoot,
  'src',
  'dynamic-components',
  sourceTemplate,
);
const targetComponentsPath = path.join(
  projectRoot,
  'src',
  'dynamic-components',
  targetTemplate,
);

if (!exists(sourceComponentsPath)) {
  console.error(
    `❌ Source template directory does not exist: ${sourceComponentsPath}`,
  );
  process.exit(1);
}

if (exists(targetComponentsPath)) {
  console.error(
    `❌ Target template directory already exists: ${targetComponentsPath}`,
  );
  console.log('   Please remove it first or choose a different target name');
  process.exit(1);
}

if (!copyDirectory(sourceComponentsPath, targetComponentsPath)) {
  console.error('❌ Failed to copy dynamic components');
  process.exit(1);
}
console.log(
  `✓ Copied dynamic components from ${sourceTemplate} to ${targetTemplate}`,
);

// Step 2: Update references in copied files
console.log('\n🔄 Step 2: Updating references in copied files...');
const replacements = [
  // Template name references
  [sourceTemplate, targetTemplate],
  [sourceTemplate.toUpperCase(), targetTemplate.toUpperCase()],
  [sourceConstant, targetConstant],
  [sourceComponentName, targetComponentName],
  [sourcePrefix, targetPrefix],

  // Import path replacements
  [
    `@/dynamic-components/${sourceTemplate}`,
    `@/dynamic-components/${targetTemplate}`,
  ],
  [
    `'@/dynamic-components/${sourceTemplate}`,
    `'@/dynamic-components/${targetTemplate}`,
  ],
  [
    `"@/dynamic-components/${sourceTemplate}`,
    `"@/dynamic-components/${targetTemplate}`,
  ],
  [
    `from '@/dynamic-components/${sourceTemplate}`,
    `from '@/dynamic-components/${targetTemplate}`,
  ],
  [
    `from "@/dynamic-components/${sourceTemplate}`,
    `from "@/dynamic-components/${targetTemplate}`,
  ],

  // Relative path replacements
  [`../${sourceTemplate}`, `../${targetTemplate}`],
  [`../../${sourceTemplate}`, `../../${targetTemplate}`],
  [`../../../${sourceTemplate}`, `../../../${targetTemplate}`],

  // CSS class names
  [`${sourceTemplate}-`, `${targetTemplate}-`],
  [`className="${sourceTemplate}`, `className="${targetTemplate}`],
  [`className='${sourceTemplate}`, `className='${targetTemplate}`],
];

// Update all JS/JSX files in the copied directory
function updateFilesInDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      updateFilesInDirectory(fullPath);
    } else if (
      entry.isFile() &&
      (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))
    ) {
      replaceInFile(fullPath, replacements);
    }
  }
}

updateFilesInDirectory(targetComponentsPath);
console.log('✓ Updated all references in copied files');

// Step 3: Update templateConstants.js
console.log('\n📝 Step 3: Updating templateConstants.js...');
const constantsPath = path.join(
  projectRoot,
  'src',
  'lib',
  'templateConstants.js',
);
let constantsContent = readFile(constantsPath);

if (!constantsContent) {
  console.error('❌ Failed to read templateConstants.js');
  process.exit(1);
}

// Add TEMPLATE constant if not exists
if (!constantsContent.includes(`${targetConstant}: '${targetTemplate}'`)) {
  // Find the last TEMPLATE entry and add after it
  const templateNamesRegex = /(TEMPLATE\d+: 'template\d+',)/g;
  const matches = [...constantsContent.matchAll(templateNamesRegex)];
  if (matches.length > 0) {
    const lastMatch = matches[matches.length - 1];
    const insertPoint = lastMatch.index + lastMatch[0].length;
    const newEntry = `\n  ${targetConstant}: '${targetTemplate}',`;
    constantsContent =
      constantsContent.slice(0, insertPoint) +
      newEntry +
      constantsContent.slice(insertPoint);
  }
}

// Add template config - find the source template config and duplicate it
// Match the full config including the outer closing brace and comma
// Pattern: [TEMPLATE_NAMES.TEMPLATE8]: { ... content ... },
const sourceConfigRegex = new RegExp(
  `(\\[TEMPLATE_NAMES\\.${sourceConstant}\\]:\\s*\\{[\\s\\S]*?\\n  \\},)`,
  'm',
);
const sourceConfigMatch = constantsContent.match(sourceConfigRegex);

if (sourceConfigMatch && sourceConfigMatch[1]) {
  let sourceConfig = sourceConfigMatch[1];
  // Replace all references in the config
  sourceConfig = sourceConfig
    .replace(new RegExp(sourceConstant, 'g'), targetConstant)
    .replace(new RegExp(sourceTemplate, 'g'), targetTemplate)
    .replace(
      new RegExp(`/manifests/${sourceTemplate}\\.json`, 'g'),
      `/manifests/${targetTemplate}.json`,
    );

  // Build the new config entry (already includes the closing },)
  const newConfig = sourceConfig;

  // Insert before the closing brace of TEMPLATE_CONFIGS
  // Find the last template config entry
  const configsEndMatch = constantsContent.match(
    /export const TEMPLATE_CONFIGS = \{([\s\S]*)\};/,
  );
  if (configsEndMatch) {
    const configsContent = configsEndMatch[1];
    // Match all template configs including their closing braces
    const allConfigsMatch = configsContent.match(
      /(\[TEMPLATE_NAMES\.TEMPLATE\d+\]:\s*\{[\s\S]*?\n  \},)/g,
    );
    if (allConfigsMatch && allConfigsMatch.length > 0) {
      const lastConfig = allConfigsMatch[allConfigsMatch.length - 1];
      const insertPoint =
        constantsContent.lastIndexOf(lastConfig) + lastConfig.length;
      // Insert with proper newline and indentation
      constantsContent =
        constantsContent.slice(0, insertPoint) +
        '\n  ' +
        newConfig +
        constantsContent.slice(insertPoint);
    }
  }
}

writeFile(constantsPath, constantsContent);
console.log('✓ Updated templateConstants.js');

// Step 4: Update templateConfig.js
console.log('\n📝 Step 4: Updating templateConfig.js...');
const configPath = path.join(projectRoot, 'src', 'lib', 'templateConfig.js');
let configContent = readFile(configPath);

if (!configContent) {
  console.error('❌ Failed to read templateConfig.js');
  process.exit(1);
}

// Add imports
const newImports = `import Template${targetNumber}FloatingButtons from '@/dynamic-components/${targetTemplate}/components/FloatingButtons/FloatingButtons';
import Template${targetNumber}Footer from '@/dynamic-components/${targetTemplate}/components/Footer/Footer';
import Template${targetNumber}GlobalPageLoader from '@/dynamic-components/${targetTemplate}/components/GlobalPageLoader/GlobalPageLoader';
import * as Template${targetNumber}Modals from '@/dynamic-components/${targetTemplate}/modals';
`;

// Find the last Template import and add after it
const lastImportMatch = configContent.match(
  /import \* as Template\d+Modals from[^;]+;/g,
);
if (lastImportMatch) {
  const lastImport = lastImportMatch[lastImportMatch.length - 1];
  const insertPoint = configContent.lastIndexOf(lastImport) + lastImport.length;
  configContent =
    configContent.slice(0, insertPoint) +
    '\n' +
    newImports +
    configContent.slice(insertPoint);
}

// Add to TEMPLATE_MAP
const templateMapRegex = new RegExp(
  `\\[TEMPLATE_NAMES\\.${sourceConstant}\\]:\\s*\\{([\\s\\S]*?)\\},`,
  'm',
);
const sourceTemplateMapMatch = configContent.match(templateMapRegex);

if (sourceTemplateMapMatch && sourceTemplateMapMatch[1]) {
  let sourceMapContent = sourceTemplateMapMatch[1];
  sourceMapContent = sourceMapContent
    .replace(
      new RegExp(`Template${sourceNumber}`, 'g'),
      `Template${targetNumber}`,
    )
    .replace(new RegExp(sourceTemplate, 'g'), targetTemplate);

  const newMapEntry = `[TEMPLATE_NAMES.${targetConstant}]: {${sourceMapContent}},`;

  // Insert before the closing brace of TEMPLATE_MAP
  const mapEndMatch = configContent.match(
    /const TEMPLATE_MAP = \{([\s\S]*)\};/,
  );
  if (mapEndMatch) {
    const mapContent = mapEndMatch[1];
    const lastMapMatch = mapContent.match(
      /(\[TEMPLATE_NAMES\.TEMPLATE\d+\]: \{[\s\S]*?\},)/g,
    );
    if (lastMapMatch) {
      const lastMap = lastMapMatch[lastMapMatch.length - 1];
      const insertPoint = configContent.lastIndexOf(lastMap) + lastMap.length;
      configContent =
        configContent.slice(0, insertPoint) +
        '\n  ' +
        newMapEntry +
        configContent.slice(insertPoint);
    }
  }
}

writeFile(configPath, configContent);
console.log('✓ Updated templateConfig.js');

// Step 5: Update staticTemplatePageResolver.js
console.log('\n📝 Step 5: Updating staticTemplatePageResolver.js...');
const resolverPath = path.join(
  projectRoot,
  'src',
  'lib',
  'staticTemplatePageResolver.js',
);
let resolverContent = readFile(resolverPath);

if (!resolverContent) {
  console.error('❌ Failed to read staticTemplatePageResolver.js');
  process.exit(1);
}

// Get page components from source template
const pageComponents = getPageComponents(sourceComponentsPath);

// Generate imports
let newImportsText = `\n// Template ${targetNumber} imports\n`;

// Regular page imports
for (const { dir, file } of pageComponents) {
  const importName =
    pageImportMap[dir] ||
    dir
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('');
  const pageName = file.replace('.jsx', '').replace('.js', '');
  newImportsText += `import ${targetPrefix}${importName} from '@/dynamic-components/${targetTemplate}/${dir}/${pageName}';\n`;
}

// Dashboard imports
const dashboardPath = path.join(sourceComponentsPath, 'dashboard');
if (fs.existsSync(dashboardPath)) {
  const dashboardFiles = fs.readdirSync(dashboardPath);
  dashboardFiles.forEach((file) => {
    if (file.endsWith('Page.jsx') || file.endsWith('Page.js')) {
      // Get the base filename without extension for map lookup
      const baseFileName = file.replace('.jsx', '').replace('.js', '');
      const importName =
        dashboardImportMap[baseFileName] || baseFileName.replace('Page', '');
      const pageName = baseFileName;
      newImportsText += `import ${targetPrefix}${importName} from '@/dynamic-components/${targetTemplate}/dashboard/${pageName}';\n`;
    }
  });
}

// Find the last template import section and add after it
const lastTemplateImportMatch = resolverContent.match(
  /\/\/ Template \d+ imports\n/g,
);
if (lastTemplateImportMatch) {
  const lastMatch = lastTemplateImportMatch[lastTemplateImportMatch.length - 1];
  const lastIndex = resolverContent.lastIndexOf(lastMatch);
  // Find the end of this import section
  const nextSection = resolverContent.indexOf('\nconst ', lastIndex);
  const insertPoint =
    nextSection > 0
      ? nextSection
      : resolverContent.indexOf('\nconst ACTIVE_TEMPLATE', lastIndex);
  if (insertPoint > 0) {
    resolverContent =
      resolverContent.slice(0, insertPoint) +
      newImportsText +
      resolverContent.slice(insertPoint);
  }
}

// Add PAGE_COMPONENTS_MAP
const sourceMapName = `PAGE_COMPONENTS_MAP_T${sourceNumber}`;
const targetMapName = `PAGE_COMPONENTS_MAP_T${targetNumber}`;

// Find source map and duplicate it
const sourcePageMapRegex = new RegExp(
  `const ${sourceMapName} = \\{([\\s\\S]*?)\\};`,
  'm',
);
const sourcePageMapMatch = resolverContent.match(sourcePageMapRegex);

if (sourcePageMapMatch && sourcePageMapMatch[1]) {
  let sourceMapContent = sourcePageMapMatch[1];
  // Replace all references
  sourceMapContent = sourceMapContent.replace(
    new RegExp(sourcePrefix, 'g'),
    targetPrefix,
  );

  const newPageMap = `const ${targetMapName} = {${sourceMapContent}};`;

  // Insert before TEMPLATE_PAGES_REGISTRY
  const registryIndex = resolverContent.indexOf(
    'const TEMPLATE_PAGES_REGISTRY',
  );
  if (registryIndex > 0) {
    resolverContent =
      resolverContent.slice(0, registryIndex) +
      newPageMap +
      '\n\n' +
      resolverContent.slice(registryIndex);
  }
}

// Add to TEMPLATE_PAGES_REGISTRY
const registryRegex = /(template\d+): PAGE_COMPONENTS_MAP_T\d+,/g;
const registryMatches = [...resolverContent.matchAll(registryRegex)];
if (registryMatches.length > 0) {
  const lastMatch = registryMatches[registryMatches.length - 1];
  const insertPoint = lastMatch.index + lastMatch[0].length;
  const newEntry = `\n  ${targetTemplate}: ${targetMapName},`;
  resolverContent =
    resolverContent.slice(0, insertPoint) +
    newEntry +
    resolverContent.slice(insertPoint);
}

writeFile(resolverPath, resolverContent);
console.log('✓ Updated staticTemplatePageResolver.js');

// Step 6: Update app/layout.js
console.log('\n📝 Step 6: Updating app/layout.js...');
const layoutPath = path.join(projectRoot, 'src', 'app', 'layout.js');
let layoutContent = readFile(layoutPath);

if (!layoutContent) {
  console.error('❌ Failed to read app/layout.js');
  process.exit(1);
}

// Check if entry already exists
if (layoutContent.includes(`[TEMPLATE_NAMES.${targetConstant}]:`)) {
  console.log(
    `✓ Template ${targetTemplate} already exists in app/layout.js, skipping...`,
  );
} else {
  // Add to TEMPLATE_LOADERS with dynamic import pattern
  const newLayoutEntry = `  [TEMPLATE_NAMES.${targetConstant}]: () =>\n    import('@/app/templates/${targetTemplate}/layout'),`;

  // Find the last template entry in TEMPLATE_LOADERS
  // Match pattern: [TEMPLATE_NAMES.TEMPLATE##]: () =>\n    import('...')
  const templateEntriesRegex =
    /(\[TEMPLATE_NAMES\.TEMPLATE\d+\]:\s*\(\)\s*=>\s*\n\s*import\(['"]@\/app\/templates\/template\d+\/layout['"]\),)/g;
  const allMatches = [...layoutContent.matchAll(templateEntriesRegex)];

  if (allMatches.length > 0) {
    // Get the last match
    const lastMatch = allMatches[allMatches.length - 1];
    const insertPoint = lastMatch.index + lastMatch[0].length;
    layoutContent =
      layoutContent.slice(0, insertPoint) +
      '\n' +
      newLayoutEntry +
      layoutContent.slice(insertPoint);
  } else {
    // Fallback: find the closing brace of TEMPLATE_LOADERS and insert before it
    const loadersEndMatch = layoutContent.match(
      /(const TEMPLATE_LOADERS = \{[\s\S]*?)(\};)/,
    );
    if (loadersEndMatch) {
      const insertPoint = loadersEndMatch.index + loadersEndMatch[1].length;
      layoutContent =
        layoutContent.slice(0, insertPoint) +
        newLayoutEntry +
        '\n' +
        layoutContent.slice(insertPoint);
    }
  }

  writeFile(layoutPath, layoutContent);
  console.log('✓ Updated app/layout.js');
}

// Step 7: Create layout files
console.log('\n📝 Step 7: Creating layout files...');
const sourceLayoutPath = path.join(
  projectRoot,
  'src',
  'app',
  'templates',
  sourceTemplate,
);
const targetLayoutPath = path.join(
  projectRoot,
  'src',
  'app',
  'templates',
  targetTemplate,
);

if (!exists(sourceLayoutPath)) {
  console.error(
    `❌ Source layout directory does not exist: ${sourceLayoutPath}`,
  );
  process.exit(1);
}

// Copy layout directory
if (!copyDirectory(sourceLayoutPath, targetLayoutPath)) {
  console.error('❌ Failed to copy layout files');
  process.exit(1);
}

// Update references in layout files
const layoutFiles = ['layout.js', 'ClientLayoutContent.js'];
for (const file of layoutFiles) {
  const filePath = path.join(targetLayoutPath, file);
  if (exists(filePath)) {
    replaceInFile(filePath, replacements);
  }
}

console.log('✓ Created layout files');

// Step 8: Create CSS file
console.log('\n📝 Step 8: Creating CSS file...');
const sourceCssPath = path.join(
  projectRoot,
  'src',
  'app',
  'styles',
  `${sourceTemplate}.css`,
);
const targetCssPath = path.join(
  projectRoot,
  'src',
  'app',
  'styles',
  `${targetTemplate}.css`,
);

if (!exists(sourceCssPath)) {
  console.error(`❌ Source CSS file does not exist: ${sourceCssPath}`);
  process.exit(1);
}

let cssContent = readFile(sourceCssPath);
if (cssContent) {
  // Replace template references in CSS
  cssContent = cssContent
    .replace(new RegExp(sourceTemplate, 'g'), targetTemplate)
    .replace(new RegExp(sourceConstant, 'g'), targetConstant);
  writeFile(targetCssPath, cssContent);
  console.log('✓ Created CSS file');
} else {
  console.error('❌ Failed to read source CSS file');
}

// Step 9: Create manifest file
console.log('\n📝 Step 9: Creating manifest file...');
const sourceManifestPath = path.join(
  projectRoot,
  'public',
  'manifests',
  `${sourceTemplate}.json`,
);
const targetManifestPath = path.join(
  projectRoot,
  'public',
  'manifests',
  `${targetTemplate}.json`,
);

if (!exists(sourceManifestPath)) {
  console.error(
    `❌ Source manifest file does not exist: ${sourceManifestPath}`,
  );
  process.exit(1);
}

if (!fs.existsSync(path.dirname(targetManifestPath))) {
  fs.mkdirSync(path.dirname(targetManifestPath), { recursive: true });
}

fs.copyFileSync(sourceManifestPath, targetManifestPath);
console.log('✓ Created manifest file');

// Step 10: Copy font files
console.log('\n📝 Step 10: Copying font files...');
const sourceFontPath = path.join(
  projectRoot,
  'src',
  'app',
  'fonts',
  sourceTemplate,
);
const targetFontPath = path.join(
  projectRoot,
  'src',
  'app',
  'fonts',
  targetTemplate,
);

if (exists(sourceFontPath)) {
  if (!copyDirectory(sourceFontPath, targetFontPath)) {
    console.warn('⚠️  Warning: Failed to copy font files');
  } else {
    // Update font path references in layout files
    const layoutJsPath = path.join(targetLayoutPath, 'layout.js');
    if (exists(layoutJsPath)) {
      let layoutJsContent = readFile(layoutJsPath);
      if (layoutJsContent) {
        layoutJsContent = layoutJsContent.replace(
          new RegExp(`fonts/${sourceTemplate}`, 'g'),
          `fonts/${targetTemplate}`,
        );
        writeFile(layoutJsPath, layoutJsContent);
      }
    }
    console.log('✓ Copied font files');
  }
} else {
  console.log('ℹ️  No font files to copy');
}

// Step 11: Update next.config.mjs template exclusion loop
console.log('\n📝 Step 11: Updating next.config.mjs...');
const nextConfigPath = path.join(projectRoot, 'next.config.mjs');
let nextConfigContent = readFile(nextConfigPath);

if (!nextConfigContent) {
  console.error('❌ Failed to read next.config.mjs');
  process.exit(1);
}

// Find the template exclusion loop pattern: for (let i = 1; i <= X; i++)
const loopRegex = /for \(let i = 1; i <= (\d+); i\+\+\)/;
const loopMatch = nextConfigContent.match(loopRegex);

if (loopMatch) {
  const currentMax = parseInt(loopMatch[1], 10);
  const targetNumberInt = parseInt(targetNumber, 10);

  if (targetNumberInt > currentMax) {
    // Update the loop to include the new template
    nextConfigContent = nextConfigContent.replace(
      loopRegex,
      `for (let i = 1; i <= ${targetNumberInt}; i++)`,
    );
    writeFile(nextConfigPath, nextConfigContent);
    console.log(
      `✓ Updated template exclusion loop from ${currentMax} to ${targetNumberInt}`,
    );
  } else {
    console.log(
      `✓ Template exclusion loop already includes template ${targetNumberInt} (current max: ${currentMax})`,
    );
  }
} else {
  console.warn(
    '⚠️  Warning: Could not find template exclusion loop in next.config.mjs',
  );
  console.warn('   Please manually update the loop limit if needed');
}

console.log('\n✅ Template duplication completed successfully!');
console.log('\n📋 Summary:');
console.log(`   - Source: ${sourceTemplate}`);
console.log(`   - Target: ${targetTemplate}`);
console.log(`   - Dynamic components: ${targetComponentsPath}`);
console.log(`   - Layout files: ${targetLayoutPath}`);
console.log(`   - CSS file: ${targetCssPath}`);
console.log(`   - Manifest: ${targetManifestPath}`);
console.log(
  `\n🎉 You can now use ${targetTemplate} by setting NEXT_PUBLIC_TEMPLATE=${targetTemplate}`,
);

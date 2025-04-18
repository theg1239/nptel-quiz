const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MESSAGES_DIR = path.join(__dirname, '../messages');
const BASE_LOCALE = 'en';
const LOCALES = fs.readdirSync(MESSAGES_DIR)
  .filter(file => file.endsWith('.json'))
  .map(file => file.replace('.json', ''));

function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return null;
  }
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error.message);
    return false;
  }
}

function findMissingKeys(baseObj, compareObj, prefix = '') {
  let missing = [];
  
  for (const key in baseObj) {
    const currentPath = prefix ? `${prefix}.${key}` : key;
    
    if (typeof baseObj[key] === 'object' && baseObj[key] !== null) {
      if (!compareObj[key] || typeof compareObj[key] !== 'object') {
        missing.push(currentPath);
      } else {
        missing = [...missing, ...findMissingKeys(baseObj[key], compareObj[key], currentPath)];
      }
    } else if (compareObj[key] === undefined) {
      missing.push(currentPath);
    }
  }
  
  return missing;
}

function addMissingKeys(baseObj, targetObj, missingKeys) {
  const result = { ...targetObj };
  
  for (const keyPath of missingKeys) {
    const keys = keyPath.split('.');
    let current = result;
    let baseCurrent = baseObj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
      baseCurrent = baseCurrent[key];
    }
    
    const lastKey = keys[keys.length - 1];
    current[lastKey] = baseCurrent[lastKey];
  }
  
  return result;
}

function generateTranslationReport() {
  const baseLocaleFile = path.join(MESSAGES_DIR, `${BASE_LOCALE}.json`);
  const baseTranslations = readJsonFile(baseLocaleFile);
  
  if (!baseTranslations) {
    console.error(`Could not read base locale file: ${baseLocaleFile}`);
    return;
  }
  
  const countKeysRecursive = (obj) => {
    let count = 0;
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        count += countKeysRecursive(obj[key]);
      } else {
        count += 1;
      }
    }
    return count;
  };
  
  const totalKeys = countKeysRecursive(baseTranslations);
  
  console.log('\n=== Translation Status Report ===');
  console.log(`Base locale: ${BASE_LOCALE}`);
  console.log(`Total translation keys: ${totalKeys}`);
  console.log('');
  console.log('Locale | Translated | Missing | Completion');
  console.log('-------|------------|---------|----------');
  
  LOCALES.forEach(locale => {
    if (locale === BASE_LOCALE) return;
    
    const localeFile = path.join(MESSAGES_DIR, `${locale}.json`);
    const translations = readJsonFile(localeFile);
    
    if (!translations) {
      console.log(`${locale.padEnd(6)} | ERROR: Could not read file`);
      return;
    }
    
    const missingKeys = findMissingKeys(baseTranslations, translations);
    const translatedKeys = totalKeys - missingKeys.length;
    const completionPercentage = ((translatedKeys / totalKeys) * 100).toFixed(1);
    
    console.log(`${locale.padEnd(6)} | ${translatedKeys.toString().padEnd(10)} | ${missingKeys.length.toString().padEnd(7)} | ${completionPercentage}%`);
  });
}

function fixMissingTranslations() {
  const baseLocaleFile = path.join(MESSAGES_DIR, `${BASE_LOCALE}.json`);
  const baseTranslations = readJsonFile(baseLocaleFile);
  
  if (!baseTranslations) {
    console.error(`Could not read base locale file: ${baseLocaleFile}`);
    return;
  }
  
  LOCALES.forEach(locale => {
    if (locale === BASE_LOCALE) return;
    
    const localeFile = path.join(MESSAGES_DIR, `${locale}.json`);
    const translations = readJsonFile(localeFile);
    
    if (!translations) {
      console.error(`Could not read locale file: ${localeFile}`);
      return;
    }
    
    const missingKeys = findMissingKeys(baseTranslations, translations);
    
    if (missingKeys.length > 0) {
      console.log(`Found ${missingKeys.length} missing keys in ${locale}`);
      
      const updatedTranslations = addMissingKeys(baseTranslations, translations, missingKeys);
      
      if (writeJsonFile(localeFile, updatedTranslations)) {
        console.log(`✓ Updated ${locale} with missing keys`);
      }
    } else {
      console.log(`✓ No missing keys found in ${locale}`);
    }
  });
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  
  switch (command) {
    case 'report':
      generateTranslationReport();
      break;
      
    case 'fix':
      fixMissingTranslations();
      break;
      
    case 'help':
    default:
      console.log(`
Translation Manager - Helps manage your translation files

Usage:
  node translationManager.js <command>

Commands:
  report    Generate a report of translation status for all locales
  fix       Add missing translation keys to all locale files
  help      Show this help message
`);
      break;
  }
}

main();
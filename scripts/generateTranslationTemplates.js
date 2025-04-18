const fs = require('fs');
const path = require('path');

const locales = [
  'de', 'pt', 'it', 'ru', 'ja', 'ko', 'zh', 'ar',
  
  'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur', 'or', 'as', 'sd'
];

const enJson = require('../messages/en.json');

const messagesDir = path.join(__dirname, '../messages');

locales.forEach(locale => {
  const filePath = path.join(messagesDir, `${locale}.json`);
  
  if (fs.existsSync(filePath)) {
    console.log(`File already exists: ${filePath}`);
    return;
  }
  
  fs.writeFileSync(filePath, JSON.stringify(enJson, null, 2));
  console.log(`Created template: ${filePath}`);
});

console.log('Translation templates generation complete.');
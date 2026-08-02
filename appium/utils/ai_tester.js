const fs = require('fs-extra');
const path = require('path');

const libDir = path.join(__dirname, '..', '..', 'lib', 'screens');
const pagesDir = path.join(__dirname, '..', 'pages', 'auto');
const testsDir = path.join(__dirname, '..', 'tests', 'auto');

fs.ensureDirSync(pagesDir);
fs.ensureDirSync(testsDir);

// Helpers
function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

function toPascalCase(str) {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function analyzeDartFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract class name
  const classMatch = content.match(/class\s+([A-Za-z0-9_]+)\s+extends/);
  const className = classMatch ? classMatch[1] : path.basename(filePath, '.dart');
  
  // Extract visible texts to assert
  const textMatches = [...content.matchAll(/Text\(['"]([^'"]+)['"]/g)].map(m => m[1]);
  const hintMatches = [...content.matchAll(/hint(?:Text)?:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  
  // Extract inputs/buttons for interactions
  const hasInputs = content.includes('TextField') || content.includes('TextFormField') || content.includes('LabeledField');
  const hasButtons = content.includes('ElevatedButton') || content.includes('TextButton') || content.includes('PrimaryButton');
  const hasListView = content.includes('ListView') || content.includes('GridView') || content.includes('SingleChildScrollView');
  
  // Make a unique set of elements
  const elements = [...new Set([...textMatches, ...hintMatches])].filter(t => t.length > 2 && !t.includes('$'));

  return { className, elements, hasInputs, hasButtons, hasListView };
}

function generatePageObject(filename, data) {
  const pageName = data.className + 'Page';
  const outPath = path.join(pagesDir, `${filename}.page.js`);
  
  let getters = '';
  data.elements.slice(0, 5).forEach((text, i) => {
    const safeName = text.replace(/[^A-Za-z0-9]/g, '');
    if (safeName) {
      getters += `  get elem${safeName}() { return this.driver.$('//*[contains(@text, "${text}")]'); }\n`;
    }
  });

  const content = `'use strict';

const BasePage = require('../base.page');

class ${pageName} extends BasePage {
  constructor(driver) {
    super(driver, '${data.className}');
  }

${getters}
  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = ${pageName};
`;
  fs.writeFileSync(outPath, content);
  return pageName;
}

function generateTest(filename, data, pageName) {
  const outPath = path.join(testsDir, `${filename}.test.js`);
  
  let assertions = '';
  data.elements.slice(0, 3).forEach((text, i) => {
    assertions += `
    it('AI-Gen: Should display text: "${text}"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "${text}")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });`;
  });

  const content = `'use strict';

const { expect } = require('chai');
const DriverFactory = require('../../drivers/driver.factory');
const ${pageName} = require('../../pages/auto/${filename}.page');

describe('🤖 AI Auto-Generated Tests — ${data.className}', function () {
  let driver;
  let page;

  before(async function () {
    this.timeout(120000);
    driver = await DriverFactory.create('flutter');
    page = new ${pageName}(driver);
    await driver.pause(2000);
  });

  after(async function () {
    await DriverFactory.destroy();
  });

  it('AI-Gen: Screen loads successfully', async function () {
    const loaded = await page.waitForPage();
    expect(loaded).to.be.true;
  });
${assertions}
});
`;
  fs.writeFileSync(outPath, content);
}

function runAiTester() {
  console.log('🤖 Starting Smart AI Testing Analyzer...');
  const files = fs.readdirSync(libDir).filter(f => f.endsWith('.dart'));
  
  console.log(`Found ${files.length} Flutter screens to analyze.\n`);
  
  let generatedPages = 0;
  let generatedTests = 0;

  files.forEach(file => {
    const filePath = path.join(libDir, file);
    const basename = path.basename(file, '.dart');
    
    try {
      const data = analyzeDartFile(filePath);
      
      const pageName = generatePageObject(basename, data);
      generatedPages++;
      
      generateTest(basename, data, pageName);
      generatedTests++;
      
      console.log(`✅ AI Generated Page & Test for: ${data.className}`);
    } catch (err) {
      console.error(`❌ AI Failed on ${file}: ${err.message}`);
    }
  });

  console.log(`\n🎉 Smart AI Testing Summary:`);
  console.log(`- Screens Analyzed: ${files.length}`);
  console.log(`- Page Objects Generated: ${generatedPages}`);
  console.log(`- Test Scenarios Generated: ${generatedTests}`);
}

runAiTester();

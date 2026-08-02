const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const ExcelJS = require('exceljs');

async function generateTestCaseSheet() {
    console.log('🔍 Scanning for test cases...');
    
    // Find all test files
    const testFiles = glob.sync('tests/**/*.test.js');
    console.log(`Found ${testFiles.length} test files.`);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'QA Automation Framework';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Test Cases Matrix');

    // Define columns
    sheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Test Suite (Feature)', key: 'suite', width: 30 },
        { header: 'Test Case Description', key: 'case', width: 60 },
        { header: 'File Path', key: 'file', width: 35 },
        { header: 'Automated', key: 'auto', width: 12 }
    ];

    // Style headers
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0070C0' } };
    sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    let caseCounter = 1;

    for (const file of testFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Simple regex to extract describe and it blocks
        let currentSuite = 'General';
        
        const lines = content.split('\n');
        for (const line of lines) {
            const describeMatch = line.match(/describe\(['"](.*?)['"]/);
            if (describeMatch) {
                currentSuite = describeMatch[1];
            }

            const itMatch = line.match(/it\(['"](.*?)['"]/);
            if (itMatch) {
                sheet.addRow({
                    id: `TC-${String(caseCounter).padStart(3, '0')}`,
                    suite: currentSuite,
                    case: itMatch[1],
                    file: path.basename(file),
                    auto: 'Yes'
                });
                caseCounter++;
            }
        }
    }

    // Add alternating row colors and borders
    sheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
            row.alignment = { vertical: 'middle', wrapText: true };
            if (rowNumber % 2 === 0) {
                row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
            }
        }
        row.eachCell((cell) => {
            cell.border = {
                top: {style:'thin'},
                left: {style:'thin'},
                bottom: {style:'thin'},
                right: {style:'thin'}
            };
        });
    });

    const outPath = path.join(__dirname, 'Test_Case_Matrix.xlsx');
    await workbook.xlsx.writeFile(outPath);
    console.log(`\n✅ Generated Excel Test Case Matrix at:\n${outPath}`);
}

generateTestCaseSheet().catch(err => {
    console.error('Failed to generate sheet:', err);
});

const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

async function compileReport() {
    console.log("Compiling Master Report...");
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ResearchAI Automation';

    const suites = ['selenium', 'appium', 'api', 'validation', 'performance', 'deployment'];
    
    let totalExec = 0;
    let totalPass = 0;
    let totalFail = 0;
    let totalSkip = 0;

    const summaryData = {};
    const detailedData = {};

    for (const suite of suites) {
        const reportPath = path.join(__dirname, `../${suite}/mochawesome-report/mochawesome.json`);
        let suitePass = 0, suiteFail = 0, suiteSkip = 0;
        let testList = [];

        if (fs.existsSync(reportPath)) {
            const data = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
            if (data.results && data.results[0] && data.results[0].suites[0]) {
                const tests = data.results[0].suites[0].tests;
                tests.forEach(t => {
                    const status = t.pass ? 'PASS' : (t.fail ? 'FAIL' : 'BLOCKED');
                    if (t.pass) suitePass++;
                    if (t.fail) suiteFail++;
                    if (t.pending || !t.pass && !t.fail) suiteSkip++;
                    
                    testList.push({
                        title: t.title,
                        status: status,
                        duration: t.duration || 0,
                        error: t.err ? t.err.message : ''
                    });
                });
            }
        } else {
            console.warn(`Warning: Report not found for ${suite}`);
        }

        summaryData[suite] = { pass: suitePass, fail: suiteFail, skip: suiteSkip };
        detailedData[suite] = testList;

        totalPass += suitePass;
        totalFail += suiteFail;
        totalSkip += suiteSkip;
        totalExec += (suitePass + suiteFail + suiteSkip);
    }

    const sheet1 = workbook.addWorksheet('Executive Summary');
    sheet1.columns = [{width: 25}, {width: 25}];
    sheet1.addRow(['Execution Date', new Date().toISOString()]);
    sheet1.addRow(['Project Name', 'Research AI']);
    sheet1.addRow(['Web Tests', summaryData['selenium'].pass + summaryData['selenium'].fail + summaryData['selenium'].skip]);
    sheet1.addRow(['Android Tests', summaryData['appium'].pass + summaryData['appium'].fail + summaryData['appium'].skip]);
    sheet1.addRow(['API Tests', summaryData['api'].pass + summaryData['api'].fail + summaryData['api'].skip]);
    sheet1.addRow(['Validation Tests', summaryData['validation'].pass + summaryData['validation'].fail + summaryData['validation'].skip]);
    sheet1.addRow(['Performance Tests', summaryData['performance'].pass + summaryData['performance'].fail + summaryData['performance'].skip]);
    sheet1.addRow(['Deployment Tests', summaryData['deployment'].pass + summaryData['deployment'].fail + summaryData['deployment'].skip]);
    sheet1.addRow(['Total Tests', totalExec]);
    sheet1.addRow(['Passed', totalPass]);
    sheet1.addRow(['Failed', totalFail]);
    sheet1.addRow(['Skipped/Blocked', totalSkip]);
    
    const passPct = totalExec > 0 ? ((totalPass / totalExec) * 100).toFixed(2) : 0;
    sheet1.addRow(['Pass Percentage', passPct + '%']);

    const sheetNames = {
        'selenium': 'Selenium Web Tests',
        'appium': 'Appium Android Tests',
        'api': 'API Unit Tests',
        'validation': 'Validation Tests',
        'performance': 'Performance Tests',
        'deployment': 'Deployment Status'
    };

    for (const suite of suites) {
        const sName = sheetNames[suite];
        const sheet = workbook.addWorksheet(sName);
        sheet.columns = [
            { header: 'Test ID', key: 'id', width: 15 },
            { header: 'Scenario', key: 'scenario', width: 50 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Duration (ms)', key: 'duration', width: 15 },
            { header: 'Error', key: 'error', width: 50 }
        ];

        detailedData[suite].forEach(t => {
            const parts = t.title.split(': ');
            sheet.addRow({
                id: parts[0] || 'N/A',
                scenario: parts[1] || t.title,
                status: t.status,
                duration: t.duration,
                error: t.error
            });
        });
    }

    await workbook.xlsx.writeFile(path.join(__dirname, '../Research_AI_E2E_Master_Test_Report.xlsx'));
    
    const html = `
    <html>
    <head>
        <title>Research AI Master Report</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;}
            .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
            th { background-color: #007bff; color: white; }
            .pass { color: green; font-weight: bold; }
            .fail { color: red; font-weight: bold; }
            .blocked { color: orange; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="card">
            <h2>Executive Summary</h2>
            <p><strong>Total Executed:</strong> ${totalExec}</p>
            <p><strong>Passed:</strong> <span class="pass">${totalPass}</span></p>
            <p><strong>Failed:</strong> <span class="fail">${totalFail}</span></p>
            <p><strong>Blocked/Skipped:</strong> <span class="blocked">${totalSkip}</span></p>
            <p><strong>Pass Percentage:</strong> ${passPct}%</p>
        </div>
    </body>
    </html>
    `;
    fs.mkdirSync(path.join(__dirname, '../reports'), { recursive: true });
    fs.writeFileSync(path.join(__dirname, '../reports/index.html'), html);
    console.log("Master report generated at testing/Research_AI_E2E_Master_Test_Report.xlsx");
}

compileReport().catch(console.error);

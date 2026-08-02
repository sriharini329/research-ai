import json
import os
import xlsxwriter
import datetime

# File Paths
ANDROID_REPORT_PATH = "appium/mochawesome-report/mochawesome-android.json"
WEB_REPORT_PATH = "selenium/mochawesome-report/mochawesome-web.json"
OUTPUT_EXCEL = "Flutter_E2E_Report.xlsx"

def parse_mochawesome(file_path, module_name):
    tests = []
    total_passed = 0
    total_failed = 0
    
    if not os.path.exists(file_path):
        print(f"Warning: JSON report not found at {file_path}")
        return total_passed, total_failed, tests

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        suites = data.get('results', [])
        for suite in suites:
            for s in suite.get('suites', []):
                for test in s.get('tests', []):
                    # E.g. TC_WEB_001 - [UI_UX] Responsive design constraint Iteration 1
                    title = test.get('title', 'Unknown Test')
                    tc_id = "UNKNOWN"
                    feature = "General"
                    desc = title
                    
                    if " - " in title:
                        parts = title.split(" - ", 1)
                        tc_id = parts[0].strip()
                        desc = parts[1].strip()
                        if desc.startswith("[") and "]" in desc:
                            feature_part = desc.split("]", 1)
                            feature = feature_part[0].replace("[", "").strip()
                            desc = feature_part[1].strip()

                    status = "Fail"
                    if test.get('pass'):
                        status = "Pass"
                        total_passed += 1
                    elif test.get('fail'):
                        total_failed += 1
                    else:
                        status = "Skip"

                    err = test.get('err', {})
                    err_details = err.get('message', '') if err else ''
                    
                    tests.append({
                        'Test Case ID': tc_id,
                        'Module': module_name,
                        'Feature': feature,
                        'Test Description': desc,
                        'Test Type': 'E2E',
                        'Expected Result': 'Test should execute and complete successfully.',
                        'Actual Result': 'Completed successfully without any assertions failing.' if status == "Pass" else 'Test assertions failed.',
                        'Status': status,
                        'Execution Time': f"{test.get('duration', 0)} ms",
                        'Error Details': err_details,
                        'Screenshot Path': '',
                        'Execution Date': datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%fZ")
                    })
    except Exception as e:
        print(f"Error parsing {file_path}: {e}")

    return total_passed, total_failed, tests

def generate_report():
    print("Generating Single-Sheet Enterprise Excel Report...")
    
    # Parse Results
    and_p, and_f, and_tests = parse_mochawesome(ANDROID_REPORT_PATH, "Appium (Android)")
    web_p, web_f, web_tests = parse_mochawesome(WEB_REPORT_PATH, "Selenium (Web)")
    
    all_tests = and_tests + web_tests
    total_passed = and_p + web_p
    total_failed = and_f + web_f
    total_tests = total_passed + total_failed
    pass_rate = f"{(total_passed / total_tests * 100):.1f}%" if total_tests > 0 else "0.0%"
    
    # Create Excel file
    workbook = xlsxwriter.Workbook(OUTPUT_EXCEL)
    worksheet = workbook.add_worksheet("E2E Test Report")
    
    # Define formats
    title_format = workbook.add_format({'bold': True, 'font_size': 16, 'align': 'center', 'valign': 'vcenter'})
    header_format = workbook.add_format({'bold': True, 'bg_color': '#D3D3D3', 'border': 1})
    bold_format = workbook.add_format({'bold': True})
    
    pass_format = workbook.add_format({'font_color': 'green', 'border': 1})
    fail_format = workbook.add_format({'font_color': 'red', 'bold': True, 'border': 1})
    normal_format = workbook.add_format({'border': 1})
    
    # Adjust column widths
    worksheet.set_column('A:A', 15)
    worksheet.set_column('B:C', 18)
    worksheet.set_column('D:D', 50)
    worksheet.set_column('E:H', 15)
    worksheet.set_column('I:I', 15)
    worksheet.set_column('J:K', 30)
    worksheet.set_column('L:L', 25)
    
    # Top Header
    worksheet.merge_range('A1:L1', 'End-to-End Test Automation Execution Report', title_format)
    
    # Summary Section
    worksheet.write('A3', 'Execution Summary', bold_format)
    worksheet.write('A4', 'Total Tests', bold_format)
    worksheet.write('B4', total_tests)
    worksheet.write('D4', 'Failed', bold_format)
    worksheet.write('E4', total_failed)
    
    worksheet.write('A5', 'Passed', bold_format)
    worksheet.write('B5', total_passed)
    worksheet.write('D5', 'Pass Rate', bold_format)
    worksheet.write('E5', pass_rate)
    
    # Table Headers
    headers = [
        'Test Case ID', 'Module', 'Feature', 'Test Description', 'Test Type', 
        'Expected Result', 'Actual Result', 'Status', 'Execution Time', 
        'Error Details', 'Screenshot Path', 'Execution Date'
    ]
    
    row = 6
    for col, h in enumerate(headers):
        worksheet.write(row, col, h, header_format)
        
    row += 1
    # Write Test Data
    for test in all_tests:
        worksheet.write(row, 0, test['Test Case ID'], normal_format)
        worksheet.write(row, 1, test['Module'], normal_format)
        worksheet.write(row, 2, test['Feature'], normal_format)
        worksheet.write(row, 3, test['Test Description'], normal_format)
        worksheet.write(row, 4, test['Test Type'], normal_format)
        worksheet.write(row, 5, test['Expected Result'], normal_format)
        worksheet.write(row, 6, test['Actual Result'], normal_format)
        
        status_fmt = pass_format if test['Status'] == 'Pass' else fail_format if test['Status'] == 'Fail' else normal_format
        worksheet.write(row, 7, test['Status'], status_fmt)
        worksheet.write(row, 8, test['Execution Time'], normal_format)
        worksheet.write(row, 9, test['Error Details'], normal_format)
        worksheet.write(row, 10, test['Screenshot Path'], normal_format)
        worksheet.write(row, 11, test['Execution Date'], normal_format)
        
        row += 1
        
    workbook.close()
    print(f"Report successfully saved to {OUTPUT_EXCEL}")

if __name__ == "__main__":
    generate_report()

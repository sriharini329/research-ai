import os
import json
import zipfile
from datetime import datetime
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

ANDROID_REPORT_PATH = "appium/mochawesome-report/mochawesome-android.json"
WEB_REPORT_PATH = "selenium/mochawesome-report/mochawesome-web.json"
OUTPUT_DIR = "E2E-Automation-Reports"
ZIP_NAME = "E2E-Automation-Reports.zip"

def parse_mochawesome(file_path, module_prefix, type_label):
    tests = []
    total_passed = 0
    total_failed = 0
    total_skipped = 0
    total_duration = 0
    
    if not os.path.exists(file_path):
        return total_passed, total_failed, total_skipped, total_duration, tests

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        suites = data.get('results', [])
        idx = 1
        for suite in suites:
            for s in suite.get('suites', []):
                for test in s.get('tests', []):
                    title = test.get('title', 'Unknown Test')
                    status = "Fail"
                    if test.get('pass'):
                        status = "Pass"
                        total_passed += 1
                    elif test.get('fail'):
                        status = "Fail"
                        total_failed += 1
                    else:
                        status = "Skip"
                        total_skipped += 1

                    duration = test.get('duration', 0)
                    total_duration += duration

                    # Parse enterprise piped title format
                    tc_id = f"TC-{module_prefix}-{idx:02d}"
                    feature = "General"
                    desc = title
                    module_name = type_label
                    test_type = type_label
                    platform = "Web" if module_prefix == "WEB" else "Android"
                    
                    if " | " in title:
                        parts = [p.strip() for p in title.split(" | ")]
                        tc_id = parts[0]
                        for p in parts[1:]:
                            if p.startswith("Module:"):
                                module_name = p.replace("Module:", "").strip()
                            elif p.startswith("Feature:"):
                                feature = p.replace("Feature:", "").strip()
                            elif p.startswith("Type:"):
                                test_type = p.replace("Type:", "").strip()
                            elif p.startswith("Platform:"):
                                platform = p.replace("Platform:", "").strip()
                            else:
                                desc = p
                    else:
                        # Fallback for old format
                        if " - " in title:
                            parts = title.split(" - ", 1)
                            if parts[0].startswith("TC_"):
                                tc_id = parts[0]
                                desc = parts[1]
                                
                        if desc.startswith("[") and "]" in desc:
                            f_end = desc.find("]")
                            feature = desc[1:f_end].strip()
                            desc = desc[f_end+1:].strip()

                    err = test.get('err', {})
                    err_details = err.get('message', '') if err else ''
                    screenshot_path = ""
                    if status == "Fail":
                        safe_name = title.replace(' ', '_').replace('/', '_')
                        screenshot_path = f"{'selenium' if module_prefix == 'WEB' else 'appium'}/screenshots/fail_{safe_name}.png"
                    
                    tests.append({
                        'ID': tc_id,
                        'Platform': platform,
                        'Module': module_name,
                        'Feature': feature,
                        'Description': desc,
                        'Type': test_type,
                        'Expected': 'Test should execute and complete successfully.',
                        'Actual': 'Completed successfully without any assertions failing.' if status == 'Pass' else err_details,
                        'Status': status,
                        'Duration': f"{duration} ms",
                        'Error': err_details,
                        'Screenshot': screenshot_path,
                        'Date': datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')
                    })
                    idx += 1
    except Exception as e:
        print(f"Error parsing {file_path}: {e}")

    return total_passed, total_failed, total_skipped, total_duration, tests

def generate_excel(tests, total_tests, total_web, total_android, passed, failed, skipped, pass_rate, duration, output_path):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "E2E Test Report"
    
    # Styles
    title_font = Font(name="Arial", size=16, color="FFFFFFFF", bold=True)
    title_fill = PatternFill(start_color="FF2E7D32", end_color="FF2E7D32", fill_type="solid")
    center_align = Alignment(horizontal="center", vertical="center")
    
    header_font = Font(name="Arial", size=10, color="FFFFFFFF", bold=True)
    header_fill = PatternFill(start_color="FF1B5E20", end_color="FF1B5E20", fill_type="solid")
    
    border = Border(
        left=Side(style='thin', color='FFCCCCCC'),
        right=Side(style='thin', color='FFCCCCCC'),
        top=Side(style='thin', color='FFCCCCCC'),
        bottom=Side(style='thin', color='FFCCCCCC')
    )
    
    # Header A1
    ws.merge_cells('A1:M1')
    ws['A1'] = 'End-to-End Test Automation Execution Report'
    ws['A1'].font = title_font
    ws['A1'].fill = title_fill
    ws['A1'].alignment = center_align
    
    # Summary Table
    ws['A3'] = 'Execution Summary'
    ws['A3'].font = Font(bold=True)
    
    ws['A4'] = 'Total Executed Tests'
    ws['B4'] = total_tests
    ws['D4'] = 'Browser'
    ws['E4'] = 'Chrome Headless'
    
    ws['A5'] = 'Total Web Tests'
    ws['B5'] = total_web
    ws['D5'] = 'Device'
    ws['E5'] = 'Pixel 6 Emulator'
    
    ws['A6'] = 'Total Android Tests'
    ws['B6'] = total_android
    ws['D6'] = 'Android Version'
    ws['E6'] = '13.0 (API 33)'
    
    ws['A7'] = 'Passed'
    ws['B7'] = passed
    ws['D7'] = 'Duration'
    ws['E7'] = duration
    
    ws['A8'] = 'Failed'
    ws['B8'] = failed
    
    ws['A9'] = 'Skipped'
    ws['B9'] = skipped
    
    ws['A10'] = 'Pass Percentage'
    ws['B10'] = pass_rate
    
    # Column Headers at Row 12
    headers = [
        'Test Case ID', 'Platform', 'Module', 'Feature', 'Test Description', 'Test Type', 
        'Expected Result', 'Actual Result', 'Status', 'Execution Time', 
        'Error Details', 'Screenshot Path', 'Execution Date'
    ]
    
    for col_idx, header in enumerate(headers, 1):
        cell = ws.cell(row=12, column=col_idx)
        cell.value = header
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = border
        
    # Column Widths
    col_widths = {
        'A': 16.0, 'B': 12.0, 'C': 14.0, 'D': 29.0, 'E': 40.0, 'F': 14.0, 'G': 40.0, 
        'H': 13.0, 'I': 12.0, 'J': 18.0, 'K': 17.0, 'L': 19.0, 'M': 28.0
    }
    for col, width in col_widths.items():
        ws.column_dimensions[col].width = width
        
    # Data Rows
    row_idx = 13
    for test in tests:
        row_data = [
            test['ID'], test['Platform'], test['Module'], test['Feature'], test['Description'], test['Type'],
            test['Expected'], test['Actual'], test['Status'], test['Duration'],
            test['Error'], test['Screenshot'], test['Date']
        ]
        for col_idx, val in enumerate(row_data, 1):
            cell = ws.cell(row=row_idx, column=col_idx)
            cell.value = val
            cell.border = border
            if col_idx == 9: # Status color
                if val == 'Pass':
                    cell.font = Font(color="FF10B981")
                elif val == 'Fail':
                    cell.font = Font(color="FFEF4444")
                else:
                    cell.font = Font(color="FFF59E0B")
        row_idx += 1
        
    wb.save(output_path)

def generate_html(tests, output_path):
    # Minimal HTML report
    html_content = f"""
    <html>
    <head><title>E2E Summary</title></head>
    <body>
        <h1>E2E Summary</h1>
        <p>Total Tests: {len(tests)}</p>
    </body>
    </html>
    """
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)

def main():
    print("Generating E2E Reports...")
    
    os.makedirs(f"{OUTPUT_DIR}/reports", exist_ok=True)
    
    passed1, failed1, skipped1, duration1, tests1 = parse_mochawesome(WEB_REPORT_PATH, 'WEB', 'Selenium')
    passed2, failed2, skipped2, duration2, tests2 = parse_mochawesome(ANDROID_REPORT_PATH, 'APP', 'Appium')
    
    all_tests = tests1 + tests2
    total_web = len(tests1)
    total_android = len(tests2)
    total_tests = len(all_tests)
    
    total_passed = passed1 + passed2
    total_failed = failed1 + failed2
    total_skipped = skipped1 + skipped2
    total_duration_ms = duration1 + duration2
    
    # Calculate formatted duration (seconds or minutes)
    duration_s = total_duration_ms // 1000
    formatted_duration = f"{duration_s // 60}m {duration_s % 60}s"
    
    pass_rate = f"{(total_passed / total_tests * 100):.1f}%" if total_tests > 0 else "0.0%"
    
    # Generate unified Excel
    generate_excel(all_tests, total_tests, total_web, total_android, total_passed, total_failed, total_skipped, pass_rate, formatted_duration, f"{OUTPUT_DIR}/reports/E2E_Test_Report.xlsx")
    
    # Generate unified HTML
    generate_html(all_tests, f"{OUTPUT_DIR}/reports/Test_Summary.html")
    
    # Zip artifacts
    with zipfile.ZipFile(ZIP_NAME, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(OUTPUT_DIR):
            for file in files:
                zipf.write(os.path.join(root, file), 
                           os.path.relpath(os.path.join(root, file), os.path.join(OUTPUT_DIR, '..')))
                           
    print(f"Created {ZIP_NAME} with unified Web and Android execution results.")

if __name__ == "__main__":
    main()

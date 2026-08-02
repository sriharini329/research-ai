import os
import json
from datetime import datetime
import pandas as pd

def parse_mochawesome(file_path):
    passed, failed, skipped = 0, 0, 0
    duration = 0
    details = []
    
    if os.path.exists(file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                stats = data.get('stats', {})
                passed = stats.get('passes', 0)
                failed = stats.get('failures', 0)
                skipped = stats.get('pending', 0) + stats.get('skipped', 0)
                duration = stats.get('duration', 0)
                
                for res in data.get('results', []):
                    for suite in res.get('suites', []):
                        suite_title = suite.get('title', 'Unknown Module')
                        for test in suite.get('tests', []):
                            state = test.get('state', 'skipped').upper()
                            if state == 'PASSED':
                                status = 'Passed'
                            elif state == 'FAILED':
                                status = 'Failed'
                            else:
                                status = 'Skipped'
                                
                            details.append({
                                'Test Name': test.get('title', ''),
                                'Module': suite_title,
                                'Status': status,
                                'Duration': f"{test.get('duration', 0)}ms",
                                'Error': test.get('err', {}).get('message', '') if status == 'Failed' else ''
                            })
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            
    return passed, failed, skipped, duration, details

def generate_report():
    print("Generating Multi-Tier Enterprise Excel Report...")
    
    # File Paths
    ANDROID_REPORT_PATH = "appium/mochawesome-report/mochawesome-android.json"
    WEB_REPORT_PATH = "selenium/mochawesome-report/mochawesome-web.json"
    OUTPUT_EXCEL = "Flutter_E2E_Report.xlsx"
    
    # Parse Android Results
    and_p, and_f, and_s, and_d, and_tests = parse_mochawesome(ANDROID_REPORT_PATH)
    # Parse Web Results
    web_p, web_f, web_s, web_d, web_tests = parse_mochawesome(WEB_REPORT_PATH)
    
    total_android = and_p + and_f + and_s
    total_web = web_p + web_f + web_s
    total_tests = total_android + total_web
    total_passed = and_p + web_p
    total_failed = and_f + web_f
    total_skipped = and_s + web_s
    total_duration = and_d + web_d
    
    pass_perc = (total_passed / total_tests * 100) if total_tests > 0 else 0
    
    # 1. Summary Sheet
    summary_data = {
        'Metric': [
            'Execution Date',
            'Device Name',
            'Android Version',
            'Browser',
            'Total Android Tests',
            'Total Web Tests',
            'Total Executed Tests',
            'Passed',
            'Failed',
            'Skipped',
            'Pass Percentage',
            'Total Duration'
        ],
        'Value': [
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'Pixel 6 Emulator (Appium)',
            'Android 13.0 (API 33)',
            'Chrome Headless (WebdriverIO)',
            total_android,
            total_web,
            total_tests,
            total_passed,
            total_failed,
            total_skipped,
            f"{pass_perc:.2f}%",
            f"{total_duration / 1000:.2f} seconds"
        ]
    }
    df_summary = pd.DataFrame(summary_data)
    
    # 2. Android Test Cases
    android_rows = []
    for i, t in enumerate(and_tests):
        android_rows.append({
            'Test ID': f"AND-{i+1:04d}",
            'Module': t['Module'],
            'Scenario': t['Test Name'],
            'Status': t['Status'],
            'Device': 'Pixel 6 Emulator',
            'Duration': t['Duration']
        })
    df_android = pd.DataFrame(android_rows)
    if df_android.empty:
        df_android = pd.DataFrame(columns=['Test ID', 'Module', 'Scenario', 'Status', 'Device', 'Duration'])
        
    # 3. Web Test Cases
    web_rows = []
    for i, t in enumerate(web_tests):
        web_rows.append({
            'Test ID': f"WEB-{i+1:04d}",
            'Module': t['Module'],
            'Scenario': t['Test Name'],
            'Browser': 'Chrome Headless',
            'Status': t['Status'],
            'Duration': t['Duration']
        })
    df_web = pd.DataFrame(web_rows)
    if df_web.empty:
        df_web = pd.DataFrame(columns=['Test ID', 'Module', 'Scenario', 'Browser', 'Status', 'Duration'])
        
    # 4. Passed Tests
    passed_rows = []
    for t in and_tests:
        if t['Status'] == 'Passed':
            passed_rows.append({'Test Name': t['Test Name'], 'Platform': 'Android', 'Execution Time': t['Duration']})
    for t in web_tests:
        if t['Status'] == 'Passed':
            passed_rows.append({'Test Name': t['Test Name'], 'Platform': 'Web', 'Execution Time': t['Duration']})
    df_passed = pd.DataFrame(passed_rows)
    if df_passed.empty:
        df_passed = pd.DataFrame(columns=['Test Name', 'Platform', 'Execution Time'])
        
    # 5. Failed Tests
    failed_rows = []
    for t in and_tests:
        if t['Status'] == 'Failed':
            failed_rows.append({'Test Name': t['Test Name'], 'Platform': 'Android', 'Failure Reason': t['Error'], 'Screenshot Path': 'N/A'})
    for t in web_tests:
        if t['Status'] == 'Failed':
            failed_rows.append({'Test Name': t['Test Name'], 'Platform': 'Web', 'Failure Reason': t['Error'], 'Screenshot Path': 'N/A'})
    df_failed = pd.DataFrame(failed_rows)
    if df_failed.empty:
        df_failed = pd.DataFrame(columns=['Test Name', 'Platform', 'Failure Reason', 'Screenshot Path'])

    # 6. Execution Logs
    log_rows = []
    for t in and_tests + web_tests:
        log_rows.append({
            'Timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'Test Name': t['Test Name'],
            'Step': 'Execute UI verification',
            'Result': t['Status'],
            'Remarks': t['Error'] if t['Error'] else 'OK'
        })
    df_logs = pd.DataFrame(log_rows)
    if df_logs.empty:
        df_logs = pd.DataFrame(columns=['Timestamp', 'Test Name', 'Step', 'Result', 'Remarks'])

    report_file = 'Flutter_E2E_Report.xlsx'
    
    with pd.ExcelWriter(report_file, engine='xlsxwriter') as writer:
        df_summary.to_excel(writer, sheet_name='Summary', index=False)
        df_android.to_excel(writer, sheet_name='Android Test Cases', index=False)
        df_web.to_excel(writer, sheet_name='Web Test Cases', index=False)
        df_passed.to_excel(writer, sheet_name='Passed Tests', index=False)
        df_failed.to_excel(writer, sheet_name='Failed Tests', index=False)
        df_logs.to_excel(writer, sheet_name='Execution Logs', index=False)
        
        # Style adjustments
        workbook = writer.book
        header_format = workbook.add_format({
            'bold': True,
            'text_wrap': True,
            'valign': 'top',
            'fg_color': '#D7E4BC',
            'border': 1
        })
        
        for worksheet_name in writer.sheets:
            worksheet = writer.sheets[worksheet_name]
            # Write headers with styling
            df = None
            if worksheet_name == 'Summary': df = df_summary
            elif worksheet_name == 'Android Test Cases': df = df_android
            elif worksheet_name == 'Web Test Cases': df = df_web
            elif worksheet_name == 'Passed Tests': df = df_passed
            elif worksheet_name == 'Failed Tests': df = df_failed
            elif worksheet_name == 'Execution Logs': df = df_logs
            
            if df is not None:
                for col_num, value in enumerate(df.columns.values):
                    worksheet.write(0, col_num, value, header_format)
                    worksheet.set_column(col_num, col_num, 25) # Set column width
                    
    print(f"Enterprise Multi-Tier E2E Report generated: {report_file}")

if __name__ == '__main__':
    generate_report()

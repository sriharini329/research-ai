import json
import os
import pandas as pd

# File Paths
ANDROID_REPORT_PATH = "appium/mochawesome-report/mochawesome-android.json"
WEB_REPORT_PATH = "selenium/mochawesome-report/mochawesome-web.json"
OUTPUT_EXCEL = "Flutter_E2E_Report.xlsx"

def parse_mochawesome(file_path, module_name):
    tests = []
    total_passed = 0
    total_failed = 0
    
    if not os.path.exists(file_path):
        return total_passed, total_failed, 0, 0, tests

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        suites = data.get('results', [])
        for suite in suites:
            for s in suite.get('suites', []):
                for test in s.get('tests', []):
                    title = test.get('title', 'Unknown Test')
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
                        'Test Name': title,
                        'Module': module_name,
                        'Duration (ms)': test.get('duration', 0),
                        'Status': status,
                        'Error': err_details
                    })
    except Exception as e:
        print(f"Error parsing {file_path}: {e}")

    return total_passed, total_failed, 0, 0, tests

def generate_report():
    print("Generating Multi-Tier Enterprise Excel Report...")
    
    and_p, and_f, and_s, and_d, and_tests = parse_mochawesome(ANDROID_REPORT_PATH, "Android Appium")
    web_p, web_f, web_s, web_d, web_tests = parse_mochawesome(WEB_REPORT_PATH, "Web Selenium")
    
    total_android = len(and_tests)
    total_web = len(web_tests)
    total_executed = total_android + total_web
    total_passed = and_p + web_p
    total_failed = and_f + web_f
    pass_pct = f"{(total_passed / total_executed * 100):.1f}%" if total_executed > 0 else "0.0%"
    
    summary_data = {
        'Metric': ['Total Android Tests', 'Total Web Tests', 'Total Executed', 'Passed', 'Failed', 'Skipped', 'Pass Percentage', 'Duration', 'Device', 'Browser', 'Android Version'],
        'Value': [total_android, total_web, total_executed, total_passed, total_failed, 0, pass_pct, 'N/A', 'Pixel 6 Emulator', 'Chrome Headless', 'Android 33']
    }
    df_summary = pd.DataFrame(summary_data)
    
    df_android = pd.DataFrame(and_tests)
    df_web = pd.DataFrame(web_tests)
    
    all_tests = and_tests + web_tests
    df_passed = pd.DataFrame([t for t in all_tests if t['Status'] == 'Pass'])
    df_failed = pd.DataFrame([t for t in all_tests if t['Status'] == 'Fail'])
    df_logs = pd.DataFrame(all_tests)
    
    with pd.ExcelWriter(OUTPUT_EXCEL, engine='xlsxwriter') as writer:
        df_summary.to_excel(writer, sheet_name='Summary', index=False)
        if not df_android.empty:
            df_android.to_excel(writer, sheet_name='Android Test Cases', index=False)
        else:
            pd.DataFrame(columns=['No Data']).to_excel(writer, sheet_name='Android Test Cases', index=False)
            
        if not df_web.empty:
            df_web.to_excel(writer, sheet_name='Web Test Cases', index=False)
        else:
            pd.DataFrame(columns=['No Data']).to_excel(writer, sheet_name='Web Test Cases', index=False)
            
        if not df_passed.empty:
            df_passed.to_excel(writer, sheet_name='Passed Tests', index=False)
        else:
            pd.DataFrame(columns=['No Data']).to_excel(writer, sheet_name='Passed Tests', index=False)
            
        if not df_failed.empty:
            df_failed.to_excel(writer, sheet_name='Failed Tests', index=False)
        else:
            pd.DataFrame(columns=['No Data']).to_excel(writer, sheet_name='Failed Tests', index=False)
            
        if not df_logs.empty:
            df_logs.to_excel(writer, sheet_name='Execution Logs', index=False)
        else:
            pd.DataFrame(columns=['No Data']).to_excel(writer, sheet_name='Execution Logs', index=False)
            
    print(f"Report saved to {OUTPUT_EXCEL}")

if __name__ == "__main__":
    generate_report()

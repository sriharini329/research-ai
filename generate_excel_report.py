import os
import json
from datetime import datetime
import pandas as pd

def parse_python_unittest(file_path, category):
    passed, failed = 0, 0
    details = []
    if os.path.exists(file_path):
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
                passed = data.get('passed', 0)
                failed = data.get('failed', 0)
                for item in data.get('details', []):
                    details.append({
                        'Category': category,
                        'Test Name': item.get('test'),
                        'Status': item.get('status'),
                        'Error': item.get('error', '')
                    })
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
    return passed, failed, details

def parse_flutter_machine(file_path, category):
    passed, failed = 0, 0
    details = []
    if os.path.exists(file_path):
        try:
            with open(file_path, 'r', encoding='utf-16le') as f:
                tests = {}
                for line in f:
                    if not line.strip(): continue
                    try:
                        events = json.loads(line)
                        if isinstance(events, dict):
                            events = [events]
                        for event in events:
                            if not isinstance(event, dict): continue
                            if event.get('type') == 'testStart':
                                t = event['test']
                                if not t['name'].startswith('loading '):
                                    tests[t['id']] = {'name': t['name'], 'status': 'RUNNING', 'error': ''}
                            elif event.get('type') == 'testDone':
                                tid = event['testID']
                                if tid in tests:
                                    res = event['result']
                                    if res == 'success':
                                        tests[tid]['status'] = 'PASSED'
                                        passed += 1
                                    elif res == 'skipped':
                                        tests[tid]['status'] = 'SKIPPED'
                                    else:
                                        tests[tid]['status'] = 'FAILED'
                                        failed += 1
                            elif event.get('type') == 'error':
                                tid = event['testID']
                                if tid in tests:
                                    tests[tid]['error'] += event['error']
                    except json.JSONDecodeError:
                        pass
                for t in tests.values():
                    if t['status'] in ['PASSED', 'FAILED']:
                        details.append({
                            'Category': category,
                            'Test Name': t['name'],
                            'Status': t['status'],
                            'Error': t['error']
                        })
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
    return passed, failed, details

def generate_report():
    print("Generating Multi-Tier Excel Report...")
    
    unit_p, unit_f, unit_d = parse_python_unittest('test_results_backend.json', 'Unit (Backend)')
    e2e_p, e2e_f, e2e_d = parse_python_unittest('test_results_real_backend.json', 'End-to-End (Backend)')
    widg_p, widg_f, widg_d = parse_flutter_machine('test_results_frontend.json', 'Widget (Frontend)')
    integ_p, integ_f, integ_d = parse_flutter_machine('test_results_integration.json', 'Integration (Frontend)')
    
    all_details = unit_d + e2e_d + widg_d + integ_d
    total_passed = unit_p + e2e_p + widg_p + integ_p
    total_failed = unit_f + e2e_f + widg_f + integ_f
    total_tests = total_passed + total_failed
    pass_perc = (total_passed / total_tests * 100) if total_tests > 0 else 0

    summary_data = {
        'Metric': ['Execution Date', 'Device', 'Flutter Version', 'Backend Version', 'Database Version', 'Total Executed Tests', 'Passed', 'Failed', 'Pass Percentage'],
        'Value': [
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'Chrome (Real Runtime)',
            '3.x',
            'Flask 2.x',
            'SQLite',
            total_tests,
            total_passed,
            total_failed,
            f"{pass_perc:.2f}%"
        ]
    }
    df_summary = pd.DataFrame(summary_data)
    df_details = pd.DataFrame(all_details)
    df_passed = pd.DataFrame([d for d in all_details if d['Status'] == 'PASSED'])
    df_failed = pd.DataFrame([d for d in all_details if d['Status'] == 'FAILED'])

    report_file = 'Flutter_E2E_Report.xlsx'
    with pd.ExcelWriter(report_file, engine='xlsxwriter') as writer:
        df_summary.to_excel(writer, sheet_name='Summary', index=False)
        df_details.to_excel(writer, sheet_name='All Test Cases', index=False)
        if not df_passed.empty:
            df_passed.to_excel(writer, sheet_name='Passed Tests', index=False)
        if not df_failed.empty:
            df_failed.to_excel(writer, sheet_name='Failed Tests', index=False)
    
    print(f"Report generated: {report_file}")

if __name__ == '__main__':
    generate_report()

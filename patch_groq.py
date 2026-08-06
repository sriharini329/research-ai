import re
import traceback

try:
    app_file = 'research_ai_app.py'
    backup_file = 'research_ai_app_backup.py'

    app_code = open(app_file, encoding='utf-8').read()
    backup_code = open(backup_file, encoding='utf-8').read()

    # 1. Remove local AI config block
    app_code = re.sub(r'# ─────────────────────────────────────────\s*# LOCAL AI ENGINE CONFIG.*?# ─────────────────────────────────────────\s*# GROQ AI CONFIG', '# ─────────────────────────────────────────\n# GROQ AI CONFIG', app_code, flags=re.DOTALL)

    # 2. Remove clean_extracted_text and extract_text_from_pdf
    # Notice we use (?=def groq_chat_with_retry) to avoid consuming the auth routes!
    app_code = re.sub(r'def clean_extracted_text\(text\):.*?(?=def groq_chat_with_retry)', '', app_code, flags=re.DOTALL)
    app_code = re.sub(r'def extract_text_from_pdf\(pdf_bytes\):.*?(?=def groq_chat_with_retry)', '', app_code, flags=re.DOTALL)

    # 3. Extract analyze_paper from backup
    m_analyze_backup = re.search(r'(@app\.route\(\'/papers/analyze\', methods=\[\'POST\'\]\)\s*def analyze_paper\(\):.*?)(?=@app\.route\(\'/papers/<int:paper_id>/citations\')', backup_code, re.DOTALL)
    analyze_paper_code = m_analyze_backup.group(1)

    # Insert notification logic before success return
    notification_code = """
        create_notification(user_id, 'Paper analysis completed', f'Your paper "{paper.title}" has been analyzed and is ready to view.', 'Icons.check_circle_outline', paper.id)

        return jsonify({
            'message': 'Paper analyzed',"""
            
    analyze_paper_code = analyze_paper_code.replace("return jsonify({\n            'message': 'Paper analyzed',", notification_code)

    # Extract paper_citations from backup
    m_citations_backup = re.search(r'(@app\.route\(\'/papers/<int:paper_id>/citations\', methods=\[\'GET\'\]\)\s*def paper_citations\(paper_id\):.*?)(?=@app\.route\(\'/papers/<int:paper_id>/cite\')', backup_code, re.DOTALL)
    citations_code = m_citations_backup.group(1)

    # Extract cite_paper from backup
    m_cite_backup = re.search(r'(@app\.route\(\'/papers/<int:paper_id>/cite\', methods=\[\'POST\'\]\)\s*def cite_paper\(paper_id\):.*?)(?=@app\.route\(\'/papers/<int:paper_id>/favorite\')', backup_code, re.DOTALL)
    cite_code = m_cite_backup.group(1)

    # We cannot use re.sub easily with replacement strings containing backslashes (\n). 
    # Let's find the original blocks in app_code and replace them via string slicing.
    
    def replace_block(text, start_pattern, end_pattern, replacement):
        m_start = re.search(start_pattern, text, re.DOTALL)
        m_end = re.search(end_pattern, text, re.DOTALL)
        if m_start and m_end:
            return text[:m_start.start()] + replacement + "\n\n" + text[m_end.start():]
        raise Exception(f"Could not find blocks for {start_pattern}")

    app_code = replace_block(app_code, r'@app\.route\(\'/papers/analyze\', methods=\[\'POST\'\]\)\s*def analyze_paper\(\):', r'@app\.route\(\'/papers/<int:paper_id>/citations\', methods=\[\'GET\'\]\)\s*def paper_citations\(paper_id\):', analyze_paper_code)
    
    app_code = replace_block(app_code, r'@app\.route\(\'/papers/<int:paper_id>/citations\', methods=\[\'GET\'\]\)\s*def paper_citations\(paper_id\):', r'@app\.route\(\'/papers/<int:paper_id>/cite\', methods=\[\'POST\'\]\)\s*def cite_paper\(paper_id\):', citations_code)
    
    app_code = replace_block(app_code, r'@app\.route\(\'/papers/<int:paper_id>/cite\', methods=\[\'POST\'\]\)\s*def cite_paper\(paper_id\):', r'@app\.route\(\'/papers/<int:paper_id>/favorite\', methods=\[\'POST\'\]\)\s*def toggle_favorite\(paper_id\):', cite_code)


    open(app_file, 'w', encoding='utf-8').write(app_code)
    print('Patch applied successfully')
except Exception as e:
    print("Error:", e)
    traceback.print_exc()

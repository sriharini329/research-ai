import glob

files = glob.glob('lib/screens/*.dart')

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    modified = False
    
    # Replace PaperStore.instance.load();
    if "    PaperStore.instance.load();" in content and "addPostFrameCallback" not in content:
        content = content.replace(
            "    PaperStore.instance.load();\n",
            "    WidgetsBinding.instance.addPostFrameCallback((_) {\n      PaperStore.instance.load();\n    });\n"
        )
        modified = True
        
    # Replace NoteStore.instance.load();
    if "    NoteStore.instance.load();" in content and "addPostFrameCallback" not in content:
        content = content.replace(
            "    NoteStore.instance.load();\n",
            "    WidgetsBinding.instance.addPostFrameCallback((_) {\n      NoteStore.instance.load();\n    });\n"
        )
        modified = True

    if modified:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"Patched {f}")

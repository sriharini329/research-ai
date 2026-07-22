import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/providers/note_store.dart';
import 'package:research_ai/widgets/app_widgets.dart';

class AddNoteScreen extends StatefulWidget {
  final String paperTitle;
  final int? paperId;
  const AddNoteScreen({super.key, this.paperTitle = '', this.paperId});
  @override
  State<AddNoteScreen> createState() => _AddNoteScreenState();
}

class _AddNoteScreenState extends State<AddNoteScreen> {
  final _ctrl = TextEditingController();
  final _colors = const [0xFFF59E0B, 0xFFEF4444, 0xFF22C55E, 0xFF3B82F6, 0xFFEC4899];
  int _color = 0xFFF59E0B;
  bool _saving = false;

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_ctrl.text.trim().isEmpty) {
      showSnack(context, 'Note is empty', error: true);
      return;
    }
    setState(() => _saving = true);
    try {
      await NoteStore.instance.add(_ctrl.text.trim(),
          paperId: widget.paperId,
          paperTitle: widget.paperTitle,
          colorValue: _color);
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) {
        setState(() => _saving = false);
        showSnack(context, e.toString(), error: true);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Add Note')),
      body: SafeArea(
        child: Padding(
          padding: kPad,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (widget.paperTitle.isNotEmpty) ...[
                Text('On: ${widget.paperTitle}',
                    style: const TextStyle(color: kMuted, fontSize: 13)),
                const SizedBox(height: 12),
              ],
              LabeledField(
                  hint: 'Add your note here…',
                  controller: _ctrl,
                  maxLines: 6),
              const SizedBox(height: 18),
              const Text('Highlight color',
                  style:
                      TextStyle(fontWeight: FontWeight.w700, color: kInk)),
              const SizedBox(height: 12),
              Row(
                children: _colors.map((c) {
                  final on = _color == c;
                  return GestureDetector(
                    onTap: () => setState(() => _color = c),
                    child: Container(
                      margin: const EdgeInsets.only(right: 14),
                      height: 34,
                      width: 34,
                      decoration: BoxDecoration(
                        color: Color(c),
                        shape: BoxShape.circle,
                        border: Border.all(
                            color: on ? kInk : Colors.transparent, width: 2),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const Spacer(),
              PrimaryButton(
                  label: 'Save Note', loading: _saving, onPressed: _save),
            ],
          ),
        ),
      ),
    );
  }
}

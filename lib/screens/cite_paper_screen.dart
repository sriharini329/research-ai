import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/models/paper.dart';
import 'package:research_ai/services/paper_service.dart';
import 'package:research_ai/services/api_service.dart';
import 'package:research_ai/widgets/app_widgets.dart';

class CitePaperScreen extends StatefulWidget {
  final Paper paper;
  const CitePaperScreen({super.key, required this.paper});
  @override
  State<CitePaperScreen> createState() => _CitePaperScreenState();
}

class _CitePaperScreenState extends State<CitePaperScreen> {
  final _ai = PaperService();
  final _styles = const ['APA', 'MLA', 'IEEE', 'Chicago', 'BibTeX'];
  String? _selected;
  String? _result;
  bool _loading = false;

  Future<void> _pick(String style) async {
    setState(() {
      _selected = style;
      _loading = true;
      _result = null;
    });
    try {
      if (widget.paper.content.isEmpty) {
        final full = await ApiService.getPaperDetail(widget.paper.id);
        widget.paper.content = full.content;
      }
      _result = await _ai.formatCitation(widget.paper.content, style);
    } catch (e) {
      _result = e.toString();
    }
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Cite Paper')),
      body: ListView(
        padding: kPad,
        children: [
          const Text('Select a citation style',
              style: TextStyle(
                  fontSize: 16, fontWeight: FontWeight.w700, color: kInk)),
          const SizedBox(height: 14),
          ..._styles.map((s) {
            final on = _selected == s;
            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: AppCard(
                onTap: () => _pick(s),
                padding:
                    const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
                child: Row(
                  children: [
                    Icon(
                        on
                            ? Icons.radio_button_checked
                            : Icons.radio_button_unchecked,
                        color: on ? kPrimary : kMuted,
                        size: 22),
                    const SizedBox(width: 12),
                    Text(s,
                        style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            color: kInk,
                            fontSize: 15)),
                  ],
                ),
              ),
            );
          }),
          const SizedBox(height: 8),
          if (_loading)
            const Padding(
              padding: EdgeInsets.all(24),
              child: Center(child: CircularProgressIndicator(color: kPrimary)),
            ),
          if (_result != null && !_loading) ...[
            const SizedBox(height: 6),
            AppCard(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('$_selected Citation',
                      style: const TextStyle(
                          fontWeight: FontWeight.w800,
                          color: kInk,
                          fontSize: 15)),
                  const Divider(height: 18),
                  SelectableText(_result!,
                      style: const TextStyle(
                          fontSize: 14.5, height: 1.5, color: kInk)),
                ],
              ),
            ),
            const SizedBox(height: 16),
            PrimaryButton(
              label: 'Copy Citation',
              icon: Icons.copy_rounded,
              onPressed: () {
                Clipboard.setData(ClipboardData(text: _result!));
                showSnack(context, 'Citation copied to clipboard');
              },
            ),
          ],
        ],
      ),
    );
  }
}

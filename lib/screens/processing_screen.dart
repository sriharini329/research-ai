import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/models/paper.dart';
import 'package:research_ai/models/session.dart';
import 'package:research_ai/services/paper_service.dart';
import 'package:research_ai/services/api_service.dart';
import 'package:research_ai/providers/paper_store.dart';
import 'package:research_ai/widgets/app_widgets.dart';
import 'package:research_ai/screens/paper_detail_screen.dart';

class ProcessingScreen extends StatefulWidget {
  final String fileName;
  final String text;
  const ProcessingScreen(
      {super.key, required this.fileName, required this.text});

  @override
  State<ProcessingScreen> createState() => _ProcessingScreenState();
}

class _ProcessingScreenState extends State<ProcessingScreen> {
  final _ai = PaperService();
  final _steps = ['Extracting Text', 'Understanding Content', 'Generating Summary'];
  int _done = 0;
  bool _complete = false;
  String? _error;
  Paper? _paper;

  @override
  void initState() {
    super.initState();
    _run();
  }

  Future<void> _run() async {
    try {
      setState(() => _done = 1);
      // 1) metadata (Groq, in app)
      final meta = await _ai.extractMeta(widget.text);
      if (!mounted) return;
      setState(() => _done = 2);
      // 2) summary (Groq, in app)
      final summary = await _ai.summarize(widget.text);
      if (!mounted) return;
      setState(() => _done = 3);

      final title = widget.fileName.replaceAll(
        RegExp(r'\.(pdf|docx|txt)$'),
        '',
      );

      // 3) save to backend
      final paper = await ApiService.savePaper(
        userId: Session.userId!,
        fileName: widget.fileName,
        title: title,
        authors: meta['authors'] ?? '',
        year: meta['year'] ?? '',
        content: widget.text,
        summary: summary,
      );
      // keep content locally so detail/chat/cite have it without a refetch
      paper.content = widget.text;
      if (!mounted) return;
      PaperStore.instance.cacheNew(paper);
      setState(() {
        _complete = true;
        _paper = paper;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(automaticallyImplyLeading: false),
      body: Padding(
        padding: const EdgeInsets.all(28),
        child: _error != null
            ? _errorView()
            : _complete
                ? _completeView()
                : _processingView(),
      ),
    );
  }

  Widget _processingView() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const SizedBox(
            height: 64,
            width: 64,
            child: CircularProgressIndicator(color: kPrimary, strokeWidth: 4)),
        const SizedBox(height: 28),
        const Text('Processing Paper',
            style: TextStyle(
                fontSize: 20, fontWeight: FontWeight.w800, color: kInk)),
        const SizedBox(height: 8),
        const Text('AI is analyzing your paper and\nextracting key information.',
            textAlign: TextAlign.center,
            style: TextStyle(color: kMuted, height: 1.5)),
        const SizedBox(height: 36),
        ...List.generate(_steps.length, (i) {
          final done = i < _done;
          final active = i == _done;
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Row(
              children: [
                done
                    ? const Icon(Icons.check_circle_rounded, color: kSuccess, size: 24)
                    : active
                        ? const SizedBox(
                            height: 22,
                            width: 22,
                            child: CircularProgressIndicator(
                                strokeWidth: 2.4, color: kPrimary))
                        : Icon(Icons.radio_button_unchecked, color: kBorder, size: 24),
                const SizedBox(width: 12),
                Text(_steps[i],
                    style: TextStyle(
                        color: done || active ? kInk : kMuted,
                        fontWeight: active ? FontWeight.w700 : FontWeight.w500)),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _completeView() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          height: 96,
          width: 96,
          decoration: BoxDecoration(
              color: kSuccess.withOpacity(0.12), shape: BoxShape.circle),
          child: const Icon(Icons.check_rounded, color: kSuccess, size: 56),
        ),
        const SizedBox(height: 24),
        const Text('Processing Complete!',
            style: TextStyle(fontSize: 21, fontWeight: FontWeight.w800, color: kInk)),
        const SizedBox(height: 8),
        const Text('Your paper has been analyzed successfully.',
            textAlign: TextAlign.center, style: TextStyle(color: kMuted)),
        const SizedBox(height: 36),
        PrimaryButton(
          label: 'View Paper',
          onPressed: () => Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (_) => PaperDetailScreen(paper: _paper!)),
          ),
        ),
        const SizedBox(height: 12),
        TextButton(
          onPressed: () => Navigator.popUntil(context, (r) => r.isFirst),
          child: const Text('Back to Home',
              style: TextStyle(color: kMuted, fontWeight: FontWeight.w600)),
        ),
      ],
    );
  }

  Widget _errorView() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(Icons.error_outline_rounded, color: kError, size: 64),
        const SizedBox(height: 20),
        const Text('Could not analyze the paper',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: kInk)),
        const SizedBox(height: 8),
        Text(_error ?? '',
            textAlign: TextAlign.center, style: const TextStyle(color: kMuted)),
        const SizedBox(height: 28),
        PrimaryButton(
            label: 'Try Again',
            onPressed: () {
              setState(() {
                _error = null;
                _done = 0;
              });
              _run();
            }),
        const SizedBox(height: 12),
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel',
              style: TextStyle(color: kMuted, fontWeight: FontWeight.w600)),
        ),
      ],
    );
  }
}

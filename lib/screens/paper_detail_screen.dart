import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/models/paper.dart';
import 'package:research_ai/services/api_service.dart';
import 'package:research_ai/services/paper_service.dart';
import 'package:research_ai/providers/paper_store.dart';
import 'package:research_ai/widgets/app_widgets.dart';
import 'package:research_ai/screens/chat_with_paper_screen.dart';
import 'package:research_ai/screens/cite_paper_screen.dart';
import 'package:research_ai/widgets/paper_actions_sheet.dart';

class PaperDetailScreen extends StatefulWidget {
  final Paper paper;
  const PaperDetailScreen({super.key, required this.paper});
  @override
  State<PaperDetailScreen> createState() => _PaperDetailScreenState();
}

class _PaperDetailScreenState extends State<PaperDetailScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tab;
  bool _loadingDetail = true;
  String? _citations;
  bool _citLoading = false;
  bool _citRequested = false;

  @override
  void initState() {
    super.initState();
    _tab = TabController(length: 3, vsync: this);
    _tab.addListener(() {
      if (_tab.index == 2) _loadCitations();
    });
    _loadDetail();
  }

  Future<void> _loadDetail() async {
    try {
      final full = await ApiService.getPaperDetail(widget.paper.id);
      widget.paper.content = full.content;
      widget.paper.summary = full.summary;
      widget.paper.citations = full.citations;
      if (full.citations.isNotEmpty) _citations = full.citations;
    } catch (_) {}
    if (mounted) setState(() => _loadingDetail = false);
  }

  final _ai = PaperService();

  Future<void> _loadCitations() async {
    if (_citRequested) return;
    _citRequested = true;
    if (_citations != null && _citations!.isNotEmpty) return;
    setState(() => _citLoading = true);
    try {
      // make sure we have the paper text
      if (widget.paper.content.isEmpty) {
        final full = await ApiService.getPaperDetail(widget.paper.id);
        widget.paper.content = full.content;
      }
      final result = await _ai.citations(widget.paper.content);
      _citations = result;
      // cache on the backend so it loads instantly next time
      try {
        await ApiService.saveCitations(widget.paper.id, result);
      } catch (_) {}
    } catch (e) {
      _citations = e.toString();
    }
    if (mounted) setState(() => _citLoading = false);
  }

  @override
  void dispose() {
    _tab.dispose();
    super.dispose();
  }

  String _statusLabel(ReadingStatus s) {
    switch (s) {
      case ReadingStatus.toRead:
        return 'To Read';
      case ReadingStatus.reading:
        return 'Reading';
      case ReadingStatus.completed:
        return 'Completed';
    }
  }

  void _changeStatus() {
    showModalBottomSheet(
      context: context,
      backgroundColor: kSurface,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(22))),
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: ReadingStatus.values
              .map((s) => ListTile(
                    leading: Icon(
                        widget.paper.status == s
                            ? Icons.radio_button_checked
                            : Icons.radio_button_unchecked,
                        color: kPrimary),
                    title: Text(_statusLabel(s)),
                    onTap: () async {
                      await PaperStore.instance.setStatus(widget.paper, s);
                      if (ctx.mounted) Navigator.pop(ctx);
                      if (mounted) setState(() {});
                    },
                  ))
              .toList(),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.paper;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Paper Detail'),
        actions: [
          AnimatedBuilder(
            animation: PaperStore.instance,
            builder: (_, __) => IconButton(
              icon: Icon(p.favorite ? Icons.favorite : Icons.favorite_border,
                  color: p.favorite ? kPink : kMuted),
              onPressed: () => PaperStore.instance.toggleFavorite(p),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.more_vert_rounded, color: kInk),
            onPressed: () => showPaperActions(context, p),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(22, 0, 22, 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(p.title,
                    style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: kInk)),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Expanded(
                      child: Text(p.citationLine,
                          style: const TextStyle(
                              color: kMuted, fontSize: 13.5)),
                    ),
                    GestureDetector(
                      onTap: _changeStatus,
                      child: AnimatedBuilder(
                        animation: PaperStore.instance,
                        builder: (_, __) => Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                              color: kChipBg,
                              borderRadius: BorderRadius.circular(20)),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(_statusLabel(p.status),
                                  style: const TextStyle(
                                      color: kPrimaryDark,
                                      fontWeight: FontWeight.w700,
                                      fontSize: 12)),
                              const SizedBox(width: 4),
                              const Icon(Icons.expand_more_rounded,
                                  size: 16, color: kPrimaryDark),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          TabBar(
            controller: _tab,
            labelColor: kPrimary,
            unselectedLabelColor: kMuted,
            indicatorColor: kPrimary,
            indicatorWeight: 3,
            labelStyle: const TextStyle(fontWeight: FontWeight.w700),
            tabs: const [
              Tab(text: 'Overview'),
              Tab(text: 'Content'),
              Tab(text: 'Citations'),
            ],
          ),
          Expanded(
            child: TabBarView(
              controller: _tab,
              children: [
                ListView(padding: kPad, children: [
                  _card('Summary',
                      p.summary.isEmpty ? 'Loading…' : p.summary,
                      Icons.summarize_outlined),
                ]),
                _loadingDetail
                    ? _loader('Loading full text…')
                    : ListView(padding: kPad, children: [
                        _card('Full Text',
                            p.content.isEmpty ? 'No text available.' : p.content,
                            Icons.description_outlined),
                      ]),
                _citationsTab(),
              ],
            ),
          ),
          _bottomBar(p),
        ],
      ),
    );
  }

  Widget _loader(String label) => Center(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          const CircularProgressIndicator(color: kPrimary),
          const SizedBox(height: 16),
          Text(label, style: const TextStyle(color: kMuted)),
        ]),
      );

  Widget _citationsTab() {
    if (_citLoading) return _loader('Building IEEE citations…');
    if (_citations == null) {
      return const Center(
          child: Text('Open this tab to load citations',
              style: TextStyle(color: kMuted)));
    }
    return ListView(padding: kPad, children: [
      _card('References (IEEE)', _citations!, Icons.format_quote_rounded),
    ]);
  }

  Widget _card(String title, String body, IconData icon) {
    return AppCard(
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: kPrimary, size: 20),
              const SizedBox(width: 8),
              Text(title,
                  style: const TextStyle(
                      fontWeight: FontWeight.w800, color: kInk, fontSize: 16)),
              const Spacer(),
              IconButton(
                icon: const Icon(Icons.copy_rounded, size: 18, color: kMuted),
                onPressed: () {
                  Clipboard.setData(ClipboardData(text: body));
                  showSnack(context, 'Copied to clipboard');
                },
              ),
            ],
          ),
          const Divider(height: 20),
          SelectableText(body,
              style:
                  const TextStyle(fontSize: 14.5, height: 1.55, color: kInk)),
        ],
      ),
    );
  }

  Widget _bottomBar(Paper p) {
    return Container(
      padding: const EdgeInsets.fromLTRB(22, 12, 22, 12),
      decoration: const BoxDecoration(
          color: kSurface, border: Border(top: BorderSide(color: kBorder))),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  foregroundColor: kPrimary,
                  side: const BorderSide(color: kPrimary),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(kRadius)),
                ),
                icon: const Icon(Icons.format_quote_rounded, size: 18),
                label: const Text('Cite',
                    style: TextStyle(fontWeight: FontWeight.w700)),
                onPressed: () => Navigator.push(context,
                    MaterialPageRoute(builder: (_) => CitePaperScreen(paper: p))),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              flex: 2,
              child: PrimaryButton(
                label: 'Chat with Paper',
                icon: Icons.chat_bubble_outline_rounded,
                height: 48,
                onPressed: () => Navigator.push(context,
                    MaterialPageRoute(
                        builder: (_) => ChatWithPaperScreen(paper: p))),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

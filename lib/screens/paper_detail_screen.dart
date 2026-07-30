import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/models/paper.dart';
import 'package:research_ai/services/api_service.dart';
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
      widget.paper.abstractText = full.abstractText;
      widget.paper.keywords = full.keywords;
      widget.paper.references = full.references;
      widget.paper.citations = full.citations;
    } catch (_) {}
    if (mounted) setState(() => _loadingDetail = false);
  }

  Future<void> _loadCitations() async {
    // References are now pre-extracted by the backend.
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
      backgroundColor: context.kSurface,
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
                        color: context.kPrimary),
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
                  color: p.favorite ? context.kPink : context.kMuted),
              onPressed: () => PaperStore.instance.toggleFavorite(p),
            ),
          ),
          IconButton(
            icon: Icon(Icons.more_vert_rounded, color: context.kInk),
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
                    style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: context.kInk)),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Expanded(
                      child: Text(p.citationLine,
                          style: TextStyle(
                              color: context.kMuted, fontSize: 13.5)),
                    ),
                    GestureDetector(
                      onTap: _changeStatus,
                      child: AnimatedBuilder(
                        animation: PaperStore.instance,
                        builder: (_, __) => Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                              color: context.kChipBg,
                              borderRadius: BorderRadius.circular(20)),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(_statusLabel(p.status),
                                  style: TextStyle(
                                      color: context.kPrimaryDark,
                                      fontWeight: FontWeight.w700,
                                      fontSize: 12)),
                              const SizedBox(width: 4),
                              Icon(Icons.expand_more_rounded,
                                  size: 16, color: context.kPrimaryDark),
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
            labelColor: context.kPrimary,
            unselectedLabelColor: context.kMuted,
            indicatorColor: context.kPrimary,
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
                _loadingDetail
                    ? _loader('Loading Details...')
                    : ListView(padding: kPad, children: [
                        if (p.abstractText.isNotEmpty) ...[
                          _card('Abstract', p.abstractText, Icons.article_outlined),
                          const SizedBox(height: 16),
                        ],
                        if (p.keywords.isNotEmpty) ...[
                          _card('Keywords', p.keywords, Icons.vpn_key_outlined),
                          const SizedBox(height: 16),
                        ],
                        _card('Summary',
                            p.summary.isEmpty ? 'Summary not available.' : p.summary,
                            Icons.summarize_outlined),
                      ]),
                _loadingDetail
                    ? _loader('Loading full text…')
                    : ListView(padding: kPad, children: [
                        _card('Extracted Full Text (PyMuPDF)',
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
          CircularProgressIndicator(color: context.kPrimary),
          const SizedBox(height: 16),
          Text(label, style: TextStyle(color: context.kMuted)),
        ]),
      );

  Widget _citationsTab() {
    if (_loadingDetail) return _loader('Loading References...');
    final refs = widget.paper.references;
    if (refs.isEmpty) {
      return Center(
          child: Text('No references found in this paper.',
              style: TextStyle(color: context.kMuted)));
    }
    return ListView(padding: kPad, children: [
      _card('Extracted References', refs, Icons.format_quote_rounded),
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
              Icon(icon, color: context.kPrimary, size: 20),
              const SizedBox(width: 8),
              Text(title,
                  style: TextStyle(
                      fontWeight: FontWeight.w800, color: context.kInk, fontSize: 16)),
              const Spacer(),
              IconButton(
                icon: Icon(Icons.copy_rounded, size: 18, color: context.kMuted),
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
                  TextStyle(fontSize: 14.5, height: 1.55, color: context.kInk)),
        ],
      ),
    );
  }

  Widget _bottomBar(Paper p) {
    return Container(
      padding: const EdgeInsets.fromLTRB(22, 12, 22, 12),
      decoration: BoxDecoration(
          color: context.kSurface, border: Border(top: BorderSide(color: context.kBorder))),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  foregroundColor: context.kPrimary,
                  side: BorderSide(color: context.kPrimary),
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

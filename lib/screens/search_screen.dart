import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/models/paper.dart';
import 'package:research_ai/providers/paper_store.dart';
import 'package:research_ai/widgets/app_widgets.dart';
import 'package:research_ai/screens/paper_detail_screen.dart';
import 'package:research_ai/screens/paper_filters_screen.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});
  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _ctrl = TextEditingController();
  String _q = '';

  @override
  void initState() {
    super.initState();
    PaperStore.instance.load();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Find Papers'),
        actions: [
          IconButton(
            icon: const Icon(Icons.tune_rounded, color: kInk),
            onPressed: () => Navigator.push(context,
                MaterialPageRoute(builder: (_) => const PaperFiltersScreen())),
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: kPad,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextField(
                controller: _ctrl,
                onChanged: (v) => setState(() => _q = v),
                decoration: const InputDecoration(
                  hintText: 'Search papers, authors, topics…',
                  prefixIcon: Icon(Icons.search_rounded, color: kMuted),
                ),
              ),
              const SizedBox(height: 18),
              Expanded(
                child: AnimatedBuilder(
                  animation: PaperStore.instance,
                  builder: (context, _) {
                    final store = PaperStore.instance;
                    if (store.loading && store.all.isEmpty) {
                      return const Center(
                          child: CircularProgressIndicator(color: kPrimary));
                    }
                    final results = store.search(_q);
                    if (results.isEmpty) {
                      return Center(
                        child: Text(
                            _q.isEmpty
                                ? 'Search across your analyzed papers'
                                : 'No matches for "$_q"',
                            style: const TextStyle(color: kMuted)),
                      );
                    }
                    return ListView.separated(
                      itemCount: results.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 10),
                      itemBuilder: (_, i) => _tile(results[i]),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _tile(Paper p) => AppCard(
        onTap: () => Navigator.push(context,
            MaterialPageRoute(builder: (_) => PaperDetailScreen(paper: p))),
        child: Row(
          children: [
            const Icon(Icons.article_outlined, color: kPrimary),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(p.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                          fontWeight: FontWeight.w700, color: kInk)),
                  Text(p.citationLine,
                      style: const TextStyle(color: kMuted, fontSize: 12.5)),
                ],
              ),
            ),
          ],
        ),
      );
}

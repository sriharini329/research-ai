import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/models/paper.dart';
import 'package:research_ai/providers/paper_store.dart';
import 'package:research_ai/widgets/app_widgets.dart';
import 'package:research_ai/screens/paper_detail_screen.dart';

class ReadingListScreen extends StatefulWidget {
  const ReadingListScreen({super.key});
  @override
  State<ReadingListScreen> createState() => _ReadingListScreenState();
}

class _ReadingListScreenState extends State<ReadingListScreen> {
  @override
  void initState() {
    super.initState();
    PaperStore.instance.load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Reading List')),
      body: AnimatedBuilder(
        animation: PaperStore.instance,
        builder: (context, _) {
          final store = PaperStore.instance;
          if (store.loading && store.all.isEmpty) {
            return const Center(child: CircularProgressIndicator(color: kPrimary));
          }
          if (store.all.isEmpty) {
            return const Center(
                child: Text('No papers yet', style: TextStyle(color: kMuted)));
          }
          return ListView(
            padding: kPad,
            children: [
              _group('To Read', Icons.bookmark_border_rounded, kOrange,
                  store.byStatus(ReadingStatus.toRead)),
              _group('Reading', Icons.menu_book_rounded, kBlue,
                  store.byStatus(ReadingStatus.reading)),
              _group('Completed', Icons.check_circle_outline, kSuccess,
                  store.byStatus(ReadingStatus.completed)),
            ],
          );
        },
      ),
    );
  }

  Widget _group(String title, IconData icon, Color c, List<Paper> items) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(2, 8, 2, 10),
          child: Row(
            children: [
              Icon(icon, color: c, size: 20),
              const SizedBox(width: 8),
              Text(title,
                  style: const TextStyle(
                      fontWeight: FontWeight.w800, color: kInk, fontSize: 15)),
              const SizedBox(width: 6),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                    color: c.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(10)),
                child: Text('${items.length}',
                    style: TextStyle(
                        color: c, fontWeight: FontWeight.w700, fontSize: 12)),
              ),
            ],
          ),
        ),
        if (items.isEmpty)
          const Padding(
            padding: EdgeInsets.only(left: 4, bottom: 12),
            child: Text('Nothing here',
                style: TextStyle(color: kMuted, fontSize: 13)),
          )
        else
          ...items.map((p) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: AppCard(
                  onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (_) => PaperDetailScreen(paper: p))),
                  child: Row(
                    children: [
                      const Icon(Icons.article_outlined, color: kPrimary),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(p.title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                                fontWeight: FontWeight.w700, color: kInk)),
                      ),
                    ],
                  ),
                ),
              )),
        const SizedBox(height: 8),
      ],
    );
  }
}

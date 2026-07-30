import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/models/paper.dart';
import 'package:research_ai/providers/paper_store.dart';
import 'package:research_ai/widgets/app_widgets.dart';
import 'package:research_ai/screens/paper_detail_screen.dart';
import 'package:research_ai/widgets/paper_actions_sheet.dart';
import 'package:research_ai/screens/favorites_screen.dart';
import 'package:research_ai/screens/reading_list_screen.dart';
import 'package:research_ai/screens/notes_screen.dart';
import 'package:provider/provider.dart';
import 'package:research_ai/providers/notification_store.dart';

class LibraryScreen extends StatefulWidget {
  const LibraryScreen({super.key});
  @override
  State<LibraryScreen> createState() => _LibraryScreenState();
}

class _LibraryScreenState extends State<LibraryScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      PaperStore.instance.load();
    });
  }

  void _go(Widget s) async {
    await Navigator.push(context, MaterialPageRoute(builder: (_) => s));
    PaperStore.instance.load();
    if (context.mounted) {
      Provider.of<NotificationStore>(context, listen: false).fetchNotifications();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Library')),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () => PaperStore.instance.load(),
          child: AnimatedBuilder(
            animation: PaperStore.instance,
            builder: (context, _) {
              final store = PaperStore.instance;
              final all = store.all;
              return ListView(
                padding: kPad,
                children: [
                  Row(
                    children: [
                      _quick(Icons.favorite, 'Favorites', context.kPink,
                          store.favorites.length,
                          () => _go(const FavoritesScreen())),
                      const SizedBox(width: 12),
                      _quick(Icons.bookmark_rounded, 'Reading', context.kBlue,
                          store.byStatus(ReadingStatus.reading).length,
                          () => _go(const ReadingListScreen())),
                      const SizedBox(width: 12),
                      _quick(Icons.sticky_note_2_rounded, 'Notes', context.kOrange, -1,
                          () => _go(const NotesScreen())),
                    ],
                  ),
                  const SizedBox(height: 22),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('All Papers',
                          style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w800,
                              color: context.kInk)),
                      Text('${all.length}',
                          style: TextStyle(
                              color: context.kMuted, fontWeight: FontWeight.w700)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  if (store.loading && all.isEmpty)
                    Padding(
                      padding: EdgeInsets.only(top: 40),
                      child: Center(
                          child:
                              CircularProgressIndicator(color: context.kPrimary)),
                    )
                  else if (all.isEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 40),
                      child: Center(
                        child: Column(
                          children: [
                            Icon(Icons.folder_open_rounded,
                                size: 50, color: context.kMuted),
                            SizedBox(height: 12),
                            Text('Your library is empty',
                                style: TextStyle(
                                    fontWeight: FontWeight.w700,
                                    color: context.kInk)),
                            SizedBox(height: 4),
                            Text('Analyzed papers will appear here',
                                style:
                                    TextStyle(color: context.kMuted, fontSize: 13)),
                          ],
                        ),
                      ),
                    )
                  else
                    ...all.map((p) => _tile(p)),
                ],
              );
            },
          ),
        ),
      ),
    );
  }

  Widget _quick(IconData icon, String label, Color color, int count,
      VoidCallback onTap) {
    return Expanded(
      child: AppCard(
        onTap: onTap,
        padding: const EdgeInsets.symmetric(vertical: 16),
        child: Column(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 8),
            Text(label,
                style: TextStyle(
                    fontWeight: FontWeight.w700, color: context.kInk, fontSize: 13)),
            if (count >= 0)
              Padding(
                padding: const EdgeInsets.only(top: 2),
                child: Text('$count',
                    style: TextStyle(color: context.kMuted, fontSize: 12)),
              ),
          ],
        ),
      ),
    );
  }

  Widget _tile(Paper p) => Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: AppCard(
          onTap: () => _go(PaperDetailScreen(paper: p)),
          child: Row(
            children: [
              Container(
                height: 44,
                width: 44,
                decoration: BoxDecoration(
                    color: context.kChipBg, borderRadius: BorderRadius.circular(12)),
                child: Icon(Icons.article_rounded, color: context.kPrimary),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(p.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                            fontWeight: FontWeight.w700, color: context.kInk)),
                    const SizedBox(height: 2),
                    Text(p.citationLine,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style:
                            TextStyle(color: context.kMuted, fontSize: 12.5)),
                  ],
                ),
              ),
              IconButton(
                icon: Icon(Icons.more_vert_rounded, color: context.kMuted),
                onPressed: () => showPaperActions(context, p),
              ),
            ],
          ),
        ),
      );
}

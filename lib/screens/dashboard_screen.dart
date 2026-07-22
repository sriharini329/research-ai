import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/models/session.dart';
import 'package:research_ai/models/paper.dart';
import 'package:research_ai/providers/paper_store.dart';
import 'package:research_ai/widgets/app_widgets.dart';
import 'package:research_ai/screens/upload_screen.dart';
import 'package:research_ai/screens/ask_question_screen.dart';
import 'package:research_ai/screens/paper_detail_screen.dart';
import 'package:research_ai/screens/library_screen.dart';
import 'package:research_ai/screens/search_screen.dart';
import 'package:research_ai/screens/notifications_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});
  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    PaperStore.instance.load();
  }

  String get _greeting {
    final h = DateTime.now().hour;
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  void _open(Widget s) async {
    await Navigator.push(context, MaterialPageRoute(builder: (_) => s));
    PaperStore.instance.load();
  }

  @override
  Widget build(BuildContext context) {
    final name = Session.userName ?? 'Researcher';
    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () => PaperStore.instance.load(),
          child: AnimatedBuilder(
            animation: PaperStore.instance,
            builder: (context, _) {
              final store = PaperStore.instance;
              final recent = store.all.take(4).toList();
              return ListView(
                padding: kPad,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('$_greeting, $name!',
                                style: const TextStyle(
                                    fontSize: 22,
                                    fontWeight: FontWeight.w800,
                                    color: kInk)),
                            const SizedBox(height: 4),
                            const Text('What would you like to do?',
                                style: TextStyle(color: kMuted)),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.notifications_none_rounded,
                            color: kInk),
                        onPressed: () =>
                            _open(const NotificationsScreen()),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  GridView(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      mainAxisSpacing: 14,
                      crossAxisSpacing: 14,
                      mainAxisExtent: 122,
                    ),
                    children: [
                      _action(Icons.upload_file_rounded, 'Upload Paper', kBlue,
                          () => _open(const UploadScreen())),
                      _action(Icons.help_outline_rounded, 'Ask Question',
                          kOrange, () => _open(const AskQuestionScreen())),
                      _action(Icons.search_rounded, 'Find Papers', kTeal,
                          () => _open(const SearchScreen())),
                      _action(Icons.folder_rounded, 'My Library', kPink,
                          () => _open(const LibraryScreen())),
                    ],
                  ),
                  const SizedBox(height: 26),
                  const Text('Recent Papers',
                      style: TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w800,
                          color: kInk)),
                  const SizedBox(height: 12),
                  if (store.loading && recent.isEmpty)
                    const Padding(
                      padding: EdgeInsets.only(top: 24),
                      child: Center(
                          child:
                              CircularProgressIndicator(color: kPrimary)),
                    )
                  else if (recent.isEmpty)
                    AppCard(
                      child: Column(
                        children: [
                          Icon(Icons.description_outlined,
                              size: 40, color: kMuted.withOpacity(0.6)),
                          const SizedBox(height: 10),
                          const Text('No papers yet',
                              style: TextStyle(
                                  fontWeight: FontWeight.w700, color: kInk)),
                          const SizedBox(height: 4),
                          const Text('Upload your first research paper',
                              style:
                                  TextStyle(color: kMuted, fontSize: 13)),
                        ],
                      ),
                    )
                  else
                    ...recent.map((p) => _paperTile(p)),
                ],
              );
            },
          ),
        ),
      ),
    );
  }

  Widget _action(
      IconData icon, String label, Color color, VoidCallback onTap) {
    return AppCard(
      onTap: onTap,
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            height: 42,
            width: 42,
            decoration: BoxDecoration(
                color: color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: color, size: 22),
          ),
          const SizedBox(height: 12),
          Text(label,
              style: const TextStyle(
                  fontWeight: FontWeight.w700, color: kInk, fontSize: 15)),
        ],
      ),
    );
  }

  Widget _paperTile(Paper p) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: AppCard(
        onTap: () => _open(PaperDetailScreen(paper: p)),
        child: Row(
          children: [
            Container(
              height: 44,
              width: 44,
              decoration: BoxDecoration(
                  color: kChipBg, borderRadius: BorderRadius.circular(12)),
              child: const Icon(Icons.article_rounded, color: kPrimary),
            ),
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
                  const SizedBox(height: 2),
                  Text(p.citationLine,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(color: kMuted, fontSize: 12.5)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: kMuted),
          ],
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/models/paper.dart';
import 'package:research_ai/providers/paper_store.dart';
import 'package:research_ai/widgets/app_widgets.dart';
import 'package:research_ai/screens/paper_detail_screen.dart';

class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({super.key});
  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> {
  @override
  void initState() {
    super.initState();
    PaperStore.instance.load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Favorites')),
      body: AnimatedBuilder(
        animation: PaperStore.instance,
        builder: (context, _) {
          final store = PaperStore.instance;
          if (store.loading && store.all.isEmpty) {
            return const Center(child: CircularProgressIndicator(color: kPrimary));
          }
          final favs = store.favorites;
          if (favs.isEmpty) {
            return const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.favorite_border, size: 54, color: kMuted),
                  SizedBox(height: 12),
                  Text('No favorites yet',
                      style:
                          TextStyle(fontWeight: FontWeight.w700, color: kInk)),
                  SizedBox(height: 4),
                  Text('Tap the heart on a paper to save it',
                      style: TextStyle(color: kMuted, fontSize: 13)),
                ],
              ),
            );
          }
          return ListView.separated(
            padding: kPad,
            itemCount: favs.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (_, i) => _tile(favs[i]),
          );
        },
      ),
    );
  }

  Widget _tile(Paper p) => AppCard(
        onTap: () => Navigator.push(context,
            MaterialPageRoute(builder: (_) => PaperDetailScreen(paper: p))),
        child: Row(
          children: [
            const Icon(Icons.favorite, color: kPink),
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
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(color: kMuted, fontSize: 12.5)),
                ],
              ),
            ),
          ],
        ),
      );
}

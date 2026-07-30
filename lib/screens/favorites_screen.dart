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
    WidgetsBinding.instance.addPostFrameCallback((_) {
      PaperStore.instance.load();
    });
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
            return Center(child: CircularProgressIndicator(color: context.kPrimary));
          }
          final favs = store.favorites;
          if (favs.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.favorite_border, size: 54, color: context.kMuted),
                  SizedBox(height: 12),
                  Text('No favorites yet',
                      style:
                          TextStyle(fontWeight: FontWeight.w700, color: context.kInk)),
                  SizedBox(height: 4),
                  Text('Tap the heart on a paper to save it',
                      style: TextStyle(color: context.kMuted, fontSize: 13)),
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
            Icon(Icons.favorite, color: context.kPink),
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
                  Text(p.citationLine,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(color: context.kMuted, fontSize: 12.5)),
                ],
              ),
            ),
          ],
        ),
      );
}

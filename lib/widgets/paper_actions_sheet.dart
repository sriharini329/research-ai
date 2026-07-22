import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/models/paper.dart';
import 'package:research_ai/providers/paper_store.dart';
import 'package:research_ai/widgets/app_widgets.dart';
import 'package:research_ai/screens/paper_detail_screen.dart';
import 'package:research_ai/screens/chat_with_paper_screen.dart';
import 'package:research_ai/screens/cite_paper_screen.dart';
import 'package:research_ai/screens/export_options_screen.dart';

/// Bottom sheet of actions for a paper (mockup 28: Paper Actions).
void showPaperActions(BuildContext context, Paper p) {
  showModalBottomSheet(
    context: context,
    backgroundColor: kSurface,
    shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(22))),
    builder: (ctx) {
      Widget tile(IconData icon, String label, VoidCallback onTap,
          {Color color = kPrimary}) {
        return ListTile(
          leading: Icon(icon, color: color),
          title: Text(label,
              style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: color == kError ? kError : kInk)),
          onTap: () {
            Navigator.pop(ctx);
            onTap();
          },
        );
      }

      return SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 6),
                decoration: BoxDecoration(
                    color: kBorder, borderRadius: BorderRadius.circular(2)),
              ),
              tile(Icons.visibility_outlined, 'View Details',
                  () => Navigator.push(context,
                      MaterialPageRoute(builder: (_) => PaperDetailScreen(paper: p)))),
              tile(Icons.chat_bubble_outline_rounded, 'Chat with Paper',
                  () => Navigator.push(context,
                      MaterialPageRoute(builder: (_) => ChatWithPaperScreen(paper: p)))),
              tile(
                  p.favorite ? Icons.favorite : Icons.favorite_border,
                  p.favorite ? 'Remove from Favorites' : 'Add to Favorites',
                  () => PaperStore.instance.toggleFavorite(p),
                  color: kPink),
              tile(Icons.format_quote_rounded, 'Cite Paper',
                  () => Navigator.push(context,
                      MaterialPageRoute(builder: (_) => CitePaperScreen(paper: p)))),
              tile(Icons.download_outlined, 'Export',
                  () => Navigator.push(context,
                      MaterialPageRoute(builder: (_) => ExportOptionsScreen(paper: p)))),
              tile(Icons.delete_outline, 'Delete', () {
                PaperStore.instance.remove(p);
                showSnack(context, 'Paper deleted');
              }, color: kError),
            ],
          ),
        ),
      );
    },
  );
}

import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/widgets/app_widgets.dart';
import 'package:research_ai/screens/contact_support_screen.dart';

class HelpCenterScreen extends StatelessWidget {
  const HelpCenterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final faqs = const [
      ['How do I upload a paper?',
       'Go to the dashboard and tap Upload Paper, then choose a PDF, Word or text file.'],
      ['What file types are supported?',
       'PDF, Word (.docx) and plain text (.txt). Scanned image-only PDFs are not supported.'],
      ['How are citations generated?',
       'The AI reads the paper and reformats its references into IEEE, APA, MLA, Chicago or BibTeX.'],
      ['Is my data private?',
       'You control history and analytics from Privacy Settings.'],
    ];
    return Scaffold(
      appBar: AppBar(title: const Text('Help Center')),
      body: ListView(
        padding: kPad,
        children: [
          MenuTile(
              icon: Icons.menu_book_rounded,
              label: 'User Guide',
              onTap: () => showSnack(context, 'Opening user guide')),
          MenuTile(
              icon: Icons.play_circle_outline,
              label: 'Video Tutorials',
              onTap: () => showSnack(context, 'Opening tutorials')),
          MenuTile(
              icon: Icons.support_agent_rounded,
              label: 'Contact Support',
              onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (_) => const ContactSupportScreen()))),
          const SectionTitle('FAQs'),
          ...faqs.map((f) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: AppCard(
                  child: Theme(
                    data: Theme.of(context)
                        .copyWith(dividerColor: Colors.transparent),
                    child: ExpansionTile(
                      tilePadding: EdgeInsets.zero,
                      childrenPadding:
                          const EdgeInsets.only(bottom: 8),
                      iconColor: kPrimary,
                      collapsedIconColor: kMuted,
                      title: Text(f[0],
                          style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              color: kInk,
                              fontSize: 14.5)),
                      children: [
                        Align(
                          alignment: Alignment.centerLeft,
                          child: Text(f[1],
                              style: const TextStyle(
                                  color: kMuted, height: 1.5)),
                        ),
                      ],
                    ),
                  ),
                ),
              )),
        ],
      ),
    );
  }
}

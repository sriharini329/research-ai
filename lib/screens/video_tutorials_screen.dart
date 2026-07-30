import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/widgets/app_widgets.dart';

class VideoTutorialsScreen extends StatelessWidget {
  const VideoTutorialsScreen({super.key});

  final List<Map<String, String>> tutorials = const [
    {
      'title': 'How to Upload Papers',
      'description': 'Learn how to upload PDFs, Word documents, and text files to ResearchAI for instant analysis.',
      'url': 'https://www.youtube.com/results?search_query=how+to+upload+papers',
    },
    {
      'title': 'AI Summary Generation',
      'description': 'Discover how our AI instantly generates comprehensive summaries of your research papers.',
      'url': 'https://www.youtube.com/results?search_query=ai+paper+summary',
    },
    {
      'title': 'Chatting with your Paper',
      'description': 'A deep dive into using the AI Chat feature to ask specific questions about the text.',
      'url': 'https://www.youtube.com/results?search_query=chat+with+pdf+ai',
    },
    {
      'title': 'Managing Notes',
      'description': 'See how to create, edit, and organize notes linked directly to your papers.',
      'url': 'https://www.youtube.com/results?search_query=managing+research+notes',
    },
    {
      'title': 'Export Features',
      'description': 'Learn how to export papers to PDF, or download summaries, notes, and citations as text.',
      'url': 'https://www.youtube.com/results?search_query=export+pdf+tutorial',
    },
    {
      'title': 'Extracting Citations',
      'description': 'Generate IEEE, APA, or MLA citations instantly using our AI citation engine.',
      'url': 'https://www.youtube.com/results?search_query=auto+citation+generator',
    },
    {
      'title': 'Managing References',
      'description': 'How to properly extract and view the reference lists from your uploaded documents.',
      'url': 'https://www.youtube.com/results?search_query=extract+references+from+pdf',
    },
    {
      'title': 'Favorites & Reading Status',
      'description': 'Organize your library using Favorites and Reading Status tags (To Read, Reading, Completed).',
      'url': 'https://www.youtube.com/results?search_query=organize+reading+list',
    },
    {
      'title': 'Customizing Settings',
      'description': 'Configure privacy, data usage, chat history, and dark mode in Settings.',
      'url': 'https://www.youtube.com/results?search_query=app+privacy+settings',
    }
  ];

  Future<void> _launchUrl(BuildContext context, String urlString) async {
    final url = Uri.parse(urlString);
    if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
      if (context.mounted) {
        showSnack(context, 'Could not launch video', error: true);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Video Tutorials')),
      body: ListView.builder(
        padding: kPad,
        itemCount: tutorials.length,
        itemBuilder: (context, index) {
          final t = tutorials[index];
          return Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Mock Thumbnail
                  Container(
                    height: 160,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: context.kPrimary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Center(
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: context.kPrimary,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 40),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    t['title']!,
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: context.kInk,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    t['description']!,
                    style: TextStyle(
                      fontSize: 14,
                      color: context.kMuted,
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: context.kPrimary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(kRadius),
                        ),
                      ),
                      onPressed: () => _launchUrl(context, t['url']!),
                      icon: const Icon(Icons.open_in_new_rounded, size: 18),
                      label: const Text('Watch Tutorial', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

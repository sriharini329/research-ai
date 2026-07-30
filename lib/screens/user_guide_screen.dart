import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/widgets/app_widgets.dart';

class UserGuideScreen extends StatelessWidget {
  const UserGuideScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final sections = [
      {
        'title': 'Introduction',
        'content': 'Welcome to ResearchAI! This tool helps you quickly digest complex research papers using AI. You can upload documents, get instant summaries, chat with your papers, extract references, and keep organized notes.'
      },
      {
        'title': 'How to upload papers',
        'content': 'Go to the Dashboard and click the "Upload Paper" button. You can select PDF, Word (.docx), or plain text files. Once selected, the AI will automatically extract the content, title, and authors.'
      },
      {
        'title': 'How to summarize papers',
        'content': 'Once a paper is uploaded, ResearchAI automatically generates a comprehensive summary detailing what it is about, key findings, and methods. You can view this anytime from the paper details screen.'
      },
      {
        'title': 'How to ask AI questions',
        'content': 'Open any paper and tap the "Chat with AI" button. You can ask specific questions about the text, methodologies, or results, and the AI will answer directly using context from the paper.'
      },
      {
        'title': 'How to manage notes',
        'content': 'While reading a paper, you can tap the "Add Note" button to jot down your thoughts. Notes are color-coded and can be exported later. View all your notes across all papers from the Notes tab.'
      },
      {
        'title': 'How to export papers',
        'content': 'From the paper details screen, click the "Export" button. You can export the full details as a formatted PDF, or download the summary, your notes, or IEEE citations directly as text files.'
      },
      {
        'title': 'How to manage profile',
        'content': 'Navigate to the Profile tab. Here you can edit your name, update your research interests, change your password, and adjust privacy settings like data usage and chat history.'
      },
      {
        'title': 'Frequently Asked Questions',
        'content': 'Q: Can I access my data offline?\nA: Currently, an internet connection is required to communicate with the AI.\n\nQ: Is my data private?\nA: Yes! You can completely disable analytics and chat history in the Privacy Settings.'
      },
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('User Guide')),
      body: ListView.builder(
        padding: kPad,
        itemCount: sections.length,
        itemBuilder: (context, index) {
          final section = sections[index];
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: AppCard(
              child: Theme(
                data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
                child: ExpansionTile(
                  tilePadding: EdgeInsets.zero,
                  childrenPadding: const EdgeInsets.only(bottom: 12),
                  iconColor: context.kPrimary,
                  collapsedIconColor: context.kMuted,
                  title: Text(
                    section['title']!,
                    style: TextStyle(fontWeight: FontWeight.w700, color: context.kInk, fontSize: 15),
                  ),
                  children: [
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Text(
                        section['content']!,
                        style: TextStyle(color: context.kMuted, height: 1.5, fontSize: 14),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

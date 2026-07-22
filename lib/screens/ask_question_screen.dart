import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/providers/paper_store.dart';
import 'package:research_ai/widgets/app_widgets.dart';
import 'package:research_ai/screens/chat_with_paper_screen.dart';
import 'package:research_ai/screens/upload_screen.dart';

/// Lists papers to chat with, or prompts to upload.
class AskQuestionScreen extends StatefulWidget {
  const AskQuestionScreen({super.key});
  @override
  State<AskQuestionScreen> createState() => _AskQuestionScreenState();
}

class _AskQuestionScreenState extends State<AskQuestionScreen> {
  @override
  void initState() {
    super.initState();
    PaperStore.instance.load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Ask Question')),
      body: AnimatedBuilder(
        animation: PaperStore.instance,
        builder: (context, _) {
          final store = PaperStore.instance;
          if (store.loading && store.all.isEmpty) {
            return const Center(child: CircularProgressIndicator(color: kPrimary));
          }
          final papers = store.all;
          if (papers.isEmpty) {
            return Padding(
              padding: const EdgeInsets.all(28),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.help_outline_rounded,
                      size: 56, color: kPrimary.withOpacity(0.4)),
                  const SizedBox(height: 16),
                  const Text('No paper to ask about yet',
                      style: TextStyle(
                          fontWeight: FontWeight.w700,
                          color: kInk,
                          fontSize: 16)),
                  const SizedBox(height: 6),
                  const Text('Upload a paper first, then ask anything.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: kMuted)),
                  const SizedBox(height: 24),
                  PrimaryButton(
                    label: 'Upload Paper',
                    icon: Icons.upload_file_rounded,
                    onPressed: () => Navigator.pushReplacement(context,
                        MaterialPageRoute(builder: (_) => const UploadScreen())),
                  ),
                ],
              ),
            );
          }
          return ListView(
            padding: kPad,
            children: [
              const Text('Choose a paper to ask about',
                  style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: kInk)),
              const SizedBox(height: 14),
              ...papers.map((p) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: AppCard(
                      onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) => ChatWithPaperScreen(paper: p))),
                      child: Row(
                        children: [
                          Container(
                            height: 42,
                            width: 42,
                            decoration: BoxDecoration(
                                color: kChipBg,
                                borderRadius: BorderRadius.circular(12)),
                            child: const Icon(Icons.article_rounded,
                                color: kPrimary),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(p.title,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                    fontWeight: FontWeight.w700,
                                    color: kInk)),
                          ),
                          const Icon(Icons.chevron_right_rounded,
                              color: kMuted),
                        ],
                      ),
                    ),
                  )),
            ],
          );
        },
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/widgets/app_widgets.dart';

class FeedbackScreen extends StatefulWidget {
  const FeedbackScreen({super.key});
  @override
  State<FeedbackScreen> createState() => _FeedbackScreenState();
}

class _FeedbackScreenState extends State<FeedbackScreen> {
  int _rating = 5;
  final _msg = TextEditingController();

  @override
  void dispose() {
    _msg.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Feedback')),
      body: SafeArea(
        child: ListView(
          padding: kPad,
          children: [
            const SizedBox(height: 8),
            const Center(
              child: Text("We'd love to hear your feedback!",
                  style: TextStyle(
                      fontSize: 16, fontWeight: FontWeight.w700, color: kInk)),
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(5, (i) {
                final filled = i < _rating;
                return IconButton(
                  iconSize: 38,
                  icon: Icon(filled ? Icons.star_rounded : Icons.star_outline_rounded,
                      color: filled ? kOrange : kMuted),
                  onPressed: () => setState(() => _rating = i + 1),
                );
              }),
            ),
            const SizedBox(height: 12),
            LabeledField(
                hint: 'Write your feedback…',
                controller: _msg,
                maxLines: 6),
            const SizedBox(height: 24),
            PrimaryButton(
              label: 'Submit',
              onPressed: () {
                showSnack(context, 'Thanks for your feedback!');
                Navigator.pop(context);
              },
            ),
          ],
        ),
      ),
    );
  }
}

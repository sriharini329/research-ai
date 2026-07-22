import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('About App')),
      body: Padding(
        padding: kPad,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              height: 96,
              width: 96,
              decoration:
                  BoxDecoration(gradient: kViolet, borderRadius: BorderRadius.circular(26)),
              child: const Icon(Icons.psychology_alt_outlined,
                  color: Colors.white, size: 50),
            ),
            const SizedBox(height: 20),
            const Text('Research AI',
                style: TextStyle(
                    fontSize: 24, fontWeight: FontWeight.w800, color: kInk)),
            const SizedBox(height: 6),
            const Text('Version 1.0.0', style: TextStyle(color: kMuted)),
            const SizedBox(height: 18),
            const Text(
              'Empowering researchers with AI-driven insights — summarize papers, ask questions, and generate citations in seconds.',
              textAlign: TextAlign.center,
              style: TextStyle(color: kMuted, height: 1.6),
            ),
          ],
        ),
      ),
    );
  }
}

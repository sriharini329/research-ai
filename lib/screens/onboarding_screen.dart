import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/widgets/app_widgets.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});
  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _pc = PageController();
  int _page = 0;

  final _pages = const [
    _OnbData(Icons.auto_awesome, 'Understand Research Better with AI',
        'Summarize, analyze and extract insights from research papers instantly.'),
    _OnbData(Icons.format_quote_rounded, 'Get Context-Aware Citations',
        'Find the right papers and citations based on your research context.'),
    _OnbData(Icons.bolt_rounded, 'Save Time, Enhance Quality',
        'AI-powered assistance to streamline your research workflow.'),
  ];

  void _next() {
    if (_page == _pages.length - 1) {
      Navigator.pushReplacementNamed(context, '/signup');
    } else {
      _pc.nextPage(
          duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
    }
  }

  @override
  void dispose() {
    _pc.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final last = _page == _pages.length - 1;
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: () =>
                    Navigator.pushReplacementNamed(context, '/signup'),
                child: const Text('Skip',
                    style: TextStyle(color: kMuted, fontWeight: FontWeight.w600)),
              ),
            ),
            Expanded(
              child: PageView.builder(
                controller: _pc,
                onPageChanged: (i) => setState(() => _page = i),
                itemCount: _pages.length,
                itemBuilder: (_, i) {
                  final p = _pages[i];
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 28),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          height: 180,
                          width: 180,
                          decoration: BoxDecoration(
                            gradient: kViolet,
                            borderRadius: BorderRadius.circular(44),
                            boxShadow: [
                              BoxShadow(
                                  color: kPrimary.withOpacity(0.3),
                                  blurRadius: 28,
                                  offset: const Offset(0, 14)),
                            ],
                          ),
                          child: Icon(p.icon, color: Colors.white, size: 84),
                        ),
                        const SizedBox(height: 48),
                        Text(p.title,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.w800,
                                color: kInk,
                                height: 1.25)),
                        const SizedBox(height: 16),
                        Text(p.sub,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                                fontSize: 15, color: kMuted, height: 1.5)),
                      ],
                    ),
                  );
                },
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(
                _pages.length,
                (i) => AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  margin: const EdgeInsets.symmetric(horizontal: 3),
                  height: 8,
                  width: _page == i ? 22 : 8,
                  decoration: BoxDecoration(
                    color: _page == i ? kPrimary : kBorder,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(24),
              child: PrimaryButton(
                  label: last ? 'Get Started' : 'Next', onPressed: _next),
            ),
          ],
        ),
      ),
    );
  }
}

class _OnbData {
  final IconData icon;
  final String title;
  final String sub;
  const _OnbData(this.icon, this.title, this.sub);
}

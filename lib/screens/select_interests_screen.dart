import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/models/session.dart';
import 'package:research_ai/services/api_service.dart';
import 'package:research_ai/widgets/app_widgets.dart';

class SelectInterestsScreen extends StatefulWidget {
  const SelectInterestsScreen({super.key});
  @override
  State<SelectInterestsScreen> createState() => _SelectInterestsScreenState();
}

class _SelectInterestsScreenState extends State<SelectInterestsScreen> {
  final _all = const [
    'AI / ML', 'Data Science', 'NLP', 'Computer Vision',
    'Healthcare', 'Education', 'Robotics', 'Cybersecurity',
    'Blockchain', 'IoT', 'Other',
  ];
  final Set<String> _selected = {};
  bool _saving = false;

  Future<void> _continue() async {
    setState(() => _saving = true);
    Session.interests = _selected.toList();
    try {
      if (Session.userId != null) {
        await ApiService.updateProfile(Session.userId!,
            interests: _selected.toList());
      }
    } catch (_) {
      // non-blocking; interests still kept in session
    }
    if (mounted) {
      Navigator.pushReplacementNamed(context, '/main');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 8),
              const Text('Select Your Interests',
                  style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w800,
                      color: kInk)),
              const SizedBox(height: 6),
              const Text('Choose your research areas',
                  style: TextStyle(color: kMuted)),
              const SizedBox(height: 28),
              Expanded(
                child: SingleChildScrollView(
                  child: Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: _all.map((t) {
                      final on = _selected.contains(t);
                      return GestureDetector(
                        onTap: () => setState(() =>
                            on ? _selected.remove(t) : _selected.add(t)),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 180),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 18, vertical: 12),
                          decoration: BoxDecoration(
                            gradient: on ? kViolet : null,
                            color: on ? null : kChipBg,
                            borderRadius: BorderRadius.circular(30),
                          ),
                          child: Text(t,
                              style: TextStyle(
                                  color: on ? Colors.white : kInk,
                                  fontWeight: FontWeight.w600)),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ),
              PrimaryButton(
                  label: 'Continue',
                  loading: _saving,
                  onPressed: _continue),
            ],
          ),
        ),
      ),
    );
  }
}

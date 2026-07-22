import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/models/session.dart';
import 'package:research_ai/services/api_service.dart';
import 'package:research_ai/widgets/app_widgets.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});
  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  late final TextEditingController _name =
      TextEditingController(text: Session.userName ?? '');
  late final TextEditingController _email =
      TextEditingController(text: Session.userEmail ?? '');

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final name = Session.userName ?? 'R';
    return Scaffold(
      appBar: AppBar(title: const Text('Edit Profile')),
      body: SafeArea(
        child: ListView(
          padding: kPad,
          children: [
            Center(
              child: Container(
                height: 90,
                width: 90,
                decoration:
                    BoxDecoration(gradient: kViolet, shape: BoxShape.circle),
                child: Center(
                  child: Text(name.isNotEmpty ? name[0].toUpperCase() : 'R',
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 34,
                          fontWeight: FontWeight.w800)),
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Text('Name',
                style: TextStyle(fontWeight: FontWeight.w600, color: kInk)),
            const SizedBox(height: 8),
            LabeledField(hint: 'Name', controller: _name),
            const SizedBox(height: 16),
            const Text('Email',
                style: TextStyle(fontWeight: FontWeight.w600, color: kInk)),
            const SizedBox(height: 8),
            LabeledField(
                hint: 'Email',
                controller: _email,
                keyboard: TextInputType.emailAddress),
            const SizedBox(height: 28),
            PrimaryButton(
              label: 'Save Changes',
              onPressed: () async {
                try {
                  if (Session.userId != null) {
                    await ApiService.updateProfile(Session.userId!,
                        name: _name.text.trim());
                  }
                  Session.userName = _name.text.trim();
                  if (context.mounted) {
                    showSnack(context, 'Profile updated');
                    Navigator.pop(context);
                  }
                } catch (e) {
                  if (context.mounted) showSnack(context, e.toString(), error: true);
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}

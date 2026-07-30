import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/services/document_service.dart';
import 'package:research_ai/widgets/app_widgets.dart';
import 'package:research_ai/screens/processing_screen.dart';

class UploadScreen extends StatefulWidget {
  const UploadScreen({super.key});
  @override
  State<UploadScreen> createState() => _UploadScreenState();
}

class _UploadScreenState extends State<UploadScreen> {
  bool _busy = false;

  Future<void> _browse() async {
    setState(() => _busy = true);
    try {
      final paper = await DocumentService.pickAndExtract();
      if (!mounted) return;
      setState(() => _busy = false);
      if (paper == null) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) =>
              ProcessingScreen(fileName: paper.fileName, fileBytes: paper.fileBytes),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _busy = false);
      showSnack(context, e.toString().replaceFirst('Exception: ', ''),
          error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Upload Research Paper')),
      body: Padding(
        padding: kPad,
        child: Column(
          children: [
            const SizedBox(height: 20),
            GestureDetector(
              onTap: _busy ? null : _browse,
              child: DottedCard(busy: _busy),
            ),
            const SizedBox(height: 24),
            PrimaryButton(
              label: _busy ? 'Reading…' : 'Browse Files',
              loading: _busy,
              icon: Icons.folder_open_rounded,
              onPressed: _browse,
            ),
            const SizedBox(height: 16),
            Text('Supports: PDF, Word (.docx), TXT',
                style: TextStyle(color: context.kMuted, fontSize: 13)),
          ],
        ),
      ),
    );
  }
}

class DottedCard extends StatelessWidget {
  final bool busy;
  const DottedCard({super.key, required this.busy});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 56),
      decoration: BoxDecoration(
        color: context.kChipBg.withOpacity(0.5),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
            color: context.kPrimary.withOpacity(0.4), width: 1.5, style: BorderStyle.solid),
      ),
      child: Column(
        children: [
          Container(
            height: 78,
            width: 78,
            decoration: BoxDecoration(
                color: context.kPrimary.withOpacity(0.10),
                shape: BoxShape.circle),
            child: busy
                ? Padding(
                    padding: EdgeInsets.all(24),
                    child: CircularProgressIndicator(
                        strokeWidth: 3, color: context.kPrimary))
                : Icon(Icons.cloud_upload_outlined,
                    color: context.kPrimary, size: 40),
          ),
          const SizedBox(height: 18),
          Text(busy ? 'Reading document…' : 'Drag & drop your file here',
              style: TextStyle(
                  fontWeight: FontWeight.w700, color: context.kInk, fontSize: 15)),
          const SizedBox(height: 4),
          Text('or tap to choose a file',
              style: TextStyle(color: context.kMuted, fontSize: 13)),
        ],
      ),
    );
  }
}

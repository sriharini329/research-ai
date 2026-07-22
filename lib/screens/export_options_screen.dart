import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/models/paper.dart';
import 'package:research_ai/widgets/app_widgets.dart';

class ExportOptionsScreen extends StatelessWidget {
  final Paper paper;
  const ExportOptionsScreen({super.key, required this.paper});

  @override
  Widget build(BuildContext context) {
    final opts = [
      _Opt(Icons.picture_as_pdf_outlined, 'Export as PDF', kPink),
      _Opt(Icons.summarize_outlined, 'Export Summary', kBlue),
      _Opt(Icons.sticky_note_2_outlined, 'Export Notes', kOrange),
      _Opt(Icons.format_quote_rounded, 'Export Citation', kTeal),
    ];
    return Scaffold(
      appBar: AppBar(title: const Text('Export Options')),
      body: ListView(
        padding: kPad,
        children: [
          Text(paper.title,
              style: const TextStyle(
                  fontWeight: FontWeight.w800, color: kInk, fontSize: 16)),
          const SizedBox(height: 16),
          ...opts.map((o) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: AppCard(
                  onTap: () =>
                      showSnack(context, '${o.label} — coming soon'),
                  child: Row(
                    children: [
                      Container(
                        height: 42,
                        width: 42,
                        decoration: BoxDecoration(
                            color: o.color.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(12)),
                        child: Icon(o.icon, color: o.color),
                      ),
                      const SizedBox(width: 14),
                      Text(o.label,
                          style: const TextStyle(
                              fontWeight: FontWeight.w700, color: kInk)),
                      const Spacer(),
                      const Icon(Icons.chevron_right_rounded, color: kMuted),
                    ],
                  ),
                ),
              )),
        ],
      ),
    );
  }
}

class _Opt {
  final IconData icon;
  final String label;
  final Color color;
  _Opt(this.icon, this.label, this.color);
}

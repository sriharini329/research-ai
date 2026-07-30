import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/models/paper.dart';
import 'package:research_ai/widgets/app_widgets.dart';
import 'package:research_ai/services/api_service.dart';
import 'package:research_ai/utils/file_saver/file_saver.dart';
import 'package:syncfusion_flutter_pdf/pdf.dart';
import 'dart:typed_data';

class ExportOptionsScreen extends StatefulWidget {
  final Paper paper;
  const ExportOptionsScreen({super.key, required this.paper});

  @override
  State<ExportOptionsScreen> createState() => _ExportOptionsScreenState();
}

class _ExportOptionsScreenState extends State<ExportOptionsScreen> {
  int? _loadingIndex;

  Future<void> _exportPdf() async {
    final pdf = PdfDocument();
    final page = pdf.pages.add();
    final bounds = page.getClientSize();
    
    final titleFont = PdfStandardFont(PdfFontFamily.helvetica, 24, style: PdfFontStyle.bold);
    final headerFont = PdfStandardFont(PdfFontFamily.helvetica, 16, style: PdfFontStyle.bold);
    final textFont = PdfStandardFont(PdfFontFamily.helvetica, 12);

    double y = 0;
    
    // Helper to draw text
    double drawText(String text, PdfFont font, double yOffset) {
      if (text.isEmpty) return yOffset;
      final format = PdfStringFormat(wordWrap: PdfWordWrapType.word);
      final layoutResult = PdfTextElement(text: text, font: font, format: format)
          .draw(page: page, bounds: Rect.fromLTWH(0, yOffset, bounds.width, bounds.height - yOffset));
      return layoutResult!.bounds.bottom + 10;
    }

    y = drawText(widget.paper.title, titleFont, y);
    if (widget.paper.authors.isNotEmpty) {
      y = drawText(widget.paper.authors, textFont, y);
    }
    
    if (widget.paper.abstractText.isNotEmpty) {
      y = drawText("Abstract", headerFont, y);
      y = drawText(widget.paper.abstractText, textFont, y);
    }

    if (widget.paper.summary.isNotEmpty) {
      y = drawText("Summary", headerFont, y);
      y = drawText(widget.paper.summary, textFont, y);
    }

    if (widget.paper.keywords.isNotEmpty) {
      y = drawText("Keywords", headerFont, y);
      y = drawText(widget.paper.keywords, textFont, y);
    }

    if (widget.paper.references.isNotEmpty) {
      y = drawText("References", headerFont, y);
      y = drawText(widget.paper.references, textFont, y);
    }

    final bytes = await pdf.save();
    pdf.dispose();
    
    final safeTitle = widget.paper.title.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '_');
    await saveFileCustom('$safeTitle.pdf', Uint8List.fromList(bytes), ext: 'pdf');
  }

  Future<void> _exportSummary() async {
    final summary = widget.paper.summary;
    if (summary.isEmpty) throw Exception('No summary available for this paper.');
    final safeTitle = widget.paper.title.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '_');
    final bytes = Uint8List.fromList(utf8.encode(summary));
    await saveFileCustom('${safeTitle}_Summary.txt', bytes, ext: 'txt');
  }

  Future<void> _exportNotes() async {
    final notes = await ApiService.getPaperNotes(widget.paper.id);
    if (notes.isEmpty) throw Exception('No notes found for this paper.');
    
    final buffer = StringBuffer();
    buffer.writeln('Notes for: ${widget.paper.title}');
    buffer.writeln('=========================================');
    for (var n in notes) {
      buffer.writeln('\n-- Note --');
      buffer.writeln(n.content);
    }
    
    final safeTitle = widget.paper.title.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '_');
    final bytes = Uint8List.fromList(utf8.encode(buffer.toString()));
    await saveFileCustom('${safeTitle}_Notes.txt', bytes, ext: 'txt');
  }

  Future<void> _exportCitation() async {
    final citations = await ApiService.getCitations(widget.paper.id);
    if (citations.isEmpty) throw Exception('No citations generated for this paper.');
    
    final safeTitle = widget.paper.title.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '_');
    final bytes = Uint8List.fromList(utf8.encode(citations));
    await saveFileCustom('${safeTitle}_Citations.txt', bytes, ext: 'txt');
  }

  Future<void> _handleExport(int index) async {
    setState(() => _loadingIndex = index);
    try {
      if (index == 0) {
        await _exportPdf();
      } else if (index == 1) {
        await _exportSummary();
      } else if (index == 2) {
        await _exportNotes();
      } else if (index == 3) {
        await _exportCitation();
      }
      
      if (!mounted) return;
      showSnack(context, 'Export successful');
    } catch (e) {
      if (!mounted) return;
      showSnack(context, e.toString().replaceFirst('Exception: ', ''), error: true);
    } finally {
      if (mounted) setState(() => _loadingIndex = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final opts = [
      _Opt(Icons.picture_as_pdf_outlined, 'Export as PDF', context.kPink),
      _Opt(Icons.summarize_outlined, 'Export Summary', context.kBlue),
      _Opt(Icons.sticky_note_2_outlined, 'Export Notes', context.kOrange),
      _Opt(Icons.format_quote_rounded, 'Export Citation', context.kTeal),
    ];
    return Scaffold(
      appBar: AppBar(title: const Text('Export Options')),
      body: ListView(
        padding: kPad,
        children: [
          Text(widget.paper.title,
              style: TextStyle(
                  fontWeight: FontWeight.w800, color: context.kInk, fontSize: 16)),
          const SizedBox(height: 16),
          ...opts.asMap().entries.map((entry) {
            final idx = entry.key;
            final o = entry.value;
            final isLoading = _loadingIndex == idx;
            final isDisabled = _loadingIndex != null && !isLoading;
            
            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Opacity(
                opacity: isDisabled ? 0.5 : 1.0,
                child: AppCard(
                  onTap: isDisabled || isLoading ? null : () => _handleExport(idx),
                  child: Row(
                    children: [
                      Container(
                        height: 42,
                        width: 42,
                        decoration: BoxDecoration(
                            color: o.color.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(12)),
                        child: isLoading 
                            ? Padding(
                                padding: const EdgeInsets.all(10),
                                child: CircularProgressIndicator(strokeWidth: 2, color: o.color)
                              )
                            : Icon(o.icon, color: o.color),
                      ),
                      const SizedBox(width: 14),
                      Text(isLoading ? 'Exporting...' : o.label,
                          style: TextStyle(
                              fontWeight: FontWeight.w700, color: context.kInk)),
                      const Spacer(),
                      Icon(Icons.chevron_right_rounded, color: context.kMuted),
                    ],
                  ),
                ),
              ),
            );
          }),
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

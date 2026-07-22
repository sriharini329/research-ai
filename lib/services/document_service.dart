import 'package:file_picker/file_picker.dart';
import 'package:syncfusion_flutter_pdf/pdf.dart';
import 'package:docx_to_text/docx_to_text.dart';

class PickedPaper {
  final String fileName;
  final String text;

  PickedPaper(this.fileName, this.text);
}

class DocumentService {
  static Future<PickedPaper?> pickAndExtract() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'docx', 'txt'],
      withData: true,
    );

    if (result == null) return null;

    final picked = result.files.single;

    if (picked.bytes == null) {
      throw Exception("Unable to read file.");
    }

    final bytes = picked.bytes!;
    final ext = (picked.extension ?? '').toLowerCase();

    String text;

    switch (ext) {
      case 'pdf':
        final document = PdfDocument(inputBytes: bytes);
        final extractor = PdfTextExtractor(document);

        text = extractor.extractText();
        document.dispose();
        break;

      case 'docx':
        text = docxToText(bytes);
        break;

      case 'txt':
        text = String.fromCharCodes(bytes);
        break;

      default:
        throw Exception("Unsupported file type");
    }

    if (text.trim().isEmpty) {
      throw Exception("No text found in the selected file.");
    }

    return PickedPaper(picked.name, text);
  }
}
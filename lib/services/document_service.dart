import 'dart:convert';
import 'package:file_picker/file_picker.dart';

class PickedPaper {
  final String fileName;
  final String fileBytes;

  PickedPaper(this.fileName, this.fileBytes);
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

    // Convert bytes to base64 string to send to backend
    final base64String = base64Encode(picked.bytes!);

    return PickedPaper(picked.name, base64String);
  }
}
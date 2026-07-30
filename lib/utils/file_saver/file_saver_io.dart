import 'dart:io';
import 'dart:typed_data';
import 'package:file_picker/file_picker.dart';

Future<void> saveFileCustom(String fileName, Uint8List bytes, {String? ext}) async {
  final path = await FilePicker.platform.saveFile(
    dialogTitle: 'Save $fileName',
    fileName: fileName,
    type: ext != null ? FileType.custom : FileType.any,
    allowedExtensions: ext != null ? [ext] : null,
  );

  if (path != null) {
    final file = File(path);
    await file.writeAsBytes(bytes);
  }
}

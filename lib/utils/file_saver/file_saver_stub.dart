import 'dart:typed_data';

Future<void> saveFileCustom(String fileName, Uint8List bytes, {String? ext}) async {
  throw UnsupportedError('Cannot save files without dart:html or dart:io');
}

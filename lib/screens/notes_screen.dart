import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/models/note.dart';
import 'package:research_ai/providers/note_store.dart';
import 'package:research_ai/screens/add_note_screen.dart';

class NotesScreen extends StatefulWidget {
  const NotesScreen({super.key});
  @override
  State<NotesScreen> createState() => _NotesScreenState();
}

class _NotesScreenState extends State<NotesScreen> {
  @override
  void initState() {
    super.initState();
    NoteStore.instance.load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Notes & Highlights')),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: kPrimary,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Add Note',
            style:
                TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
        onPressed: () async {
          await Navigator.push(context,
              MaterialPageRoute(builder: (_) => const AddNoteScreen()));
        },
      ),
      body: AnimatedBuilder(
        animation: NoteStore.instance,
        builder: (context, _) {
          final store = NoteStore.instance;
          if (store.loading && store.all.isEmpty) {
            return const Center(child: CircularProgressIndicator(color: kPrimary));
          }
          final notes = store.all;
          if (notes.isEmpty) {
            return const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.sticky_note_2_outlined, size: 54, color: kMuted),
                  SizedBox(height: 12),
                  Text('No notes yet',
                      style:
                          TextStyle(fontWeight: FontWeight.w700, color: kInk)),
                  SizedBox(height: 4),
                  Text('Tap Add Note to capture an idea',
                      style: TextStyle(color: kMuted, fontSize: 13)),
                ],
              ),
            );
          }
          return ListView.separated(
            padding: kPad,
            itemCount: notes.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (_, i) => _card(notes[i]),
          );
        },
      ),
    );
  }

  Widget _card(Note n) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Color(n.colorValue).withOpacity(0.10),
        borderRadius: BorderRadius.circular(kRadius),
        border: Border(left: BorderSide(color: Color(n.colorValue), width: 4)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(n.content,
                    style: const TextStyle(color: kInk, height: 1.4)),
                if (n.paperTitle.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Text(n.paperTitle,
                      style: const TextStyle(color: kMuted, fontSize: 12)),
                ],
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.delete_outline, color: kMuted, size: 20),
            onPressed: () => NoteStore.instance.remove(n),
          ),
        ],
      ),
    );
  }
}

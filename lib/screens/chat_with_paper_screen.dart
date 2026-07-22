import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/models/paper.dart';
import 'package:research_ai/models/session.dart';
import 'package:research_ai/models/chat_message.dart';
import 'package:research_ai/services/paper_service.dart';
import 'package:research_ai/services/api_service.dart';

class ChatWithPaperScreen extends StatefulWidget {
  final Paper paper;
  const ChatWithPaperScreen({super.key, required this.paper});
  @override
  State<ChatWithPaperScreen> createState() => _ChatWithPaperScreenState();
}

class _ChatWithPaperScreenState extends State<ChatWithPaperScreen> {
  final _ai = PaperService();
  final _ctrl = TextEditingController();
  final _scroll = ScrollController();
  final List<ChatMessage> _messages = [];
  bool _answering = false;
  bool _loading = true;

  final _suggestions = const [
    'What is the main contribution of this paper?',
    'Explain the methodology simply',
    'What are the limitations?',
  ];

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    try {
      // ensure we have the paper text for Groq
      if (widget.paper.content.isEmpty) {
        final full = await ApiService.getPaperDetail(widget.paper.id);
        widget.paper.content = full.content;
      }
      final msgs = await ApiService.getChat(widget.paper.id);
      _messages.addAll(msgs);
    } catch (_) {}
    if (mounted) {
      setState(() => _loading = false);
      _down();
    }
  }

  @override
  void dispose() {
    _ctrl.dispose();
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _send([String? preset]) async {
    final q = (preset ?? _ctrl.text).trim();
    if (q.isEmpty || _answering) return;
    _ctrl.clear();
    setState(() {
      _messages.add(ChatMessage(text: q, isUser: true));
      _answering = true;
    });
    _down();

    // save user message (fire and forget)
    try {
      await ApiService.saveChatMessage(
          widget.paper.id, Session.userId!, 'user', q);
    } catch (_) {}

    // Groq answer in app
    final a = await _ai.ask(
        text: widget.paper.content, history: _messages, question: q);
    if (!mounted) return;
    setState(() {
      _messages.add(ChatMessage(text: a, isUser: false));
      _answering = false;
    });
    _down();

    // save ai message
    try {
      await ApiService.saveChatMessage(
          widget.paper.id, Session.userId!, 'ai', a);
    } catch (_) {}
  }

  void _down() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) {
        _scroll.animateTo(_scroll.position.maxScrollExtent + 120,
            duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Chat with Paper')),
      body: Column(
        children: [
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator(color: kPrimary))
                : _messages.isEmpty
                    ? _empty()
                    : ListView.builder(
                        controller: _scroll,
                        padding: const EdgeInsets.all(16),
                        itemCount: _messages.length + (_answering ? 1 : 0),
                        itemBuilder: (_, i) => i == _messages.length
                            ? _typing()
                            : _bubble(_messages[i]),
                      ),
          ),
          _composer(),
        ],
      ),
    );
  }

  Widget _empty() => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.chat_bubble_outline_rounded,
                size: 52, color: kPrimary.withOpacity(0.4)),
            const SizedBox(height: 14),
            const Text('Ask anything about this paper',
                style: TextStyle(
                    fontWeight: FontWeight.w700, color: kInk, fontSize: 16)),
            const SizedBox(height: 18),
            ..._suggestions.map((s) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: GestureDetector(
                    onTap: () => _send(s),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                          color: kChipBg,
                          borderRadius: BorderRadius.circular(12)),
                      child: Text(s,
                          style: const TextStyle(
                              color: kPrimaryDark, fontWeight: FontWeight.w600)),
                    ),
                  ),
                )),
          ],
        ),
      );

  Widget _bubble(ChatMessage m) {
    final u = m.isUser;
    return Align(
      alignment: u ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 5),
        padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 11),
        constraints:
            BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.78),
        decoration: BoxDecoration(
          gradient: u ? kViolet : null,
          color: u ? null : kSurface,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(u ? 16 : 4),
            bottomRight: Radius.circular(u ? 4 : 16),
          ),
          border: u ? null : Border.all(color: kBorder),
        ),
        child: SelectableText(m.text,
            style: TextStyle(
                color: u ? Colors.white : kInk, fontSize: 14.5, height: 1.4)),
      ),
    );
  }

  Widget _typing() => Align(
        alignment: Alignment.centerLeft,
        child: Container(
          margin: const EdgeInsets.symmetric(vertical: 5),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
              color: kSurface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: kBorder)),
          child: const SizedBox(
              height: 16,
              width: 16,
              child: CircularProgressIndicator(strokeWidth: 2, color: kPrimary)),
        ),
      );

  Widget _composer() => Container(
        padding: const EdgeInsets.fromLTRB(12, 8, 12, 10),
        decoration: const BoxDecoration(
            color: kSurface, border: Border(top: BorderSide(color: kBorder))),
        child: SafeArea(
          top: false,
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _ctrl,
                  minLines: 1,
                  maxLines: 4,
                  onSubmitted: (_) => _send(),
                  decoration: InputDecoration(
                    hintText: 'Ask a question…',
                    fillColor: kBackground,
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 12),
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide.none),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: () => _send(),
                child: Container(
                  height: 46,
                  width: 46,
                  decoration: const BoxDecoration(
                      gradient: kViolet, shape: BoxShape.circle),
                  child: const Icon(Icons.send_rounded,
                      color: Colors.white, size: 20),
                ),
              ),
            ],
          ),
        ),
      );
}

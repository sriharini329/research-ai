import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/screens/dashboard_screen.dart';
import 'package:research_ai/screens/search_screen.dart';
import 'package:research_ai/screens/library_screen.dart';
import 'package:research_ai/screens/profile_screen.dart';
import 'package:research_ai/providers/paper_store.dart';
import 'package:research_ai/providers/note_store.dart';
import 'package:provider/provider.dart';
import 'package:research_ai/providers/notification_store.dart';
import 'package:research_ai/models/session.dart';

class MainScaffold extends StatefulWidget {
  const MainScaffold({super.key});
  @override
  State<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends State<MainScaffold> {
  int _index = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      PaperStore.instance.load();
      NoteStore.instance.load();
      if (Session.userId != null) {
        Provider.of<NotificationStore>(context, listen: false).startPolling(Session.userId!);
      }
    });
  }
  final _pages = const [
    DashboardScreen(),
    SearchScreen(),
    LibraryScreen(),
    ProfileScreen(),
  ];

  final _items = const [
    _NavItem(Icons.home_outlined, Icons.home_rounded, 'Home'),
    _NavItem(Icons.search_outlined, Icons.search_rounded, 'Search'),
    _NavItem(Icons.folder_outlined, Icons.folder_rounded, 'Library'),
    _NavItem(Icons.person_outline, Icons.person_rounded, 'Profile'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _index, children: _pages),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: context.kSurface,
          border: Border(top: BorderSide(color: context.kBorder)),
        ),
        child: SafeArea(
          top: false,
          child: SizedBox(
            height: 64,
            child: Row(
              children: List.generate(_items.length, (i) {
                final on = _index == i;
                final item = _items[i];
                return Expanded(
                  child: InkWell(
                    onTap: () => setState(() => _index = i),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(on ? item.active : item.icon,
                            color: on ? context.kPrimary : context.kMuted, size: 25),
                        const SizedBox(height: 4),
                        Text(
                          item.label,
                          style: TextStyle(
                            fontSize: 11.5,
                            fontWeight:
                                on ? FontWeight.w700 : FontWeight.w500,
                            color: on ? context.kPrimary : context.kMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }),
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem {
  final IconData icon;
  final IconData active;
  final String label;
  const _NavItem(this.icon, this.active, this.label);
}

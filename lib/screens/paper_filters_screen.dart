import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/widgets/app_widgets.dart';

class PaperFiltersScreen extends StatefulWidget {
  const PaperFiltersScreen({super.key});
  @override
  State<PaperFiltersScreen> createState() => _PaperFiltersScreenState();
}

class _PaperFiltersScreenState extends State<PaperFiltersScreen> {
  RangeValues _years = const RangeValues(2015, 2024);
  String _type = 'All';
  String _sort = 'Relevance';
  final _types = const ['All', 'Journal', 'Conference', 'Preprint'];
  final _sorts = const ['Relevance', 'Newest', 'Oldest'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Paper Filters')),
      body: ListView(
        padding: kPad,
        children: [
          const SectionTitle('Year Range'),
          RangeSlider(
            values: _years,
            min: 2000,
            max: 2025,
            divisions: 25,
            activeColor: kPrimary,
            labels: RangeLabels('${_years.start.round()}',
                '${_years.end.round()}'),
            onChanged: (v) => setState(() => _years = v),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('${_years.start.round()}',
                  style: const TextStyle(color: kMuted)),
              Text('${_years.end.round()}',
                  style: const TextStyle(color: kMuted)),
            ],
          ),
          const SectionTitle('Document Type'),
          Wrap(
            spacing: 10,
            children: _types
                .map((t) => ChoiceChip(
                      label: Text(t),
                      selected: _type == t,
                      selectedColor: kPrimary,
                      labelStyle: TextStyle(
                          color: _type == t ? Colors.white : kInk,
                          fontWeight: FontWeight.w600),
                      backgroundColor: kChipBg,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20)),
                      onSelected: (_) => setState(() => _type = t),
                    ))
                .toList(),
          ),
          const SectionTitle('Sort By'),
          ..._sorts.map((s) => RadioListTile<String>(
                value: s,
                groupValue: _sort,
                activeColor: kPrimary,
                contentPadding: EdgeInsets.zero,
                title: Text(s, style: const TextStyle(color: kInk)),
                onChanged: (v) => setState(() => _sort = v!),
              )),
          const SizedBox(height: 16),
          PrimaryButton(
              label: 'Apply Filters',
              onPressed: () => Navigator.pop(context)),
        ],
      ),
    );
  }
}

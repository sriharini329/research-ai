import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';

/// Solid violet primary button with loading state.
class PrimaryButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final bool loading;
  final IconData? icon;
  final double height;
  const PrimaryButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.loading = false,
    this.icon,
    this.height = 52,
  });

  @override
  Widget build(BuildContext context) {
    final disabled = onPressed == null || loading;
    return Opacity(
      opacity: disabled ? 0.6 : 1,
      child: Container(
        height: height,
        decoration: BoxDecoration(
          gradient: kViolet,
          borderRadius: BorderRadius.circular(kRadius),
          boxShadow: [
            BoxShadow(
                color: kPrimary.withOpacity(0.28),
                blurRadius: 14,
                offset: const Offset(0, 7)),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            borderRadius: BorderRadius.circular(kRadius),
            onTap: loading ? null : onPressed,
            child: Center(
              child: loading
                  ? const SizedBox(
                      height: 22,
                      width: 22,
                      child: CircularProgressIndicator(
                          strokeWidth: 2.3, color: Colors.white))
                  : Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (icon != null) ...[
                          Icon(icon, color: Colors.white, size: 20),
                          const SizedBox(width: 9),
                        ],
                        Text(label,
                            style: const TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.w700)),
                      ],
                    ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Outlined secondary button.
class SecondaryButton extends StatelessWidget {
  final String label;
  final VoidCallback onPressed;
  final IconData? icon;
  const SecondaryButton(
      {super.key, required this.label, required this.onPressed, this.icon});

  @override
  Widget build(BuildContext context) {
    return OutlinedButton.icon(
      style: OutlinedButton.styleFrom(
        foregroundColor: kPrimary,
        side: const BorderSide(color: kPrimary),
        minimumSize: const Size.fromHeight(50),
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(kRadius)),
      ),
      icon: Icon(icon ?? Icons.circle, size: 18),
      label: Text(label, style: const TextStyle(fontWeight: FontWeight.w700)),
      onPressed: onPressed,
    );
  }
}

/// Single line text field.
class LabeledField extends StatelessWidget {
  final String hint;
  final TextEditingController controller;
  final bool obscure;
  final TextInputType keyboard;
  final Widget? suffix;
  final IconData? icon;
  final int maxLines;
  const LabeledField({
    super.key,
    required this.hint,
    required this.controller,
    this.obscure = false,
    this.keyboard = TextInputType.text,
    this.suffix,
    this.icon,
    this.maxLines = 1,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      obscureText: obscure,
      keyboardType: keyboard,
      maxLines: obscure ? 1 : maxLines,
      decoration: InputDecoration(
        hintText: hint,
        prefixIcon: icon == null ? null : Icon(icon, color: kMuted, size: 20),
        suffixIcon: suffix,
      ),
    );
  }
}

/// White rounded card.
class AppCard extends StatelessWidget {
  final Widget child;
  final EdgeInsets padding;
  final VoidCallback? onTap;
  const AppCard(
      {super.key,
      required this.child,
      this.padding = const EdgeInsets.all(16),
      this.onTap});

  @override
  Widget build(BuildContext context) {
    final card = Container(
      width: double.infinity,
      padding: padding,
      decoration: BoxDecoration(
        color: kSurface,
        borderRadius: BorderRadius.circular(kRadius),
        border: Border.all(color: kBorder),
      ),
      child: child,
    );
    if (onTap == null) return card;
    return GestureDetector(onTap: onTap, child: card);
  }
}

/// Section title for lists/settings.
class SectionTitle extends StatelessWidget {
  final String text;
  const SectionTitle(this.text, {super.key});
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(4, 18, 4, 10),
        child: Text(text,
            style: const TextStyle(
                fontWeight: FontWeight.w800, color: kInk, fontSize: 15)),
      );
}

/// Tappable row with icon + label + chevron.
class MenuTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String? trailingText;
  final VoidCallback onTap;
  final bool danger;
  const MenuTile({
    super.key,
    required this.icon,
    required this.label,
    required this.onTap,
    this.trailingText,
    this.danger = false,
  });

  @override
  Widget build(BuildContext context) {
    final color = danger ? kError : kPrimary;
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Material(
        color: kSurface,
        borderRadius: BorderRadius.circular(kRadius),
        child: InkWell(
          borderRadius: BorderRadius.circular(kRadius),
          onTap: onTap,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
            decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(kRadius),
                border: Border.all(color: kBorder)),
            child: Row(
              children: [
                Icon(icon, color: color, size: 21),
                const SizedBox(width: 14),
                Text(label,
                    style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: danger ? kError : kInk,
                        fontSize: 15)),
                const Spacer(),
                if (trailingText != null)
                  Text(trailingText!,
                      style: const TextStyle(color: kMuted, fontSize: 13)),
                if (!danger) ...[
                  const SizedBox(width: 6),
                  const Icon(Icons.chevron_right_rounded, color: kMuted),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Row with a switch.
class ToggleTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String? sub;
  final bool value;
  final ValueChanged<bool> onChanged;
  const ToggleTile({
    super.key,
    required this.icon,
    required this.label,
    required this.value,
    required this.onChanged,
    this.sub,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
          color: kSurface,
          borderRadius: BorderRadius.circular(kRadius),
          border: Border.all(color: kBorder)),
      child: Row(
        children: [
          Icon(icon, color: kPrimary, size: 21),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: const TextStyle(
                        fontWeight: FontWeight.w600, color: kInk)),
                if (sub != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 2),
                    child: Text(sub!,
                        style: const TextStyle(color: kMuted, fontSize: 12)),
                  ),
              ],
            ),
          ),
          Switch(value: value, activeColor: kPrimary, onChanged: onChanged),
        ],
      ),
    );
  }
}

void showSnack(BuildContext context, String msg, {bool error = false}) {
  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
    content: Text(msg),
    backgroundColor: error ? kError : kInk,
    behavior: SnackBarBehavior.floating,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
  ));
}

import 'package:flutter/material.dart';
import 'package:flutter_starter/features/email_authentication/email_authentication_screen.dart';
import 'package:flutter_starter/features/sms_authentication/sms_authentication_screen.dart';
import 'package:flutter_starter/models/auth_action.dart';
import 'package:privy_flutter/privy_flutter.dart';

/// Widget that displays all linked accounts for a Privy user
class LinkedAccountsWidget extends StatelessWidget {
  final PrivyUser user;
  final VoidCallback? onAccountLinked;

  const LinkedAccountsWidget({
    super.key,
    required this.user,
    this.onAccountLinked,
  });

  @override
  Widget build(BuildContext context) {
    final hasEmail = user.linkedAccounts.any(
      (account) => account is EmailAccount,
    );
    final hasPhone = user.linkedAccounts.any(
      (account) => account is PhoneNumberAccount,
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text("Linked Accounts", style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 10),
        if (user.linkedAccounts.isEmpty)
          const Text("No linked accounts", style: TextStyle(color: Colors.grey))
        else
          ...user.linkedAccounts.map(
            (account) => _buildAccountTile(account, context),
          ),

        // Show link buttons for accounts that aren't linked yet
        if (!hasEmail) _buildLinkEmailButton(context),
        if (!hasPhone) _buildLinkSmsButton(context),
      ],
    );
  }

  Widget _buildAccountTile(LinkedAccounts account, BuildContext context) {
    if (account is EmailAccount) {
      return ListTile(
        leading: const Icon(Icons.email),
        title: const Text("Email Account"),
        subtitle: Text(account.emailAddress),
        trailing: ElevatedButton(
          onPressed: () => _updateEmailAccount(context, account.emailAddress),
          child: const Text("Update"),
        ),
        dense: true,
      );
    } else if (account is PhoneNumberAccount) {
      return ListTile(
        leading: const Icon(Icons.phone),
        title: const Text("Phone Number"),
        subtitle: Text(account.phoneNumber),
        trailing: ElevatedButton(
          onPressed: () => _updateSmsAccount(context, account.phoneNumber),
          child: const Text("Update"),
        ),
        dense: true,
      );
    } else if (account is GoogleOAuthAccount) {
      return ListTile(
        leading: const Icon(Icons.g_mobiledata),
        title: const Text("Google Account"),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (account.name != null) Text("Name: ${account.name}"),
            Text("Email: ${account.email}"),
            Text("Subject: ${account.subject}"),
          ],
        ),
        dense: true,
      );
    } else if (account is TwitterOAuthAccount) {
      return ListTile(
        leading: const Icon(Icons.alternate_email),
        title: const Text("Twitter Account"),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (account.name != null) Text("Name: ${account.name}"),
            if (account.username != null)
              Text("Username: @${account.username}"),
            Text("Subject: ${account.subject}"),
          ],
        ),
        dense: true,
      );
    } else if (account is DiscordOAuthAccount) {
      return ListTile(
        leading: const Icon(Icons.chat),
        title: const Text("Discord Account"),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (account.username != null) Text("Username: ${account.username}"),
            if (account.email != null) Text("Email: ${account.email}"),
            Text("Subject: ${account.subject}"),
          ],
        ),
        dense: true,
      );
    } else if (account is EmbeddedEthereumWalletAccount ||
        account is EmbeddedSolanaWalletAccount) {
      // Skip wallet accounts as they'll be shown in their own section
      return const SizedBox.shrink();
    } else {
      // Generic account tile for other account types
      return ListTile(
        leading: const Icon(Icons.account_circle),
        title: Text("${account.type.toUpperCase()} Account"),
        dense: true,
      );
    }
  }

  Widget _buildLinkEmailButton(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: ListTile(
        leading: const Icon(Icons.email_outlined, color: Colors.blue),
        title: const Text("Link Email Account"),
        subtitle: const Text("Add an email address to your account"),
        trailing: ElevatedButton(
          onPressed: () => _linkEmailAccount(context),
          child: const Text("Link"),
        ),
        dense: true,
      ),
    );
  }

  Widget _buildLinkSmsButton(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: ListTile(
        leading: const Icon(Icons.phone_outlined, color: Colors.blue),
        title: const Text("Link Phone Number"),
        subtitle: const Text("Add a phone number to your account"),
        trailing: ElevatedButton(
          onPressed: () => _linkSmsAccount(context),
          child: const Text("Link"),
        ),
        dense: true,
      ),
    );
  }

  Future<void> _linkEmailAccount(BuildContext context) async {
    final result = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder:
            (context) => const EmailAuthenticationScreen(authAction: Link()),
      ),
    );

    if (result == true) {
      // Trigger refresh callback if provided
      onAccountLinked?.call();
    }
  }

  Future<void> _linkSmsAccount(BuildContext context) async {
    final result = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (context) => const SmsAuthenticationScreen(authAction: Link()),
      ),
    );

    if (result == true) {
      // Trigger refresh callback if provided
      onAccountLinked?.call();
    }
  }

  Future<void> _updateEmailAccount(
    BuildContext context,
    String currentEmail,
  ) async {
    final result = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder:
            (context) =>
                EmailAuthenticationScreen(authAction: Update(currentEmail)),
      ),
    );

    if (result == true) {
      // Trigger refresh callback if provided
      onAccountLinked?.call();
    }
  }

  Future<void> _updateSmsAccount(
    BuildContext context,
    String currentPhone,
  ) async {
    final result = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder:
            (context) =>
                SmsAuthenticationScreen(authAction: Update(currentPhone)),
      ),
    );

    if (result == true) {
      // Trigger refresh callback if provided
      onAccountLinked?.call();
    }
  }
}

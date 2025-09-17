import {
  type LinkedAccountWithMetadata,
  usePrivy,
  type User,
} from "@privy-io/react-auth";
import React from "react";
import { Badge } from "./ui/badge";

const UnlinkAccountsCard = () => {
  const {
    user,
    unlinkEmail,
    unlinkPhone,
    unlinkWallet,
    unlinkGoogle,
    unlinkTwitter,
    unlinkDiscord,
    unlinkGithub,
    unlinkSpotify,
    unlinkInstagram,
    unlinkTiktok,
    unlinkLine,
    unlinkLinkedIn,
    unlinkApple,
    unlinkCrossAppAccount,
    unlinkFarcaster,
    unlinkTelegram,
    unlinkPasskey,
  } = usePrivy();

  const accounts: LinkedAccountWithMetadata[] = (
    user?.linkedAccounts ?? []
  ).filter(Boolean);
  const unlinkable = accounts.length > 1;

  type Btn = { key: string; label: string; onClick: () => Promise<User> };
  const buttons: Btn[] = [];

  for (const acc of accounts) {
    if (acc.type === "email") {
      const address = acc.address;
      buttons.push({
        key: `email:${address}`,
        label: `Unlink Email (${address.slice(0, 6)}...)`,
        onClick: () => unlinkEmail(address),
      });
    }
    if (acc.type === "phone") {
      const phone = (acc as unknown as { phoneNumber?: string }).phoneNumber;
      if (phone) {
        buttons.push({
          key: `phone:${phone}`,
          label: `Unlink Phone (${phone.slice(0, 6)}...)`,
          onClick: () => unlinkPhone(phone),
        });
      }
    }
    if (acc.type === "wallet") {
      const address = acc.address;
      const isExternal =
        acc.walletClientType &&
        acc.walletClientType !== "privy" &&
        acc.walletClientType !== "privy-v2";
      if (isExternal && address) {
        buttons.push({
          key: `wallet:${address}`,
          label: `Unlink Wallet (${address.slice(0, 6)}...)`,
          onClick: () => unlinkWallet(address),
        });
      }
    }
    if (acc.type === "google_oauth") {
      const subject = acc.subject;
      buttons.push({
        key: `google:${subject}`,
        label: `Unlink Google (${subject.slice(0, 6)}...)`,
        onClick: () => unlinkGoogle(subject),
      });
    }
    if (acc.type === "twitter_oauth") {
      const subject = acc.subject;
      buttons.push({
        key: `twitter:${subject}`,
        label: `Unlink Twitter (${subject.slice(0, 6)}...)`,
        onClick: () => unlinkTwitter(subject),
      });
    }
    if (acc.type === "discord_oauth") {
      const subject = acc.subject;
      buttons.push({
        key: `discord:${subject}`,
        label: `Unlink Discord (${subject.slice(0, 6)}...)`,
        onClick: () => unlinkDiscord(subject),
      });
    }
    if (acc.type === "github_oauth") {
      const subject = acc.subject;
      buttons.push({
        key: `github:${subject}`,
        label: `Unlink GitHub (${subject.slice(0, 6)}...)`,
        onClick: () => unlinkGithub(subject),
      });
    }
    if (acc.type === "spotify_oauth") {
      const subject = acc.subject;
      buttons.push({
        key: `spotify:${subject}`,
        label: `Unlink Spotify (${subject.slice(0, 6)}...)`,
        onClick: () => unlinkSpotify(subject),
      });
    }
    if (acc.type === "instagram_oauth") {
      const subject = acc.subject;
      buttons.push({
        key: `instagram:${subject}`,
        label: `Unlink Instagram (${subject.slice(0, 6)}...)`,
        onClick: () => unlinkInstagram(subject),
      });
    }
    if (acc.type === "tiktok_oauth") {
      const subject = acc.subject;
      buttons.push({
        key: `tiktok:${subject}`,
        label: `Unlink Tiktok (${subject.slice(0, 6)}...)`,
        onClick: () => unlinkTiktok(subject),
      });
    }
    if (acc.type === "line_oauth") {
      const subject = acc.subject;
      buttons.push({
        key: `line:${subject}`,
        label: `Unlink Line (${subject.slice(0, 6)}...)`,
        onClick: () => unlinkLine(subject),
      });
    }
    if (acc.type === "linkedin_oauth") {
      const subject = acc.subject;
      buttons.push({
        key: `linkedin:${subject}`,
        label: `Unlink LinkedIn (${subject.slice(0, 6)}...)`,
        onClick: () => unlinkLinkedIn(subject),
      });
    }
    if (acc.type === "apple_oauth") {
      const subject = acc.subject;
      buttons.push({
        key: `apple:${subject}`,
        label: `Unlink Apple (${subject.slice(0, 6)}...)`,
        onClick: () => unlinkApple(subject),
      });
    }
    if (acc.type === "cross_app") {
      const subject = (acc as unknown as { subject?: string }).subject;
      if (subject) {
        buttons.push({
          key: `crossapp:${subject}`,
          label: `Unlink Cross-App (${subject.slice(0, 6)}...)`,
          onClick: () => unlinkCrossAppAccount({ subject }),
        });
      }
    }
    if (acc.type === "farcaster") {
      const fid = acc.fid ?? null;
      if (fid !== null) {
        buttons.push({
          key: `farcaster:${fid}`,
          label: `Unlink Farcaster (${fid})`,
          onClick: () => unlinkFarcaster(fid),
        });
      }
    }
    if (acc.type === "telegram") {
      const telegramUserId = (acc as unknown as { telegramUserId?: string })
        .telegramUserId;
      if (telegramUserId) {
        buttons.push({
          key: `telegram:${telegramUserId}`,
          label: `Unlink Telegram (${telegramUserId.slice(0, 6)}...)`,
          onClick: () => unlinkTelegram(telegramUserId),
        });
      }
    }
    if (acc.type === "passkey") {
      const credentialId = (acc as unknown as { credentialId?: string })
        .credentialId;
      if (credentialId) {
        buttons.push({
          key: `passkey:${credentialId}`,
          label: `Unlink Passkey (${credentialId.slice(0, 6)}...)`,
          onClick: () => unlinkPasskey(credentialId),
        });
      }
    }
  }

  const [loadingKey, setLoadingKey] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleClick = async (btn: Btn) => {
    try {
      setError(null);
      setMessage(null);
      setLoadingKey(btn.key);
      await btn.onClick();
      setMessage("Unlinked successfully");
    } catch (e) {
      setError(e?.toString?.() ?? "Failed to unlink");
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <div className={["card", "card-padding"].join(" ")}>
      <div className="row-between-start">
        <div>
          <h3 className="card-title">
            Unlink accounts{" "}
            <Badge>
              <code>@/components/unlink-accounts-card.tsx</code>
            </Badge>
          </h3>
          <p className={["mt-1", "text-sm", "muted"].join(" ")}>
            {accounts.length > 1
              ? "Select an account to unlink."
              : "You need more than one linked account to unlink."}
          </p>
        </div>
      </div>

      {error && (
        <div className={["mt-2", "alert", "alert-error", "text-xs"].join(" ")}>
          {error}
        </div>
      )}
      {message && (
        <div
          className={["mt-2", "alert", "alert-success", "text-xs"].join(" ")}
        >
          {message}
        </div>
      )}

      {unlinkable && (
        <div className={["mt-3", "row", "wrap", "gap-2"].join(" ")}>
          {buttons.map((b) => (
            <button
              key={b.key}
              onClick={() => handleClick(b)}
              disabled={!!loadingKey}
              className="btn"
            >
              {loadingKey === b.key ? "Unlinking…" : b.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default UnlinkAccountsCard;

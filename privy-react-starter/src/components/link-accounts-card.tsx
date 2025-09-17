import { useLinkAccount } from "@privy-io/react-auth";
import { useMemo, useState } from "react";
import { Badge } from "./ui/badge";

type Status = "idle" | "loading" | "success" | "error";
type Action =
  | "email"
  | "phone"
  | "wallet"
  | "google"
  | "apple"
  | "twitter"
  | "discord"
  | "github"
  | "linkedin"
  | "tiktok"
  | "line"
  | "spotify"
  | "instagram"
  | "farcaster"
  | "telegram"
  | "passkey"
  | null;

const LinkAccountsCard = () => {
  const [status, setStatus] = useState<Status>("idle");
  const [currentAction, setCurrentAction] = useState<Action>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const handlers = useLinkAccount({
    onSuccess: () => {
      setResult("Linked successfully");
      setStatus("success");
    },
    onError: (e) => {
      setError(e?.toString?.() ?? "Failed to link account");
      setStatus("error");
    },
  });

  const items = useMemo(
    () =>
      [
        { key: "email", label: "Link Email", run: () => handlers.linkEmail() },
        { key: "phone", label: "Link Phone", run: () => handlers.linkPhone() },
        {
          key: "wallet",
          label: "Link Wallet",
          run: () => handlers.linkWallet(),
        },
        {
          key: "google",
          label: "Link Google",
          run: () => handlers.linkGoogle(),
        },
        { key: "apple", label: "Link Apple", run: () => handlers.linkApple() },
        {
          key: "twitter",
          label: "Link Twitter",
          run: () => handlers.linkTwitter(),
        },
        {
          key: "discord",
          label: "Link Discord",
          run: () => handlers.linkDiscord(),
        },
        {
          key: "github",
          label: "Link GitHub",
          run: () => handlers.linkGithub(),
        },
        {
          key: "linkedin",
          label: "Link LinkedIn",
          run: () => handlers.linkLinkedIn(),
        },
        {
          key: "tiktok",
          label: "Link Tiktok",
          run: () => handlers.linkTiktok(),
        },
        { key: "line", label: "Link Line", run: () => handlers.linkLine() },
        {
          key: "spotify",
          label: "Link Spotify",
          run: () => handlers.linkSpotify(),
        },
        {
          key: "instagram",
          label: "Link Instagram",
          run: () => handlers.linkInstagram(),
        },
        {
          key: "farcaster",
          label: "Link Farcaster",
          run: () => handlers.linkFarcaster(),
        },
        {
          key: "telegram",
          label: "Link Telegram",
          run: () => handlers.linkTelegram({ launchParams: {} }),
        },
        {
          key: "passkey",
          label: "Link Passkey",
          run: () => handlers.linkPasskey(),
        },
      ] as { key: Action; label: string; run: () => void }[],
    [handlers]
  );

  const badgeFor = (s: Status) => (
    <Badge
      variant={
        s === "success" ? "success" : s === "error" ? "destructive" : "default"
      }
    >
      {s}
    </Badge>
  );

  return (
    <div className={["card", "card-padding"].join(" ")}>
      <div className="row-between-start">
        <div>
          <h3 className="card-title">
            Link Accounts{" "}
            <Badge>
              <code>@/components/link-accounts-card.tsx</code>
            </Badge>
          </h3>
          <p className={["mt-1", "muted", "text-sm"].join(" ")}>
            Link social accounts or external wallets to the current user. See
            <a
              href="https://docs.privy.io/user-management/users/linking-accounts"
              target="_blank"
              rel="noopener noreferrer"
              className="link"
            >
              &nbsp;docs
            </a>
            .
          </p>
        </div>
      </div>

      {error && (
        <div className={["mt-3", "alert", "alert-error", "text-xs"].join(" ")}>
          {error}
        </div>
      )}
      {result && (
        <div
          className={["mt-3", "alert", "alert-success", "text-xs"].join(" ")}
        >
          {result}
        </div>
      )}

      <div className={["mt-3", "row", "wrap", "gap-2"].join(" ")}>
        {items.map(({ key, label, run }) => (
          <div key={key!} className={["col", "gap-1"].join(" ")}>
            <button
              onClick={() => {
                setError(null);
                setResult(null);
                setCurrentAction(key);
                setStatus("loading");
                run();
              }}
              disabled={status === "loading" && currentAction === key}
              className="btn"
            >
              {status === "loading" && currentAction === key
                ? `Linking ${label.replace("Link ", "")}…`
                : label}
            </button>
            {currentAction === key && status !== "idle" && (
              <div className={["row", "gap-2"].join(" ")}>
                {badgeFor(status)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LinkAccountsCard;

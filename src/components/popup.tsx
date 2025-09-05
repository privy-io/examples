import React, { useMemo, useState } from "react";
import "./popup.css";

import {
  useCreateWallet,
  usePrivy,
  useSignMessage,
  useWallets,
} from "@privy-io/react-auth";

type PopupMode = "popup" | "page";

export const Popup: React.FC<{ mode?: PopupMode }> = ({ mode = "popup" }) => {
  const { authenticated, logout, user, login } = usePrivy();
  const { wallets } = useWallets();
  const [signedMessage, setSignedMessage] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const { createWallet } = useCreateWallet();
  const { signMessage } = useSignMessage({
    onSuccess: (data) => setSignedMessage(data.signature),
  });
  const openOptionsPage = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      chrome.tabs.create({ url: chrome.runtime.getURL("options.html") });
    }
  };

  const openAuthWindow = () => {
    chrome.windows.create({
      url: chrome.runtime.getURL("auth.html"),
      type: "popup",
      width: 420,
      height: 640,
    });
  };

  const wrapperClass = useMemo(
    () => (mode === "popup" ? "wrapper-popup" : "wrapper-page"),
    [mode]
  );

  return (
    <div className={wrapperClass}>
      <div className="container">
        <div className="card">
          <div className="toolbar">
            <h3 className="title">Account</h3>
            <div className="row" style={{ margin: 0 }}>
              <button className="btn btn-ghost" onClick={openOptionsPage}>
                Open Options Page
              </button>
              <button className="btn btn-ghost" onClick={openAuthWindow}>
                Login (Popup)
              </button>
            </div>
          </div>
          {authenticated ? (
            <div>
              <div className="badge">
                <span aria-hidden className="badge-dot" />
                Authenticated
              </div>
              <div className="row">
                <button className="btn btn-secondary" onClick={() => logout()}>
                  Logout
                </button>
                {wallets.length === 0 && (
                  <button
                    className="btn btn-primary"
                    onClick={() => createWallet()}
                  >
                    Create Wallet
                  </button>
                )}
                <button
                  className="btn btn-primary"
                  onClick={() => signMessage({ message: "Hello, world!" })}
                >
                  Sign Message
                </button>
              </div>
              <button
                className="accordion-header"
                onClick={() => setShowDetails((v) => !v)}
              >
                <span>Privy User Details</span>
                <span aria-hidden style={{ fontSize: 16 }}>
                  {showDetails ? "▾" : "▸"}
                </span>
              </button>
              {showDetails && (
                <div className="accordion-body">
                  <pre className="accordion-pre">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>
              )}
              {signedMessage && (
                <p className="subtle">
                  Signed Message:{" "}
                  <span className="signed-message">{signedMessage}</span>
                </p>
              )}
            </div>
          ) : (
            <div>
              <div className="row">
                <button className="btn btn-primary" onClick={() => login()}>
                  Login with Privy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

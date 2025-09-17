import { useSessionSigners, useWallets } from "@privy-io/react-auth";
import { useState } from "react";
import { Badge } from "./ui/badge";

const SessionSignersCard = () => {
  const { wallets } = useWallets();
  const { addSessionSigners } = useSessionSigners();
  const { removeSessionSigners } = useSessionSigners();

  const [message, setMessage] = useState<string | null>(null);
  const handleAddSessionSigners = async () => {
    try {
      setMessage(null);
      await addSessionSigners({
        address: wallets[0]?.address,
        signers: [
          {
            signerId: import.meta.env.VITE_PRIVY_SIGNER_ID!,
            policyIds: [],
          },
        ],
      });
      setMessage("Session signer added");
    } catch (e) {
      setMessage(e?.toString?.() ?? "Failed to add session signer");
    }
  };

  const handleRemoveSessionSigners = async () => {
    try {
      setMessage(null);
      await removeSessionSigners({
        address: wallets[0]?.address,
      });
      setMessage("Session signer removed");
    } catch (e) {
      setMessage(e?.toString?.() ?? "Failed to remove session signer");
    }
  };

  return (
    <div className={["card", "card-padding"].join(" ")}>
      <div className="row-between-start">
        <div>
          <h3 className="card-title">
            Session signers{" "}
            <Badge>
              <code>@/components/session-signers-card.tsx</code>
            </Badge>
          </h3>
          <p className={["mt-1", "text-sm", "muted"].join(" ")}>
            Delegate signing to a trusted service for actions like limit orders
            or scheduled transactions when the user is offline.
          </p>
        </div>
      </div>

      {message && (
        <div className={["mt-3", "alert", "text-xs"].join(" ")}>{message}</div>
      )}

      <div className={["mt-3", "row", "wrap", "gap-2"].join(" ")}>
        <button onClick={handleAddSessionSigners} className="btn">
          Add Session Signer
        </button>
        <button onClick={handleRemoveSessionSigners} className="btn">
          Remove Session Signer
        </button>
      </div>
    </div>
  );
};

export default SessionSignersCard;

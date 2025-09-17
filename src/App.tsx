import { usePrivy } from "@privy-io/react-auth";
import { FullScreenLoader } from "./components/ui/fullscreen-loader";
import {
  CreateWalletCard,
  PrivyUserObject,
  LinkAccountsCard,
  UnlinkAccountsCard,
  WalletActionsCard,
  SessionSignersCard,
  WalletManagement,
  MFAEnrollmentCard,
  FundingCard,
  CrossappAccountsCard,
} from "./components";

import "./App.css";

function App() {
  const { ready, authenticated, logout, login } = usePrivy();
  if (!ready) {
    return <FullScreenLoader />;
  }

  return (
    <div className={["p-6", "space-y-6"].join(" ")}>
      {authenticated ? (
        <div className="pt-2">
          <button
            className={["btn-lg", "px-4", "py-2"].join(" ")}
            onClick={logout}
          >
            Logout
          </button>
          <section className={["grid", "grid-cols-1", "gap-4"].join(" ")}>
            <PrivyUserObject />
            <CreateWalletCard />
            <FundingCard />
            <LinkAccountsCard />
            <UnlinkAccountsCard />
            <WalletActionsCard />
            <SessionSignersCard />
            <WalletManagement />
            <MFAEnrollmentCard />
          </section>
        </div>
      ) : (
        <div className="pt-2">
          <button className="btn-lg px-4 py-2" onClick={login}>
            Login
          </button>
        </div>
      )}{" "}
      <CrossappAccountsCard />
    </div>
  );
}

export default App;

import { useCrossAppAccounts, usePrivy } from "@privy-io/react-auth";
import { Badge } from "./ui/badge";

const CrossappAccountsCard = () => {
  const { linkCrossAppAccount, loginWithCrossAppAccount } =
    useCrossAppAccounts();
  const { authenticated } = usePrivy();

  // cm04asygd041fmry9zmcyn5o5 is the appId for Abstract, find the appId for other providers at https://dashboard.privy.io/apps/ecosystem?tab=integrations
  const handleLinkCrossAppAccount = async () => {
    await linkCrossAppAccount({
      appId: "cm04asygd041fmry9zmcyn5o5",
    });
  };

  const handleLoginWithCrossAppAccount = async () => {
    await loginWithCrossAppAccount({
      appId: "cm04asygd041fmry9zmcyn5o5",
    });
  };

  return (
    <div className={["card", "card-padding"].join(" ")}>
      <div className="row-between-start">
        <div>
          <h3 className="card-title">
            Cross App Accounts{" "}
            <Badge>
              <code>@/components/crossapp-accounts-card.tsx</code>
            </Badge>
          </h3>
        </div>
      </div>

      {authenticated && (
        <button onClick={handleLinkCrossAppAccount} className="btn">
          Link Cross App Account (eg: Abstract)
        </button>
      )}
      {!authenticated && (
        <button onClick={handleLoginWithCrossAppAccount} className="btn">
          Login With Cross App Account (eg: Abstract)
        </button>
      )}
    </div>
  );
};

export default CrossappAccountsCard;

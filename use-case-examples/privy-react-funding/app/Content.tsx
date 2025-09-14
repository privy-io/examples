"use client";

import FundingButton from "@/lib/privy/FundingButton";
import LoginButton from "@/lib/privy/LoginButton";
import { usePrivy } from "@privy-io/react-auth";

const FundingPage = () => {
  const { user } = usePrivy();

  if (!user) {
    return <LoginButton />;
  }

  return <FundingButton />;
};

export default FundingPage;

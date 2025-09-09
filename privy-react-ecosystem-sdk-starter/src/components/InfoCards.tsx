import { Files } from "lucide-react";
import { InfoCard } from "./InfoCard";
import Image from "next/image";

export const InfoCards = () => {
  return (
    <div className="flex flex-col gap-6">
      <InfoCard
        icon={<Files size={32} />}
        title="Explore docs"
        description="Everything you need to get started with Privy."
        href="https://docs.privy.io"
      />
      <InfoCard
        icon={
          <Image src="./github-mark.svg" height="32" width="32" alt="github" />
        }
        title="View demo repository"
        description="Build your own ecosystem wallet SDK."
        href="https://github.com/privy-io/ecosystem-sdk-starter"
      />
      <InfoCard
        icon={<Image src="./privy.svg" height="32" width="26" alt="privy" />}
        title="Learn more about Privy"
        description="Privy is a powerful authentication and key management platform."
        href="https://www.privy.io/about-us"
      />
    </div>
  );
};

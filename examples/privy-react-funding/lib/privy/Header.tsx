"use client";

import { UserPill } from "@privy-io/react-auth/ui";

const Header = () => (
  <header className="w-full absolute flex justify-end top-0 right-0">
    <UserPill />
  </header>
);

export default Header;

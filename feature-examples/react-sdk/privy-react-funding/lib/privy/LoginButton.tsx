"use client";

import { useLogin } from "@privy-io/react-auth";

const LoginButton = () => {
  const { login } = useLogin();

  return <button onClick={() => login()}>Login</button>;
};

export default LoginButton;

import React from "react";
import { Buffer } from "buffer";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Popup } from "./components/popup";
import { PrivyProvider } from "@privy-io/react-auth";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

// Ensure Buffer is available for SDKs that expect Node globals
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).Buffer = (window as any).Buffer || Buffer;

const renderByHash = () => {
  const hash = window.location.hash.replace("#", "");
  let element: React.ReactElement;
  if (hash === "options" || hash === "auth") {
    element = <Popup mode="page" />;
  } else {
    element = <Popup />;
  }
  root.render(
    <React.StrictMode>
      <PrivyProvider appId={process.env.REACT_APP_PRIVY_APP_ID as string}>
        {element}
      </PrivyProvider>
    </React.StrictMode>
  );
};

window.addEventListener("hashchange", renderByHash);
renderByHash();

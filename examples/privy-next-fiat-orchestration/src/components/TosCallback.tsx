"use client";

import { useEffect } from "react";

export function TosCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const signedAgreementId = params.get("signed_agreement_id");

    if (signedAgreementId) {
      localStorage.setItem("tos_signed_agreement_id", signedAgreementId);
    }

    // Redirect back to main app
    window.location.href = "/";
  }, []);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-sm text-text-muted">Redirecting back to the demo…</p>
    </div>
  );
}

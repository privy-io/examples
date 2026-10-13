import type { BadgeVariant } from "@/lib/ui/badge";

/**
 * Human-readable labels for the raw values the KYX API returns. The main
 * panel shows these; the API inspector keeps the raw values.
 */
const LABELS: Record<string, string> = {
  // Statuses
  not_started: "Not started",
  incomplete: "Incomplete",
  pending: "Pending",
  under_review: "Under review",
  awaiting_ubo: "Awaiting owners",
  approved: "Approved",
  active: "Active",
  inactive: "Inactive",
  rejected: "Rejected",
  offboarded: "Offboarded",
  paused: "Paused",
  revoked: "Revoked",

  // Endorsements
  base: "US bank transfers",
  sepa: "SEPA (EU)",
  spei: "SPEI (Mexico)",
  pix: "Pix (Brazil)",
  faster_payments: "Faster Payments (UK)",
  cards: "Cards",

  // Requirements
  terms_of_service_v1: "Terms of service",
  terms_of_service_v2: "Terms of service",
  tax_identification_number: "Tax ID",
  first_name: "First name",
  last_name: "Last name",
  birth_date: "Date of birth",
  email_address: "Email address",
  phone_number: "Phone number",
  address_of_residence: "Home address",
  proof_of_address: "Proof of address",
  government_id_verification: "Government ID",
  selfie_verification: "Selfie",
  source_of_funds: "Source of funds",
  sof_eu_questionnaire: "Source of funds questionnaire",
};

/** Sentence-cases an unknown snake_case value, e.g. "min_age_check" → "Min age check". */
function fallbackLabel(value: string): string {
  const words = value.replace(/_/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function kycLabel(value: string): string {
  return LABELS[value] ?? fallbackLabel(value);
}

export function kycStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case "approved":
    case "active":
      return "success";
    case "pending":
    case "under_review":
    case "awaiting_ubo":
      return "warning";
    case "rejected":
    case "offboarded":
    case "revoked":
      return "error";
    default:
      return "neutral";
  }
}

/**
 * Random-but-valid US bank details for seeding the demo's bank account form.
 *
 * Bridge rejects an external account whose details exactly match one the
 * customer already has ("An external account with the same information has
 * already been added for this customer"), so fixed defaults only work once.
 * Randomizing the account number makes each submission a new account.
 */

function randomDigits(count: number): number[] {
  return Array.from({ length: count }, () => Math.floor(Math.random() * 10));
}

/**
 * A 9-digit ABA routing number whose check digit is correct.
 *
 * Bridge sandbox does not appear to verify the checksum today — the previous
 * hardcoded `121212121` fails it — but generating a valid one costs nothing and
 * avoids depending on that staying true.
 */
export function randomRoutingNumber(): string {
  const [d1, d2, d3, d4, d5, d6, d7, d8] = randomDigits(8);

  // ABA: 3(d1+d4+d7) + 7(d2+d5+d8) + (d3+d6+d9) must be a multiple of 10.
  const weighted = 3 * (d1 + d4 + d7) + 7 * (d2 + d5 + d8) + (d3 + d6);
  const checkDigit = (10 - (weighted % 10)) % 10;

  return [d1, d2, d3, d4, d5, d6, d7, d8, checkDigit].join("");
}

/** A 10-digit account number. */
export function randomAccountNumber(): string {
  // Avoid a leading zero so the value round-trips as typed.
  return [1 + Math.floor(Math.random() * 9), ...randomDigits(9)].join("");
}

/** An 8-digit UK account number, as the `gb` account type requires. */
export function randomGbAccountNumber(): string {
  return [1 + Math.floor(Math.random() * 9), ...randomDigits(7)].join("");
}

/** A 6-digit sort code, without hyphens. */
export function randomSortCode(): string {
  return randomDigits(6).join("");
}

/** An IBAN-shaped value: country code, check digits, then a random body. */
export function randomIban(): string {
  return `DE${randomDigits(2).join("")}${randomDigits(18).join("")}`;
}

/** A Pix EVP key, which is a UUID. */
export function randomPixKey(): string {
  return crypto.randomUUID();
}

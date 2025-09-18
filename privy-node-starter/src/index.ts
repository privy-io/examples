import "dotenv/config";
import express from "express";
import { sendUSDC } from "./handlers/transactions/send_usdc";
import { createAllowlistUsdc } from "./handlers/internal/policies/create_allowlist_usdc";
import { payWithUSDC } from "./handlers/transactions/pay_with_usdc";
import { addTreasury } from "./handlers/additional_signers/add_treasury";
import { createWallet } from "./handlers/key_quorums/create_wallet";

const app = express();
const port = "3300";
app.use(express.json());

app.post("/transactions/send_usdc", sendUSDC);
app.post("/transactions/pay_with_usdc", payWithUSDC);

app.post("/additional_signers/add_treasury", addTreasury);

app.post("/key_quorums/create_wallet", createWallet);

app.post("/internal/policies/create_allowlist_usdc", createAllowlistUsdc);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

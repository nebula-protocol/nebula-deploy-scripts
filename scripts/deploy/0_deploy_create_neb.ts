import { strictEqual } from "assert";
import {
  newClient,
  writeArtifact,
  readArtifact,
  instantiateContract,
  queryContract,
  uploadContract,
  TokenAsset,
  NativeAsset,
  sleep,
} from "../lib/helpers.js";
import { createPair, provideLiquidity } from "../lib/lp.js";

const TOKEN_INITIAL_AMOUNT =
  process.env.TOKEN_INITIAL_AMOUNT! || String(1_000_000_000_000000);

// Main
async function main() {
  // Setup
  console.log("===EXECUTE_CREATE_NEB_START===");
  const { terra, wallet } = newClient();
  let network = readArtifact(terra.config.chainID);
  console.log(
    `chainID: ${terra.config.chainID} wallet: ${wallet.key.accAddress}`
  );
  console.log(`admin: ${network.multisigAddress}`);

  // Token info
  const TOKEN_NAME = "Nebula Token";
  const TOKEN_SYMBOL = "NEB";
  const TOKEN_DECIMALS = 6;

  const TOKEN_INFO = {
    name: TOKEN_NAME,
    symbol: TOKEN_SYMBOL,
    decimals: TOKEN_DECIMALS,
    initial_balances: [
      {
        address: wallet.key.accAddress,
        amount: TOKEN_INITIAL_AMOUNT,
      },
    ],
  };

  // Instantiate NEB token contract
  let resp = await instantiateContract(
    terra,
    wallet,
    network.multisigAddress,
    network.tokenCodeID,
    TOKEN_INFO
  );
  network.nebTokenAddress = resp.shift();
  console.log("NEB contract:", network.nebTokenAddress);
  console.log(
    await queryContract(terra, network.nebTokenAddress, { token_info: {} })
  );

  let balance = await queryContract(terra, network.nebTokenAddress, {
    balance: { address: TOKEN_INFO.initial_balances[0].address },
  });
  strictEqual(balance.balance, TOKEN_INFO.initial_balances[0].amount);

  // create NEB-UST pair
  network = await createPair(network, "neb");

  writeArtifact(network, terra.config.chainID);
  console.log("===EXECUTE_CREATE_NEB_FINISH===");
}
main().catch(console.log);

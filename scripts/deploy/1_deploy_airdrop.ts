import "dotenv/config";
import { newClient, writeArtifact, readArtifact } from "../lib/helpers.js";

import { uploadAndInit } from "../lib/tx.js";

const ARTIFACTS_PATH = "../artifacts";

async function main() {
  console.log("===EXECUTE_DEPLOY_AIRDROP_START===");
  const { terra, wallet } = newClient();
  console.log(
    `chainID: ${terra.config.chainID} wallet: ${wallet.key.accAddress}`
  );
  let network = readArtifact(terra.config.chainID);
  console.log(`admin: ${network.multisigAddress}`);

  // Upload and instantiate Airdrop contract
  network = await uploadAndInit(
    "airdrop",
    terra,
    wallet,
    network.multisigAddress,
    {
      owner: network.airdropOwnerAddress,
      nebula_token: network.nebTokenAddress,
    }
  );

  writeArtifact(network, terra.config.chainID);

  console.log("===EXECUTE_DEPLOY_AIRDROP_FINISH===");
}

main().catch(console.log);

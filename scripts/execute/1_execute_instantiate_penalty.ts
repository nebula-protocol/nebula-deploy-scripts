import "dotenv/config";
import {
  newClient,
  readArtifact,
  writeArtifact,
  instantiateContract,
  NativeAsset,
} from "../lib/helpers.js";

import { createCluster } from "../lib/clusters.js";

// Main
async function main() {
  // Setup
  console.log("===EXECUTE_INSTANTIATE_PENALTY_START===");
  const { terra, wallet } = newClient();
  console.log(
    `chainID: ${terra.config.chainID} wallet: ${wallet.key.accAddress}`
  );
  let network = readArtifact(terra.config.chainID);
  const clusterFactoryAddress = network.clusterFactoryAddress;

  // Instantiate penalty contract
  let instantiateResponse = await instantiateContract(
    terra,
    wallet,
    network.multisigAddress,
    network.penaltyCodeID,
    {
      owner: clusterFactoryAddress,
      penalty_params: {
        penalty_amt_lo: "0.02",
        penalty_cutoff_lo: "0.01",
        penalty_amt_hi: "1",
        penalty_cutoff_hi: "0.1",
        reward_amt: "0.01",
        reward_cutoff: "0.02",
      },
    }
  );
  network.penaltyAddress = instantiateResponse.shift();
  console.log(`instantiated penalty contract: ${network.penaltyAddress}`);
  writeArtifact(network, terra.config.chainID);
  console.log("===EXECUTE_INSTANTIATE_PENALTY_FINISH===");
}

main().catch(console.log);

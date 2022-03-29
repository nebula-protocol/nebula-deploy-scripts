import "dotenv/config";
import {
  newClient,
  writeArtifact,
  readArtifact,
  uploadContract,
  instantiateContract,
  sleep,
  executeContract,
} from "../lib/helpers.js";
import { join } from "path";
import { AccAddress, LCDClient } from "@terra-money/terra.js";

import { uploadAndInit } from "../lib/tx.js";

const ARTIFACTS_PATH = "../artifacts";

async function main() {
  // Setup
  console.log("===EXECUTE_CREATE_NEB_START===");
  const { terra, wallet } = newClient();
  let network = readArtifact(terra.config.chainID);
  console.log(
    `chainID: ${terra.config.chainID} wallet: ${wallet.key.accAddress}`
  );
  console.log(`admin: ${network.multisigAddress}`);

  writeArtifact(network, terra.config.chainID);
  console.log("===INIT_LBP_FINISH===");
}
main().catch(console.log);

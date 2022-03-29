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

async function uploadLBPFactoryContractCode(terra: LCDClient, wallet: any) {
  console.log("===INIT_LBP_START===");
  let network = readArtifact(terra.config.chainID);

  console.log("Uploading LBP Factory Contract code...");

  let resp = await uploadContract(
    terra,
    wallet,
    join(ARTIFACTS_PATH, "astroport_lbp_factory.wasm")
  );

  network["lbpFactoryCodeID"] = resp;
  console.log(`LBP Factory ID: ${network["lbpFactoryCodeID"]}`);
  writeArtifact(network, terra.config.chainID);
  return network;
}

async function uploadLBPPairContractCode(terra: LCDClient, wallet: any) {
  let network = readArtifact(terra.config.chainID);

  console.log("Uploading LBP Pair Contract code...");

  let resp = await uploadContract(
    terra,
    wallet,
    join(ARTIFACTS_PATH, "astroport_lbp_pair.wasm")
  );

  network["lbpPairCodeID"] = resp;
  console.log(`LBP Pair ID: ${network["lbpPairCodeID"]}`);
  writeArtifact(network, terra.config.chainID);
  return network;
}

async function main() {
  // Setup
  console.log("===EXECUTE_CREATE_NEB_START===");
  const { terra, wallet } = newClient();
  let network = readArtifact(terra.config.chainID);
  console.log(
    `chainID: ${terra.config.chainID} wallet: ${wallet.key.accAddress}`
  );
  console.log(`admin: ${network.multisigAddress}`);

  // Upload LBP factory and pair code
  network = await uploadLBPFactoryContractCode(terra, wallet);
  await sleep(5000);
  network = await uploadLBPPairContractCode(terra, wallet);
  await sleep(5000);

  // instantiate factory contract
  let instantiateResponse = await instantiateContract(
    terra,
    wallet,
    network.multisigAddress,
    network.lbpFactoryCodeID,
    {
      owner: wallet.key.accAddress,
      pair_code_id: network.lbpPairCodeID,
      token_code_id: network.tokenCodeID,
    }
  );
  network.lbpFactoryAddress = instantiateResponse.shift();
  console.log(
    `instantiated lbp factory contract: ${network.lbpFactoryAddress}`
  );
  await sleep(5000);

  // Create NEB-UST LBP Pair
  let startTime =
    Math.round(new Date().getTime() / 1000) + network.lbp.pair.time.delay;
  let endTime = startTime + network.lbp.pair.time.duration;
  console.info("LBP start time: " + startTime);
  console.info("LBP end time: " + endTime);
  let createPairTx = await executeContract(
    terra,
    wallet,
    network.lbpFactoryAddress,
    {
      create_pair: {
        start_time: startTime,
        end_time: endTime,
        asset_infos: [
          {
            info: {
              token: {
                contract_addr: "terra17qkrzsuzuyz09sgcnacery0ptzlztrr8pgcrgw",
              },
            },
            start_weight: network.lbp.pair.weights.token.start,
            end_weight: network.lbp.pair.weights.token.end,
          },
          {
            info: { native_token: { denom: "uusd" } },
            start_weight: network.lbp.pair.weights.native.start,
            end_weight: network.lbp.pair.weights.native.end,
          },
        ],
        description: network.lbp.pair.description,
      },
    }
  );
  const createPairHash = createPairTx.txhash;
  console.log(`create_pair excuted: ${createPairHash}`);
  network.lbpPairAddress = createPairTx.logs[0].events[2].attributes[3].value;
  console.log(`created pair, address: ${network.lbpPairAddress}`);

  writeArtifact(network, terra.config.chainID);
  console.log("===INIT_LBP_FINISH===");
}
main().catch(console.log);

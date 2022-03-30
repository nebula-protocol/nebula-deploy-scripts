import "dotenv/config";
import { newClient, readArtifact, executeContract } from "../lib/helpers.js";

// Main
async function main() {
  // Setup
  console.log("===EXECUTE_UPDATE_CONFIG_START===");
  const { terra, wallet } = newClient();
  console.log(
    `chainID: ${terra.config.chainID} wallet: ${wallet.key.accAddress}`
  );
  let network = readArtifact(terra.config.chainID);

  // update oracle hub owner to gov
  let updateOracleHubOwnerTx = await executeContract(
    terra,
    wallet,
    network.oracleHubAddress,
    {
      update_owner: {
        owner: network.govAddress,
      },
    }
  );
  let updateOracleHubOwnerTxHash = updateOracleHubOwnerTx.txhash;
  console.log(
    `oracle hub update_config excuted: ${updateOracleHubOwnerTxHash}`
  );
  // update gov owner to gov
  let updateGovOwnerTx = await executeContract(
    terra,
    wallet,
    network.govAddress,
    {
      update_config: {
        owner: network.govAddress,
      },
    }
  );
  let updateOwnerTxHash = updateGovOwnerTx.txhash;
  console.log(`gov update_config excuted: ${updateOwnerTxHash}`);
  console.log("===EXECUTE_UPDATE_CONFIG_FINISH===");
}

main().catch(console.log);

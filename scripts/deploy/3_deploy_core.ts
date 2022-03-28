import "dotenv/config";
import { newClient, readArtifact, writeArtifact } from "../lib/helpers.js";
import { uploadAndInit } from "../lib/tx.js";

async function main() {
  // Setup
  console.log("===EXECUTE_DEPLOY_CORE_START===");
  const { terra, wallet } = newClient();
  console.log(
    `chainID: ${terra.config.chainID} wallet: ${wallet.key.accAddress}`
  );
  let network = readArtifact(terra.config.chainID);

  // Deploy core contracts
  network = await uploadAndInit(
    "cluster_factory",
    terra,
    wallet,
    wallet.key.accAddress,
    {
      token_code_id: network.tokenCodeID,
      cluster_code_id: network.clusterTokenCodeID,
      base_denom: network.baseDenom,
      protocol_fee_rate: "0.001",
      distribution_schedule: network.clusterFactory.distributionSchedule,
    }
  );
  network = await uploadAndInit(
    "lp_staking",
    terra,
    wallet,
    wallet.key.accAddress,
    {
      owner: network.clusterFactoryAddress,
      nebula_token: network.nebTokenAddress,
      astroport_factory: network.astroportFactoryAddress,
    }
  );
  network = await uploadAndInit(
    "collector",
    terra,
    wallet,
    wallet.key.accAddress,
    {
      distribution_contract: network.govAddress,
      astroport_factory: network.astroportFactoryAddress,
      nebula_token: network.nebTokenAddress,
      base_denom: network.baseDenom,
      owner: network.clusterFactoryAddress,
    }
  );
  network = await uploadAndInit(
    "incentives",
    terra,
    wallet,
    wallet.key.accAddress,
    {
      factory: network.clusterFactoryAddress,
      custody: network.incentivesCustodyAddress,
      astroport_factory: network.astroportFactoryAddress,
      nebula_token: network.nebTokenAddress,
      base_denom: network.baseDenom,
      owner: network.govAddress,
    }
  );
  network = await uploadAndInit(
    "incentives_custody",
    terra,
    wallet,
    wallet.key.accAddress,
    {
      owner: network.incentivesAddress,
      neb_token: network.nebTokenAddress,
    }
  );

  writeArtifact(network, terra.config.chainID);
  console.log("===EXECUTE_DEPLOY_CORE_FINISH===");
}

main().catch(console.log);

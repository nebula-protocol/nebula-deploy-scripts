import "dotenv/config";
import { newClient, readArtifact, writeArtifact } from "../lib/helpers.js";
import { uploadAndInit, execute } from "../lib/tx.js";

async function main() {
  // Setup
  console.log("===EXECUTE_DEPLOY_CORE_START===");
  const { terra, wallet } = newClient();
  console.log(
    `chainID: ${terra.config.chainID} wallet: ${wallet.key.accAddress}`
  );
  let network = readArtifact(terra.config.chainID);
  console.log(`admin: ${network.multisigAddress}`);

  let distribution_schedule = network.clusterFactory.distributionSchedule;
  if (terra.config.chainID === "columbus-5") {
    let reward_start_timestamp = 1652270400;
    let current_time = Math.floor(Date.now() / 1000);
    let diff = reward_start_timestamp - current_time;
    distribution_schedule[0][0] += diff;
  }

  // Deploy core contracts
  network = await uploadAndInit(
    "cluster_factory",
    terra,
    wallet,
    network.multisigAddress,
    {
      protocol_fee_rate: network.clusterFactory.protocolFeeRate,
      token_code_id: network.tokenCodeID,
      cluster_code_id: network.clusterCodeID,
      base_denom: network.baseDenom,
      distribution_schedule: distribution_schedule,
    }
  );
  network = await uploadAndInit(
    "lp_staking",
    terra,
    wallet,
    network.multisigAddress,
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
    network.multisigAddress,
    {
      distribution_contract: network.govAddress,
      astroport_factory: network.astroportFactoryAddress,
      nebula_token: network.nebTokenAddress,
      base_denom: network.baseDenom,
      owner: network.clusterFactoryAddress,
    }
  );
  network = await uploadAndInit(
    "incentives_custody",
    terra,
    wallet,
    network.multisigAddress,
    {
      owner: wallet.key.accAddress,
      nebula_token: network.nebTokenAddress,
    }
  );
  network = await uploadAndInit(
    "incentives",
    terra,
    wallet,
    network.multisigAddress,
    {
      factory: network.clusterFactoryAddress,
      custody: network.incentivesCustodyAddress,
      astroport_factory: network.astroportFactoryAddress,
      nebula_token: network.nebTokenAddress,
      base_denom: network.baseDenom,
      owner: network.govAddress,
    }
  );

  await execute(
    "update_config",
    network.incentivesCustodyAddress,
    terra,
    wallet,
    {
      update_config: {
        owner: network.incentivesAddress,
      },
    }
  );

  writeArtifact(network, terra.config.chainID);
  console.log("===EXECUTE_DEPLOY_CORE_FINISH===");
}

main().catch(console.log);

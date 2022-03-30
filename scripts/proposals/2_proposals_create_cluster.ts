import "dotenv/config";
import {
  newClient,
  readArtifact,
  writeArtifact,
  executeContract,
  msgToBase64Binary,
  NativeAsset,
  TokenAsset,
} from "../lib/helpers.js";

async function main() {
  // Setup
  console.log("===PROPOSALS_CREATE_LUST_START===");
  const { terra, wallet } = newClient();
  console.log(
    `chainID: ${terra.config.chainID} wallet: ${wallet.key.accAddress}`
  );
  let network = readArtifact(terra.config.chainID);

  // create LUNA-aUST cluster
  let createClusterMsg = {
    create_cluster: {
      params: {
        name: "LUNA-aUST",
        description: "LUNA-aUST Cluster",
        symbol: "LUST",
        penalty: network.penaltyAddress,
        target: [
          new NativeAsset("uluna", "37").withAmount(),
          new TokenAsset(network.cluster.aUST, "12").withAmount(),
        ],
        pricing_oracle: network.oracleAddress,
        target_oracle: network.targetAddress,
      },
    },
  };

  // create gov poll
  let createPollMsg = {
    create_poll: {
      title: "Nebula Create LUNA-aUST Cluster Proposal",
      description:
        "This poll will create the first Nebula cluster containing LUNA and aUST.",
      execute_msgs: [
        {
          contract: network.clusterFactoryAddress,
          msg: msgToBase64Binary(createClusterMsg),
        },
      ],
    },
  };
  let receiveCW20Msg = {
    send: {
      contract: network.govAddress,
      amount: network.gov.proposalDeposit,
      msg: msgToBase64Binary(createPollMsg),
    },
  };

  // execute create poll
  let createLBPPollTx = await executeContract(
    terra,
    wallet,
    network.nebTokenAddress,
    receiveCW20Msg
  );
  let createLBPPollTxHash = createLBPPollTx.txhash;
  console.log(createLBPPollTxHash);

  writeArtifact(network, terra.config.chainID);
  console.log("===PROPOSALS_CREATE_LUST_FINISH===");
}
main().catch(console.log);

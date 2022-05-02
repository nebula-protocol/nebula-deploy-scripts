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
        name: "LUST Cluster",
        description:
          "A cluster consisting of LUNA and aUST. The weight of each asset are dynamically set to the inverse of their relative market cap. https://forum.neb.money/t/new-cluster-proposal-introducing-lust-proposal-for-the-first-cluster-on-nebula-protocol",
        symbol: "LUST",
        penalty: network.penaltyAddress,
        target: [
          new NativeAsset("uluna", "3906").withAmount(),
          new TokenAsset(network.cluster.austAddress, "543337").withAmount(),
        ],
        pricing_oracle: network.oracleAddress,
        target_oracle: network.targetAddress,
      },
    },
  };

  // create gov poll
  let createPollMsg = {
    create_poll: {
      title: "Create LUST Cluster",
      description:
        "Creates LUST as the first Nebula cluster, marking the full launch of Nebula. Afterward,  all functionalities will be enabled.\n\n LUST will hold LUNA and aUST in its inventory, with the weights inversely proportional to the asset's relative market cap.",
      link: "https://forum.neb.money/t/new-cluster-proposal-introducing-lust-proposal-for-the-first-cluster-on-nebula-protocol",
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
  let createClusterPollTx = await executeContract(
    terra,
    wallet,
    network.nebTokenAddress,
    receiveCW20Msg
  );
  let createClusterPollTxHash = createClusterPollTx.txhash;
  console.log(createClusterPollTxHash);

  writeArtifact(network, terra.config.chainID);
  console.log("===PROPOSALS_CREATE_LUST_FINISH===");
}
main().catch(console.log);

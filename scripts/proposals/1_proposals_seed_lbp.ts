import "dotenv/config";
import {
  newClient,
  readArtifact,
  writeArtifact,
  executeContract,
  msgToBase64Binary,
} from "../lib/helpers.js";

async function main() {
  // Setup
  console.log("===PROPOSALS_SEED_LBP_START===");
  const { terra, wallet } = newClient();
  console.log(
    `chainID: ${terra.config.chainID} wallet: ${wallet.key.accAddress}`
  );
  let network = readArtifact(terra.config.chainID);

  // increase NEB LBP Pair Allowance
  let increaseAllowanceMsg = {
    increase_allowance: {
      amount: network.lbp.lp.tokenAmount,
      spender: network.lbpPairAddress,
    },
  };
  let increaseAllowancePassCommandMsg = {
    pass_command: {
      wasm_msg: {
        execute: {
          contract_addr: network.nebTokenAddress,
          msg: msgToBase64Binary(increaseAllowanceMsg),
          funds: [],
        },
      },
    },
  };

  // provide LBP liquidity
  let provideLiquidityMsg = {
    provide_liquidity: {
      assets: [
        {
          info: {
            token: {
              contract_addr: network.nebTokenAddress,
            },
          },
          amount: network.lbp.lp.tokenAmount,
        },
        {
          info: {
            native_token: { denom: network.baseDenom },
          },
          amount: network.lbp.lp.nativeAmount,
        },
      ],
    },
  };
  let provideLiquidityPassCommandMsg = {
    pass_command: {
      wasm_msg: {
        execute: {
          contract_addr: network.lbpPairAddress,
          msg: msgToBase64Binary(provideLiquidityMsg),
          funds: [
            { amount: network.lbp.lp.nativeAmount, denom: network.baseDenom },
          ],
        },
      },
    },
  };

  // create gov poll
  let createPollMsg = {
    create_poll: {
      title: "Initiate and Seed Nebula Liquidity Bootstrapping Pool (LBP)",
      description:
        "The execution of this proposal will initiate and seed Nebula's liquidity bootstrapping pool (LBP) using 20 million NEB tokens and 1 million UST from the community pool. Once live, the pool will have a starting NEB-UST weight of 98-2 and ends at a 40-60 weight over the course of 5 days.",
      link: "https://blog.neb.money/announcing-the-nebula-launch-sequence-455b8983c4c9",
      execute_msgs: [
        {
          contract: network.communityAddress,
          msg: msgToBase64Binary(increaseAllowancePassCommandMsg),
        },
        {
          contract: network.communityAddress,
          msg: msgToBase64Binary(provideLiquidityPassCommandMsg),
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
  console.log("===PROPOSALS_SEED_LBP_FINISH===");
}
main().catch(console.log);

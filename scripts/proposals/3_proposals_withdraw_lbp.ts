import "dotenv/config";
import {
  newClient,
  readArtifact,
  writeArtifact,
  executeContract,
  msgToBase64Binary,
  NativeAsset,
  TokenAsset,
  queryContract,
} from "../lib/helpers.js";

async function main() {
  // Setup
  console.log("===PROPOSALS_WITHDRAW_LBP_START===");
  const { terra, wallet } = newClient();
  console.log(
    `chainID: ${terra.config.chainID} wallet: ${wallet.key.accAddress}`
  );
  let network = readArtifact(terra.config.chainID);

  let lbpPairResponse = await queryContract(terra, network.lbpPairAddress, {
    pair: {},
  });
  let lbpTokenAddress = lbpPairResponse.liquidity_token;

  // query community contract's LP token balance
  let balanceResponse = await queryContract(terra, lbpTokenAddress, {
    balance: {
      address: network.communityAddress,
    },
  });
  let balance = balanceResponse.balance;

  // construct withdraw LBP liquidity message
  let withdrawLiquidityMsg = {
    withdraw_liquidity: {},
  };
  let lbpReceiveCW20Msg = {
    send: {
      contract: network.lbpPairAddress,
      amount: balance,
      msg: msgToBase64Binary(withdrawLiquidityMsg),
    },
  };

  // construct withdraw liquidity governance proposal
  let withdrawLiquidityPassCommandMsg = {
    pass_command: {
      wasm_msg: {
        execute: {
          contract_addr: lbpTokenAddress,
          msg: msgToBase64Binary(lbpReceiveCW20Msg),
          funds: [],
        },
      },
    },
  };
  let createPollMsg = {
    create_poll: {
      title: "Withdraw NEB LBP Liquidity",
      description:
        "This poll will remove the resulting liquidity from the LBP pool",
      execute_msgs: [
        {
          contract: network.communityAddress,
          msg: msgToBase64Binary(withdrawLiquidityPassCommandMsg),
        },
      ],
    },
  };

  // create governance poll
  let nebReceiveCW20Msg = {
    send: {
      contract: network.govAddress,
      amount: network.gov.proposalDeposit,
      msg: msgToBase64Binary(createPollMsg),
    },
  };
  let createLBPPollTx = await executeContract(
    terra,
    wallet,
    network.nebTokenAddress,
    nebReceiveCW20Msg
  );
  let createLBPPollTxHash = createLBPPollTx.txhash;
  console.log(createLBPPollTxHash);

  writeArtifact(network, terra.config.chainID);
  console.log("===PROPOSALS_WITHDRAW_LBP_FINISH===");
}
main().catch(console.log);

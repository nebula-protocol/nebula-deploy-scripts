import 'dotenv/config'
import { newClient, readArtifact, writeArtifact } from '../lib/helpers.js'
import { execute } from '../lib/tx.js'

const ARTIFACTS_PATH = '../artifacts'

async function main() {
  console.log('===EXECUTE_NEB_TRANSFERS_START===')
  const { terra, wallet } = newClient()
  console.log(`chainID: ${terra.config.chainID} wallet: ${wallet.key.accAddress}`)
  let network = readArtifact(terra.config.chainID)

  // 317 million to TFL Wallet
  await execute('transfer', network.nebTokenAddress, terra, wallet, {
    transfer: {
      amount: '317000000000000',
      recipient: network.tflAddress,
    },
  })
  // 473 million to Community Pool
  await execute('transfer', network.nebTokenAddress, terra, wallet, {
    transfer: {
      amount: '473000000000000',
      recipient: network.communityAddress,
    },
  })
  // 200 million to Cluster Factory
  await execute('transfer', network.nebTokenAddress, terra, wallet, {
    transfer: {
      amount: '200000000000000',
      recipient: network.clusterFactoryAddress,
    },
  })
  // 10  million to Airdrop Wallet
  await execute('transfer', network.nebTokenAddress, terra, wallet, {
    transfer: {
      amount: '10000000000000',
      recipient: network.multisigAddress,
    },
  })

  console.log('===EXECUTE_NEB_TRANSFERS_FINISH===')
}

main().catch(console.log)

import 'dotenv/config'
import { newClient, writeArtifact, readArtifact, uploadContract } from '../lib/helpers.js'
import { join } from 'path'
import { AccAddress, LCDClient } from '@terra-money/terra.js'

import { uploadAndInit } from '../lib/tx.js'

const ARTIFACTS_PATH = '../artifacts'

async function uploadClusterCode(terra: LCDClient, wallet: any) {
  let network = readArtifact(terra.config.chainID)

  console.log('Uploading Cluster code...')

  let resp = await uploadContract(terra, wallet, join(ARTIFACTS_PATH, 'nebula_cluster.wasm'))

  network['clusterCodeID'] = resp
  console.log(`Cluster Code ID: ${network['clusterCodeID']}`)
  writeArtifact(network, terra.config.chainID)
  return network
}

async function uploadPenaltyCode(terra: LCDClient, wallet: any) {
  let network = readArtifact(terra.config.chainID)

  console.log('Uploading Penalty code...')

  let resp = await uploadContract(terra, wallet, join(ARTIFACTS_PATH, 'nebula_penalty.wasm'))

  network['penaltyCodeID'] = resp
  console.log(`Penalty Code ID: ${network['penaltyCodeID']}`)
  writeArtifact(network, terra.config.chainID)
  return network
}

async function main() {
  console.log('===EXECUTE_DEPLOY_PERIPHERAL_START===')
  const { terra, wallet } = newClient()
  console.log(`chainID: ${terra.config.chainID} wallet: ${wallet.key.accAddress}`)
  let network = readArtifact(terra.config.chainID)
  console.log(`admin: ${network.multisigAddress}`)

  // Upload cluster and penalty code
  network = await uploadClusterCode(terra, wallet)
  network = await uploadPenaltyCode(terra, wallet)

  // Upload and instantiate peripheral contract
  network = await uploadAndInit('gov', terra, wallet, network.multisigAddress, {
    nebula_token: network.nebTokenAddress,
    quorum: network.gov.quorum,
    threshold: network.gov.threshold,
    voting_period: network.gov.votingPeriod,
    effective_delay: network.gov.effectiveDelay,
    proposal_deposit: network.gov.proposalDeposit,
    voter_weight: network.gov.voterWeight,
    snapshot_period: network.gov.snapshotPeriod,
  })
  network = await uploadAndInit('community', terra, wallet, network.multisigAddress, {
    owner: network.govAddress,
  })
  network = await uploadAndInit('oracle', terra, wallet, network.multisigAddress, {
    owner: network.govAddress,
    oracle_addr: network.oracleHubAddress,
    base_denom: network.baseDenom,
  })

  writeArtifact(network, terra.config.chainID)

  console.log('===EXECUTE_DEPLOY_PERIPHERAL_FINISH===')
}

main().catch(console.log)

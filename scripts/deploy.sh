#!/usr/bin/env bash

set -e

projectPath=$(cd "$(dirname "${0}")" && cd ../ && pwd)

cd "$projectPath/scripts" && node --loader ts-node/esm deploy/0_deploy_create_neb.ts
# cd "$projectPath/scripts" && node --loader ts-node/esm deploy/1_deploy_airdrop.ts
# cd "$projectPath/scripts" && node --loader ts-node/esm deploy/2_deploy_peripheral.ts
# cd "$projectPath/scripts" && node --loader ts-node/esm deploy/3_deploy_core.ts
# cd "$projectPath/scripts" && node --loader ts-node/esm deploy/4_deploy_post_initialize.ts
# cd "$projectPath/scripts" && node --loader ts-node/esm deploy/5_distribute_neb.ts

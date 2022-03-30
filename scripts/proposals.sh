#!/usr/bin/env bash

set -e

projectPath=$(cd "$(dirname "${0}")" && cd ../ && pwd)

cd "$projectPath/scripts" && node --loader ts-node/esm proposals/1_proposals_seed_lbp.ts

cd "$projectPath/scripts" && node --loader ts-node/esm proposals/2_proposals_create_cluster.ts

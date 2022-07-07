#!/usr/bin/env bash

set -e

projectPath=$(cd "$(dirname "${0}")" && cd ../ && pwd)

# cd "$projectPath/scripts" && node --loader ts-node/esm execute/1_execute_instantiate_penalty.ts
cd "$projectPath/scripts" && node --loader ts-node/esm execute/2_execute_update_config.ts

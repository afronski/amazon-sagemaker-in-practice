#!/usr/bin/env bash

npm run build

PROVIDED_REGION=${REGION:-eu-central-1}

cdk bootstrap --profile="pattern-match-workshops" "${ACCOUNT}/${PROVIDED_REGION}"
cdk deploy --profile="pattern-match-workshops" -c password="${PASSWORD}"

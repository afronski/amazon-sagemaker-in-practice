#!/usr/bin/env bash

for I in `seq 1 30`; do
  aws --profile="pattern-match-workshops" s3 rm "s3://amazon-sagemaker-in-practice-bucket-user-${I}" --recursive;
done

#!/bin/zsh
export $(grep -v '^#' .env | xargs)

anvil -f https://a.api.s0.t.hmny.io/ --fork-block-number 64603499

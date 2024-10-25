[![Coverage Status](https://coveralls.io/repos/github/polymorpher/otc-country/badge.svg?branch=otc-contract)](https://coveralls.io/github/polymorpher/otc-country?branch=otc-contract)

## commands

``` shell

# compile
yarn compile

# test
yarn test

# test with coverage
yarn coverage

# prettify
yarn prettify

# deploy on mainnet
yarn deploy
yarn verify

# deploy on sepolia testnet
# this will deploy mock contracts as well
yarn deploy:sepolia
yarn verify --network sepolia

```

Using the test key in example environment variable, starting from nonce 0, the deployment address would be as the following 

```
polymorpher@Mac contract % npx hardhat deploy --network anvil --reset
Nothing to compile
No need to generate any newer typings.
deploying "OfferFactory" (tx: 0xacdab2a89ff0be74f7cc306fc6f4d88110dfa654b4e02c633182f3d1ac2bce80)...: deployed at 0x700b6A60ce7EaaEA56F065753d8dcB9653dbAD35 with 2505221 gas
deploying "OTC" (tx: 0x37f1276c308577f2291f3a0987def95c5d14d257273c42fe3785006479aaa6ba)...: deployed at 0xA15BB66138824a1c7167f5E85b957d04Dd34E468 with 2526679 gas
deploying "TokenA" (tx: 0x073138283b9e18eeba3bcc5ccd3855578a48bbbfe0c83bcaaa026ba959ac614c)...: deployed at 0xb19b36b1456E65E3A6D514D3F715f204BD59f431 with 1406624 gas
deploying "TokenB" (tx: 0x60d31b38453c6a3c7691dac79e1dadc57d5595115bcd965ccf844fa943bfc5be)...: deployed at 0x8ce361602B935680E8DeC218b820ff5056BeB7af with 1406624 gas
deploying "TokenC" (tx: 0xb3d090250662d587168bd45af5d5ef0ffce9eac845b9712d15d4b19961d79bdb)...: deployed at 0xe1Aa25618fA0c7A1CFDab5d6B456af611873b629 with 1406624 gas
deploying "TokenD" (tx: 0x1905f6317e099af88e30c982f5591f23bb82fb77a4804ff5df7bc5f6c7db7b6d)...: deployed at 0xe1DA8919f262Ee86f9BE05059C9280142CF23f48 with 1406624 gas
deploying "TokenE" (tx: 0xaa83f92181ade1e20a74ab4f6744eeb9be84c46eb29d412ed193e9699c896743)...: deployed at 0x0C8E79F3534B00D9a3D4a856B665Bf4eBC22f2ba with 1406624 gas
deploying "DomainContract" (tx: 0x1c3811099741d92da3feac351782adf664bdf1e4a2de1a5c6290e9c5fac56e97)...: deployed at 0xeD1DB453C3156Ff3155a97AD217b3087D5Dc5f6E with 453931 gas
```
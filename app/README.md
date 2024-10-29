# how to test

1. deploy contracts on the testnet

```shell
cd ../contract
yarn deploy:sepolia
yarn verify --network sepolia
```

2. make `.env` file under `app` directory and fill values

```
VITE_OTC_ADDRESS=otc address deployed in the above step
VITE_ALCHEMY_KEY=alchemy key
```

3. run the app

```shell
yarn dev
```

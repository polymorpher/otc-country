# How to run locally

Reference: https://github.com/graphprotocol/graph-node

- install rust
https://www.digitalocean.com/community/tutorials/install-rust-on-ubuntu-linux

- install postgres and run
```
initdb -D .postgres -E UTF8 --locale=C
pg_ctl -D .postgres -l logfile start
createdb graph-node
```

- install ipfs
https://docs.ipfs.tech/install/command-line/

- install protobuf-compiler
https://grpc.io/docs/protoc-installation/#install-pre-compiled-binaries-any-os

- build `graph-node`

```
sudo apt-get install -y clang libpq-dev libssl-dev pkg-config
git clone https://github.com/graphprotocol/graph-node.git
cd graph-node
cargo build
```

- if you are on Ubuntu 22 or later, install `libssl.so.1.1` referring to the following URL

https://stackoverflow.com/questions/72133316/libssl-so-1-1-cannot-open-shared-object-file-no-such-file-or-directory/72633324

- run ipfs and graph-node

```
# terminal A
ipfs init
ipfs daemon

# terminal B
./target/debug/graph-node \
  --debug \
  --postgres-url postgresql://USERNAME[:PASSWORD]@localhost:5432/graph-node \
  --ethereum-rpc NETWORK_NAME:[CAPABILITIES]:URL \ # example: sepolia:https://eth-sepolia.g.alchemy.com/v2/<token>
  --ipfs 127.0.0.1:5001
```

- run subgraph on local node
```
yarn setup:local
```

- query data from `http://localhost:8000/subgraphs/name/otc-country`

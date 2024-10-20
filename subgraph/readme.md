# How to run locally

Reference: https://github.com/graphprotocol/graph-node

- install rust
https://www.digitalocean.com/community/tutorials/install-rust-on-ubuntu-linux

- install postgres

- install ipfs
https://docs.ipfs.tech/install/command-line/

- build `graph-node`

```
sudo apt-get install -y clang libpq-dev libssl-dev pkg-config protobuf-compiler
git clone https://github.com/graphprotocol/graph-node.git
cd graph-node
cargo build
```

- run ipfs and graph-node

```
# terminal A
ipfs init
ipfs daemon

# terminal B
cargo run -p graph-node --release -- \
  --postgres-url postgresql://USERNAME[:PASSWORD]@localhost:5432/graph-node \
  --ethereum-rpc NETWORK_NAME:[CAPABILITIES]:URL \
  --ipfs 127.0.0.1:5001

# --ethereum-rpc example value: sepolia:https://eth-sepolia.g.alchemy.com/v2/<token>
```

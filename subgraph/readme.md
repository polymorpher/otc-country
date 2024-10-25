# How to run locally

Reference: https://github.com/graphprotocol/graph-node

- install rust
https://www.digitalocean.com/community/tutorials/install-rust-on-ubuntu-linux

- install postgres and run at separate directory (e.g. `~/postgres/graph`) 
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

On macOS:

```
brew install protobuf
```

- if you are on Ubuntu 22 or later, install `libssl.so.1.1` referring to the following URL

https://stackoverflow.com/questions/72133316/libssl-so-1-1-cannot-open-shared-object-file-no-such-file-or-directory/72633324

- (optional) setup postgres user account for GraphQL 

```
psql graph-node

# then run the following SQL scripts in the psql console

CREATE USER testuser WITH ENCRYPTED PASSWORD 'testpassword';
GRANT ALL PRIVILEGES ON DATABASE "graph-node" TO testuser;
GRANT CREATE ON DATABASE "graph-node" to testuser;
CREATE EXTENSION postgres_fdw;
CREATE EXTENSION "pg_stat_statements";

# or just grant superuser role to the user, but don't forget to change it back after initialization
# ALTER ROLE testuser SUPERUSER;
# ALTER ROLE testuser NOSUPERUSER;
```

- (optional) setup local blockchain, optionally fork from existing blockchain in production at a given block

```
# NOTE: must use archival node
anvil -f https://a.api.s0.t.hmny.io/  

# or, for example 
# anvil -f https://mainnet.infura.io/v3/[YOUR_INFURA_KEY] --fork-block-number 20488727

# anvil can be install as part of Foundry, see https://book.getfoundry.sh/getting-started/installation
```

- run ipfs and graph-node

```
# terminal A

# NOTE: initialize ipfs only if this is the first time you run ipfs locally
ipfs init

ipfs daemon

# terminal B
./target/debug/graph-node \
  --debug \
  --postgres-url postgresql://testuser:testpassword@localhost:5432/graph-node \
  --ethereum-rpc anvil:http://127.0.0.1:8545 \ # or any NETWORK_NAME:[CAPABILITIES]:URL for example: sepolia:https://eth-sepolia.g.alchemy.com/v2/<token>
  --ipfs 127.0.0.1:5001
```

- run subgraph on local node
```
yarn setup:local
```

- query data from `http://localhost:8000/subgraphs/name/otc-country`

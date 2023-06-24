module.exports = async ({ getNamedAccounts, deployments }) => {
  if (process.env.DEPLOY_MAINNET === "1") {
    return;
  }

  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  for (const name of ["TokenA", "TokenB", "TokenC", "TokenD", "TokenE"]) {
    await deploy(name, {
      from: deployer,
      contract: "ERC20Mock",
      args: [name, name],
      log: true,
    });
  }

  await deploy('DomainContract', {
    from: deployer,
    args: [],
    log: true,
  });
};

module.exports.tags = ['TestContracts'];

module.exports = async ({ getNamedAccounts, deployments }) => {
  if (!process.env.DEPLOY_TEST_TOKENS) {
    console.log('Skipping deploying test tokens. It can be enabled with DEPLOY_TEST_TOKENS=1')
    return
  }

  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  for (const name of ['TokenA', 'TokenB', 'TokenC', 'TokenD', 'TokenE']) {
    await deploy(name, {
      from: deployer,
      contract: 'ERC20Mock',
      args: [name, name],
      log: true
    })
  }
}

module.exports.tags = ['TestContracts']

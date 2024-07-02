module.exports = async ({ getNamedAccounts, deployments, ...other }) => {
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  const offerFactory = await deployments.get('OfferFactory')

  let domainContract = {
    address: process.env.DOMAIN_CONTRACT
  }

  if (process.env.DEPLOY_MAINNET === '0') {
    domainContract = await deployments.get('DomainContract')
  }
  await deploy('OTC', {
    from: deployer,
    args: [domainContract.address, offerFactory.address],
    log: true
  })
}

module.exports.tags = ['OTC']

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
    args: [
      domainContract.address,
      offerFactory.address,
      process.env.ADMIN_ACCOUNT,
      process.env.OPERATOR_ACCOUNT,
      process.env.REVENUE_ACCOUNT,
      process.env.FEE_PERCENTAGE
    ],
    log: true
  })
}

module.exports.tags = ['OTC']

module.exports = async ({ getNamedAccounts, deployments, ...other }) => {
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  const offerFactory = await deployments.get('OfferFactory')

  let domainContractAddress = process.env.DOMAIN_CONTRACT
  if (!domainContractAddress) {
    console.log('Cannot find DOMAIN_CONTRACT. Deploying mock domain contract...')
    const c = await deploy('DomainContract', {
      from: deployer,
      args: [],
      log: true
    })
    domainContractAddress = c.address
  }
  await deploy('OTC', {
    from: deployer,
    args: [
      domainContractAddress,
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

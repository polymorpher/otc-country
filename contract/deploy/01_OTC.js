module.exports = async ({ getNamedAccounts, deployments, ...other }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log(Object.keys(other))
  // const domainContract = 
  const offerFactory = await deployments.get('OfferFactory')

  await deploy('OTC', {
    from: deployer,
    args: [domainContract, offerFactory],
    log: true,
  });
};

module.exports.tags = ['OTC'];
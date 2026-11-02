const { ethers, upgrades } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying from:', deployer.address);

  const UniverselFactory = await ethers.getContractFactory('UniverselFactory');
  const proxy = await upgrades.deployProxy(UniverselFactory, [deployer.address], {
    initializer: 'initialize',
    kind: 'uups',
  });
  await proxy.waitForDeployment();

  console.log('UniverselFactory proxy deployed to:', await proxy.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

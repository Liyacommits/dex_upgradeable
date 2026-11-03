const { ethers, upgrades } = require('hardhat');

const FACTORY_ADDRESS =
  process.env.FACTORY_ADDRESS || '0x37928e9ae57e67BcaEC365992aE282b3a8cA854C';
const WETH_ADDRESS =
  process.env.WETH_ADDRESS || '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying from:', deployer.address);

  const UniverselRouter02 = await ethers.getContractFactory('UniverselRouter02');
  const proxy = await upgrades.deployProxy(
    UniverselRouter02,
    [FACTORY_ADDRESS, WETH_ADDRESS],
    {
      initializer: 'initialize',
      kind: 'uups',
    }
  );
  await proxy.waitForDeployment();

  console.log('UniverselRouter02 proxy deployed to:', await proxy.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

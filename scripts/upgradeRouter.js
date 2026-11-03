const { ethers, upgrades } = require('hardhat');

// Address of the proxy contract from your initial deployment
const PROXY_ADDRESS = process.env.PROXY_ADDRESS || '0xYOUR_PROXY_ADDRESS_HERE';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Upgrading from:', deployer.address);

  const UniverselRouter02V2 = await ethers.getContractFactory('UniverselRouter02');
  const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, UniverselRouter02V2);
  await upgraded.waitForDeployment();

  console.log('Proxy upgraded at:', await upgraded.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

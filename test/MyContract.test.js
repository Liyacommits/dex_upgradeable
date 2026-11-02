const { expect } = require('chai');
const { ethers, upgrades } = require('hardhat');

describe('UniverselFactory', function () {
  let factory;
  let deployer, otherAccount;

  beforeEach(async function () {
    [deployer, otherAccount] = await ethers.getSigners();
    const UniverselFactory = await ethers.getContractFactory('UniverselFactory');
    factory = await upgrades.deployProxy(UniverselFactory, [deployer.address], {
      initializer: 'initialize',
      kind: 'uups',
    });
    await factory.waitForDeployment();
  });

  it('should deploy and initialize proxy successfully', async function () {
    expect(await factory.getAddress()).to.not.equal(ethers.ZeroAddress);
    expect(await factory.feeToSetter()).to.equal(deployer.address);
    expect(await factory.owner()).to.equal(deployer.address);
    expect(await factory.allPairsLength()).to.equal(0);
  });

  it('should create a pair and communicate with UniverselPair', async function () {
    const tokenA = '0x0000000000000000000000000000000000000001';
    const tokenB = '0x0000000000000000000000000000000000000002';

    await expect(factory.createPair(tokenA, tokenB)).to.emit(factory, 'PairCreated');

    const pairAddress = await factory.getPair(tokenA, tokenB);
    expect(pairAddress).to.not.equal(ethers.ZeroAddress);
    expect(await factory.getPair(tokenB, tokenA)).to.equal(pairAddress);
    expect(await factory.allPairsLength()).to.equal(1);

    const pair = await ethers.getContractAt('UniverselPair', pairAddress);
    expect(await pair.factory()).to.equal(await factory.getAddress());
    expect(await pair.token0()).to.equal(tokenA);
    expect(await pair.token1()).to.equal(tokenB);
  });

  it('should allow feeToSetter to update feeTo', async function () {
    await factory.setFeeTo(otherAccount.address);
    expect(await factory.feeTo()).to.equal(otherAccount.address);
  });

  it('should upgrade the UUPS proxy while preserving state', async function () {
    await factory.setFeeTo(otherAccount.address);
    const proxyAddress = await factory.getAddress();

    const UniverselFactoryV2 = await ethers.getContractFactory('UniverselFactory');
    const upgraded = await upgrades.upgradeProxy(proxyAddress, UniverselFactoryV2);
    await upgraded.waitForDeployment();

    expect(await upgraded.getAddress()).to.equal(proxyAddress);
    expect(await upgraded.feeTo()).to.equal(otherAccount.address);
  });
});

const hre = require('hardhat');

async function main() {
  const currentTimestamp = Math.round(Date.now() / 1000);
  const timeline = currentTimestamp + 3600; // one hour from deployment;
  const fundingGoal = hre.ethers.utils.parseEther('100');

  const CrowdFunding = await hre.ethers.getContractFactory('CrowdFunding');
  const crowdFunding = await CrowdFunding.deploy(timeline, fundingGoal);

  await crowdFunding.deployed();
  console.log(`Contract deployed to ${crowdFunding.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

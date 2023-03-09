const {
  time,
  loadFixture,
} = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('Crowdfunding', () => {
  async function loadContractFixture() {
    const currentTime = await time.latest();
    const timeline = currentTime + 3600; //1hr from deployment;
    const fundingGoal = ethers.utils.parseEther('100');
    const CrowdFunding = await ethers.getContractFactory('CrowdFunding');
    const crowdFunding = await CrowdFunding.deploy(timeline, fundingGoal);
    const [owner, funder] = await ethers.getSigners();
    return { crowdFunding, owner, funder };
  }

  describe('Deployment', () => {
    it('Should set the right goal amount', async () => {
      const { crowdFunding } = await loadFixture(loadContractFixture);
      const fundingAmount = await crowdFunding.fundingGoal();
      expect(fundingAmount).to.equal(ethers.utils.parseEther('100'));
    });
    it('Should set the right owner', async () => {
      const { crowdFunding, owner } = await loadFixture(loadContractFixture);
      expect(await crowdFunding.owner()).to.equal(owner.address);
    });
  });

  describe('Deposit funds', () => {
    it('Should send funds to contract', async () => {
      const { crowdFunding, owner, funder } = await loadFixture(
        loadContractFixture
      );
      await crowdFunding
        .connect(funder)
        .sendFunds({ value: ethers.utils.parseEther('10') });
      expect(await crowdFunding.raisedAmount()).to.equal(
        ethers.utils.parseEther('10')
      );
      expect(await crowdFunding.contributors(funder.address)).to.equal(
        ethers.utils.parseEther('10')
      );
      expect(await crowdFunding.getContractBalance()).to.equal(
        ethers.utils.parseEther('10')
      );
    });
  });

  describe('Withdraw', () => {
    it('Should fail to withdraw if withdrawn before the goal is reached', async () => {
      const { crowdFunding, owner, funder } = await loadFixture(
        loadContractFixture
      );
      expect(await crowdFunding.connect(owner).withdraw()).to.be.reverted();
    });
  });
});

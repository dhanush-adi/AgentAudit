import { expect } from "chai";
import { ethers } from "hardhat";

describe("AgentAudit", function () {
  let agentRegistry: any;
  let reputationRegistry: any;
  let validationRegistry: any;
  let owner: any;
  let client: any;
  let validator: any;
  let newWallet: any;

  before(async function () {
    [owner, client, validator, newWallet] = await ethers.getSigners();
  });

  beforeEach(async function () {
    const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    agentRegistry = await AgentRegistry.deploy();
    
    const ReputationRegistry = await ethers.getContractFactory("ReputationRegistry");
    reputationRegistry = await ReputationRegistry.deploy(await agentRegistry.getAddress());
    
    const ValidationRegistry = await ethers.getContractFactory("ValidationRegistry");
    validationRegistry = await ValidationRegistry.deploy(await agentRegistry.getAddress());
  });

  it("Should register an agent", async function () {
    // Calling the overloaded register function taking a string
    const tx = await agentRegistry.connect(owner)["register(string)"]("ipfs://registration");
    await tx.wait();
    
    expect(await agentRegistry.ownerOf(0)).to.equal(owner.address);
    expect(await agentRegistry.tokenURI(0)).to.equal("ipfs://registration");
    expect(await agentRegistry.getAgentWallet(0)).to.equal(owner.address);
  });

  it("Should set an agent wallet with EIP-712 signature", async function () {
    const tx = await agentRegistry.connect(owner)["register(string)"]("ipfs://registration");
    await tx.wait();

    const deadline = Math.floor(Date.now() / 1000) + 3600;
    const chainId = (await ethers.provider.getNetwork()).chainId;
    const contractAddress = await agentRegistry.getAddress();

    const domain = {
      name: 'AgentRegistry',
      version: '1',
      chainId: chainId,
      verifyingContract: contractAddress
    };

    const types = {
      SetAgentWallet: [
        { name: 'agentId', type: 'uint256' },
        { name: 'newWallet', type: 'address' },
        { name: 'deadline', type: 'uint256' }
      ]
    };

    const message = {
      agentId: 0,
      newWallet: newWallet.address,
      deadline: deadline
    };

    // newWallet provides signature proving control
    const signature = await newWallet.signTypedData(domain, types, message);

    await agentRegistry.connect(owner).setAgentWallet(0, newWallet.address, deadline, signature);
    expect(await agentRegistry.getAgentWallet(0)).to.equal(newWallet.address);
  });

  it("Should give reputation feedback", async function () {
    const tx = await agentRegistry.connect(owner)["register(string)"]("ipfs://registration");
    await tx.wait();

    // Owner cannot feedback, so use client
    await reputationRegistry.connect(client).giveFeedback(
      0,
      950,
      1,
      "successRate",
      "",
      "",
      "ipfs://feedback",
      ethers.ZeroHash
    );

    const summary = await reputationRegistry.getSummary(0, [client.address], "successRate", "");
    expect(summary.count).to.equal(1n);
    expect(summary.summaryValue).to.equal(950n);
    expect(summary.summaryValueDecimals).to.equal(1n);
  });

  it("Should complete validation flow", async function () {
    await agentRegistry.connect(owner)["register(string)"]("ipfs://registration");

    const reqHash = ethers.id("request");
    await validationRegistry.connect(owner).validationRequest(validator.address, 0, "ipfs://req", reqHash);

    const resHash = ethers.id("response");
    await validationRegistry.connect(validator).validationResponse(reqHash, 100, "ipfs://res", resHash, "human_verified");

    const status = await validationRegistry.getValidationStatus(reqHash);
    expect(status.validatorAddress).to.equal(validator.address);
    expect(status.response).to.equal(100n);
    expect(status.responseHash).to.equal(resHash);
    expect(status.tag).to.equal("human_verified");
  });
});

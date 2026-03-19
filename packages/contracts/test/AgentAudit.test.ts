import { expect } from "chai";
import { ethers } from "hardhat";

describe("AgentAudit Contracts", function () {
  let agentRegistry: any;
  let reputationRegistry: any;
  let validationRegistry: any;
  let owner: any;
  let client: any;
  let validator: any;
  let newWallet: any;
  let unauthorized: any;

  before(async function () {
    [owner, client, validator, newWallet, unauthorized] = await ethers.getSigners();
  });

  beforeEach(async function () {
    const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    agentRegistry = await AgentRegistry.deploy();

    const ReputationRegistry = await ethers.getContractFactory("ReputationRegistry");
    reputationRegistry = await ReputationRegistry.deploy(await agentRegistry.getAddress());

    const ValidationRegistry = await ethers.getContractFactory("ValidationRegistry");
    validationRegistry = await ValidationRegistry.deploy(await agentRegistry.getAddress());
  });

  // ── AgentRegistry ─────────────────────────────────────────

  describe("AgentRegistry", function () {
    it("Should register an agent with correct token URI", async function () {
      const tx = await agentRegistry.connect(owner)["register(string)"]("ipfs://registration");
      await tx.wait();

      expect(await agentRegistry.ownerOf(0)).to.equal(owner.address);
      expect(await agentRegistry.tokenURI(0)).to.equal("ipfs://registration");
      expect(await agentRegistry.getAgentWallet(0)).to.equal(owner.address);
    });

    it("Should increment token IDs for successive registrations", async function () {
      await agentRegistry.connect(owner)["register(string)"]("ipfs://agent1");
      await agentRegistry.connect(client)["register(string)"]("ipfs://agent2");

      expect(await agentRegistry.ownerOf(0)).to.equal(owner.address);
      expect(await agentRegistry.ownerOf(1)).to.equal(client.address);
      expect(await agentRegistry.tokenURI(1)).to.equal("ipfs://agent2");
    });

    it("Should set agent wallet with valid EIP-712 signature", async function () {
      await agentRegistry.connect(owner)["register(string)"]("ipfs://registration");

      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const chainId = (await ethers.provider.getNetwork()).chainId;
      const contractAddress = await agentRegistry.getAddress();

      const domain = {
        name: 'AgentRegistry',
        version: '1',
        chainId: chainId,
        verifyingContract: contractAddress,
      };

      const types = {
        SetAgentWallet: [
          { name: 'agentId', type: 'uint256' },
          { name: 'newWallet', type: 'address' },
          { name: 'deadline', type: 'uint256' },
        ],
      };

      const message = {
        agentId: 0,
        newWallet: newWallet.address,
        deadline: deadline,
      };

      const signature = await newWallet.signTypedData(domain, types, message);
      await agentRegistry.connect(owner).setAgentWallet(0, newWallet.address, deadline, signature);
      expect(await agentRegistry.getAgentWallet(0)).to.equal(newWallet.address);
    });

    it("Should reject wallet change with expired deadline", async function () {
      await agentRegistry.connect(owner)["register(string)"]("ipfs://registration");

      const deadline = Math.floor(Date.now() / 1000) - 3600;
      const chainId = (await ethers.provider.getNetwork()).chainId;
      const contractAddress = await agentRegistry.getAddress();

      const domain = {
        name: 'AgentRegistry',
        version: '1',
        chainId: chainId,
        verifyingContract: contractAddress,
      };

      const types = {
        SetAgentWallet: [
          { name: 'agentId', type: 'uint256' },
          { name: 'newWallet', type: 'address' },
          { name: 'deadline', type: 'uint256' },
        ],
      };

      const message = { agentId: 0, newWallet: newWallet.address, deadline };
      const signature = await newWallet.signTypedData(domain, types, message);

      await expect(
        agentRegistry.connect(owner).setAgentWallet(0, newWallet.address, deadline, signature),
      ).to.be.reverted;
    });

    it("Should reject wallet change by non-owner", async function () {
      await agentRegistry.connect(owner)["register(string)"]("ipfs://registration");

      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const chainId = (await ethers.provider.getNetwork()).chainId;
      const contractAddress = await agentRegistry.getAddress();

      const domain = {
        name: 'AgentRegistry',
        version: '1',
        chainId: chainId,
        verifyingContract: contractAddress,
      };

      const types = {
        SetAgentWallet: [
          { name: 'agentId', type: 'uint256' },
          { name: 'newWallet', type: 'address' },
          { name: 'deadline', type: 'uint256' },
        ],
      };

      const message = { agentId: 0, newWallet: newWallet.address, deadline };
      const signature = await newWallet.signTypedData(domain, types, message);

      await expect(
        agentRegistry.connect(unauthorized).setAgentWallet(0, newWallet.address, deadline, signature),
      ).to.be.reverted;
    });
  });

  // ── ReputationRegistry ────────────────────────────────────

  describe("ReputationRegistry", function () {
    beforeEach(async function () {
      await agentRegistry.connect(owner)["register(string)"]("ipfs://registration");
    });

    it("Should record feedback and compute correct summary", async function () {
      await reputationRegistry.connect(client).giveFeedback(
        0, 950, 1, "successRate", "", "", "ipfs://feedback", ethers.ZeroHash,
      );

      const summary = await reputationRegistry.getSummary(0, [client.address], "successRate", "");
      expect(summary.count).to.equal(1n);
      expect(summary.summaryValue).to.equal(950n);
      expect(summary.summaryValueDecimals).to.equal(1n);
    });

    it("Should aggregate multiple feedback entries", async function () {
      await reputationRegistry.connect(client).giveFeedback(
        0, 950, 1, "successRate", "", "", "ipfs://f1", ethers.ZeroHash,
      );
      await reputationRegistry.connect(validator).giveFeedback(
        0, 800, 1, "successRate", "", "", "ipfs://f2", ethers.ZeroHash,
      );

      const summary = await reputationRegistry.getSummary(0, [client.address, validator.address], "successRate", "");
      expect(summary.count).to.equal(2n);
      expect(summary.summaryValue).to.equal(1750n);
    });

    it("Should prevent owner from giving feedback on own agent", async function () {
      await expect(
        reputationRegistry.connect(owner).giveFeedback(
          0, 1000, 1, "successRate", "", "", "ipfs://self", ethers.ZeroHash,
        ),
      ).to.be.reverted;
    });
  });

  // ── ValidationRegistry ────────────────────────────────────

  describe("ValidationRegistry", function () {
    beforeEach(async function () {
      await agentRegistry.connect(owner)["register(string)"]("ipfs://registration");
    });

    it("Should complete full validation flow", async function () {
      const reqHash = ethers.id("request");
      await validationRegistry.connect(owner).validationRequest(
        validator.address, 0, "ipfs://req", reqHash,
      );

      const resHash = ethers.id("response");
      await validationRegistry.connect(validator).validationResponse(
        reqHash, 100, "ipfs://res", resHash, "human_verified",
      );

      const status = await validationRegistry.getValidationStatus(reqHash);
      expect(status.validatorAddress).to.equal(validator.address);
      expect(status.response).to.equal(100n);
      expect(status.responseHash).to.equal(resHash);
      expect(status.tag).to.equal("human_verified");
    });

    it("Should reject response from non-assigned validator", async function () {
      const reqHash = ethers.id("request");
      await validationRegistry.connect(owner).validationRequest(
        validator.address, 0, "ipfs://req", reqHash,
      );

      const resHash = ethers.id("response");
      await expect(
        validationRegistry.connect(unauthorized).validationResponse(
          reqHash, 100, "ipfs://res", resHash, "human_verified",
        ),
      ).to.be.reverted;
    });

    it("Should reject duplicate validation responses", async function () {
      const reqHash = ethers.id("request");
      await validationRegistry.connect(owner).validationRequest(
        validator.address, 0, "ipfs://req", reqHash,
      );

      const resHash = ethers.id("response");
      await validationRegistry.connect(validator).validationResponse(
        reqHash, 100, "ipfs://res", resHash, "human_verified",
      );

      const resHash2 = ethers.id("response2");
      await expect(
        validationRegistry.connect(validator).validationResponse(
          reqHash, 200, "ipfs://res2", resHash2, "ai_verified",
        ),
      ).to.be.reverted;
    });
  });
});

const assert = require("assert");
const { expect } = require("chai");
const exp = require("constants");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

const ID = 1;
const NAME = "shoes";
const CATEGORY = "Clothing";
const IMAGE =
  "https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/shoes.jpg";
const COST = tokens(1);
const RATING = 4;
const STOCK = 5;

describe("Dappazon", () => {
  let dappazon, deployer, buyer;
  beforeEach(async () => {
    [deployer, buyer] = await ethers.getSigners();
    dappazon = await ethers.getContractFactory("Dappazon");
    dappazon = await dappazon.deploy();
  });
  describe("Deployment", () => {
    it("sets the owner", async () => {
      expect(await dappazon.owner()).to.equal(deployer.address);
    });
  });
  describe("Listing", () => {
    let tx;
    beforeEach(async () => {
      tx = await dappazon
        .connect(deployer)
        .list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK);
      await tx.wait();
    });
    it("returns item attributes", async () => {
      const item = await dappazon.items(ID);
      expect(item.id).to.equal(ID);
      expect(item.name).to.equal(NAME);
      expect(item.category).to.equal(CATEGORY);
      expect(item.image).to.equal(IMAGE);
      expect(item.cost).to.equal(COST);
      expect(item.rating).to.equal(RATING);
      expect(item.stock).to.equal(STOCK);
    });
    it("emits list event", async () => {
      expect(tx).to.emit(dappazon, "List");
    });
  });
  describe("Buying", () => {
    let tx;
    beforeEach(async () => {
      tx = await dappazon
        .connect(deployer)
        .list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK);
      await tx.wait();
      tx = await dappazon.connect(buyer).buy(ID, { value: COST });
      await tx.wait();
    });
    it("Updates the contract balance", async () => {
      const result = await ethers.provider.getBalance(dappazon.address);
      expect(result).to.equal(COST);
    });
    it("Updates buyer's order count", async () => {
      let result = await dappazon.orderCount(buyer.address);
      expect(result).to.equal(1);
    });
    it("Adds the order", async () => {
      const order = await dappazon.orders(buyer.address, 1);
      expect(order.time).to.be.greaterThan(0);
      expect(order.item.name).to.equal(NAME);
    });
    it("Deducts the stock", async () => {
      const item = await dappazon.items(ID);
      expect(item.stock).to.equal(STOCK - 1);
    });
    it("emits buy event", async () => {
      expect(tx).to.emit(dappazon, "Buy");
    });
  });
  describe("Withdrawing", () => {
    let balanceBefore, balanceAfter;
    beforeEach(async () => {
      let tx = await dappazon
        .connect(deployer)
        .list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK);
      await tx.wait();

      tx = await dappazon.connect(buyer).buy(ID, { value: COST });
      await tx.wait();

      balanceBefore = await ethers.provider.getBalance(deployer.address);
      tx = await dappazon.connect(deployer).withdraw();
      await tx.wait();
    });
    it("withdraws funds to owner", async () => {
      balanceAfter = await ethers.provider.getBalance(deployer.address);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    });
    it("updates the contract balance", async () => {
      const result = await ethers.provider.getBalance(dappazon.address);
      expect(result).to.equal(0);
    });
  });
});

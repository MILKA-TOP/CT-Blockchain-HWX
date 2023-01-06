const { expect } = require("chai");
const { time }   = require("@nomicfoundation/hardhat-network-helpers");
describe("Token contract", function () {

  let singleBidding;
  let multiBidding;
  let lib;
  let owner;
  let addr1;
  let addr2;
  let addrs;
  let dec = 1000000;
  let DELAY = 4 * 24 * 60 * 60;
  let DAY_DELAY = 24 * 60 * 60;
  let TEN_MINUTES_DELAY = 10 * 60
  let TITLE_BYTES = "0x536f6d6520746578742100000000000000000000000000000000000000000000"
  let DESCRIPTION_BYTES = "0x536f6d65206465736372697074696f6e21000000000000000000000000000000"
  let TAB = "        "

  beforeEach(async function () {
    [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();

    SingleBidding = await ethers.getContractFactory("MilkaSingleBidding");

    MultyBidding = await ethers.getContractFactory("MilkaQueueBidding");


    singleBidding = await SingleBidding.deploy(TITLE_BYTES, DESCRIPTION_BYTES, 100, TEN_MINUTES_DELAY, DAY_DELAY, 10);
    await singleBidding.deployed();

    multiBidding = await MultyBidding.deploy(10 * 60);
    await multiBidding.deployed();

  });

  describe("Single bidding test", function () {

    it("1 payments | ErrorType: timeout | Result: Cancel", async function () {
      
      expect(await singleBidding.connect(addr1).currentDeltaTime()).to.equal(DAY_DELAY - TEN_MINUTES_DELAY)
      console.log(TAB + "-| time left (sec.): " + await singleBidding.connect(addr1).currentDeltaTime())
      await time.increase(DAY_DELAY);
      console.log(TAB + "-| time pass (sec.): " + DAY_DELAY)

      await expect(singleBidding.connect(addr1).tryFinishBidding()).to
        .emit(singleBidding, 'CancelProposal')
        .withArgs(0, TITLE_BYTES, DESCRIPTION_BYTES);

      console.log(TAB + "-| bidding status: CANCEL")
    
    });

    it("2 payments | ErrorType: _ | Result: Accepted", async function () {
      let ownerBalanceBefore = await owner.getBalance()
      console.log(TAB + "-| owner balance: " + ownerBalanceBefore)
      expect(await singleBidding.connect(addr1).currentDeltaTime()).to.equal(DAY_DELAY - TEN_MINUTES_DELAY)
      console.log(TAB + "-| time left (sec.): " + await singleBidding.connect(addr1).currentDeltaTime())

      await singleBidding.connect(addr1).buyItem({ value: 1000 })
      console.log(TAB + "-| addr1 buy item with this price: " + 1000)
      expect(await singleBidding.connect(addr1).currentAddress()).to.equal(addr1.address)
      console.log(TAB + "-| current owner: " + await singleBidding.connect(addr1).currentAddress())
      expect(await singleBidding.connect(addr1).currentDeltaTime()).to.equal(DAY_DELAY - TEN_MINUTES_DELAY * 2)
      console.log(TAB + "-| time left (sec.): " + await singleBidding.connect(addr1).currentDeltaTime())

      await time.increase(DAY_DELAY);
      console.log(TAB + "-| time pass (sec.): " + DAY_DELAY)

      await expect(singleBidding.connect(addr1).tryFinishBidding()).to
        .emit(singleBidding, 'AcceptedProposal')
        .withArgs(0, TITLE_BYTES, DESCRIPTION_BYTES, addr1.address, 1000);
      console.log(TAB + "-| bidding status: ACCEPT")
      console.log(TAB + "-| owner/price: " + addr1.address + "/" + 1000)

      expect(await owner.getBalance()).to.equal(BigInt(ownerBalanceBefore) + BigInt(1000))
      console.log(TAB + "-| previous owner's balance: " + await owner.getBalance())

    
    });

    it("3 payments | ErrorType: _ | Result: Accepted", async function () {
      let ownerBalanceBefore = await owner.getBalance()

      expect(await singleBidding.connect(addr1).currentDeltaTime()).to.equal(DAY_DELAY - TEN_MINUTES_DELAY)
      console.log(TAB + "-| time left (sec.): " + await singleBidding.connect(addr1).currentDeltaTime())

      await singleBidding.connect(addr1).buyItem({ value: 1000 })
      console.log(TAB + "-| addr1 buy item with this price: " + 1000)

      let balanceBeforeSecondbuy = await addr1.getBalance()
      expect(await singleBidding.connect(addr1).currentAddress()).to.equal(addr1.address)
      expect(await singleBidding.connect(addr1).currentDeltaTime()).to.equal(DAY_DELAY - TEN_MINUTES_DELAY * 2)
      console.log(TAB + "-| current owner: " + await singleBidding.connect(addr1).currentAddress())
      console.log(TAB + "-| time left (sec.): " + await singleBidding.connect(addr1).currentDeltaTime())


      await singleBidding.connect(addr2).buyItem({ value: 2000 })
      console.log(TAB + "-| addr2 buy item with this price: " + 2000)

      expect(await addr1.getBalance()).to.equal(BigInt(balanceBeforeSecondbuy) + BigInt(1000))
      expect(await singleBidding.connect(addr1).currentAddress()).to.equal(addr2.address)
      expect(await singleBidding.connect(addr1).currentDeltaTime()).to.equal(DAY_DELAY - TEN_MINUTES_DELAY * 3)
      console.log(TAB + "-| current owner: " + await singleBidding.connect(addr1).currentAddress())
      console.log(TAB + "-| time left (sec.): " + await singleBidding.connect(addr1).currentDeltaTime())

      await time.increase(DAY_DELAY);
      console.log(TAB + "-| time pass (sec.): " + DAY_DELAY)

      await expect(singleBidding.connect(addr1).tryFinishBidding()).to
        .emit(singleBidding, 'AcceptedProposal')
        .withArgs(0, TITLE_BYTES, DESCRIPTION_BYTES, addr2.address, 2000);

      expect(await owner.getBalance()).to.equal(BigInt(ownerBalanceBefore) + BigInt(2000))
      console.log(TAB + "-| bidding status: ACCEPT")
      console.log(TAB + "-| owner/price: " + addr2.address + "/" + 2000)
      console.log(TAB + "-| previous owner's balance: " + await owner.getBalance())
    });

    it("`n` payments | ErrorType: _ | Result: Accepted", async function () {
      let ownerBalanceBefore = await owner.getBalance()

      let a = 1;
      let b = 1;
      let firstValueDelta = 200;
      let currValue = firstValueDelta
      let multProc = 10
      while (DAY_DELAY - TEN_MINUTES_DELAY * (a + b) > 0) {
        expect(await singleBidding.connect(addr1).currentDeltaTime()).to.equal(DAY_DELAY - TEN_MINUTES_DELAY * b)

        await singleBidding.connect(addr1).buyItem({ value: currValue })
        console.log(TAB + "-| addr1 buy item with this price: " + currValue)

        sum = a + b
        a = b
        b = sum
        currValue += Math.floor(currValue / 100)  * multProc

        let balanceBeforeSecondbuy = await addr1.getBalance()
        expect(await singleBidding.connect(addr1).currentAddress()).to.equal(addr1.address)
        expect(await singleBidding.connect(addr1).currentDeltaTime()).to.equal(DAY_DELAY - TEN_MINUTES_DELAY * sum)
        console.log(TAB + "-| current owner: " + await singleBidding.connect(addr1).currentAddress())
        console.log(TAB + "-| time left (sec.): " + await singleBidding.connect(addr1).currentDeltaTime())
      }

      i = 0
      while (i < 2){
        await singleBidding.connect(addr1).buyItem({ value: currValue })
        resValue = currValue
        currValue += Math.floor(currValue / 100)  * multProc
        expect(await singleBidding.connect(addr1).currentAddress()).to.equal(addr1.address)
        expect(await singleBidding.connect(addr1).currentDeltaTime()).to.equal(TEN_MINUTES_DELAY)
        console.log(TAB + "-| addr1 buy item with this price: " + currValue)
        console.log(TAB + "-| current owner: " + await singleBidding.connect(addr1).currentAddress())
        console.log(TAB + "-| time left (sec.): " + await singleBidding.connect(addr1).currentDeltaTime())
        i++;
      }

      await time.increase(DAY_DELAY);
      console.log(TAB + "-| time pass (sec.): " + DAY_DELAY)

      await expect(singleBidding.connect(addr1).tryFinishBidding()).to
        .emit(singleBidding, 'AcceptedProposal')
        .withArgs(0, TITLE_BYTES, DESCRIPTION_BYTES, addr1.address, resValue);
        console.log(TAB + "-| bidding status: ACCEPT")
        console.log(TAB + "-| owner/price: " + addr1.address + "/" + resValue)

    });
  });

  describe("Multi bidding test", function () {

    it("1 create | (0 payments, _ , _ ) | Result: Cancel", async function () {

      let hashId1 = 100
      await expect(multiBidding.connect(addr1).createBidding(hashId1, TITLE_BYTES, DESCRIPTION_BYTES, TEN_MINUTES_DELAY)).to
        .emit(multiBidding, 'CreatedBidding')
        .withArgs(hashId1, TITLE_BYTES, DESCRIPTION_BYTES, addr1.address)
      console.log(TAB + "-| Create new bidding with this hashId: " + hashId1)

      await time.increase(DAY_DELAY);
      console.log(TAB + "-| time pass (sec.): " + DAY_DELAY)

      await expect(multiBidding.connect(addr1).tryFinishBidding(hashId1)).to
        .emit(multiBidding, 'CancelProposal')
        .withArgs(hashId1, TITLE_BYTES, DESCRIPTION_BYTES);
        console.log(TAB + "-| hashId: " + hashId1 + " | bidding status: CANCEL")

    });

    it("1 create | (1 payments, _ , _ ) | Result: Accept", async function () {

      let hashId1 = 100
      await expect(multiBidding.connect(addr1).createBidding(hashId1, TITLE_BYTES, DESCRIPTION_BYTES, 100)).to
        .emit(multiBidding, 'CreatedBidding')
        .withArgs(hashId1, TITLE_BYTES, DESCRIPTION_BYTES, addr1.address)
        console.log(TAB + "-| Create new bidding with this hashId: " + hashId1)

      await multiBidding.connect(addr2).buyItem(hashId1, { value: 200 })
      console.log(TAB + "-| addr2 buy item with hashId=" + hashId1 + " with this price: " + 200)

      expect(await multiBidding.connect(addr2).currentAddress(hashId1)).to.equal(addr2.address)
      console.log(TAB + "-| current owner of item with hashId= " + hashId1 + ": " + await multiBidding.connect(addr2).currentAddress(hashId1))
      await time.increase(DAY_DELAY);
      console.log(TAB + "-| time pass (sec.): " + DAY_DELAY)

      await expect(multiBidding.connect(addr2).tryFinishBidding(hashId1)).to
        .emit(multiBidding, 'AcceptedProposal')
        .withArgs(hashId1, TITLE_BYTES, DESCRIPTION_BYTES, addr2.address, 200);
        console.log(TAB + "-| hashId: " + hashId1 + " | bidding status: APPOVE | price: " + 200)

    });

    it("1 create | (2 payments, _ , _ ) | Result: Accept", async function () {

      let hashId1 = 100
      await expect(multiBidding.connect(addr1).createBidding(hashId1, TITLE_BYTES, DESCRIPTION_BYTES, 100)).to
        .emit(multiBidding, 'CreatedBidding')
        .withArgs(hashId1, TITLE_BYTES, DESCRIPTION_BYTES, addr1.address)
        console.log(TAB + "-| Create new bidding with this hashId: " + hashId1)

      await multiBidding.connect(addr2).buyItem(hashId1, { value: 200 })
      console.log(TAB + "-| addr2 buy item with hashId=" + hashId1 + " with this price: " + 200)

      expect(await multiBidding.connect(addr2).currentAddress(hashId1)).to.equal(addr2.address)
      console.log(TAB + "-| current owner of item with hashId= " + hashId1 + ": " + await multiBidding.connect(addr2).currentAddress(hashId1))

      let balanceBeforeNextbuy = await addr2.getBalance()
      await multiBidding.connect(addr3).buyItem(hashId1, { value: 300 })
      console.log(TAB + "-| addr3 buy item with hashId=" + hashId1 + " with this price: " + 300)

      expect(await multiBidding.connect(addr3).currentAddress(hashId1)).to.equal(addr3.address)
      expect(await addr2.getBalance()).to.equal(BigInt(balanceBeforeNextbuy) + BigInt(200))
      console.log(TAB + "-| current owner of item with hashId= " + hashId1 + ": " + await multiBidding.connect(addr2).currentAddress(hashId1))


      await time.increase(DAY_DELAY);
      console.log(TAB + "-| time pass (sec.): " + DAY_DELAY)

      await expect(multiBidding.connect(addr2).tryFinishBidding(hashId1)).to
        .emit(multiBidding, 'AcceptedProposal')
        .withArgs(hashId1, TITLE_BYTES, DESCRIPTION_BYTES, addr3.address, 300);
        console.log(TAB + "-| hashId: " + hashId1 + " | bidding status: APPOVE | price: " + 300)

    });


    it("2 create | (0 payments, 0 payments , _ ) | Result: Cancel", async function () {

      let hashId1 = 100
      let hashId2 = 200

      await expect(multiBidding.connect(addr1).createBidding(hashId1, TITLE_BYTES, DESCRIPTION_BYTES, 1000)).to
        .emit(multiBidding, 'CreatedBidding')
        .withArgs(hashId1, TITLE_BYTES, DESCRIPTION_BYTES, addr1.address)
        console.log(TAB + "-| Create new bidding with this hashId: " + hashId1)

      await time.increase(TEN_MINUTES_DELAY / 2);
      console.log(TAB + "-| time pass (sec.): " + TEN_MINUTES_DELAY / 2)

      await expect(multiBidding.connect(addr1).createBidding(hashId2, TITLE_BYTES, DESCRIPTION_BYTES, 1000)).to
        .emit(multiBidding, 'CreatedBidding')
        .withArgs(hashId2, TITLE_BYTES, DESCRIPTION_BYTES, addr1.address)
        console.log(TAB + "-| Create new bidding with this hashId: " + hashId2)

      await time.increase(TEN_MINUTES_DELAY  / 1.5);
      console.log(TAB + "-| time pass (sec.): " + TEN_MINUTES_DELAY  / 1.5)

      await expect(multiBidding.connect(addr1).tryFinishBidding(hashId1)).to
      .emit(multiBidding, 'CancelProposal')
      .withArgs(hashId1, TITLE_BYTES, DESCRIPTION_BYTES);
      console.log(TAB + "-| hashId: " + hashId1 + " | bidding status: CANCEL")

      await time.increase(TEN_MINUTES_DELAY);
      console.log(TAB + "-| time pass (sec.): " + TEN_MINUTES_DELAY)

      await expect(multiBidding.connect(addr1).tryFinishBidding(hashId2)).to
      .emit(multiBidding, 'CancelProposal')
      .withArgs(hashId2, TITLE_BYTES, DESCRIPTION_BYTES);
      console.log(TAB + "-| hashId: " + hashId2 + " | bidding status: CANCEL")

    });

    it("2 create | (1 payments, 0 payments , _ ) | Result: (Accept | Cancel)", async function () {

      let hashId1 = 100
      let hashId2 = 200

      await expect(multiBidding.connect(addr1).createBidding(hashId1, TITLE_BYTES, DESCRIPTION_BYTES, 1000)).to
        .emit(multiBidding, 'CreatedBidding')
        .withArgs(hashId1, TITLE_BYTES, DESCRIPTION_BYTES, addr1.address)
        console.log(TAB + "-| Create new bidding with this hashId: " + hashId1)

      await time.increase(4 * 60);
      console.log(TAB + "-| time pass (sec.): " + 4 * 60)

      await expect(multiBidding.connect(addr1).createBidding(hashId2, TITLE_BYTES, DESCRIPTION_BYTES, 1000)).to
        .emit(multiBidding, 'CreatedBidding')
        .withArgs(hashId2, TITLE_BYTES, DESCRIPTION_BYTES, addr1.address)
        console.log(TAB + "-| Create new bidding with this hashId: " + hashId2)

      await time.increase(4 * 60);
      console.log(TAB + "-| time pass (sec.): " + 4 * 60)


      await multiBidding.connect(addr2).buyItem(hashId1, { value: 2000 })
      expect(await multiBidding.connect(addr3).currentAddress(hashId1)).to.equal(addr2.address)
      console.log(TAB + "-| addr3 buy item with hashId=" + hashId1 + " with this price: " + 2000)

      await time.increase(7 * 60);
      console.log(TAB + "-| time pass (sec.): " + 7 * 60)

      await expect(multiBidding.connect(addr1).tryFinishBidding(hashId2)).to
        .emit(multiBidding, 'CancelProposal')
        .withArgs(hashId2, TITLE_BYTES, DESCRIPTION_BYTES);
        console.log(TAB + "-| hashId: " + hashId1 + " | bidding status: CANCEL")

      await time.increase(TEN_MINUTES_DELAY);
      console.log(TAB + "-| time pass (sec.): " + TEN_MINUTES_DELAY)

      await expect(multiBidding.connect(addr1).tryFinishBidding(hashId1)).to
        .emit(multiBidding, 'AcceptedProposal')
        .withArgs(hashId1, TITLE_BYTES, DESCRIPTION_BYTES, addr2.address, 2000);
        console.log(TAB + "-| hashId: " + hashId1 + " | bidding status: APPOVE | price: " + 2000)

    });

    it("2 create | (2 payments, 0 payments , _ ) | Result: (Accept | Cancel)", async function () {

      let hashId1 = 100
      let hashId2 = 200

      await expect(multiBidding.connect(addr1).createBidding(hashId1, TITLE_BYTES, DESCRIPTION_BYTES, 1000)).to
        .emit(multiBidding, 'CreatedBidding')
        .withArgs(hashId1, TITLE_BYTES, DESCRIPTION_BYTES, addr1.address)

      await time.increase(2 * 60);

      await expect(multiBidding.connect(addr1).createBidding(hashId2, TITLE_BYTES, DESCRIPTION_BYTES, 1000)).to
        .emit(multiBidding, 'CreatedBidding')
        .withArgs(hashId2, TITLE_BYTES, DESCRIPTION_BYTES, addr1.address)

      await multiBidding.connect(addr2).buyItem(hashId1, { value: 2000 })
      expect(await multiBidding.connect(addr3).currentAddress(hashId1)).to.equal(addr2.address)
      let balanceBeforeNextbuy = await addr2.getBalance()

      await time.increase(4 * 60);

      await multiBidding.connect(addr3).buyItem(hashId1, { value: 4000 })
      expect(await addr2.getBalance()).to.equal(BigInt(balanceBeforeNextbuy) + BigInt(2000))
      expect(await multiBidding.connect(addr3).currentAddress(hashId1)).to.equal(addr3.address)

      // console.log(await time.latest())
      // console.log(await multiBidding.connect(addr3).getTimeStampEnd(hashId2))
      await time.increase(7 * 60);

      await expect(multiBidding.connect(addr1).tryFinishBidding(hashId2)).to
        .emit(multiBidding, 'CancelProposal')
        .withArgs(hashId2, TITLE_BYTES, DESCRIPTION_BYTES);

      await time.increase(TEN_MINUTES_DELAY);

      await expect(multiBidding.connect(addr1).tryFinishBidding(hashId1)).to
        .emit(multiBidding, 'AcceptedProposal')
        .withArgs(hashId1, TITLE_BYTES, DESCRIPTION_BYTES, addr3.address, 4000);
    });

    it("4 create | (0 payments, 0 payments , 0 payments ) | Result: (Cancel | Cancel | Cancel)", async function () {

      let hashId1 = 100
      let hashId2 = 200
      let hashId3 = 300
      let hashId4 = 400

      await expect(multiBidding.connect(addr1).createBidding(hashId1, TITLE_BYTES, DESCRIPTION_BYTES, 1000)).to
        .emit(multiBidding, 'CreatedBidding')
        .withArgs(hashId1, TITLE_BYTES, DESCRIPTION_BYTES, addr1.address)

      await time.increase(2 * 60);

      await expect(multiBidding.connect(addr1).createBidding(hashId2, TITLE_BYTES, DESCRIPTION_BYTES, 1000)).to
        .emit(multiBidding, 'CreatedBidding')
        .withArgs(hashId2, TITLE_BYTES, DESCRIPTION_BYTES, addr1.address)

      await time.increase(6 * 60);

      await expect(multiBidding.connect(addr1).createBidding(hashId3, TITLE_BYTES, DESCRIPTION_BYTES, 1000)).to
      .emit(multiBidding, 'CreatedBidding')
      .withArgs(hashId3, TITLE_BYTES, DESCRIPTION_BYTES, addr1.address)

      await time.increase(3 * 60);

      await expect(multiBidding.connect(addr1).tryFinishBidding(hashId1)).to
        .emit(multiBidding, 'CancelProposal')
        .withArgs(hashId1, TITLE_BYTES, DESCRIPTION_BYTES);

      await expect(multiBidding.connect(addr1).createBidding(hashId4, TITLE_BYTES, DESCRIPTION_BYTES, 1000)).to
      .emit(multiBidding, 'CreatedBidding')
      .withArgs(hashId4, TITLE_BYTES, DESCRIPTION_BYTES, addr1.address)

      await time.increase(5 * 60);

      await expect(multiBidding.connect(addr1).tryFinishBidding(hashId2)).to
      .emit(multiBidding, 'CancelProposal')
      .withArgs(hashId2, TITLE_BYTES, DESCRIPTION_BYTES);

      await time.increase(4 * 60);

      await expect(multiBidding.connect(addr1).tryFinishBidding(hashId3)).to
      .emit(multiBidding, 'CancelProposal')
      .withArgs(hashId3, TITLE_BYTES, DESCRIPTION_BYTES);

      await time.increase(TEN_MINUTES_DELAY);


      await expect(multiBidding.connect(addr1).tryFinishBidding(hashId4)).to
      .emit(multiBidding, 'CancelProposal')
      .withArgs(hashId4, TITLE_BYTES, DESCRIPTION_BYTES);

      await time.increase(TEN_MINUTES_DELAY);
    });
  })
})

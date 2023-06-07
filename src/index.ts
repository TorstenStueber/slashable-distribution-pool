const { TripleTest } = require("./distributionPool");

const test = new TripleTest();

test.increaseStake("a", 10000);
test.increaseStake("b", 10000);
test.distributeReward(1000, "t");
test.getStake("a"); //10000
test.getStake("b"); //10000
test.getReward("a", "t"); //500
test.getReward("b", "t"); //500
test.displayState();
test.slashStake(50);
test.displayState();
test.getStake("a"); //10000
test.getStake("b"); //10000
test.getReward("a", "t"); //500
test.getReward("b", "t"); //500
test.slashStake(50);
test.getReward("a", "t"); //500
test.getReward("b", "t"); //500
test.increaseStake("a", 1000);
test.distributeReward(1000, "t");
test.getReward("a", "t"); //1023
test.getReward("b", "t"); //976
test.decreaseStake("a", 10000);
test.getStake("a"); //950
test.decreaseStake("a", 950);
test.getStake("a"); //0
test.increaseStake("b", 10000);
test.getStake("b"); //19950
test.distributeReward(1000, "t");
test.slashStake(10000);
test.getStake("b"); //9950
test.getReward("a", "t"); //1023
test.getReward("b", "t"); //1976

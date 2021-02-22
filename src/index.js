const core = require("@actions/core");
const github = require("@actions/github");
const testrail = require("testrail-api");

const main = async () => {
  console.log("Hello world")
}

main().catch((err) => core.setFailed(err.message));

const util = require("util");
const exec = util.promisify(require("child_process").exec);

module.exports = async (hash) => {

  const { stdout, stderr } = await exec(`ipfs cat ${hash}`).catch(
    (e) => e
  );
  // not pinned is a valid state when rm is used
  if (stderr && !stderr.includes("not pinned")) {
    console.error(`🚨 error with ${hash}`, stderr);
    return;
  }
  if (stdout) {
    console.log(`✅${hash}`);
    console.log(stdout);
    return JSON.parse(stdout);
  }
};

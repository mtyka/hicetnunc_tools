/**
 * fetch all tokens for a given address (created/collected)
 */
const config = require("../config");
const filterUnique = require("./filter.unique");
const getAllBCD = require("./get.all.bcd");
module.exports = async (token_id) => {
  // the original hicetnunc-api was fetching ALL the tokens/swaps
  // which gets less scalable as the platform adds more and more tokens
  // instead, let's just ask for all the token swap activity for this specific wallet
  // then we can filter it down and get the status of each token from another API
  const transfers = await getAllBCD(
    `https://api.better-call.dev/v1/tokens/mainnet/transfers/KT1Hkg5qeNhfwpKW4fXvq7HGZB9z2EnmCCA9?sort=asc&token_id=${token_id}`, "transfers"
  );
  
  return transfers;

	console.log(transfers);
  // we only care about the hicetnunc contracts
  const filtered = transfers.filter(
    (xfer) => xfer.contract === config.nftContract
  );

  // now we split into collected and created
  // yeah, this is inneficient to do 3 loops but I'm lazy and the perf is negligible
  const collected = filtered
    .map((xfer) => (xfer.parent === "collect" ? xfer.token_id : null))
    .filter(filterUnique) // only care about unique token_ids
    .filter((i) => i); // remove nulls

  // the things we created have been swapped and canceled
  // note: this will change when the resale market opens
  // then, we'll need to compare the source wallet and dest wallet
  const created = filtered
    .map((xfer) => (xfer.parent === "swap" ? xfer.token_id : null))
    .filter(filterUnique) // only care about unique token_ids
    .filter((i) => i); // remove nulls

  return { collected, created };
};

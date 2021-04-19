/**
 * Which items are available for sale by an address?
 *
 * node available.js tz1iyFi4WjSttoja7Vi1EJYMEKKSebQyMkF9
 */
const config = require("./config");
const getHolders = require("./lib/get.holders");
const getTokens = require("./lib/get.address.tokens");
const reduceSum = require("./lib/reduce.sum");
const conseilUtil = require("./lib/conseilUtil");
const getObjktMeta = require("./lib/get.objkt.meta");
const {
  getArtisticOutputForAddress,
  getCollectionForAddress,
} = require("./lib/conseilUtil");

const tz = process.argv[2];
if(!tz) {
  console.log("node creations.js <wallet>");
  return 1;
}
const getWalletMetadata = require("./lib/get.wallet.metadata.js");

const baseURL = `https://www.hicetnunc.xyz/objkt/`;

console.log(`⚡ fetching creation info for address ${tz}...`);

wallet_owner = async(wallet) => {
  const meta = await getWalletMetadata(wallet);
  const owner = meta["twitter"] ? `@${meta["twitter"]}` : 0 || meta["alias"] || "???";
  return owner;
}

audit_list = async(tokens) => {

  const details = await Promise.all(
    tokens.map(async (token) => {
      const token_id = token["objectId"];
      const holders = await getHolders(token_id);
      const swaps = await conseilUtil.getSwapsById(token_id);
      const meta = await getObjktMeta(token["ipfsHash"]);
      const creator = await wallet_owner(meta["creators"][0]);
      return {
        token_id,
        holders,
        swaps,
        total: Object.values(holders).reduce(reduceSum),
        meta,
        token,
        creator
      };
    })
  );

  details.sort((a, b) => (parseInt(a.token_id) < parseInt(b.token_id) ? -1 : 1));

  details.forEach((o) => {
    const available = o.holders[config.protocol]||0;
    const reserve = o.holders[tz]||0;
    let line = `  ${baseURL}${o.token_id} Held/Avail/Total: ${reserve}/${available}/${o.total}  Primary:`

    for(s of o.swaps) {
      if(s.issuer == tz) {
        line += ` ${s.objkt_amount}x${s.xtz_per_objkt/1000000}ꜩ `;
      }
    }
    line += " Resale: ";
    for(s of o.swaps) {
      if(s.issuer != tz) {
        line += ` ${s.objkt_amount}x${s.xtz_per_objkt/1000000}ꜩ `;
      }
    }
    console.log(o.meta.name);
    console.log(line);
   }
  );
};

(async () => {
  console.log("Auditing Collection...", tz);
  const creations = await getArtisticOutputForAddress(tz);
  await audit_list(creations);
})();

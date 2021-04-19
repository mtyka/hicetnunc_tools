const fetchJSON = require("./fetch.json");
let cache = {};

module.exports = (wallet) => {
  if(!wallet) return {};
  if(wallet in cache) {
    return Promise.resolve(cache[wallet]);
  } else {
    const url = "https://api.tzkt.io/v1/accounts/" + wallet + "/metadata";

    return fetchJSON(url).then(function(v) {
        cache[wallet] = v;
        return v;
        });
  }
}

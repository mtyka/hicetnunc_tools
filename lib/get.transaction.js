const fetchJSON = require("./fetch.json");
module.exports = (hash) => {
  const url = "https://api.better-call.dev/v1/opg/" + hash; 
  return fetchJSON(url);
}

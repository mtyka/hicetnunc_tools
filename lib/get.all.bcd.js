/**
 * fetch all content (paginated) for a given API route on better-call.dev
 */
const fetchJSON = require("./fetch.json");
module.exports = async (url, key) => {
  // console.log(url, key);
  const fetch = async (page) => {
    // should really use a url parser here ?
    const pagedurl = url + ( url.match( /[\?]/g ) ? '&' : '?' ) +  `last_id=${page}` 
    const response = await fetchJSON(page ? pagedurl : url);
    // console.log({ response });
    if (!response || !response[key]) {
      return [];
    }
    if (response.last_id && response.last_id !== "0") {
      const sub = await fetch(response.last_id);
      return [...response[key], ...sub];
    }
    return response[key];
  };
  return fetch();
};

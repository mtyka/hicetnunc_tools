const fs = require('fs');
const conseilUtil = require("./lib/conseilUtil");
const getIPFS = require("./lib/get.IPFS");

 (async () => {
   const objkt_ids = [...Array(80000).keys()].map(i => (i).toString());
   const ipfsmap = await conseilUtil.getMetadataIpfsMap(objkt_ids);
   fs.writeFileSync('data/all_ipfs_hashes.json', JSON.stringify(ipfsmap))

   let all_metadata = {};
   for(id in ipfsmap) {
     try {
       const metadata = await getIPFS(ipfsmap[id]);
       all_metadata[id] = {
         'metadata_ipfshash': ipfsmap[id],
         'metadata': metadata
       }
     } catch (e) {
     }
   }
   fs.writeFileSync('data/all_metadata.json', JSON.stringify(all_metadata))

 })();

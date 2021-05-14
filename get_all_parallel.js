const fs = require('fs');
const conseilUtil = require("./lib/conseilUtil");
const getIPFS = require("./lib/get.IPFS");

 (async () => {
   const objkt_ids = [...Array(80000).keys()].map(i => (i).toString());
   const ipfsmap = await conseilUtil.getMetadataIpfsMap(objkt_ids);
   fs.writeFileSync('data/all_ipfs_hashes.json', JSON.stringify(ipfsmap))

   let all_metadata = {};
   const blocksize = 10;
   const ipfs_chunks = conseilUtil.chunkArray(Object.entries(ipfsmap),  blocksize);
   for(i in ipfs_chunks) {
    const chunk = ipfs_chunks[i];
    await Promise.all(chunk.map( async (pair) => {
      const objkt_id = pair[0];
      const ipfshash = pair[1];
      try {
        const metadata = await getIPFS(ipfshash);
        all_metadata[objkt_id] = {
          'metadata_ipfshash': ipfshash,
          'metadata': metadata
        }
      } catch(e) {
        // Todo add some retry logic here
        console.log("BAD: ", ipfshash, objkt_id);
      }
    }));
    console.log("Block:", i);
   };
   fs.writeFileSync('data/all_metadata_p.json',
          JSON.stringify(all_metadata))

 })();

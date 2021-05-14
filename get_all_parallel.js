const fs = require('fs');
const conseilUtil = require("./lib/conseilUtil");
const getIPFS = require("./lib/get.IPFS");

 (async () => {
   let all_metadata = {};
   try {
     all_metadata = JSON.parse(fs.readFileSync('data/all_metadata.json'));
   } catch(e) { }

   const objkt_ids = [...Array(80000).keys()]
     .filter(i => !(i in all_metadata))
     .map(i => (i).toString());
   const ipfsmap = await conseilUtil.getMetadataIpfsMap(objkt_ids);
   fs.writeFileSync('data/all_ipfs_hashes.json', JSON.stringify(ipfsmap))

   const blocksize = 10;
   const ipfs_chunks = conseilUtil.chunkArray(Object.entries(ipfsmap),  blocksize);
   let newdata = 0;
   for(i in ipfs_chunks) {
    if(i==6769) continue;
    const chunk = ipfs_chunks[i];
    await Promise.all(chunk.map( async (pair) => {
      const objkt_id = pair[0];
      const ipfshash = pair[1];
      if(ipfshash=='QmTb9Px2w8t4YkzHrX6dK4KpMSUdfgCCy49o61GEJXCuhC') return; // bad somehow ipfs has lost this ??
      if(ipfshash=='QmUZxF8fZCcr2HfqggWF3M5JZD88ScNsMnKcKWAAn2e7Hh') return; // bad somehow
      if(ipfshash=='QmTUJvxbBTrrBBKgJcxcyM8uYpRjrhCaMtkwDncdAq6KJH') return; // bad somehow
      console.log(objkt_id, ipfshash);
      try {
        if(!(objkt_id in all_metadata)){
          const metadata = await getIPFS(ipfshash);
          all_metadata[objkt_id] = {
            'metadata_ipfshash': ipfshash,
            'metadata': metadata
          }
          newdata += 1;
          console.log("DONE:", objkt_id, ipfshash);
        }
      } catch(e) {
        // Todo add some retry logic here
        console.log("BAD: ", ipfshash, objkt_id);
      }
    }));
    console.log("Block:", i, "Read: ", newdata);
    if(((newdata+1)%100)==0) {
      console.log("Writing..");
      fs.writeFileSync('data/all_metadata.json',
          JSON.stringify(all_metadata))
    }
   };
   fs.writeFileSync('data/all_metadata.json',
          JSON.stringify(all_metadata))

 })();

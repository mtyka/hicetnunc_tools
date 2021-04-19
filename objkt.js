/**
 */
const fs = require('fs');
const config = require("./config");
const getHolders = require("./lib/get.holders");
const filterUnique = require("./lib/filter.unique");
const conseilUtil = require("./lib/conseilUtil");
const getBlockedObj = require("./lib/get.blocked.obj");
const getBlockedTz = require("./lib/get.blocked.tz");
const getIPFS = require("./lib/get.IPFS");
const objktSanitize = require("./lib/objkt.sanitize");
const pin = require("./lib/ipfs.pin");
const getWalletMetadata = require("./lib/get.wallet.metadata.js");
const getTokenTransactions = require("./lib/get.token.transfers.js");
const getTransactionByHash = require("./lib/get.transaction.js");
const baseURL = `https://www.hicetnunc.xyz/objkt/`;


 (async () => {
   const token_id = process.argv[2];
   if(!token_id) {
     console.log("node objkt.js <object_id>");
     return 1;
   }
   const obj = await conseilUtil.getObjectById(token_id);
   console.log(obj);
   transfers = await getTokenTransactions(token_id);
   for(t of transfers) {

     const transaction = await getTransactionByHash(t["hash"])
     const wallet = t["parent"]=="swap" ? t["from"] : t["to"];
     const meta = await getWalletMetadata(wallet);
     const twitter = meta["twitter"] ? `@${meta["twitter"]}` : 0 || meta["alias"] || "???";

     if(t["parent"]=="swap"){
       console.log(t["timestamp"], t["from"], t["amount"], t["parent"],
         transaction[0].parameters[0].children[2].value / 1e6, twitter);
     }
     if(t["parent"]=="collect"){
       console.log(t["timestamp"], t["to"], t["amount"], t["parent"], `${transaction[0]["amount"] /1e6}ꜩ`, twitter);
       for(tl of transaction){
         if(tl["destination"].startsWith("KT")) continue;
         if(tl["destination"]=="tz1UBZUkXpKGhYsP5KtzDNqLLchwF4uHrGjw") continue;
         console.log(tl["destination"], tl["amount"])
       }
     }
   }
 })();

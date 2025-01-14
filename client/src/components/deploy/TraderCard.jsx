import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Trader from "../../abis/Trader.json";
import Whitelist from "../../abis/Whitelist.json";
import web3 from "../../connections";
import DeployTrader from "./DeployTrader";

const TraderCard = ({ walletAddress }) => {
   const whitelistAddress = useSelector((store) => store.whitelistAddress);

   const [traderInfo, setTraderInfo] = useState({
      name: "",
      contractAddress: "",
      walletAddress: walletAddress,
   });
   //COde to initially fetch the address
   const getTraderAddress = async () => {
      if (!whitelistAddress) {
         console.log("No Whitelist address in the redux state");
         return;
      }
      const whitelistContract = new web3.eth.Contract(
         Whitelist.abi,
         whitelistAddress
      );

      const res = await whitelistContract.methods
         .getTraderAddress(walletAddress)
         .call();
      console.log("res: ", res);
      setTraderInfo({ ...traderInfo, contractAddress: res });
   };

   const fetchTraderDetails = () => {
      const traderContract = new web3.eth.Contract(
         Trader.abi,
         traderInfo.contractAddress
      );
      traderContract.methods
         .name()
         .call()
         .then((res) => {
            setTraderInfo({
               ...traderInfo,
               name: res,
            });
         });
   };
   //Code to fetch other details form stock address
   // const fetchDetails = async () => {
   //    const contract = new web3.eth.Contract(Trader.abi, traderInfo.address);
   //    const unsold = await contract.methods
   //       .unsold_amount()
   //       .call()
   //    const price = await  contract.methods
   //       .currentPrice()
   //       .call()
   //    const amountInPublic = await contract.methods
   //       .amountInPublic()
   //       .call()
   //    settraderInfo({
   //       ...traderInfo,
   //       price: price,
   //       unsold: unsold,
   //       amountInPublic: amountInPublic
   //    })
   //    // console.log("Fetched Details: ", res);
   // };
   useEffect(() => {
      getTraderAddress();
   }, [whitelistAddress]);

   useEffect(() => {
      if (traderInfo.contractAddress) {
         fetchTraderDetails();
      }
   }, [traderInfo.contractAddress]);
   // useEffect(() => {
   //    if(traderInfo.walletAddress){
   //       fetchDetails();
   //    }
   // }, [traderInfo.walletAddress])

   return (
      <div className="bg-opacity-80 rounded-xl bg-black p-3 my-5 justify-between items-center flex justify between flex-wrap">
         <div className="">
            <p className="text-white">
               <span className="text-primary font-medium">Wallet Address </span>
               {traderInfo.walletAddress}
            </p>
            <p className="text-white">
               <span className="text-primary font-medium">
                  Contract Address{" "}
               </span>
               {traderInfo.contractAddress}
            </p>
         </div>
         <div className="flex  space-x-10">
            <div>
               <p className="text-lg font-semibold text-primary">
                  {traderInfo.name}
               </p>
            </div>
         </div>
      </div>
   );
};

export default TraderCard;

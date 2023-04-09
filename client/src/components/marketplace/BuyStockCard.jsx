import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import web3 from "../../connections";
import Stock from "../../abis/Stock.json";
import Whitelist from "../../abis/Whitelist.json";

const BuyStockCard = ({ traderAddress, name }) => {
   const whitelistAddress = useSelector((store) => store.whitelistAddress);

   const [stockInfo, setStockInfo] = useState({
      name: name,
      price: 0,
      unsold: 0,
      amountInPublic: 0,
      address: "",
   });
   // console.log("stockInfo: ", stockInfo);
   //COde to initially fetch the address
   const getStockAddress = async () => {
      if (!whitelistAddress) {
         console.log("No Whitelist address in the redux state");
         return;
      }
      const whitelistContract = new web3.eth.Contract(
         Whitelist.abi,
         whitelistAddress
      );
      const res = await whitelistContract.methods.getStockAddress(name).call();
      setStockInfo({ ...stockInfo, address: res });
   };
   //Code to fetch other details form stock address
   const fetchDetails = async () => {
      const contract = new web3.eth.Contract(Stock.abi, stockInfo.address);
      const unsold = await contract.methods.unsold_amount().call();
      const price = await contract.methods.currentPrice().call();
      const amountInPublic = await contract.methods.amountInPublic().call();
      setStockInfo({
         ...stockInfo,
         price: price,
         unsold: unsold,
         amountInPublic: amountInPublic,
      });
      // console.log("Fetched Details: ", res);
   };
   useEffect(() => {
      getStockAddress();
   }, [whitelistAddress]);
   useEffect(() => {
      const fetchLoop = () =>
         setInterval(() => {
            fetchDetails();
         }, 1000);
      if (stockInfo.address) {
         fetchDetails();
         fetchLoop();
      }
      return () => {
         clearInterval(fetchLoop);
      };
   }, [stockInfo.address]);

   //function to buy a stock

   const verifyTrader = () => {
      
   }

   const buyStock = () => {
      if (!traderAddress) {
         alert("No trader contract address");
      }

      const traderContract = new web3.eth.Contract("");
   };

   return (
      <div className="border-2 border-black rounded-lg p-3 bg-black bg-opacity-10 mb-6">
         <h3 className="text-3xl text-primary font-semibold my-3">
            {stockInfo.name}
         </h3>
         <p>
            <strong className="text-lg">Price: </strong>
            {stockInfo.price}
         </p>
         <p>
            <strong className="text-lg">Stock Address: </strong>
            {stockInfo.address}
         </p>
         <div className="flex space-x-3 mt-3">
            <button
               onClick={() => {
                  buyStock();
               }}
               className="py-2 px-4 w-full rounded-lg border-white border-2 bg-blue-400 text-white"
            >
               Buy
            </button>
            <button
               onClick={() => {
                  buyStock();
               }}
               className="py-2 px-4 w-full rounded-lg border-white border-2 bg-red-400 text-white"
            >
               Sell
            </button>
         </div>
      </div>
   );
};

export default BuyStockCard;
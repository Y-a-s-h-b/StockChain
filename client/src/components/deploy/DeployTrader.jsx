import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import web3 from "../../connections";
import Whitelist from "../../abis/Whitelist.json";
import Trader from "../../abis/Trader.json";
import axios from "axios";
import { addTraders } from "../../actions";
import TraderCard from "./TraderCard";

const DeployTrader = () => {
   const dispatch = useDispatch();
   const address = useSelector((store) => store.walletAddress);
   const governmentAccount = useSelector((store) => store.governmentAccount);
   const whitelistAddress = useSelector((store) => store.whitelistAddress);
   const traders = useSelector(store => store.traders);

   const [deployParams, setDeployParams] = useState({
      name: "",
      address: "",
   });

   // useEffect(() => {
   //    setDeployParams({
   //       ...deployParams,
   //       address: address
   //    })
   // }, [address]);

   const handleChange = (e) => {
      setDeployParams({ ...deployParams, [e.target.name]: e.target.value });
   };

   const checkWallet = async () => {
      const whitelistContract = new web3.eth.Contract(
         Whitelist.abi,
         whitelistAddress
      );
      const res = await whitelistContract.methods
         .verifyWallet(deployParams.address)
         .call();
      return res;
   };

   const getTraders = () => {
      axios.get("/traders").then((res) => dispatch(addTraders(res.data)));
   }

   const deployTrader = async () => {
      if (address.toLowerCase() !== governmentAccount.toLowerCase()) {
         alert("Only Government address can deploy a trader");
         return;
      }
      const isDeployed = await checkWallet();
      if (isDeployed) {
         alert("A trader using this wallet address is already Deployed!");
         return;
      }
      const traderContract = new web3.eth.Contract(Trader.abi);
      traderContract
         .deploy({
            data: Trader.bytecode,
            arguments: [deployParams.name,deployParams.address],
         })
         .send({
            from: address,
            gas: 1500000,
         })
         .then((res) => {
            const deployedAddress = res._address;
            const whitelistContract = new web3.eth.Contract(
               Whitelist.abi,
               whitelistAddress
            );
            whitelistContract.methods
               .addTrader(deployParams.name,deployParams.address,deployedAddress)
               .send({
                  from: address,
                  gas: 1000000,
               })
               .then((res) => {
                  if (res.status) {
                     axios.post("/traders", {
                        walletAddress: deployParams.address,
                        contractAddress: deployedAddress
                     }).then(() => {
                        getTraders();
                     })
                  }
               });
         });
   };



   return (
      <div className="flex flex-col mx-auto space-y-4 py-3 p-3 max-w-3xl">
         <h1 className="text-4xl text-center">
            Whitelist Trader/ Create Trader Contract
         </h1>
         <label htmlFor="">Name</label>
         <input
            type="text"
            name="name"
            value={deployParams.name}
            onChange={(e) => handleChange(e)}
            placeholder="Name"
            className="p-3 border-2 border-black  rounded-md"
         />
         <label htmlFor="">Wallet Address</label>
         <input
            type="text"
            name="address"
            value={deployParams.address}
            onChange={(e) => handleChange(e)}
            placeholder="Address"
            className="p-3 border-2 border-black  rounded-md"
         />

         <button
            onClick={() => deployTrader()}
            className="text-white bg-blue-600 p-2 rounded-lg"
         >
            Deploy
         </button>
         {
            traders.map((trader,index) => {
               return <TraderCard key={index} walletAddress={trader.walletAddress}/>
            })
         }
      </div>
   );
};

export default DeployTrader;

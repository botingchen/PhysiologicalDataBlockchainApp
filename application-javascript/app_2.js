'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const channelName = 'my-channel1';
const chaincodeName = 'chaincode1';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'appUser3';
const { buildCCPOrg1, buildWallet } = require('../test-application/javascript/AppUtil.js');

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

async function main() {
	try {


		// setup the wallet to hold the credentials of the application user
		const wallet = await buildWallet(Wallets, walletPath);
        const ccp = buildCCPOrg1();
		// Create a new gateway instance for interacting with the fabric network.
		// In a real application this would be done as the backend server session is setup for
		// a user that has been verified.
		const gateway = new Gateway();

		try {
			// setup the gateway instance
			// The user will now be able to create connections to the fabric network and be able to
			// submit transactions and query. All transactions submitted by this gateway will be
			// signed by this user using the credentials stored in the wallet.
			await gateway.connect(ccp, {
				wallet,
				identity: org1UserId,
				discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
			});

			// Build a network instance based on the channel where the smart contract is deployed
			const network = await gateway.getNetwork(channelName);

			// Get the contract from the network.
			const contract = network.getContract(chaincodeName);

			// Initialize a set of asset data on the channel using the chaincode 'InitLedger' function.
			// This type of transaction would only be run once by an application the first time it was started after it
			// deployed the first time. Any updates to the chaincode deployed later would likely not need to run
/*			// an "init" type function.
			console.log('\n--> Submit Transaction: InitLedger, function creates the initial set of assets on the ledger');
			await contract.submitTransaction('InitLedger');
			console.log('*** Result: committed');

			// Let's try a query type operation (function).
			// This will be sent to just one peer and the results will be shown.
			console.log('\n--> Evaluate Transaction: GetAllAssets, function returns all the current assets on the ledger');
			let result = await contract.evaluateTransaction('GetAllAssets');
			console.log(`*** Result: ${prettyJSONString(result.toString())}`);

			// Now let's try to submit a transaction.
			// This will be sent to both peers and if both peers endorse the transaction, the endorsed proposal will be sent
			// to the orderer to be committed by each of the peer's to the channel ledger.*/
			console.log('\n--> Submit Transaction: CreateACL, creates new ACL with ID, attribute, provider, and availability arguments');
			const result = await contract.submitTransaction('KVContract:CreateACL', 'app2', 'stepcount', 'apple',  '1');

			console.log('*** Result: committed');
			if (`${result}` !== '') {
				console.log(`*** Result: ${prettyJSONString(result.toString())}`);
			}

			console.log('\n--> Submit Transaction: CreateACL, creates new ACL with ID, attribute, provider, and availability arguments');
            const result_3 = await contract.submitTransaction('KVContract:CreateACL', 'app2', 'blood_pressure', 'google',  '1');
            console.log('*** Result: committed');
            if (`${result_3}` !== '') {
                    console.log(`*** Result: ${prettyJSONString(result_3.toString())}`);
            }

			console.log('\n--> Evaluate Transaction: ReadACL, function returns an access control list with a given pubkey and attribute');
			let result_2 = await contract.evaluateTransaction('KVContract:ReadACL', 'dv234re','stepcount');
			console.log(`*** Result: ${prettyJSONString(result_2.toString())}`);

            console.log('\n--> Evaluate Transaction: ReadACL, function returns an access control list with a given pubkey and attribute');
			result_2 = await contract.evaluateTransaction('KVContract:ReadACL', 'app2','stepcount');
			console.log(`*** Result: ${prettyJSONString(result_2.toString())}`);

/*			console.log('\n--> Evaluate Transaction: PubkeyExists, function returns "true" if an ACL with given pubkey and attribution exist');
			result_2 = await contract.evaluateTransaction('KVContract:ReadACL', 'dv234re',' stepcount');
			console.log(`*** Result: ${result2}`);*/

			console.log('\n--> Submit Transaction: UpdateACL, change the availability');
			await contract.submitTransaction('KVContract:UpdateACL', 'dv234re', 'stepcount', 'apple', '0');
			console.log('*** Result: committed');

			console.log('\n--> Evaluate Transaction: ReadACL, function returns the ACL of given pubkey and attributes');
			result_2 = await contract.evaluateTransaction('KVContract:ReadACL', 'dv234re','stepcount');
			console.log(`*** Result: ${prettyJSONString(result_2.toString())}`);


                        console.log('\n--> Evaluate Transaction: ReadACL, function returns the ACL of given pubkey and attributes');
                        result_2 = await contract.evaluateTransaction('KVContract:ReadACL', 'dv234re','blood_pressure');
                        console.log(`*** Result: ${prettyJSONString(result_2.toString())}`);			                        
			console.log('\n--> Evaluate Transaction: GetAllAssets, function returns all the current assets on the ledger');
                        //const resul_2 = await contract.evaluateTransaction('KVContract:GetAllACL');
                        //console.log(`*** Result: ${prettyJSONString(result_2.toString())}`);
			//console.log(resul_2);


		} finally {
			// Disconnect from the gateway when the application is closing
			// This will close all connections to the network
			gateway.disconnect();
		}
	}catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
}

main();
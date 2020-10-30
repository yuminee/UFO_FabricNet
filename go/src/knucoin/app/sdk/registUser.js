'use strict';

const { CouchDBWallet, Gateway, X509WalletMixin } = require('fabric-network');
const path = require('path');
const sdk = require('../server/sdk')

async function main(args, res) {
    try {

        let ccpPath = '';
        let url = ''
        switch(args[2]){
            case 'SalesOrg':
                url = "http://knucoin:knucoin@localhost:9984"
                ccpPath = path.resolve(__dirname, '../../network/ca file', 'connection_sales.json')
                break;
            case 'CustomerOrg':
                url = "http://knucoin:knucoin@localhost:10984"
                ccpPath = path.resolve(__dirname, '../../network/ca file', 'connection_customer.json')
                break;
        }

        const wallet = new CouchDBWallet({"url":url})

        const userExists = await wallet.exists(args[0]);
        if (userExists) {
            console.log(`An identity for the client user(id:${args[0]}) of ${args[2]} already exists in the wallet`);
            res.send('fail')
            return;
        }

        const adminExists = await wallet.exists(args[1]);
        if (!adminExists) {
            console.log(`register: An identity for the admin user(id:${args[1]}) of ${args[2]} doesn't exists in the wallet`);
            console.log('register: Run the enrollAdmin.js application before retrying');
            res.send('fail')
            return;
        }
        console.log("1")
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: args[1], discovery: { enabled: true, asLocalhost: true } });
        console.log("2")
        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();
        console.log("3")
        const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: args[0], role: 'client' }, adminIdentity);
        const enrollment = await ca.enroll({ enrollmentID: args[0], enrollmentSecret: secret });
        const userIdentity = X509WalletMixin.createIdentity(args[2], enrollment.certificate, enrollment.key.toBytes());
        await wallet.import(args[0], userIdentity);
        console.log("4")
        // Excute ChainCode to init Wallet
        const network = await gateway.getNetwork('channelsales1');
        const contract = network.getContract('knucoin-cc3');
        console.log("5")
        await contract.submitTransaction('initWallet', ...[args[0]])
        await gateway.disconnect();
        console.log("6")
        console.log(`register: Successfully registered and enrolled client user(id:${args[0]}) of ${args[2]} and imported it into the wallet`);
        res.send('success')
        console.log("7")
    } catch (error) {
        console.error(`register: Failed to enroll client user(id:${args[0]}) of ${args[2]}: ${error}`);
        process.exit(1);
    }
}

module.exports = {
    main:main
}
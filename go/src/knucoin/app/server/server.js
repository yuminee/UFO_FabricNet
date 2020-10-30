const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path')

app.use(bodyParser.json())
require('dotenv').config({ path: path.join(__dirname, '../../network/.env') });

const { PORT : port } = process.env;
const host = 'localhost';

var sdk = require('./sdk');
var regist = require('../sdk/registUser')

app.post('/api/registUser', (req, res) => {

    id = req.body.id
    admin = req.body.admin
    org = req.body.org

    args = [id, admin, org]

    regist.main(args, res)
})

app.post('/api/chargeMoney', (req, res) => {
   
    id = req.body.id
    org = req.body.org
    amount = req.body.amount

    user = [id, org]
    args = [id, amount]

    sdk.send(true, user, 'chargeMoney', args, res)
})

app.post('/api/transferMoney', (req, res) => {

    sender = req.body.sender
    receiver = req.body.receiver
    amount = req.body.amount
    org = req.body.org

    user = [sender, org]
    args = [sender, receiver, amount]

    sdk.send(true, user, 'transferMoney', args, res)
})

app.post('/api/getWallet', (req, res) => {

    id = req.body.id
    org = req.body.org

    user = [id, org]
    args = [id]

    sdk.send(true, user, 'getWallet', args, res)
})


app.listen(port, host);
console.log(`http://${host}:${port} has been connected`);
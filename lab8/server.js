const express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    path = require('path');
const app = express();
const mongoURI = 'mongodb+srv://opa:11110000@test-7x8hy.mongodb.net/orderDb?retryWrites=true&w=majority';
const dataFilePath = './assets/data/data.json';

const orderDataSchema = new mongoose.Schema({
    name: { type: String, required: true },
    cost: Number,
    amount: Number
}, {
    collection: 'orders',
    versionKey: false
});
const OrderData = mongoose.model('OrderData', orderDataSchema);

app.use(express.static(path.join(__dirname, 'assets')));
app.use(bodyParser.json());

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true }, err => {
    if (err) {
        return console.log(err);
    }

    app.listen(4000, function () {
        console.log('Server is running');
    });
});


function retrieveOrderFromRequest(req) {
    const order = {
        name: req.body.name,
        cost: req.body.cost,
        amount: req.body.amount
    };

    if (!order.cost || isNaN(order.cost) || !order.amount || isNaN(order.amount)) {
        return {};
    }
    return order;
}


async function saveOrderToFile(order, callback) {
    const json = fs.readFileSync(dataFilePath, 'utf8');
    const orders = json != "" ? JSON.parse(json) : [];

    console.log(orders);
    orders.push(order);
    fs.writeFile(dataFilePath, JSON.stringify(orders));
}


async function readOrdersFromFile(callback) {
    const json = fs.readFileSync(dataFilePath, 'utf8');

    return json != "" ? JSON.parse(json) : [];
}

function clearOrdersFromFile(filterObj) {
    readOrdersFromFile().then(orders => {
        const filteredOrders = orders.filter(el => el.cost <= filterObj['cost']['gt']);
        fs.writeFile(dataFilePath, JSON.stringify(filteredOrders));
    })
}


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


app.get('/data', (req, res) => {
    const fromFileQueryParam = req.query.fromFile;

    try {
        if (fromFileQueryParam) {
            readOrdersFromFile().then(orders => res.json(orders));
        }
        else {
            OrderData.find().then(orders => res.json(orders));
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});


app.post('/data', (req, res) => {
    const order = retrieveOrderFromRequest(req);

    if (!Object.keys(order).length) {
        res.status(422).send('Incorrect field format');
    }
    else {
        const orderData = new OrderData(order);

        orderData.save();
        saveOrderToFile(orderData._doc);
        res.status(201).json(order);
    }
});


app.delete('/data', (req, res) => {
    if (!req.body['min']) {
        res.status(422).send('Incorrect field format');
        return;
    }

    OrderData.deleteMany({ cost: { $gt: +req.body.min } }, err => console.log(err));
    clearOrdersFromFile({ cost: { 'gt': +req.body.min } });
    res.status(204).send('Success');
});


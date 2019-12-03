const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

const brData = require('./assets/data/Belarus.json')
const ukData = require('./assets/data/UK.json')
const usaData = require('./assets/data/USA.json')
const rusData = require('./assets/data/Russia.json')


app.use(express.static(path.join(__dirname, 'assets')));


app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});


app.get('/data/belarus', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    return res.json(brData);
})


app.get('/data/usa', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    return res.json(usaData);
})


app.get('/data/uk', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    return res.json(ukData);
})


app.get('/data/russia', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    return res.json(rusData)
})


app.listen(process.env.PORT || 4000, function(){
    console.log('NodeJS server is running');
});
const mqtt = require('mqtt');
const express = require('express');
const path = require('path');

const client = mqtt.connect(process.env.BROKER, {
    clientId: 'testing',
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
});
const app = express();

client.on('connect', () => {
    client.subscribe('sen55/#', (err) => {
        if (!err) {
            console.log('Connected to MQTT Broker!');
        } else {
            console.log('Failed to connect to MQTT broker');
        }
    });
});

var data = {};

client.on('message', (topic, message) => {
    data[topic] = {
        last100: 
            data[topic]?.last100 ? 
                [
                    {
                        val: message.toString(),
                        time: new Date().toString(),
                    },
                    ...data[topic]?.last100
                ].slice(0, 100).reverse()
            :
                [
                    {
                        val: message.toString(),
                        time: new Date().toString(),
                    }
                ],
        last100MinuteIntervals: 
            data[topic]?.last100MinuteIntervals?.length >= 0 && 
            Math.floor((Math.abs(new Date(Date.now()) - new Date(data[topic]?.last100MinuteIntervals[0]?.time))/1000)/60) >= 1 ?
                [
                    {
                        val: message.toString(),
                        time: new Date().toString(),
                    },
                    ...data[topic]?.last100MinuteIntervals
                ].slice(0, 100).reverse()
            : data[topic]?.last100MinuteIntervals?.length >= 0 ?
                [ 
                    ...data[topic].last100MinuteIntervals
                ]
            :
                [
                    {
                        val: message.toString(),
                        time: new Date().toString(),
                    }
                ],
        last100FifteenMinuteIntervals: 
            data[topic]?.last100FifteenMinuteIntervals?.length >= 0 && 
            Math.floor((Math.abs(new Date(Date.now()) - new Date(data[topic]?.last100FifteenMinuteIntervals[0]?.time))/1000)/60) >= 15 ?
                [
                    {
                        val: message.toString(),
                        time: new Date().toString(),
                    },
                    ...data[topic]?.last100FifteenMinuteIntervals
                ].slice(0, 100).reverse()
            : data[topic]?.last100FifteenMinuteIntervals?.length >= 0 ?
                [ 
                    ...data[topic].last100FifteenMinuteIntervals
                ]
            :
                [
                    {
                        val: message.toString(),
                        time: new Date().toString(),
                    }
                ],
        last100HourIntervals: 
            data[topic]?.last100HourIntervals?.length >= 0 && 
            Math.floor((Math.abs(new Date(Date.now()) - new Date(data[topic]?.last100HourIntervals[0]?.time))/1000)/60) >= 60 ?
                [
                    {
                        val: message.toString(),
                        time: new Date().toString(),
                    },
                    ...data[topic]?.last100HourIntervals
                ].slice(0, 100).reverse()
            : data[topic]?.last100HourIntervals?.length >= 0 ?
                [ 
                    ...data[topic].last100HourIntervals
                ]
            :
                [
                    {
                        val: message.toString(),
                        time: new Date().toString(),
                    }
                ]
    }
});

app.get('/data', (req, res) => {
    res.send(data);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
})

app.listen(3000, () => {
    console.log('Listening to http');
});
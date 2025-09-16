'use strict';
const { app, BrowserWindow } = require("electron");
const express = require('express');
const path = require('path');
const { Server } = require('ws');

let mainWindow;

const PORT = process.env.PORT || 3000;
const INDEX = 'force.html';

// Fix 1: Serve static files and handle routes properly
const expressApp = express();

// Serve static files from current directory
expressApp.use(express.static(__dirname));

// Only redirect root to force.html, let other files be served normally
expressApp.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, INDEX));
});

const server = expressApp.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

// Fix 2: WebSocket server setup
const wss = new Server({ server });

// Your existing game logic
let boys = []
let games = []
let tournaments = []

class TournamentBracket{
    constructor(name, size, stock){
        this.name = name
        this.id = Math.random()
        this.size = size
        this.stock = stock
        if(this.stock == 0 || typeof this.stock != "number"){
            this.stock = 1
        }
        this.players = []
        this.rooms = []
        this.unpaired = 0
        this.totalIn = 0
        for(let t = 535131+(tournaments.length*64); t <  535131+(tournaments.length*64) + Math.ceil(this.size*.5); t++){
            this.rooms.push(t)
        }
        this.layer = 0
        this.layercap = Math.floor(Math.log(this.size)/Math.log(2))
        this.map = Math.floor(Math.random()*20)
        this.roundOuts = 0
    }
    sort(){
        let wet = 0
        for(let t = 0;t<this.players.length;t++){
            if(this.players[t].readyState == 1){
                wet = 1
            }else{
                this.players.splice(t,1)
                t--
            }
        }
        if(wet == 0){
            tournaments.splice(tournaments.indexOf(this), 1)
        }
    }
    pair(){
        let g = 0 
        let index1 = Math.floor(Math.random()*this.players.length)
        while(this.players[index1].lockout == this.layer){
            if(g>(this.players.length*this.players.length*this.players.length)+10){
                break
            }
            if(this.totalIn >= this.size){
                break
            }
            index1 = Math.floor(Math.random()*this.players.length)
            g++
        }
        let index2 = Math.floor(Math.random()*this.players.length)
        let j = 0 
        g = 0 
        while(index2 == index1){
            j++
            if(j>(this.players.length*this.players.length*this.players.length)+10){
                break
            }
            index2 = Math.floor(Math.random()*this.players.length)

            while(this.players[index2].lockout == this.layer){
                if(g>(this.players.length*this.players.length*this.players.length)+10){
                    break
                }
                if(this.totalIn >= this.size){
                    break
                }
                index2 = Math.floor(Math.random()*this.players.length)
                g++
            }
        }

        if(this.players[index1].lockout == this.layer){
            return
        }
        if(this.players[index2].lockout == this.layer){
            return
        }
        if(index1 == index2){
            return
        }
        let room = this.rooms[Math.floor(Math.random()*this.rooms.length)]
        let r = 0
        while(games[room].occupied == 1){
            room = this.rooms[Math.floor(Math.random()*this.rooms.length)]
            r++
            if(r>100){
                return
            }
        }
        games[this.players[index1].assigned].swapRoom(this.players[index1], room)
        games[this.players[index2].assigned].swapRoom(this.players[index2], room)
        games[room].occupied = 1

        let forceSwap = {}
        let map = this.map
        forceSwap.tournamentRoom = room
        forceSwap.map = map
        forceSwap.stock = this.stock
        forceSwap.id = this.id
        this.players[index1].send(JSON.stringify(forceSwap))
        this.players[index2].send(JSON.stringify(forceSwap))
        this.players[index1].lockout = this.layer
        this.players[index2].lockout = this.layer
        
        if(this.totalIn >= this.size){
            this.layer++
            this.size = Math.floor(this.size*.5)
        }
    }

    addPlayer(player) {
        this.players.push(player)
        this.unpaired++
        this.totalIn++
    }
}

class Game {
    constructor() {
        this.players = []
        this.occupied = 0
    }
    removePlayer(player) {
        this.players.splice(this.players.indexOf(player), 1)
        if(this.players.length == 0){
            this.occupied = 0
        }
    }
    addPlayer(player) {
        this.players.push(player)
        this.occupied = 1
    }
    swapRoom(player, room){
        this.players.splice(this.players.indexOf(player), 1)
        player.assigned = room
        games[room].addPlayer(player)
        if(this.players.length == 0){
            this.occupied = 0
        }
    }
}

// Helper function to safely relay messages
function relayMessage(ws, messageData) {
    if (!games[ws.assigned] || !games[ws.assigned].players) {
        console.error("Invalid game assignment");
        return;
    }

    try {
        // Handle different types of data
        for (let k = 0; k < games[ws.assigned].players.length; k++) {
            if (games[ws.assigned].players[k] !== ws) { // Don't send back to sender
                games[ws.assigned].players[k].send(messageData);
            }
        }
    } catch (error) {
        console.error("Failed to relay message:", error);
        console.error("Problem data type:", typeof messageData);
    }
}

// Helper function to safely stringify and send JSON
function sendJSONToGame(ws, jsonData) {
    try {
        let data = JSON.stringify(jsonData);
        for (let k = 0; k < games[ws.assigned].players.length; k++) {
            if (games[ws.assigned].players[k] !== ws) { // Don't send back to sender
                games[ws.assigned].players[k].send(data);
            }
        }
    } catch (error) {
        console.error("JSON stringify failed:", error);
        console.error("Problem object:", jsonData);
        if (jsonData && typeof jsonData === 'object') {
            for (let key in jsonData) {
                console.error(`${key}:`, typeof jsonData[key]);
                if (jsonData[key] instanceof ArrayBuffer) {
                    console.error("Found ArrayBuffer - cannot stringify!");
                }
            }
        }
    }
}

for (let t = 0; t < 1000; t++) {
    games.push(new Game())
}

// Your existing WebSocket logic
wss.on("connection", ws => {
    ws.lockout = -1
    ws.assigned = Math.round(Math.random()*0)
    ws.index = games[ws.assigned].players.length
    games[ws.assigned].addPlayer(ws)
    let pair = [games[ws.assigned].players.length, -1]
    ws.pair = pair
    
    ws.on("close", () => {
        let minarr = []
        for (let t = 0; t < games[ws.assigned].players.length; t++) {
            minarr.push(games[ws.assigned].players[t].pair[1])
        }
        if (Math.max(...minarr) == -1) {
            ws.pair[1] = 0
        } else {
            if (!minarr.includes(7)) {
                ws.pair[1] = 7
            }
            if (!minarr.includes(6)) {
                ws.pair[1] = 6
            }
            if (!minarr.includes(5)) {
                ws.pair[1] = 5
            }
            if (!minarr.includes(4)) {
                ws.pair[1] = 4
            }
            if (!minarr.includes(3)) {
                ws.pair[1] = 3
            }
            if (!minarr.includes(2)) {
                ws.pair[1] = 2
            }
            if (!minarr.includes(1)) {
                ws.pair[1] = 1
            }
            if (!minarr.includes(0)) {
                ws.pair[1] = 0
            }
        }
        
        for (let t = 0; t < games[ws.assigned].players.length; t++) {
            let sjon = {
                "delete": `${ws.pair[1]}`,
                "index": `${t}`,
                "length": `${games[ws.assigned].players.length}`
            }
            let ids = []
            for (let t = 0; t < games[ws.assigned].players.length; t++) {
                if (t != games[ws.assigned].players.indexOf(ws)) {
                    ids.push(games[ws.assigned].players[t].serverID)
                }
            }
            sjon.playerIDs = ids
            // Use safe JSON sending
            try {
                games[ws.assigned].players[t].send(JSON.stringify(sjon))
            } catch (e) {
                console.error("Failed to send delete message:", e);
            }
        }
        
        // Clean message
        let sjon = { 'clean': '1' }
        let ids = []
        for (let t = 0; t < games[ws.assigned].players.length; t++) {
            if (t != games[ws.assigned].players.indexOf(ws)) {
                ids.push(games[ws.assigned].players[t].serverID)
            }
        }
        sjon.playerIDs = ids
        sendJSONToGame(ws, sjon);
        
        games[ws.assigned].removePlayer(ws)
    })

    ws.on("message", data => {
        try {
            // Check if it's binary data (like audio)
            if (data instanceof Buffer) {
                // Relay binary data directly
                relayMessage(ws, data);
                return;
            }

            // Try to parse as JSON
            let parsed;
            try {
                parsed = JSON.parse(data);
            } catch (parseError) {
                console.error("Failed to parse message as JSON:", parseError);
                console.error("Raw data:", data.toString());
                return;
            }

            // Handle specific message types
            if (parsed.connect == 1) {
                // Connection logic - send back to all players
                sendJSONToGame(ws, parsed);
            }
            else if (parsed.makeTournament == 1) {
                let tournament = new TournamentBracket(parsed.name, parsed.size, parsed.stock);
                tournaments.push(tournament);
                tournament.addPlayer(ws);
            }
            else if (parsed.type === "audio") {
                // Audio metadata - relay as JSON
                sendJSONToGame(ws, parsed);
            }
            else {
                // For all other messages, relay as JSON
                sendJSONToGame(ws, parsed);
            }

        } catch (error) {
            console.error("Error handling message:", error);
            console.error("Message data:", data);
        }
    })
})

// Electron app setup
app.on("ready", () => {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: false,
            webSecurity: true,
            contextIsolation: true
        },
    });

    // Load the local server URL instead of file
    mainWindow.loadURL(`http://localhost:${PORT}`);
    
    mainWindow.on("closed", () => {
        mainWindow = null;
        server.close();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
    if (mainWindow === null) {
        createWindow();
    }
});
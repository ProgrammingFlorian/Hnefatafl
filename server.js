const express = require("express");
const helmet = require("helmet");
const path = require("path");
const sio = require("socket.io");
const uuid = require("uuid");

const gameserver = require("./gameserver");
const app = express();
const http = require("http").Server(app);

app.use(helmet());
app.use("/", express.static(path.join(__dirname, "static")));

http.listen(5000, () => {
    console.log("App now listening on port 5000!");
});

let io = sio.listen(http);

io.sockets.on("connection", (client) => {

    client.id = uuid();
    client.emit("onconnected", {
        id: client.id
    });

    console.log("New Client: " + client.id);

    client.on("message", (m) => {
        gameserver.onMessage(client, m);
    });

    client.on("disconnect", () => {
        console.log("Client " + client.id + " disconnected");
        if(client.game && client.game.id){
            gameserver.endGame(client.game.id, 0);
        }
    });

});
const uuid = require("uuid");

let gameserver = module.exports = {
    games: {},
    gameCount: 0
}

gameserver.findGame = function(player, name) {
    console.log("Searching a Game for " + player.id);
    if(this.gameCount){
        var joined = false;
        for(var gameid in this.games){
            if(!this.games.hasOwnProperty(gameid))
                continue;

            var gameInstance = this.games[gameid];

            if(gameInstance.playerCount < 2 && gameInstance.name == name){
                joined = true;
                gameInstance.playerClient = player;
                gameInstance.playerCount++;

                console.log("Player " + player.id + " joined Game " + gameInstance.id);

                if(gameInstance.name != "random")
                    player.emit("server", {
                        message: "roomname:" + gameInstance.name
                    });

                this.startGame(gameInstance);
            }
        }
        if(!joined)
            this.createGame(player, name);
    }else{
        this.createGame(player, name);
    }
}

gameserver.createGame = function(player, name) {
    if(name !== "random"){
        for(var gameid in this.games){
            if(!this.games.hasOwnProperty(gameid))
                continue;

            var gameInstance = this.games[gameid];
            if(gameInstance.name === name){
                player.emit("server", {
                    message: "alreadyexists"
                });
                return;
            }
        }
    }

    var game = {
        id: uuid(),
        playerHost: player,
        playerClient: null,
        playerCount: 1,
        positions: [
            [0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0],
            [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2],
            [2, 0, 0, 0, 1, 1, 1, 0, 0, 0, 2],
            [2, 2, 0, 1, 1, 3, 1, 1, 0, 2, 2],
            [2, 0, 0, 0, 1, 1, 1, 0, 0, 0, 2],
            [2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
            [0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0]
        ],
        turnBlack: true,
        name: name
    };

    this.games[game.id] = game;
    this.gameCount++;
    player.game = game;
    player.hosting = true;
    player.emit("server", {
        message: "hosting:" + game.id
    });
    if(game.name != "random")
        player.emit("server", {
            message: "roomname:" + game.name
        });

    console.log("Player " + player.id + " created a Game");

    return game;
}

gameserver.startGame = function(game) {
    console.log("Starting Game " + game.id);
    game.playerClient.emit("server", {
        message: "joined:" + game.id
    });
    game.playerClient.game = game;
    game.playerClient.emit("server", {
        message: "start:" + game.playerHost.id
    });
    game.playerHost.emit("server", {
        message: "start:" + game.playerClient.id
    });
    game.active = true;
}

gameserver.onMessage = function(client, message) {
    console.log("Message from " + client.id + ": " + JSON.stringify(message));
    if(message.type == "room"){
        if(message.name){
            this.findGame(client, message.name);
        }
    }else if(message.type == "move"){
        if(client.game.turnBlack == (client.id == client.game.playerHost.id) && this.checkMove(client.game, message.x1, message.y1, message.x2, message.y2, message._type) === true){
            client.game.turnBlack = !client.game.turnBlack;
            client.game.positions[message.y1][message.x1] = 0;
            client.game.positions[message.y2][message.x2] = message._type;
            var otherClient = (client.game.playerHost.id == client.id) ? client.game.playerClient : client.game.playerHost;
            if(otherClient)
                otherClient.emit("move", message);
            client.emit("move", message);
            this.checkKick(client.game, message.x2, message.y2);
            this.checkWin(client.game);
        }else{
            console.log("Invalid move from " + client.id);
        }
    }
}

gameserver.checkMove = function(game, x1, y1, x2, y2, type) {
    if(game.positions[y1][x1] === 0 || game.positions[y2][x2] != 0)
        return false;
    if(x1 != x2 && y1 != y2)
        return false;
    if(type !== 3 && ((x2 === 0 && y2 === 0) || (x2 === 10 && y2 === 10) || (x2 === 0 && y2 === 10) || (x2 === 10 && y2 === 0) || (x2 === 5 && y2 === 5)))
        return false;
    else{
        if(x1 < x2){
            for(i = x1 + 1; i < x2; i++){
                if(game.positions[y1][i] != 0)
                    return false;
            }
        }else if(x1 > x2){
            for(i = x1 - 1; i > x2; i--){
                if(game.positions[y1][i] != 0)
                    return false;
            }
        }else if(y1 < y2){
            for(i = y1 + 1; i < y2; i++){
                if(game.positions[i][x1] != 0)
                    return false;
            }
        }else if(y1 > y2){
            for(i = y1 - 1; i > y2; i--){
                if(game.positions[i][x1] != 0)
                    return false;
            }
        }
        return true;
    }
}

gameserver.checkKick = function(game, x, y) {
    if(y > 0)
        this.tryKick(game, x, y - 1);
    if(y < 10)
        this.tryKick(game, x, y + 1);
    if(x > 0)
        this.tryKick(game, x - 1, y);
    if(x < 10)
        this.tryKick(game, x + 1, y);
}

gameserver.tryKick = function(game, x, y) {
    if((x == 0 && y == 0) || (x == 10 && y == 10))
        return;
    
    me = game.positions[y][x];
    if(me == 0)
        return;

    if(y > 0)
        if(y == 1 && (x == 0 || x == 10))
            o = (me == 2) ? 1 : 2;
        else
            o = game.positions[y - 1][x];
    else
        o = 0;
    
    if(y < 10)
        if(y == 9 && (x == 0 || x == 10))
            u = (me == 2) ? 1 : 2;
        else
            u = game.positions[y + 1][x];
    else
        u = 0;
    
    if(x > 0)
        if(x == 1 && (y == 0 || y == 10))
            l = (me == 2) ? 1 : 2;
        else
            l = game.positions[y][x - 1];
    else
        l = 0;
    
    if(x < 10)
        if(x == 9 && (y == 0 || y == 10))
            l = (me == 2) ? 1 : 2;
        else
            r = game.positions[y][x + 1];
    else
        r = 0;

    if(me == 3){
        if(this.areEnemies(me, o) && this.areEnemies(me, u) && this.areEnemies(me, l) && this.areEnemies(me, r)){
            game.positions[y][x] = 0;
            this.endGame(game.id, 2);
        }
    }else{
        if(this.areEnemies(me, o) && this.areEnemies(me, u))
            game.positions[y][x] = 0;
        else if(this.areEnemies(me, l) && this.areEnemies(me, r))
            game.positions[y][x] = 0;
    }
}

gameserver.checkWin = function(game){
    if(game.positions[0][0] === 3 || game.positions[10][0] === 3 || game.positions[0][10] === 3 || game.positions[10][10] === 3){
        this.endGame(game.id, 1);
    }
}

gameserver.areEnemies = function(a, b){
    if(a == 0 || b == 0)
        return false;
    if(a == 2)
        return b == 1 || b == 3;
    else if(a == 1 || a == 3)
        return b == 2;
    else
        return false;
}

gameserver.endGame = function(gameid, winner) {
    console.log("Ending Game " + gameid);
    var game = this.games[gameid];
    if(game){
        if(game.playerClient){
            game.playerClient.emit("server", {
                message: "end",
                winner: winner
            });
        }
        if(game.playerHost){
            game.playerHost.emit("server", {
                message: "end",
                winner: winner
            });
            game.playerHost.hosting = false;
        }
        delete this.games[gameid];
        this.gameCount--;
    }else{
        console.log("Game " + gameid + " not found");
    }
}
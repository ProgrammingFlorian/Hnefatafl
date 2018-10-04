window.onload = () => {
    moving = false;
    moving_x = undefined;
    moving_y = undefined;
    movingType = undefined;
    playing = false;
    imBlack = true;
    turnBlack = true;
    positions = [
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
    ];
    
    _render = () => {
        for(var x = 0; x < 11; x++){
            for(var y = 0; y < 11; y++){
                document.getElementById(_coordToString(x, y)).innerHTML = _getTypeImg(positions[y][x]);
            }   
        }
    }

    _move = (x1, y1, x2, y2, type) => {
        moving = false;
        positions[y1][x1] = 0;
        positions[y2][x2] = type;
        _checkKick(x2, y2);
        _render();
        turnBlack = !turnBlack;
        document.getElementById("text").innerHTML = (turnBlack == imBlack) ? "Your Turn" : "Enemy's Turn";
    }
    
    _checkKick = (x, y) => {
        if(y > 0)
            _tryKick(x, y - 1);
        if(y < 10)
            _tryKick(x, y + 1);
        if(x > 0)
            _tryKick(x - 1, y);
        if(x < 10)
            _tryKick(x + 1, y);
    }
    
    _tryKick = (x, y) => {
        if((x == 0 && y == 0) || (x == 10 && y == 10))
            return;
        
        me = positions[y][x];
        if(me == 0)
            return;

        if(y > 0)
            if(y == 1 && (x == 0 || x == 10))
                o = (me == 2) ? 1 : 2;
            else
                o = positions[y - 1][x];
        else
            o = 0;
        
        if(y < 10)
            if(y == 9 && (x == 0 || x == 10))
                u = (me == 2) ? 1 : 2;
            else
                u = positions[y + 1][x];
        else
            u = 0;
        
        if(x > 0)
            if(x == 1 && (y == 0 || y == 10))
                l = (me == 2) ? 1 : 2;
            else
                l = positions[y][x - 1];
        else
            l = 0;
        
        if(x < 10)
            if(x == 9 && (y == 0 || y == 10))
                l = (me == 2) ? 1 : 2;
            else
            r = positions[y][x + 1];
        else
            r = 0;
        
        if(me == 3){
            if(_areEnemies(me, o) && _areEnemies(me, u) && _areEnemies(me, l) && _areEnemies(me, r)){
                positions[y][x] = 0;
                playing = false;
                document.getElementById("text").innerHTML = "Black Won";
            }
        }else{
            if(_areEnemies(me, o) && _areEnemies(me, u))
                positions[y][x] = 0;
            else if(_areEnemies(me, l) && _areEnemies(me, r))
                positions[y][x] = 0;
        }
    }
    
    _getTypeOfClass = (className) => {
        if(className == "king"){
            return 3;
        }else if(className == "black"){
            return 2;
        }else if(className == "white"){
            return 1;
        }else{
            return 0;
        }
    }
    
    _areEnemies = (a, b) => {
        if(a == 0 || b == 0)
            return false;
        if(a == 2)
            return b == 1 || b == 3;
        else if(a == 1 || a == 3)
            return b == 2;
        else
            return false;
    }
    
    _getTypeImg = (type) => {
        if(type == 3){
            return "<img class=\"king\" src=\"king.svg\">";
        }else if(type == 2){
            return "<img class=\"black\" src=\"black.svg\">";
        }else if(type == 1){
            return "<img class=\"white\" src=\"white.svg\">";
        }else{
            return "";
        }
    }
    
    _getTypePlaceholder = (type) => {
        if(type == 3){
            return "<img class=\"king\" src=\"king1.svg\">";
        }else if(type == 2){
            return "<img class=\"black\" src=\"black1.svg\">";
        }else if(type == 1){
            return "<img class=\"white\" src=\"white1.svg\">";
        }else{
            return "";
        }
    }

    _coordToString = (x, y) => {
        return (y + "").replace("10", "o") + (x + "").replace("10", "o")
    }
    
    document.body.onclick = (e) => {
        if(!playing || (turnBlack != imBlack))
            return;
        
        if(e.target.nodeName == "TD"){
            if((moving && e.target.childElementCount == 0) || (!moving && e.target.childElementCount > 0)){
                id = e.target.id;
            }else if(moving && e.target.id === _coordToString(moving_x, moving_y)){
                moving = false;
                document.getElementById(e.target.id).innerHTML = _getTypeImg(_getTypeOfClass(e.target.children[0].className));
                return;
            }else
                return;
        }else if(e.target.nodeName == "IMG" && e.target.parentElement.nodeName == "TD"){
            if(moving && e.target.parentElement.id === _coordToString(moving_x, moving_y)){
                moving = false;
                document.getElementById(e.target.parentElement.id).innerHTML = _getTypeImg(_getTypeOfClass(e.target.className));
                return;
            }else if(moving)
                return;
            
            id = e.target.parentElement.id;
            type = _getTypeOfClass(e.target.className);
        }else{
            return;
        }
        
        if(turnBlack && (type == 1 || type == 3))
            return;
        else if(!turnBlack && type == 2)
            return;
        
        y = parseInt(id.substring(0, 1).replace("o", "10"));
        x = parseInt(id.substring(1, 2).replace("o", "10"));

        if(moving){
            socket.send({
                type: "move",
                x1: moving_x,
                y1: moving_y,
                x2: x,
                y2: y,
                _type: movingType
            });
        }else if(!moving){
            moving = true;
            moving_x = x;
            moving_y = y;
            movingType = type;
            document.getElementById(id).innerHTML = _getTypePlaceholder(movingType);
        }
    }

    document.getElementById("roomname").addEventListener("input", (e) => {
        if(document.getElementById("roomname").value && document.getElementById("roomname").value != "random"){
            document.getElementById("btn_join").classList.remove("btn_out");
        }else{
            document.getElementById("btn_join").classList.add("btn_out");
        }
    });

    document.getElementById("btn_join").onclick = () => {
        if(document.getElementById("roomname").value && document.getElementById("roomname").value != "random"){
            socket.send({
                type: "room",
                name: document.getElementById("roomname").value
            });
            document.getElementById("joinscreen").style.display = "none";
        }
    }

    document.getElementById("btn_joinr").onclick = () => {
        socket.send({
            type: "room",
            name: "random"
        });
        document.getElementById("joinscreen").style.display = "none";
    }


    //
    //
    //
    //
    //
    //
    //

    var socket = io("https://floseite.de", {path: "/hnefatafl/socket.io"});

    socket.on("onconnected", (msg) => {
        document.getElementById("me").innerHTML = "You are: " + msg.id;
    });

    socket.on("server", (msg) => {
        if(msg.message == "alreadyexists"){
            document.getElementById("joinscreen").style.display = "block";
            document.getElementById("roomname").value = "";
            document.getElementById("roomexists").style.display = "block";
            _hideMessage();
        }else if(msg.message.startsWith("roomname:")){
            document.getElementById("room").innerHTML = "Room: <i>" + msg.message.substring(9) + "</i>";
        }else if(msg.message.startsWith("hosting:")){
            imBlack = true;
            document.getElementById("text").innerHTML = "Looking for an opponent..";
            document.getElementById("you").innerHTML = "You are <b>Black</b>";
            document.getElementById("game").innerHTML = "Game: " + msg.message.substring(7);
        }else if(msg.message.startsWith("joined:")){
            imBlack = false;
            document.getElementById("text").innerHTML = "Found a Game";
            document.getElementById("you").innerHTML = "You are <b>White</b>";
            document.getElementById("game").innerHTML = "Game: " + msg.message.substring(7);
        }else if(msg.message.startsWith("start:")){
            playing = true;
            document.getElementById("him").innerHTML = "You're playing against: " + msg.message.substring(6);
            document.getElementById("text").innerHTML = (turnBlack == imBlack) ? "Your Turn" : "Enemy's Turn";
        }else if(msg.message == "end"){
            playing = false;
            document.getElementById("text").innerHTML = (msg.winner == 2 ? "Black won!" : (msg.winner == 1 ? "White won!" : "Bye"));
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        }
    });

    socket.on("move", (msg) => {
        _move(msg.x1, msg.y1, msg.x2, msg.y2, msg._type);
    });

    var _timeout;

    _hideMessage = () => {
        clearTimeout(_timeout);
        _timeout = setTimeout(() => {
            document.getElementById("roomexists").style.display = "none";
        }, 2000);
    }

}

function debug(){
    if(document.getElementById("me").style.display == "none"){
        document.getElementById("me").style.display = "block";
        document.getElementById("him").style.display = "block";
        document.getElementById("game").style.display = "block";
    }else{
        document.getElementById("me").style.display = "none";
        document.getElementById("him").style.display = "none";
        document.getElementById("game").style.display = "none";
    }
}
"use strict";

/* Network.js
 *
 * Contain all low-level related code
 *
 */


var NetworkSocket = function (id, handler) {
    this.wsUrl;
    this.ws = null;
    this.id = id;
    this.handler = handler;

    var url = window.location.href;
    if (url.indexOf('localhost') > -1) {
        //this.wsUrl = 'ws://r00ted.ch:8080/ws/v2';
        this.wsUrl = 'ws://localhost:8080/ws/v2';
    } else {
        this.wsUrl = 'ws://r00ted.ch:8080/ws/v2';
    }
};
NetworkSocket.prototype.constructor = NetworkSocket;



/* NetworkSocket Connect
 *
 * Connects to the server web socket
 * also starts the receiveData() handler
 *
 * called by bootState
 * no registration is performed here, just socket opened (but received messages already processed)
 */
NetworkSocket.prototype.connect = function () {
    log.info(this.id + ": Connect to: " + this.wsUrl);
    this.ws = new WebSocket(this.wsUrl);

    var that = this;
    this.ws.onmessage = function (evt) {
        that.receiveData(evt);
    }
}



/* Main network packet dispatcher
 *
 * Called on every message from the websocket
 *
 * we receive:  ServerEvent
 * {
 *   "type": <String>,
 *   "data": <JSON-String>,
 *   "error": <Boolean>,
 *   "errorMessage": <String>
 * }
 *
 */
NetworkSocket.prototype.receiveData = function (evt) {
    log.info(this.id + ": ReceiveData: " + evt.data);

    if (evt.data == "X") { // WTF
        return;
    }

    if (game.state.getCurrentState().key == "menu") {
        // handle directly
        this.handleData(evt.data);
    } else {
        // Add to network queue
        // handle via update() in game state "play"
        networkQueue.addNetworkMessage(evt.data);
    }
}



/* Mamual Handler
 *
 * Used to handle messages if we are not in game state "play"
 *
 * e.g.:
 * - Registration
 */
NetworkSocket.prototype.handleData = function (msg) {
    var serverData = JSON.parse(msg);
    if (serverData == null) {
        log.error("Could not deserialize message");
        return;
    }

    // Always want to receive errors
    if (serverData.type == "errorEntity") {
        this.handler.handleErrorEvent(serverData.data);
    }

    // The only message we want to receive when not registered
    if (serverData.type == "registerAnswer") {
        this.handler.handleRegisterAnswer(serverData.data);
    } else {
        log.info(this.id + ": Message ignored (because registering not done");
    }
}


/* Send Data to server via web socket
 *
 * We send ClientEvent:
 *
 * {
 *   "type": <String>,
 *   "data": <JSON-String>
 * }
 *
 */
NetworkSocket.prototype.sendData = function (clientEvent) {
    log.info(this.id + ": sendData, state: " + this.ws.readyState);

    var jsonData = JSON.stringify(clientEvent);
    log.info(this.id + ": sendData: " + jsonData);

    this.ws.send(jsonData);
}



NetworkSocket.prototype.wrapData = function (type, data) {
    var packet = {
        "type": type,
        "data": data,
    }

    return packet;
}



NetworkSocket.prototype.close = function () {
    if (this.ws != null) {
        this.sendLeaveRequest();
        this.ws.close();
    }
}



/* Register a player
 *
 * Send player name to server
 * This only happens at a start of the game
 *
 *
 * registerRequest:
 * {
 *    "userName": <String>,
 *    "version": <Integer>
 * }
 *
 */
NetworkSocket.prototype.register = function (userName) {
    var registerRequest = {
        "userName": userName,
        "version": 1,
    }

    registerRequest = this.wrapData("registerRequest", registerRequest)
    this.sendData(registerRequest);

    return true;
}



NetworkSocket.prototype.sendPlayerKeyPress = function (key, position) {
    var keyPress = {
        'key': key,
        'time': this.getCurrentTime(),
        'position': position,
    }
    var json = this.wrapData("keyPressEvent", keyPress);
    this.sendData(json);
}



NetworkSocket.prototype.sendPlayerKeyRelease = function (key, position) {
    var keyRelease = {
        'key': key,
        'time': this.getCurrentTime(),
        'position': position,
    }
    var json = this.wrapData("keyReleaseEvent", keyRelease);
    this.sendData(json);
}



NetworkSocket.prototype.getCurrentTime = function() {
    return game.time.time;
    //return new Date().getTime()
    //return game.time.physicsElapsedMS;
}



NetworkSocket.prototype.sendFireEvent = function (fireEvent) {
    var json = this.wrapData("fireEvent", fireEvent);
    this.sendData(json);
}




/* Send a chat message to the server
 *
 * Executed when user inserted some text and clicks on the "send" button
 */
NetworkSocket.prototype.sendChatMessage = function (message) {
    var chatMessage = {
        "text": message,
    }

    chatMessage = this.wrapData("chatMessage", chatMessage);
    this.sendData(chatMessage);
}



NetworkSocket.prototype.sendLeaveRequest = function () {
    var data = {};
    var leaveRequest = this.wrapData("leaveRequest", data);
    this.sendData(leaveRequest);
}


NetworkSocket.prototype.sendPlayerStateUpdate = function (playerState) {
    var playerState = this.wrapData('playerState', playerState);
    this.sendData(playerState);
}

NetworkSocket.prototype.sendPong = function (pingData) {
    var data = {
        type: 'pong',
        data: pingData,
    };
    this.sendData(data);
}


/* Get web socket status (as string)
 *
 * Used in the main menu to display server status
 */
NetworkSocket.prototype.getWsStatus = function () {
    var status = this.ws.readyState;

    switch (status) {
        case 0: // connecting
            return "Connecting";
        case 1: // Open
            return "Connected";
        case 2: // Closing
        case 3: // Closed
            return "Not connected";
    }
}



NetworkSocket.prototype.isConnected = function() {
    if (this.ws.readyState == 3) {
        return false;
    } else {
        return true;
    }
}



NetworkSocket.prototype.getWsUrl = function () {
    return this.wsUrl;
}

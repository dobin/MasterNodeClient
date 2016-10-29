"use strict";

/* NetworkQueue.js
 *
 * Incoming network messages get added here to a list
 * The list will be processed in the update() loop in gamestate "play"
 *
 */


var NetworkQueue = function (handler) {
    this.networkEvents = [];
    this.handler = handler;
}
NetworkQueue.prototype.constructor = NetworkQueue;


/* Add Network Message
 *
 * adds message to the queue
 */
NetworkQueue.prototype.addNetworkMessage = function (msg) {
    this.networkEvents.push(msg);
}



/* get all network messages
 *
 * returns all current network messages
 * immediatly allocates a new array for incoming messages
 *
 * Therefore, the chance that a new message gets added to the existing queue while it is being
 * handled should be small enough
 */
NetworkQueue.prototype.getAllNetworkMessages = function () {
    var ret = this.networkEvents;
    this.networkEvents = [];
    return ret;
}



NetworkQueue.prototype.handleMessages = function() {
    var msgs = this.getAllNetworkMessages();
    var n;

    for(n=0; n<msgs.length; n++) {
        this.handleMessage(msgs[n]);
    }
}



NetworkQueue.prototype.handleMessage = function(msg) {
    var serverData;
    try {
        serverData = JSON.parse(msg);
    } catch (e) {
        log.error(e);
        log.error( msg);
    }

    if (serverData == null) {
        log.error("Could not deserialize message");
        return;
    }

    // Always want to receive errors
    if (serverData.type == "errorEntity") {
        this.handler.handleErrorEvent(serverData.data);
    }


    if (serverData.type == "registerClient") {
        this.handler.handleRegisterClient(serverData.data);
    }

    if (serverData.type == "chatBlock") {
        //this.handleChatBlock(serverData.data);
    }
    if (serverData.type == "chatMessage") {
        this.handler.handleChatMessage(serverData.data);
    }
    if (serverData.type == "ping") {
        this.handler.handlePing(serverData.data);
    }

    // Only handle player gfx stuff when really ingame
    if (game.state.getCurrentState().key == "play") {
        if (serverData.type == "playerLocation") {
            //this.handler.handlePlayerLocation(serverData.data);
        }

        if (serverData.type == "dynamicEntity") {
            //this.handleDynamicEntity(serverData.data);
        }
        if (serverData.type == "mapEntity") {
            //this.handleMapEntity(serverData.data);
        }

        if (serverData.type == "fireEvent") {
            this.handler.handleFireEvent(serverData.data);
        }

        if (serverData.type == "collisionEvent") {
            this.handler.handleCollisionEvent(serverData.data);
        }

        if (serverData.type == "playerStatsUpdate") {
            this.handler.handlePlayerStatsUpdate(serverData.data);
        }

        if (serverData.type == "chamberStats") {
            this.handler.handleChamberStats(serverData.data);
        }

        if (serverData.type == "keyPressEvent") {
            this.handler.handleKeyPressEvent(serverData.data);
        }

        if (serverData.type == "keyReleaseEvent") {
            this.handler.handleKeyReleaseEvent(serverData.data);
        }

        if (serverData.type == "addEntity") {
            this.handler.addEntityEvent(serverData.data);
        }

        if (serverData.type == "removeEntity") {
            this.handler.removeEntityEvent(serverData.data);
        }

        if (serverData.type == "playerState") {
            this.handler.playerStateEvent(serverData.data);
        }
    }
}

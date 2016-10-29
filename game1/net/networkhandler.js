"use strict";

/* NetworkHandler.js
 *
 * Implements main network message handler to call game logic
 * on received network messages.
 *
 * - May convert network data into game compatible format
 * - calls appropriate function
 * - also handles periodic timers to send data to network
 *
 */


var NetworkHandler = function (id) {
    this.id = id;

    this.chamber = undefined;
}
NetworkHandler.prototype.constructor = NetworkHandler;



/* RegisterAnswer
 *
 * Used in "menuState" to handle responses to "register" messages
 *
 * Data:
 * {
 *   "clientId": <String>,
 *   "position":  {
 *     "x": <Integer>,
 *     "y": <Integer>
 *   },
 *   "velocity": {
 *     "x": <Float>,
 *     "y": <Float>
 *   },
 *   "chamber": <String>
 * }
 */
NetworkHandler.prototype.handleRegisterAnswer = function (data) {
    log.info(this.id + ": " + "Handle register Answer");

    // The real handler is in gamestate menu
    menuState.handleRegisterAnswer(data);
}



/* RegisterClient
 *
 * Data:
 * {
 *   "clientId": <String>,
 *   "userName": <String>,
 *   "position":  {
 *     "x": <Integer>,
 *     "y": <Integer>
 *   },
 *   "velocity": {
 *      "x": <Float>,
 *      "y": <Float>
 *    }
 *  }
 *
 */
NetworkHandler.prototype.handleRegisterClient = function (data) {
    log.info(this.id + ": " + "Handle register Client");
    this.chamber.createNewEnemyFromNetwork(data.player);
    handleNetworkChatMessage("New player joined: " + data.player.userName, "System");
}



/* Player Location
 *
 * {
 *   "userId": "<userId">,
 *   "position":  {
 *     "x": <Integer>,
 *     "y": <Integer>
 *   },
 *   "velocity": {
 *     "x": <Float>,
 *     "y": <Float>
 *    }
 * }
 *
 * find enemy whose position is sent
 * update local enemy position according to the network packet
 */
NetworkHandler.prototype.handlePlayerLocation = function (data) {
    log.info(this.id + ": " + "Handle Player location ");

    var enemyData = {
        clientId: data.clientId,
        position: data.position,
        velocity: data.velocity,
    }

    var enemy = this.chamber.findEnemyByClientId(enemyData.clientId);
    enemy.networkInput.updatePlayerLocationNetwork(enemyData);
}



/* Fire event
 *
 * {
 *   clientId: <clientId>,
 *   position: {
 *     "x": <Integer>
 *     "y": <Integer>
 *   }
 * }
 *
 */
NetworkHandler.prototype.handleFireEvent = function (data) {
    log.info(this.id + ": " + "Handle Fire Event");

    var enemy = this.chamber.findEnemyByClientId(data.clientId);

    if (data.weaponType == "SingleBullet") {
        enemy.weaponBullet.fireNetwork(data);
    } else if (data.weaponType == "Barrier") {
        enemy.weaponBarrier.fireNetwork(data);
    } else if (data.weaponType == "Grenade") {
        enemy.weaponGrenade.fireNetwork(data);
    } else if (data.weaponType == "MovementSpeed") {
        enemy.buffMovementSpeed.activateNetwork();
    } else if (data.weaponType == "AttackSpeed") {
        enemy.buffAttackSpeed.activateNetwork();
    } else if (data.weaponType == "Invisibility") {
        enemy.buffInvisibility.activateNetwork();
    } else if (data.weaponType == "Shield") {
        enemy.buffShield.activateNetwork();
    }
}



/* Chat Message
 *
 * {
 *   "text": <String>
 * }
 */
NetworkHandler.prototype.handleChatMessage = function (data) {
    log.info(this.id + ": " + "Handle Chat Message " + JSON.stringify(data));
    handleNetworkChatMessage(data.text, data.userName);
}



/* Error Event
 *
 * {
 *   "errorMessage": <String>,
 *   "causedBy": <String>,
 *   "errorCode": <Integer>
 * }
 *
 */
NetworkHandler.prototype.handleErrorEvent = function (data) {
    log.error(this.id + ": " + "Error Event: " + data.errorMessage);
    log.error(this.id + ": " + "           : " + data.causedBy + " / " + data.errorCode);
}



/* Leave Request
 *
 * {
 * }
 */
NetworkHandler.prototype.handleLeaveRequest = function (enemy) {
    handleNetworkChatMessage("Player left the game: " + enemy.userName, "System");
}


NetworkHandler.prototype.handlePing = function (pingData) {
    networkSocket.sendPong(pingData);
}



/* Collision Event
 *
 *  {
 *      'affected':
 *      'affectedClientId':
 *      'reason':
 *      'position':
 *  }
 *
 */
NetworkHandler.prototype.handleCollisionEvent = function (collision) {
    if (collision.affected == 'player') {
        if (collision.reason == 'bullet') {
            this.chamber.gameEffects.displayBlood(collision.position);
        }
    }
}


NetworkHandler.prototype.handleChamberStats = function (chamberStats) {
    this.chamber.updateChamberStatsDisplay(chamberStats);
}



NetworkHandler.prototype.handleKeyPressEvent = function (keys) {
    var enemy = this.chamber.findEnemyByClientId(keys.clientId);
    enemy.networkInput.handleKeyPressNetwork(keys);
}

NetworkHandler.prototype.handleKeyReleaseEvent = function (keys) {
    var enemy = this.chamber.findEnemyByClientId(keys.clientId);
    enemy.networkInput.handleKeyReleaseNetwork(keys);
}

NetworkHandler.prototype.removeEntityEvent = function (removeEntityData) {
    this.chamber.removeEntity(removeEntityData)
}

NetworkHandler.prototype.addEntityEvent = function (addEntityData) {
    this.chamber.addEntity(addEntityData)
}




NetworkHandler.prototype.handlePlayerStatsUpdate = function (playerStats) {
    var player = this.chamber.findPlayerOrEnemyByClientId(playerStats.clientId);
    player.playerState.updateStats(playerStats);
}


NetworkHandler.prototype.playerStateEvent = function (playerStateData) {
    var player = this.chamber.findPlayerByClientId(playerStateData.clientId);
    if (player != null) {
        player.playerState.updateStateSelf(playerStateData);
    } else {
        var enemy = this.chamber.findEnemyByClientId(playerStateData.clientId);
        enemy.playerState.updateStateEnemy(playerStateData);
    }
}

NetworkHandler.prototype.setChamber = function(chamber) {
    this.chamber = chamber;
}



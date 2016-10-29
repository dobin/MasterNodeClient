"use strict";

/* PlayerState
 *
 * Handles all state changes of the player (between alive and dead)
 *
 */
function PlayerState(player) {
    this.player = player;
    this.chamber = player.chamber;

    this.playerState = 'alive';

    this.stats = {
        health: 100,
        maxHealth: 100,
    }

}
PlayerState.prototype.constructor = PlayerState;


PlayerState.prototype.getState = function() {
    return this.playerState;
}


/** Game interactions **/

PlayerState.prototype.initFromNetwork = function(state) {
    this.playerState = state.playerState;

    if (state.stats) {
        this.stats.health = state.stats.health;
        this.stats.maxHealth = state.stats.maxHealth;
    }

    if (this.playerState == 'dead') {
        this.die();
    }
}



PlayerState.prototype.updateStateSelf = function(stateData) {
    if (stateData.playerState == 'dead') {
        this.die();
        this.chamber.gameHud.showDeath(true, stateData);
    } else if (stateData.playerState == 'alive') {
        this.chamber.gameHud.showDeath(false);
        this.respawn(stateData);
    } else {
        log.error("Invalid state: " + stateData.playerState);
    }
}



PlayerState.prototype.updateStateEnemy = function(stateData) {
    if (stateData.playerState == 'dead') {
        this.die();
    } else if (stateData.playerState == 'alive') {
        this.respawn(stateData);
    } else {
        log.error("Invalid state: " + stateData.playerState);
    }
}



PlayerState.prototype.die = function(stateData) {
    this.playerState = 'dead';

    // Show dead body
    // and hide our body
    this.player.chamber.gameEffects.displayDeath(this.player.getPosition());
    this.player.exists = false;
}



PlayerState.prototype.tryRespawn = function(stateData) {
    if (this.playerState != 'dead') {
        return;
    }
    this.netSendPlayerStateUpdate('wantRespawn');
}


PlayerState.prototype.respawn = function(stateData) {
    this.initFromNetwork(stateData);
    this.player.initFromNetworkData(stateData.player);
    this.player.updateGfxHealthbar();

    this.player.exists = true;
}


PlayerState.prototype.updateStats = function(newStats) {
    this.stats.health = newStats.stats.health;
    this.stats.maxHealth = newStats.stats.maxHealth;
    this.player.updateGfxHealthbar();
}


PlayerState.prototype.netSendPlayerStateUpdate = function(wantState) {
    var stateData = {
        'playerState': wantState
    };
    networkSocket.sendPlayerStateUpdate(stateData);
}



PlayerState.prototype.isAlive = function() {
    if (this.playerState == 'alive') {
        return true;
    } else {
        return false;
    }
}

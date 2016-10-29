"use strict";

/* PlayerState
 *
 * Handles all state changes of the player (between alive and dead)
 *
 */
function ZombieState(player) {
    this.player = player;
    this.chamber = player.chamber;

    this.playerState = 'alive';

    this.stats = {
        health: 100,
        maxHealth: 100,
    }
}
ZombieState.prototype.constructor = ZombieState;


ZombieState.prototype.getState = function() {
    return this.playerState;
}


/** Game interactions **/

ZombieState.prototype.initFromNetwork = function(state) {
    this.playerState = state.playerState;

    if (state.stats) {
        this.stats.health = state.stats.health;
        this.stats.maxHealth = state.stats.maxHealth;
    }

    if (this.playerState == 'dead') {
        this.die();
    }
}



ZombieState.prototype.updateStateEnemy = function(stateData) {
    if (stateData.playerState == 'dead') {
        this.die();
    } else if (stateData.playerState == 'alive') {
        this.respawn(stateData);
    } else {
        log.error("Invalid state: " + stateData.playerState);
    }
}



ZombieState.prototype.die = function(stateData) {
    this.playerState = 'dead';

    // Show dead body
    // and hide our body
    this.player.chamber.gameEffects.displayDeath(this.player.getPosition());
    this.player.exists = false;
}


ZombieState.prototype.respawn = function(stateData) {
    this.initFromNetwork(stateData);
    this.player.spawn(stateData.player);

    this.player.exists = true;
}


ZombieState.prototype.updateStats = function(newStats) {
    this.stats.health = newStats.stats.health;
    this.stats.maxHealth = newStats.stats.maxHealth;
}


ZombieState.prototype.netSendPlayerStateUpdate = function(wantState) {
    var stateData = {
        'playerState': wantState
    };
    networkSocket.sendPlayerStateUpdate(stateData);
}



ZombieState.prototype.isAlive = function() {
    if (this.playerState == 'alive') {
        return true;
    } else {
        return false;
    }
}

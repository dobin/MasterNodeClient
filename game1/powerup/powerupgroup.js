"use strict";


var PowerupGroup = function(game, chamber) {
    Phaser.Group.call(this, game, game.world, 'Powerups', false, true, Phaser.Physics.ARCADE);
    //this.game = game;
    this.chamber = chamber;

    // Create several
    for (var i = 0; i < 64; i++) {
        this.add(new Powerup(game), true);
    }
};

PowerupGroup.prototype = Object.create(Phaser.Group.prototype);
PowerupGroup.prototype.constructor = PowerupGroup;


PowerupGroup.prototype.createFromInitialData = function(powerups) {
    for(var n=0; n<powerups.length; n++) {
        this.spawnPowerup(powerups[n]);
    }
}



PowerupGroup.prototype.spawnPowerup = function(powerupData) {
    var powerup = this.getFirstExists(false);
    powerup.spawn(powerupData);
}



PowerupGroup.prototype.removePowerup = function(uniqueId) {
    this.forEachExists(function(powerup) {
        if (powerup.uniqueId == uniqueId) {
            powerup.removeMe();
        }
    }, this);
}

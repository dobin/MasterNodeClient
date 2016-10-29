"use strict";

Buff.MovementSpeed = function (game, parentPlayer) {
    this.game = game;
    this.parentPlayer = parentPlayer;

    this.defaultCooldown = 5000; // ms
    this.defaultLifeSpan = 3; // seconds

    this.nextFire = 0;
}
Buff.MovementSpeed.prototype = Object.create(Phaser.Sprite.prototype);
Buff.MovementSpeed.prototype.constructor = Buff.MovementSpeed;



Buff.MovementSpeed.prototype.activateLocal = function() {
    if (! this.isFireAllowed() ) {
        return;
    }

    this.activate();

    // Send via network
    var fireEvent = {
        position: {
            x: 0,
            y: 0,
        },
        weaponType: "MovementSpeed",
    };
    networkSocket.sendFireEvent(fireEvent);
}



Buff.MovementSpeed.prototype.activateNetwork = function() {
    this.activate();
}



Buff.MovementSpeed.prototype.activate = function() {
    this.parentPlayer.stats.movementSpeed = 300;
    game.time.events.add(Phaser.Timer.SECOND * this.defaultLifeSpan, this.deactivate, this);
}



Buff.MovementSpeed.prototype.deactivate = function() {
    this.parentPlayer.stats.movementSpeed = 180;
}


/* Check if firing the weapon is allowed
 *
 * uses this.nextFire and this.fireRate
 */
Buff.MovementSpeed.prototype.isFireAllowed = function() {
    if (this.game.time.time < this.nextFire) {
        return false;
    } else {
        this.nextFire = this.game.time.time + this.defaultCooldown;
        return true;
    }
}
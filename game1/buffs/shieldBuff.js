"use strict";

Buff.Shield = function (game, parentPlayer) {
    this.game = game;
    this.parentPlayer = parentPlayer;

    this.defaultCooldown = 5000; // ms
    this.defaultLifeSpan = 3; // seconds

    this.nextFire = 0;
}
Buff.Shield.prototype = Object.create(Phaser.Sprite.prototype);
Buff.Shield.prototype.constructor = Buff.Shield;



Buff.Shield.prototype.activateLocal = function() {
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
        weaponType: "Shield",
    };
    networkSocket.sendFireEvent(fireEvent);
}



Buff.Shield.prototype.activateNetwork = function() {
    this.activate();
}



Buff.Shield.prototype.activate = function() {
    console.log("Shield on");
    this.parentPlayer.stats.shield = true;
    game.time.events.add(Phaser.Timer.SECOND * this.defaultLifeSpan, this.deactivate, this);
}



Buff.Shield.prototype.deactivate = function() {
    console.log("Shield off");
    this.parentPlayer.stats.shieldSpeed = false;
}


/* Check if firing the weapon is allowed
 *
 * uses this.nextFire and this.fireRate
 */
Buff.Shield.prototype.isFireAllowed = function() {
    if (this.game.time.time < this.nextFire) {
        return false;
    } else {
        this.nextFire = this.game.time.time + this.defaultCooldown;
        return true;
    }
}
"use strict";

Buff.Invisibility = function (game, parentPlayer) {
    this.game = game;
    this.parentPlayer = parentPlayer;

    this.defaultCooldown = 5000; // ms
    this.defaultLifeSpan = 3; // seconds

    this.nextFire = 0;
}
Buff.Invisibility.prototype = Object.create(Phaser.Sprite.prototype);
Buff.Invisibility.prototype.constructor = Buff.Invisibility;



Buff.Invisibility.prototype.activateLocal = function() {
    if (! this.isFireAllowed() ) {
        return;
    }

    // Local alpha is just 0.5, so player still sees himself, but
    // knows that the buff is on
    this.activate(0.5);

    // Send via network
    var fireEvent = {
        position: {
            x: 0,
            y: 0,
        },
        weaponType: "Invisibility",
    };
    networkSocket.sendFireEvent(fireEvent);
}



Buff.Invisibility.prototype.activateNetwork = function() {
    this.activate(0.1);
}



Buff.Invisibility.prototype.activate = function(newAlpha) {
    this.parentPlayer.stats.invisibility = true;
    this.parentPlayer.alpha = newAlpha;
    game.time.events.add(
        Phaser.Timer.SECOND * this.defaultLifeSpan,
        this.deactivate,
        this);
}



Buff.Invisibility.prototype.deactivate = function() {
    this.parentPlayer.stats.invisibility = false;
    this.parentPlayer.alpha = 1;
}


/* Check if firing the weapon is allowed
 *
 * uses this.nextFire and this.fireRate
 */
Buff.Invisibility.prototype.isFireAllowed = function() {
    if (this.game.time.time < this.nextFire) {
        return false;
    } else {
        this.nextFire = this.game.time.time + this.defaultCooldown;
        return true;
    }
}
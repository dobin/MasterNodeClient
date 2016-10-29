"use strict";

Buff.AttackSpeed = function (game, parentPlayer) {
    this.game = game;
    this.parentPlayer = parentPlayer;

    this.defaultCooldown = 5000; // ms
    this.defaultLifeSpan = 3; // seconds

    this.nextFire = 0;
}
Buff.AttackSpeed.prototype = Object.create(Phaser.Sprite.prototype);
Buff.AttackSpeed.prototype.constructor = Buff.AttackSpeed;



Buff.AttackSpeed.prototype.activateLocal = function() {
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
        weaponType: "AttackSpeed",
    };
    networkSocket.sendFireEvent(fireEvent);
}



Buff.AttackSpeed.prototype.activateNetwork = function() {
    this.activate();
}



Buff.AttackSpeed.prototype.activate = function() {
    this.parentPlayer.weaponBullet.fireRate = 125;
    game.time.events.add(Phaser.Timer.SECOND * this.defaultLifeSpan, this.deactivate, this);
}



Buff.AttackSpeed.prototype.deactivate = function() {
    this.parentPlayer.weaponBullet.fireRate = 250;
    this.parentPlayer.stats.attackSpeed = 1;
}


/* Check if firing the weapon is allowed
 *
 * uses this.nextFire and this.fireRate
 */
Buff.AttackSpeed.prototype.isFireAllowed = function() {
    if (this.game.time.time < this.nextFire) {
        return false;
    } else {
        this.nextFire = this.game.time.time + this.defaultCooldown;
        return true;
    }
}
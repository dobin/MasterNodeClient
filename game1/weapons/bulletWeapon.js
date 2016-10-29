"use strict";

/* Weapon.js
 *
 * Defines a weapon in the user's hand
 *
 * Used to:
 * - enforce time limits on fire frequency
 * - manage/hold the bullet of the player holding the weapon
 */



/*** SingleBullet ***/

Weapon.SingleBullet = function (game, parent) {
    Phaser.Group.call(this, game, game.world, 'Single Bullet', false, true, Phaser.Physics.ARCADE);
    this.playerParent = parent;

    this.bulletSpeed = 500; // Speed of bullet
    this.bulletLifespan = 1000; // lifetime of bullets in ms
    this.fireRate = 250; // Time between bullets

    // Time when we can fire again
    this.nextFire = 0;

    // Create several
    for (var i = 0; i < 16; i++) {
        this.add(new Bullet(game, this, i), true);
    }
};

Weapon.SingleBullet.prototype = Object.create(Phaser.Group.prototype);
Weapon.SingleBullet.prototype.constructor = Weapon.SingleBullet;



/* Fire Bullet form Mouse
 *
 * We have a destination in world coordinates to fire at
 * Also send the fire event to the server
 *
 * Note: Fire restriction is implemented here
 */
Weapon.SingleBullet.prototype.fireMouse = function (dest) {
    if (! this.isFireAllowed() ) {
        return;
    }

    var bulletAmmo = this.fire(dest);

    // Calculate angle (again) for server
    // FIXME double code...
    // Note that both, this (bullet) and dest are world coordinates
    var source = {
        x: this.playerParent.body.x + (this.playerParent.body.width / 2),
        y: this.playerParent.body.y + (this.playerParent.body.height / 2),
    };
    var rotation = game.physics.arcade.angleToXY(source, dest.x, dest.y);

    // Send via network
    var fireEvent = {
        destination: dest,
        angle: rotation,
        index: bulletAmmo.index,
        weaponType: "SingleBullet",
    };

    networkSocket.sendFireEvent(fireEvent);
}



/* Check if firing the weapon is allowed
 *
 * uses this.nextFire and this.fireRate
 */
Weapon.SingleBullet.prototype.isFireAllowed = function() {
    if (this.game.time.time < this.nextFire) {
        return false;
    } else {
        this.nextFire = this.game.time.time + this.fireRate;
        return true;
    }
}



/* Fire Bullet form Network
 *
 * We have a destination in world coordinates to fire at
 *
 *  Note: No fire restriction here, we just believe the server
 */
Weapon.SingleBullet.prototype.fireNetwork = function (data) {
    this.fire(data.destination);
}



/* Fire bullet
 *
 * Source is the parentPlayer body
 * Destination coordinates dest
 *
 * Both in world coordinates
 *
 */
Weapon.SingleBullet.prototype.fire = function (dest) {
    var bullet = {
        source: {
            x: this.playerParent.body.x + (this.playerParent.body.width / 2),
            y: this.playerParent.body.y + (this.playerParent.body.height / 2),
        },
        destination: dest,

        speed: this.bulletSpeed,
        lifespan: this.bulletLifespan,
    }

    var bulletAmmo = this.getFirstExists(false);
    if (bulletAmmo == null) {
        winston.error("Not enough bullets");
        return;
    }

    bulletAmmo.fireMouse(bullet, dest)
    return bulletAmmo;
}
"use strict";

/* Weapon.js
 *
 * Defines a weapon in the user's hand
 *
 * Used to:
 * - enforce time limits on fire frequency
 * - manage/hold the bullet of the player holding the weapon
 */


/*** Grenade ***/

Weapon.Grenade = function (game, parent) {
    Phaser.Group.call(this, game, game.world, 'Single Grenade', false, true, Phaser.Physics.ARCADE);
    this.playerParent = parent;

    this.fireRate = 6000; // Time between grenades
    this.grenadeLifespan = 1000;

    // Time when we can fire again
    this.nextFire = 0;

    // Grenades
    for (var i = 0; i < 4; i++) {
        this.add(new Grenade(game, this), true);
    }

    // CD
    this.cooldownIndicator = new CooldownIndicator(game, 'grenadeIndicator', 1);
    game.add.existing(this.cooldownIndicator);

    return this;
};

Weapon.Grenade.prototype = Object.create(Phaser.Group.prototype);
Weapon.Grenade.prototype.constructor = Weapon.Grenade;



/* Fire Grenade form Mouse
 *
 * We have a destination in world coordinates to fire at
 * Also send the fire event to the server
 *
 * Note: Fire restriction is implemented here
 */
Weapon.Grenade.prototype.fireMouse = function (dest) {
    if (! this.isFireAllowed() ) {
        return;
    }
    var distance = game.math.distance(dest.x, dest.y, this.playerParent.position.x, this.playerParent.position.y);
    if (distance > 500) {
        return;
    }

    this.fire(dest);

    // Send via network
    var fireEvent = {
        destination: dest,
        weaponType: "Grenade",
    };
    networkSocket.sendFireEvent(fireEvent);
}



/* Check if firing the weapon is allowed
 *
 * uses this.nextFire and this.fireRate
 */
Weapon.Grenade.prototype.isFireAllowed = function() {
    if (this.game.time.time < this.nextFire) {
        return false;
    } else {
        return true;
    }
}



/* Fire Grenade form Network
 *
 * We have a destination in world coordinates to fire at
 *
 *  Note: No fire restriction here, we just believe the server
 */
Weapon.Grenade.prototype.fireNetwork = function (data) {
    this.fire(data.destination);
}



/* Fire grenade
 *
 * Source is the parentPlayer body
 * Destination coordinates dest
 *
 * Both in world coordinates
 *
 */
Weapon.Grenade.prototype.fire = function (dest) {
    var grenade = {
        source: {
            x: this.playerParent.body.x + (this.playerParent.body.width / 2),
            y: this.playerParent.body.y + (this.playerParent.body.height / 2),
        },
        destination: dest,
        sourcePlayer: this.playerParent,

        speed: this.grenadeSpeed,
        lifespan: this.grenadeLifespan,
    }

    this.getFirstExists(false).fireMouse(grenade, dest);

    this.nextFire = this.game.time.time + this.fireRate;

    this.cooldownIndicator.startCooldown(this.fireRate);
}


Weapon.Grenade.prototype.updateTick = function (timeDiff) {
    this.cooldownIndicator.updateTick(timeDiff);
}

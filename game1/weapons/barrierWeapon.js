"use strict";

/* Weapon.js
 *
 * Defines a weapon in the user's hand
 *
 * Used to:
 * - enforce time limits on fire frequency
 * - manage/hold the bullet of the player holding the weapon
 */


/*** Barrier ***/

Weapon.Barrier = function (game, parent) {
    this.playerParent = parent;
    this.game = game;

    this.fireRate = 6000; // Time between barriers
    this.barrierLifespan = 3000; // How long it lives

    // Time when we can fire again
    this.nextFire = 0;

    // The data for the barrier
    // Set by keyPress
    // used by keyRelease
    this.nextBarrierData = null;

    // Sprite: my ammo
    this.ammoGroup = game.add.group();
    for (var i = 0; i < 4; i++) {
        this.ammoGroup.add(new Barrier(game, this), true);
    }

    // Sprite: fake barrier
    this.previewAmmo = new Barrier(game, this);
    this.previewAmmo.alpha = 0.4;
    game.add.existing(this.previewAmmo);

    this.cooldownIndicator = new CooldownIndicator(game, 'grenadeIndicator', 0);
    game.add.existing(this.cooldownIndicator);

    return this;
};
Weapon.Barrier.prototype.constructor = Weapon.Barrier;



/* Fire Barrier form Mouse
 *
 * We have a destination in world coordinates to fire at
 * Also send the fire event to the server
 *
 * Note: Fire restriction is implemented here
 */
Weapon.Barrier.prototype.fireMouse = function (dest) {
    // Do nothing if there is no valid fake barrier
    if (this.nextBarrierData == null) {
        return;
    }

    // Called by release, so remove fake barrier
    this.previewAmmo.exists = false;

    // Check if we are allowed to fire (again)
    if (! this.isFireAllowed() ) {
        return;
    }

    // Fire it
    this.fire(this.nextBarrierData);

    // Set time when we can fire next
    this.nextFire = this.game.time.time + this.fireRate;

    // Send via network
    var fireEvent = {
        destination: this.nextBarrierData.destination,
        size: this.nextBarrierData.size,
        lifespan: this.nextBarrierData.lifespan,
        weaponType: "Barrier",
    };
    networkSocket.sendFireEvent(fireEvent);

    this.nextBarrierData = null;
}


Weapon.Barrier.prototype.prepareFireMouse = function (dest) {
    if (! this.isFireAllowed() ) {
        return;
    }

    if (this.previewAmmo.exists) {
        return;
    }

    var distance = game.math.distance(dest.x, dest.y, this.playerParent.position.x, this.playerParent.position.y);
    if (distance > 500) {
        return;
    }

    var barrier = {
        destination: dest,
        size: this.calcSize(dest),
        lifespan: this.barrierLifespan,
    }

    this.nextBarrierData = barrier;
    this.previewAmmo.fireMouse(barrier);
}



/* Check if firing the weapon is allowed
 *
 * uses this.nextFire and this.fireRate
 */
Weapon.Barrier.prototype.isFireAllowed = function() {
    if (this.game.time.time < this.nextFire) {
        return false;
    } else {
        return true;
    }
}



/* Fire Barrier form Network
 *
 * We have a destination in world coordinates to fire at
 *
 *  Note: No fire restriction here, we just believe the server
 */
Weapon.Barrier.prototype.fireNetwork = function (data) {
    data.lifespan = this.barrierLifespan;
    this.fire(data);
}



/* Fire barrier
 *
 * Source is the parentPlayer body
 * Destination coordinates dest
 *
 * Both in world coordinates
 *
 */
Weapon.Barrier.prototype.fire = function (data) {
    this.cooldownIndicator.startCooldown(this.fireRate);
    this.ammoGroup.getFirstExists(false).fireMouse(data);
}



Weapon.Barrier.prototype.calcSize = function(destination) {
    var size = {
        height: 0,
        widht: 0,
    }

    // Note that both, this (barrier) and dest are world coordinates
    var rotation = game.physics.arcade.angleToXY(
        this.playerParent,
        destination.x,
        destination.y);

    rotation = rotation * (180 / Math.PI);
    var perpRotation = Math.round(rotation / 90) * 90;

    switch(perpRotation) {
        case 0:
        case 180:
        case -180:
            size.height = 128;
            size.width = 16;
            break;
        case 90:
        case -90:
            size.width = 128;
            size.height = 16;
            break;
        default:
            log.error("Rotation fucked");
    }

    return size;
}



Weapon.Barrier.prototype.updateTick = function (timeDiff) {
    this.cooldownIndicator.updateTick(timeDiff);
}

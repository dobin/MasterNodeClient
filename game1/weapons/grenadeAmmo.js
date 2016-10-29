"use strict";

/* Grenades.js
 *
 * Each grenade fired by the player
 *
 * It prepares a bunch of grenades upon load
 * and re-uses them when the player or enemy shoots
 *
 */

var Grenade = function (game, parentWeapon) {
    Phaser.Sprite.call(this, game, 0, 0, 'grenadeExplosion');

    this.parentWeapon = parentWeapon;

    //this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
    this.anchor.set(0.5);
    this.animations.add('fire', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 10, false);


    //this.width = 96;
    //this.height = 64;

    // Deactivate for now
    this.exists = false;
};
Grenade.prototype = Object.create(Phaser.Sprite.prototype);
Grenade.prototype.constructor = Grenade;



Grenade.prototype.fireMouse = function (grenade) {
    log.info("Grenade: FireMouse");

    // Set spawn location
    this.reset(grenade.destination.x, grenade.destination.y);

    //game.physics.arcade.enable(this);

    // Move grenade to target position
    //game.physics.arcade.moveToXY(this, grenade.destination.x, grenade.destination.y, grenade.speed);

    // Activate
    this.exists = true;

    // play, with loop=false, killOnComplete=true
    this.animations.play('fire', 10, false, true);

    // Set lifetime
//    this.lifespan = grenade.lifespan;
}



Grenade.prototype.update = function () {
// Empty
};

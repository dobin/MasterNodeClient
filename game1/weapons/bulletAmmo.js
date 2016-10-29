"use strict";

/* Bullets.js
 *
 * Each bullet fired by the player
 *
 * It prepares a bunch of bullets upon load
 * and re-uses them when the player or enemy shoots
 *
 */

var Bullet = function (game, parentWeapon, index) {
    Phaser.Sprite.call(this, game, 0, 0, 'fireball1');

    this.index = index;
    this.parentWeapon = parentWeapon;

    // Set animation
    this.animations.add('fire', [0, 1, 2, 3], 10, true);

    //this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
    this.anchor.set(0.5);

    // Set to destroy on end of map
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;

    // Deactivate for now
    this.exists = false;

    this.myType = "bullet";
    game.physics.arcade.enable(this);
};
Bullet.prototype = Object.create(Phaser.Sprite.prototype);
Bullet.prototype.constructor = Bullet;



Bullet.prototype.fireMouse = function (bullet) {
    log.info("Bullet: FireMouse");

    // Set spawn location
    this.reset(bullet.source.x, bullet.source.y);

    // Rotate texture
    // Note that both, this (bullet) and dest are world coordinates
    this.rotation = game.physics.arcade.angleToXY(this, bullet.destination.x, bullet.destination.y);

    // Move bullet to target position
    game.physics.arcade.moveToXY(this, bullet.destination.x, bullet.destination.y, bullet.speed);

    // Activate
    this.exists = true;

    // And animate
    this.animations.play('fire');

    // Set lifetime
    this.lifespan = bullet.lifespan;
}



Bullet.prototype.update = function () {
// Empty
};

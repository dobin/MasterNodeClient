"use strict";

/* Barriers.js
 *
 * Each barrier fired by the player
 *
 * It prepares a bunch of barriers upon load
 * and re-uses them when the player or enemy shoots
 *
 */

var Barrier = function (game, parentWeapon) {
    Phaser.Sprite.call(this, game, 0, 0, 'wall');

    this.parentWeapon = parentWeapon;

    //this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
    this.anchor.set(0.5);

    game.physics.arcade.enable(this);
    this.body.immovable = true;


    // Deactivate for now
    this.exists = false;
};
Barrier.prototype = Object.create(Phaser.Sprite.prototype);
Barrier.prototype.constructor = Barrier;



Barrier.prototype.fireMouse = function (barrier) {
    log.info("Barrier: FireMouse");

    // Set spawn location
    this.reset(barrier.destination.x, barrier.destination.y);

    this.width = barrier.size.width;
    this.height = barrier.size.height;

    this.lifespan = barrier.barrierLifespan;

    // Activate
    this.exists = true;

    // Set lifetime
    this.lifespan = barrier.lifespan;
}



Barrier.prototype.update = function () {
// Empty
};

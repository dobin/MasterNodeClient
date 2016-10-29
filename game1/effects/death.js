"use strict";

/* DeathEffects.js
 *
 *
 */

var DeathEffect = function (game) {
    Phaser.Sprite.call(this, game, 0, 0, 'death');

    // Set animation
    this.animations.add('die', null, 5, false);

    //this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
    this.anchor.set(0.5);

    this.defaultLifespan = 4000;

    // Deactivate for now
    this.exists = false;

    //this.events.onAnimationComplete.add(this.finito, this);
};
DeathEffect.prototype = Object.create(Phaser.Sprite.prototype);
DeathEffect.prototype.constructor = DeathEffect;



//DeathEffect.prototype.finito = function () {
//    this.animations.stop();
//    this.frame = 1;
//}

DeathEffect.prototype.show = function (position) {
    // Set spawn location
    this.position.x = position.x;
    this.position.y = position.y;

    // Activate
    this.exists = true;

    // And animate
    this.animations.play('die');

    // Set lifetime
    this.lifespan = this.defaultLifespan;
}



DeathEffect.prototype.update = function () {
// Empty
};

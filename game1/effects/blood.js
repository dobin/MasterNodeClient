"use strict";

/* BloodEffects.js
 *
 * Display a blood pool on the map whan a enemy has been hit
 *
 * It prepares a bunch of bloodsplats upon load
 * and re-uses them when the player or enemy gets shot
 *
 */

var BloodEffect = function (game) {
    Phaser.Sprite.call(this, game, 0, 0, 'bloodsplat1');

    // Set animation
    //this.animations.add('fire', [0, 1, 2, 3], 10, true);

    //this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
    this.anchor.set(0.5);

    this.defaultLifespan = 250;

    // Deactivate for now
    this.exists = false;
};
BloodEffect.prototype = Object.create(Phaser.Sprite.prototype);
BloodEffect.prototype.constructor = BloodEffect;



BloodEffect.prototype.show = function (position) {
    // Set spawn location
    this.position.x = position.x;
    this.position.y = position.y;

    // Activate
    this.exists = true;

    // And animate
    //this.animations.play('fire');

    // Set lifetime
    this.lifespan = this.defaultLifespan;
}



BloodEffect.prototype.update = function () {
// Empty
};

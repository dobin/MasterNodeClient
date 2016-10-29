"use strict";

var Powerup = function (game) {
    Phaser.Sprite.call(this, game, 0, 0, 'powerups');

    //this.parent = parent;
    //this.height = 16;
    //this.width = 16;

    // Set animation
    //this.animations.add('fire', [0, 1, 2, 3], 10, true);

    //this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
    this.anchor.set(0.5);

    this.myType = "powerup";

    // Deactivate for now
    this.exists = false;

    //game.physics.arcade.enable(this);
};
Powerup.prototype = Object.create(Phaser.Sprite.prototype);
Powerup.prototype.constructor = Powerup;


Powerup.prototype.spawn = function(powerupData) {
    this.position.x = powerupData.position.x;
    this.position.y = powerupData.position.y;
    this.powerupType = powerupData.powerupType;
    this.uniqueId = powerupData.uniqueId;
    this.exists = true;

    if (this.powerupType == 'health') {
        this.frame = 7;
    } else if (this.powerupType == 'barrier') {
        this.frame = 9;
    } else if (this.powerupType == 'grenade') {
        this.frame = 2;
    } else if (this.powerupType == 'buff') {
        this.frame = 3;
    }
}

Powerup.prototype.update = function () {
// Empty
};

Powerup.prototype.removeMe = function () {
    this.exists = false;
};


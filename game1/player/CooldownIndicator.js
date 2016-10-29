"use strict";

/* CooldownIndicator.js
 *
 * Manages dynamic effects on the map, e.g.:
 * - Blood when hit
 *
 */
var CooldownIndicator = function(game, spriteName, index) {
    //var x = -100;
    //var y = game.height / 2;
    var x = 0;
    var y = 0 + (index * 40);

    Phaser.Sprite.call(this, game, x, y, 'bloodsplat1');
    this.fixedToCamera = true;
    this.game = game;

    // Icon
    //var style = { font: "32px Arial", fill: "#ff0044", wordWrap: true, wordWrapWidth: sprite.width, align: "center" };
    //this.style = { font: "16px Arial", fill: "#ff0044" };
    //this.text = game.add.text(0, 0, 'Barrier CD: ', this.style);
    //this.addChild(this.text);

    // Balken
    this.barWidth = 64;
    this.healthBarSprite = game.add.sprite(32, 8, 'wall');
    this.healthBarSprite.width = 1; // Do not fucking use 0 here, or FF is broken
    this.healthBarSprite.height = 16;
    this.addChild(this.healthBarSprite);

    // Times
    this.cdLength = 0;
    this.cdHappened = 0;

    this.exists = true;
    this.cdActive = false;
}
CooldownIndicator.prototype =  Object.create(Phaser.Sprite.prototype);
CooldownIndicator.prototype.constructor = CooldownIndicator;


CooldownIndicator.prototype.startCooldown = function(cdLength) {
    this.cdLength = cdLength;
    this.cdHappened = 0;
    this.cdActive = true;
}

CooldownIndicator.prototype.updateTick = function(timeDiff) {
    if (! this.cdActive) {
        return;
    }

    this.cdHappened += timeDiff;

    this.healthBarSprite.width =
        this.barWidth -
        (this.barWidth / this.cdLength * this.cdHappened);

    if (this.cdHappened > this.cdLength) {
        this.cdActive = false;
    }
}

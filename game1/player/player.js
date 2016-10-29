"use strict";

/* Player.js
 *
 * Contain the "Player" object
 *
 * This is at the same time:
 * - a sprite (this)
 * - a physical object (this.body)
 * - container for gamelogic (in this)
 * - the "parent" for all children sprites used for the player
 *
 * - the player (gameData.player)
 *   - added to gameData.playerGroup
 * - and the enemies (gameData.enemies)
 *   - added to gameData.enemyGroup
 *
 *
 */

var Weapon = {};
var Buff = {};

var Player = function (chamber, thePlayer) {
    var spriteName = "character" + thePlayer.characterSkinIndex;
    Walker.call(this, chamber, spriteName);

    this.playerState = new PlayerState(this);
    this.playerState.initFromNetwork(thePlayer.state);
    this.initFromNetworkData(thePlayer);

    // Based on skin
    this.animations.add('up', [0, 1, 2], 8, true);
    this.animations.add('right', [3, 4, 5], 8, true);
    this.animations.add('down', [6, 7, 8], 8, true);
    this.animations.add('left', [9, 10, 11], 8, true);
    this.frame = 7; // Look straight forward!

    this.weaponBullet = new Weapon.SingleBullet(game, this);
    this.weaponBarrier = new Weapon.Barrier(game, this);
    this.weaponGrenade = new Weapon.Grenade(game, this);

    this.buffMovementSpeed = new Buff.MovementSpeed(game, this);
    this.buffAttackSpeed = new Buff.AttackSpeed(game, this);
    this.buffInvisibility = new Buff.Invisibility(game, this);
    this.buffShield = new Buff.Shield(game, this);

    this.initGfxName();
    this.initGfxHealthbar();
    this.updateGfxHealthbar();

    this.myType = "player";
}
Player.prototype = Object.create(Walker.prototype);
Player.prototype.constructor = Player;


Player.prototype.initFromNetworkData = function(thePlayer) {
    this.characterSkinIndex = thePlayer.characterSkinIndex;

    // The Player and its settings
    this.playerName = thePlayer.userName;
    this.clientId = thePlayer.clientId;

    this.position.x = thePlayer.position.x;
    this.position.y = thePlayer.position.y;
}



Player.prototype.updateTick = function(timeDiff) {
    // Call original method
    Walker.prototype.updateTick.call(this, timeDiff);

    // update my stuff
    this.weaponBarrier.updateTick(timeDiff);
    this.weaponGrenade.updateTick(timeDiff);
}



Player.prototype.initGfxName = function() {
    // Add the userName to the player sprite
    this.nameSprite = game.add.text(0, this.body.height / 2, this.playerName,  { font: '12px Arial', fill: '#000000'});
    this.nameSprite.x -= (this.nameSprite.width / 2);
    this.addChild(this.nameSprite);
}



Player.prototype.initGfxHealthbar = function() {
    // Add health bar
    this.healthBarSprite = game.add.sprite(0, -28, 'wall');
    this.healthBarSprite.width = 32;
    this.healthBarSprite.height = 4;
    this.healthBarSprite.x -= (this.healthBarSprite.width / 2);
    this.addChild(this.healthBarSprite);
}



Player.prototype.updateGfxHealthbar = function() {
    this.healthBarSprite.width =
        32 / this.playerState.stats.maxHealth * this.playerState.stats.health;
}



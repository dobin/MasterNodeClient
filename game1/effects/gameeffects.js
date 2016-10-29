"use strict";

/* GameEffects.js
 *
 * Manages dynamic effects on the map, e.g.:
 * - Blood when hit
 *
 */
var GameEffects = function(game) {
    this.game = game;

    this.bloodGroup = game.add.group();
    this.deathGroup = game.add.group();

    for (var i=0; i<64; i++)
    {
        this.bloodGroup.add(new BloodEffect(game), true);
        this.deathGroup.add(new DeathEffect(game), true);
    }
}
GameEffects.prototype.constructor = GameEffects;


GameEffects.prototype.displayBlood = function(position) {
    var blood = this.bloodGroup.getFirstExists(false);

    if (blood != null) {
        blood.show(position);
    }
}

GameEffects.prototype.displayDeath = function(position) {
    var death = this.deathGroup.getFirstExists(false);

    if (death != null) {
        death.show(position)
    }
}

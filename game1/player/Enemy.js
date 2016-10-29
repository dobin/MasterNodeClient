"use strict";

var Enemy = function (chamber, thePlayer) {
    Player.call(this, chamber, thePlayer);

    this.networkInput = new NetworkInput(this);
}
Enemy.prototype = Object.create(Player.prototype);
Enemy.prototype.constructor = Enemy;


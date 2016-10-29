"use strict";

var Zombie = function (chamber) {
    Walker.call(this, chamber, 'zombie1');

    this.playerState = new ZombieState(this);
    this.networkInput = new NetworkInput(this);

    this.body.height = 30;
    this.body.width = 30;

    // Based on skin
    this.animations.add('down', [0, 1, 2], 8, true);
    this.animations.add('right', [3, 4, 5], 8, true);
    this.animations.add('up', [6, 7, 8], 8, true);
    this.animations.add('left', [9, 10, 11], 8, true);
    this.frame = 7; // Look straight forward!

    this.stats.movementSpeed = 100;
    this.exists = false;
}
Zombie.prototype = Object.create(Walker.prototype);
Zombie.prototype.constructor = Zombie;


Zombie.prototype.spawn = function(zombieData) {
    this.position.x = zombieData.position.x;
    this.position.y = zombieData.position.y;
    this.powerupType = zombieData.powerupType;
    this.clientId = zombieData.clientId;
    this.exists = true;
    this.playerState.initFromNetwork(zombieData.state);
    this.networkInput.initFromNetwork(zombieData.input);
    this.frame = 7;
}

Zombie.prototype.removeZombie = function(zombieData) {
    console.log("Z rem");
}


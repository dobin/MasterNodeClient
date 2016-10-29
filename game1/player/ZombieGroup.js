"use strict";

var ZombieGroup = function(game, chamber) {
    Phaser.Group.call(this, game, game.world, 'Zombies', false, true, Phaser.Physics.ARCADE);


    // Create several
    for (var i=0; i < 17; i++) {
        this.add(new Zombie(chamber), true);
    }
};

ZombieGroup.prototype = Object.create(Phaser.Group.prototype);
ZombieGroup.prototype.constructor = ZombieGroup;


ZombieGroup.prototype.createFromInitialData = function(zombies) {
    for(var n=0; n<zombies.length; n++) {
        this.spawnZombie(zombies[n]);
    }
}



ZombieGroup.prototype.spawnZombie = function(zombieData) {
    var zombie = this.getFirstExists(false);
    zombie.spawn(zombieData);
}



ZombieGroup.prototype.removeZombie = function(clientId) {
    this.forEachExists(function(zombie) {
        if (zombie.clientId == clientId) {
            zombie.removeMe();
        }
    }, this);
}


ZombieGroup.prototype.findZombieByClientId = function(clientId) {
    var z = undefined;

    this.forEach(function(zombie) {
        if (zombie.clientId == clientId) {
            z = zombie;
        }
    }, this);

    return z;
}

"use strict";

function NetworkInput(player) {
    this.player = player;
}
NetworkInput.prototype.constructor = NetworkInput;


NetworkInput.prototype.handleKeyPressNetwork = function (keys) {
    if (keys.key == 'left') {
        this.player.keys.left = 1;
        this.player.animations.play('left');
    } else if (keys.key == 'right') {
        this.player.keys.right = 1;
        this.player.animations.play('right');
    } else if (keys.key == 'up') {
        this.player.keys.up = 1;
        this.player.animations.play('up');
    } else if (keys.key ==  'down') {
        this.player.keys.down = 1;
        this.player.animations.play('down');
    }

    this.player.x = keys.position.x;
    this.player.y = keys.position.y;
}



NetworkInput.prototype.handleKeyReleaseNetwork = function (keys) {
    if (keys.key == 'left') {
        this.player.keys.left = 0;
    } else if (keys.key == 'right') {
        this.player.keys.right = 0;
    } else if (keys.key == 'up') {
        this.player.keys.up = 0;
    } else if (keys.key == 'down') {
        this.player.keys.down = 0;
    }

    if (this.player.keys.left == 0 && this.player.keys.right == 0 && this.player.keys.up == 0 && this.player.keys.down == 0) {
        //  Stand still
        this.player.animations.stop();
        this.player.frame = 7;
    }

    this.player.x = keys.position.x;
    this.player.y = keys.position.y;
}


// Obsolete?
NetworkInput.prototype.updatePlayerLocationNetwork = function (enemy) {
    this.player.x = enemy.position.x;
    this.player.y = enemy.position.y;
};

NetworkInput.prototype.initFromNetwork = function (input) {
    this.keys = input.keys;
}


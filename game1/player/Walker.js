"use strict";

var Walker = function (chamber, spriteName) {
    this.chamber = chamber;

    // Stats
    this.stats = {
        movementSpeed: 180,
        baseAttackSpeed: 1,
        isInvisible: false,
        shieldActive: false,
    }

    // Our current direction
    // Based on input (either local or network)
    this.keys = {
        left: 0,
        right: 0,
        up: 0,
        down: 0,
    }

    Phaser.Sprite.call(this, game, 0, 0, spriteName);
    this.anchor.set(0.5, 0.5); // Set anchor to middle

    //  We need to enable physics on the Player
    game.physics.arcade.enable(this, Phaser.Physics.ARCADE);
}
Walker.prototype = Object.create(Phaser.Sprite.prototype);
Walker.prototype.constructor = Walker;



Walker.prototype.getPosition = function() {
    var pos = {
        x: this.position.x,
        y: this.position.y,
    };
    return pos;
}



Walker.prototype.updateTick = function (timeDiff) {
    this.positionUpdate(timeDiff);
    this.updateGfx();
}



Walker.prototype.updateGfx = function () {
    if (! this.playerState.isAlive()) {
        return;
    }

    if (this.keys.left == 1) {
        this.animations.play('left');
    } else if (this.keys.right == 1) {
        this.animations.play('right');
    } else if (this.keys.up == 1) {
        this.animations.play('up');
    } else if (this.keys.down == 1) {
        this.animations.play('down');
    } else {
        this.animations.stop();
        this.frame = 7;
    }
}



Walker.prototype.positionUpdate = function(timeDiff) {
    if (! this.playerState.isAlive()) {
        return;
    }

    var distance = timeDiff * this.stats.movementSpeed / 1000;

    if (this.keys.left == 1) {
        this.body.x -= distance;
    }

    if (this.keys.right == 1) {
        this.body.x += distance;
    }

    if (this.keys.up == 1) {
        this.body.y -= distance;
    }

    if (this.keys.down == 1) {
        this.body.y += distance;
    }
}
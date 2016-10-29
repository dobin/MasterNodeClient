"use strict";

var PlayerBot = function() {
    this.direction = 1;
    this.waitTime = 3000;
    this.lastTime = 0;
}
PlayerBot.prototype.constructor = PlayerBot;


PlayerBot.prototype.start = function() {
    this.update();
}

PlayerBot.prototype.update = function() {
    var event = {};

    if (this.direction == 1) {
        event.keyCode = Phaser.Keyboard.RIGHT;
        this.direction = 0;
    } else if (this.direction == 0) {
        event.keyCode = Phaser.Keyboard.LEFT;
        this.direction = 1;
    }

    // Just imitate a keyboard
    inputControls.keyboardDownCallback(event);

    var _this = this;
    setTimeout(function() { _this.start() }, this.waitTime);
}

"use strict";

/* Input.js
 *
 * Manages input related control
 *
 * Either by:
 * - waiting for key events, and then:
 *   - calling functions in Player
 *   - send updated via network by calling functions from Network
 *
 * has:
 *   - player
 */


var InputControls = function() {
    this.isKeyboardEnabled = true;
    this.escKey = undefined;
    this.player = undefined;
    this.spaceKey = undefined;
    this.iKey = undefined;
    this.pKey = undefined;
};
InputControls.prototype.constructor = InputControls;



InputControls.prototype.initControls = function(player) {
    this.player = player;
    game.input.keyboard.addCallbacks(this, this.keyboardDownCallback, this.keyboardUpCallback);

    this.escKey = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
    this.escKey.onDown.add(this.escapeKeyFunction, this);

    this.isKeyboardEnabled = true;
}


InputControls.prototype.enableKeyboard = function(enable) {
    this.isKeyboardEnabled = enable;
}


/* Escape Key pressed
 * Quit game, show menu
 */
InputControls.prototype.escapeKeyFunction = function () {
    game.state.getCurrentState().returnToMenu();
}


InputControls.prototype.spaceKeyFunction = function () {
    this.player.playerState.tryRespawn();
}


InputControls.prototype.iKeyFunction = function() {
    this.player.chamber.gameHud.toggleDebug();
}

InputControls.prototype.pKeyFunction = function() {
    var data = {
          playerStatistics: {
              round: {
                  frags: 23,
              },
              session: {
                  frags: 11,
              }
          }
    };
    if (this.player.chamber.gameHud.deathEnabled == false) {
        this.player.chamber.gameHud.showDeath(true, data);
    } else {
        this.player.chamber.gameHud.showDeath(false);
    }

}


InputControls.prototype.mouseEnterHandler= function() {
    this.isKeyboardEnabled = true;
}



InputControls.prototype.mouseLeaveHandler = function() {
    this.isKeyboardEnabled = false;
    this.resetAllButtons();
}



/* Shoot Barrier Weapon
 *
 * Needs: Mouse x/y for destination
 *
 * Note: The weapon will send the network event
 */
InputControls.prototype.shootWeapon1 = function() {
    var dest = {
        // World coordination of mouse
        x: game.input.worldX,
        y: game.input.worldY,
    }

    this.player.weaponBarrier.fireMouse(dest);
}

InputControls.prototype.prepareShootWeapon1 = function() {
    var dest = {
        // World coordination of mouse
        x: game.input.worldX,
        y: game.input.worldY,
    }

    this.player.weaponBarrier.prepareFireMouse(dest);
}


/* Shoot granade
 *
 * Needs: Mouse x/y for destination
 *
 * Note: The weapon will send the network event
 */
InputControls.prototype.shootWeapon2 = function() {
    var dest = {
        // World coordination of mouse
        x: game.input.worldX,
        y: game.input.worldY,
    }

    this.player.weaponGrenade.fireMouse(dest);
}

InputControls.prototype.prepareShootWeapon2 = function() {

}



/* Movement speed boost
 *
 */
InputControls.prototype.shootWeapon3 = function() {
    this.player.buffMovementSpeed.activateLocal();
}



/* Attack speed boost
 *
 */
InputControls.prototype.shootWeapon4 = function() {
    this.player.buffAttackSpeed.activateLocal();
}



/* Invisibility
 *
 */
InputControls.prototype.shootWeapon5 = function() {
    this.player.buffInvisibility.activateLocal();
}



/* Shield
 *
 */
InputControls.prototype.shootWeapon6 = function() {
    this.player.buffShield.activateLocal();
}



InputControls.prototype.resetAllButtons = function () {
    if (game.state.getCurrentState().key != "play") {
        return;
    }

    var pos = {
        x: this.player.position.x,
        y: this.player.position.y,
    };

    if (this.player.keys.up == 1) {
        this.player.keys.up = 0;
        networkSocket.sendPlayerKeyRelease('up', pos);
    }

    if (this.player.keys.down == 1) {
        this.player.keys.down = 0;
        networkSocket.sendPlayerKeyRelease('down', pos);
    }

    if (this.player.keys.left == 1) {
        this.player.keys.left = 0;
        networkSocket.sendPlayerKeyRelease('left', pos);
    }

    if (this.player.keys.right == 1) {
        networkSocket.sendPlayerKeyRelease('right', pos);
        this.player.keys.right = 0;
    }
}



/* Keyboard Release Key handler - Network
 *
 * Used to send the pressed keys to the server
 * We just need state changes, so check which keys changes and only send then
 */
InputControls.prototype.keyboardUpCallback = function (e) {
    if (! this.isKeyboardEnabled || ! this.player.playerState.isAlive()) {
        return;
    }

    if (e.keyCode == Phaser.Keyboard.ONE) {
        this.shootWeapon1();
    }
    if (e.keyCode == Phaser.Keyboard.TWO) {
        this.shootWeapon2();
    }
    if (e.keyCode == Phaser.Keyboard.THREE) {
        this.shootWeapon3();
    }
    if (e.keyCode == Phaser.Keyboard.FOUR) {
        this.shootWeapon4();
    }
    if (e.keyCode == Phaser.Keyboard.FIVE) {
        this.shootWeapon5();
    }
    if (e.keyCode == Phaser.Keyboard.SIX) {
        this.shootWeapon6();
    }

    var pos = {
        x: this.player.position.x,
        y: this.player.position.y,
    };

    if (e.keyCode == Phaser.Keyboard.UP || e.keyCode == Phaser.Keyboard.W) {
        if (!this.player.keys.up == 0 && this.player.keys.down == 0) {
            networkSocket.sendPlayerKeyRelease('up', pos);
            this.player.keys.up = 0;
        }
    }


    if (e.keyCode == Phaser.Keyboard.DOWN || e.keyCode == Phaser.Keyboard.S) {
        if (!this.player.keys.down == 0 && this.player.keys.up == 0) {
            networkSocket.sendPlayerKeyRelease('down', pos);
            this.player.keys.down = 0;
        }
    }

    if (e.keyCode == Phaser.Keyboard.LEFT || e.keyCode == Phaser.Keyboard.A) {
        if (!this.player.keys.left == 0 && this.player.keys.right == 0) {
            networkSocket.sendPlayerKeyRelease('left', pos);
            this.player.keys.left = 0;
        }
    }

    if (e.keyCode == Phaser.Keyboard.RIGHT || e.keyCode == Phaser.Keyboard.D) {
        if (!this.player.keys.right == 0 && this.player.keys.left == 0) {
            networkSocket.sendPlayerKeyRelease('right', pos);
            this.player.keys.right = 0;
        }
    }
}



/* Keyboard Press Key handler - Network
 *
 * Used to send the pressed keys to the server
 * This can be called a lot (keyboard repeat rate?)
 * But we just need state changes, so check which keys changes and only send then
 */
InputControls.prototype.keyboardDownCallback = function (e) {
    if (! this.isKeyboardEnabled) {
        return;
    }

    // Chatbox toggle
    if (e.keyCode == Phaser.Keyboard.T) {
        chatboxToggle();
    }

    if (e.keyCode == Phaser.Keyboard.B) {
        playerBot.start();
    }

    if (e.keyCode == Phaser.Keyboard.SPACEBAR) {
        this.spaceKeyFunction();
    }

    if (e.keyCode == Phaser.Keyboard.I) {
        this.iKeyFunction();
    }

    if (e.keyCode == Phaser.Keyboard.P) {
        this.pKeyFunction();
    }

    if (! this.player.playerState.isAlive()) {
        return;
    }


    var pos = {
        x: this.player.position.x,
        y: this.player.position.y,
    };

    if (e.keyCode == Phaser.Keyboard.ONE) {
        this.prepareShootWeapon1();
    }
    if (e.keyCode == Phaser.Keyboard.TWO) {
        this.prepareShootWeapon2();
    }
    if (e.keyCode == Phaser.Keyboard.THREE) {
        //this.shootWeapon3();
    }
    if (e.keyCode == Phaser.Keyboard.FOUR) {
        //this.shootWeapon4();
    }
    if (e.keyCode == Phaser.Keyboard.FIVE) {
        //this.shootWeapon5();
    }
    if (e.keyCode == Phaser.Keyboard.SIX) {
        //this.shootWeapon6();
    }


    // Player movement
    if (e.keyCode == Phaser.Keyboard.UP || e.keyCode == Phaser.Keyboard.W) {
        if (!this.player.keys.up == 1) {
            if (this.player.keys.down == 1) {
                this.player.keys.down = 0;
                networkSocket.sendPlayerKeyRelease('down', pos);
            }

            networkSocket.sendPlayerKeyPress('up', pos);
            this.player.keys.up = 1;
        }
    }

    if (e.keyCode == Phaser.Keyboard.DOWN || e.keyCode == Phaser.Keyboard.S) {
        if (!this.player.keys.down == 1) {
            if (this.player.keys.up == 1) {
                this.player.keys.up = 0;
                networkSocket.sendPlayerKeyRelease('up', pos);
            }
            networkSocket.sendPlayerKeyPress('down', pos);
            this.player.keys.down = 1;
        }
    }

    if (e.keyCode == Phaser.Keyboard.LEFT || e.keyCode == Phaser.Keyboard.A) {
        if (!this.player.keys.left == 1) {
            if (this.player.keys.right == 1) {
                this.player.keys.right = 0;
                networkSocket.sendPlayerKeyRelease('right', pos);
            }

            networkSocket.sendPlayerKeyPress('left', pos);
            this.player.keys.left = 1;
        }
    }

    if (e.keyCode == Phaser.Keyboard.RIGHT || e.keyCode == Phaser.Keyboard.D) {
        if (!this.player.keys.right == 1) {
            if (this.player.keys.left == 1) {
                this.player.keys.left = 0;
                networkSocket.sendPlayerKeyRelease('left', pos);
            }
            networkSocket.sendPlayerKeyPress('right', pos);
            this.player.keys.right = 1;
        }
    }

}



InputControls.prototype.mouseInput = function () {
    if (! this.isKeyboardEnabled || ! this.player.playerState.isAlive()) {
        return;
    }

    if (game.input.activePointer.isDown) {
        var dest = {
            // These are screen coordinates (not map)
            //x: game.input.activePointer.x,
            //y: game.input.activePointer.y,

            // World coordination of mouse click
            x: game.input.worldX,
            y: game.input.worldY,
        }

        this.player.weaponBullet.fireMouse(dest);
    }
}


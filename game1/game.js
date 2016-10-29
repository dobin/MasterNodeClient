"use strict";

/* Game.js
 *
 * Main start class of a game
 *
 * - has the states of the game, and handle state changes
 * - includes all necessary low level functions
 */

// Make game fill window
var windowHeight = $(window).height();
var windowWidth = $(window).width();

// Actual phaser game
var game = new Phaser.Game(windowWidth, windowHeight, Phaser.CANVAS, 'phaser-game');

// Logging
var log = log4javascript.getLogger();
var consoleAppender = new log4javascript.BrowserConsoleAppender();
log.addAppender(consoleAppender);
log.setLevel(log4javascript.Level.ERROR);

// Networking stuff
var networkHandler = new NetworkHandler("MainHandler");
var networkQueue = new NetworkQueue(networkHandler);
var networkSocket = new NetworkSocket("MainSocket", networkHandler);

// Input related stuff
var inputControls = new InputControls();
var playerBot = new PlayerBot();



var GameData = function () {
    // Data transmitted from server by registerAnswer
    // All entities needed to start a map
    // Used from state "menu" -> "play" transition
    this.initialData = {};
}
var gameData = new GameData();



/* State: Boot
 * Preconditions: none
 * Effect: Initializes network
 */
var bootState = {
    create: function () {
        log.debug("Boot");

        // remove default handler of browser (or right-click would show menu)
        //game.canvas.oncontextmenu = function (e) { e.preventDefault(); }

        // Init network
        networkSocket.connect();

        // Want to be notified on tab close so we can disconnect
        $(window).on('beforeunload', function () {
            networkSocket.close();
        });

        // Chatbox init
        // Default is show the box - so toggle it if it is disabled
        if (localStorage.chatboxState == 0) {
            box.chatbox("option", "boxManager").toggleBox();
        }


        game.state.start('load');
    }
};



/* State: Load
 * Preconditions: none
 * Effect: Loads assets
 */
var loadState = {
    preload: function () {
        // Disable pause when tab loses focus
        game.stage.disableVisibilityChange = true;
        game.renderer.renderSession.roundPixels = true;

        // Magecity map and chars
        game.load.tilemap('level1', 'assets/gamemap2.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.tilemap('level2', 'assets/gamemap3.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('gameTiles', 'assets/magecity.png', 256, 1408);

        // teh characters
        game.load.spritesheet('character0', 'assets/characters/healer_f.png', 32, 36);
        game.load.spritesheet('character1', 'assets/characters/healer_m.png', 32, 36);
        game.load.spritesheet('character2', 'assets/characters/mage_f.png', 32, 36);
        game.load.spritesheet('character3', 'assets/characters/mage_m.png', 32, 36);
        game.load.spritesheet('character4', 'assets/characters/ninja_f.png', 32, 36);
        game.load.spritesheet('character5', 'assets/characters/ninja_m.png', 32, 36);
        game.load.spritesheet('character6', 'assets/characters/ranger_f.png', 32, 36);
        game.load.spritesheet('character7', 'assets/characters/ranger_m.png', 32, 36);
        game.load.spritesheet('character8', 'assets/characters/townfolk1_f.png', 32, 36);
        game.load.spritesheet('character9', 'assets/characters/townfolk1_m.png', 32, 36);
        game.load.spritesheet('character10', 'assets/characters/warrior_f.png', 32, 36);
        game.load.spritesheet('character11', 'assets/characters/warrior_m.png', 32, 36);
        gameData.maxCharacterIndex = 11;

        game.load.spritesheet('zombie1', 'assets/zombies/zombie1.png', 34, 36);
        //game.load.spritesheet('zombie2', 'assets/zombies/2ZombieSpriteSheet.png', 41, 36);
        //game.load.spritesheet('zombie3', 'assets/zombies/3ZombieSpriteSheet.png', 41, 36);

        // game elements or effects
        game.load.spritesheet('fireball1', 'assets/fireball1.png', 32, 32);
        game.load.spritesheet('bloodsplat1', 'assets/bloodsplat-01.png', 32, 32);
        game.load.spritesheet('grenadeExplosion', 'assets/grenadeExplosion.png', 96, 96);
        game.load.spritesheet('death', 'assets/skeleton-mage.png', 32, 32);
        game.load.spritesheet('powerups', 'assets/powerups.png', 24, 24);

        game.load.image('deathscreen', 'assets/deathscreen.png');
        game.load.image('intro', 'assets/intro.png');

        game.load.image('wall', '../assets/wall.png');
    },

    create: function () {
        log.debug("Start");

        game.state.start('menu');
    }

};



/* State: Menu
 *
 * Preconditions:
 *  - loaded Assets
 *  - network initialized
 *  - #menuStateHtmlCanvas
 *
 * Effect:
 * - Show start menu
 * - User can input name via HTML element #menuStateHtmlCanvas
 * - User can start main game
 */
var menuState = {
    create: function () {
        log.debug("Menu");

        // We have our own keyboard handler for the menu state
        // This will be overwrite in the play-state for the play input
        game.input.keyboard.addCallbacks(this, this.keyboardDownCallback, this.keyboardUpCallback);

        game.stage.backgroundColor = 0x000000;

        // Enable HTML input field
        $('#menuStateHtmlCanvas').css({display: 'block'});

        // Get name from local storage
        var pName = localStorage.playerName == null ? "Anon" : localStorage.playerName;
        $('#playerNameInput').val(pName)


        var centerX = game.camera.width / 2;
        var centerY = game.camera.height / 2;

        // Display all text element like they appear on the screen
        // From top to bottom
        var bg = game.add.sprite(centerX, centerY, 'intro');
        bg.anchor.setTo(0.5, 0.5);


        var startLabel = game.add.text(centerX-100, centerY-100,
            'Start',
            {font: '50px Arial', fill: '#ffffff'});

        var textLabel6 = game.add.text(centerX+140, centerY+230,
            'Server: ' + networkSocket.getWsUrl(),
            {font: '12px Arial', fill: '#ffffff'});

        this.serverLabel = game.add.text(centerX+140,  centerY+245, '',
            {font: '12px Arial', fill: '#ffffff'});

        // Network status
        this.printServerStatus();
        game.time.events.repeat(Phaser.Timer.SECOND * 2, 100, this.printServerStatus, this);
        // Actions

        // Start game when user clicks on "Start"
        startLabel.inputEnabled = true;
        startLabel.events.onInputDown.add(this.startGame, this);

        // Start game when user presses enter
        var enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        enterKey.onDown.addOnce(this.startGame, this);
    },


    printServerStatus: function() {
        if (! networkSocket.isConnected() ){
            this.serverLabel.text = "Not connected to server";
            networkSocket.connect();
        } else {
            this.serverLabel.text = "Connected to server";
        }
    },

    checkServerStatus: function() {

    },


    keyboardDownCallback: function(e) {
    },

    keyboardUpCallback: function(e) {
    },


    /* Starts the main game by going to "game" state
     *
     * To do this:
     * - Disable HTML input field for player name
     * - Save player name from it
     */
    startGame: function () {
        // Disable HTML input field
        $('#menuStateHtmlCanvas').css({display: 'none'});

        // But save the Name
        gameData.playerName = $('#playerNameInput').val();

        // Save it in localstorage too
        localStorage.playerName = gameData.playerName;

        // Register player to server - start process to move into "play" state
        networkSocket.register(gameData.playerName);

        // The start of the next state, "play", is handled by
        // NetworkHandler.handleRegisterAnswer() calling this.handleRegisterAnswer()
    },


    //  Store initial data from server into gameData.initialData, and sets the state to "play"
    handleRegisterAnswer: function(registerAnswerData) {
        gameData.initialData = registerAnswerData;
        game.state.start('play');
    }

}



/* Play State
 *
 * The main game
 *
 * Preconditions:
 * - (all of menu state)
 * - gameData.initialData with all the data from the server
 *
 */
var playState = {
    create: function () {
        log.debug("Play");

        this.chamber = new Chamber(game, gameData.initialData);
        this.chamber.init();
        networkHandler.setChamber(this.chamber);
    },

    update: function () {
        this.chamber.update();
    },

    render: function () {
        //gameData.enemyGroup.forEachAlive( function(elem) {
        //    game.debug.body(elem);
        //    game.debug.spriteInfo(elem, 32, 32);
        //});

        //game.debug.spriteInfo(gameData.player, 64, 64, {font: '12px Arial', fill: '#ffffff'});
        //game.debug.text(game.time.fps || '--', 2, 14, "#00ff00");

        //game.debug.spriteInfo(gameData.player.nameSprite, 64, 64);
    },

    returnToMenu: function() {
        networkSocket.sendLeaveRequest();
        game.state.start('menu');
    }
}



// States
game.state.add('boot', bootState);
game.state.add('load', loadState);

game.state.add('menu', menuState);
game.state.add('play', playState);
//game.state.add('win', winState); // No way to win!

game.state.start('boot');

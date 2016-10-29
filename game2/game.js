/*
 * From: http://codepen.io/jackrugile/pen/fqHtn
 *
 * game.html copied from game1
 */

var Jumper = function() {};
Jumper.Play = function() {};

Jumper.Play.prototype = {

    preload: function() {
        this.load.image( 'pixel', 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/836/pixel_1.png' );
        this.load.image( 'monster1', 'assets/monster1.png' );
        this.load.image( 'monster2', 'assets/monster2.png' );
        this.load.image( 'map2', '../assets/map02.jpg' );

        this.load.spritesheet('hero', 'assets/bob-jump-01.png', 138, 172);
        this.load.spritesheet('hero1', 'assets/game2-jump-01.png', 648, 897);
        this.load.spritesheet('hero2', 'assets/game2-jump-02.png', 644, 964);

        this.monsters = new Monsters(this);
        this.player = new Player(this);
        this.platforms = new Platforms(this);
        this.interface = new Interface(this);
    },

    create: function() {
        // background color
        this.stage.backgroundColor = '#ccbbbb';

        // scaling
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

        // Enable following for non-fullscreen versino
        //this.scale.maxWidth = this.game.width;
        //this.scale.maxHeight = this.game.height;

        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        //this.scale.setScreenSize( true );


        // physics
        this.physics.startSystem( Phaser.Physics.ARCADE );

        // camera and platform tracking vars
        this.cameraYMin = 99999;

        // background
        this.bg = this.add.tileSprite(0, 0, 1132, 1677, 'map2');

        // create platforms
        this.platforms.platformsCreate();

        // create monsters
        this.monsters.monstersCreate();

        // create hero
        this.player.heroCreate();

    },

    render: function() {
        //this.monsters.forEachAlive( function(elem) {
        //    game.debug.body(elem);
        //    game.debug.spriteInfo(elem, 32, 32);
        //    //game.debugSprite(elem);
        //});
        //game.debug.spriteInfo(this.hero, 32, 32);
    },

    update: function() {
        // this is where the main magic happens
        // the y offset and the height of the world are adjusted
        // to match the highest point the hero has reached
        this.world.setBounds(
            0,
            -this.player.hero.yChange,
            this.world.width,
            this.game.height + this.player.hero.yChange );

        // the built in camera follow methods won't work for our needs
        // this is a custom follow style that will not ever move down, it only moves up
        this.cameraYMin = Math.min(this.cameraYMin, this.player.hero.y - this.game.height + 130);
        this.camera.y = this.cameraYMin;

        // hero collisions and movement
        this.physics.arcade.collide( this.player.hero, this.platforms.platforms );
        this.physics.arcade.collide( this.player.hero, this.monsters.monsters );
        this.player.heroMove();

        // Monsters
        this.monsters.monsterUpdate();
        this.monsters.monsterMove();

        // Platforms
        this.platforms.platformUpdate();

    },

    shutdown: function() {
        // reset everything, or the world will be messed up
        this.world.setBounds( 0, 0, this.game.width, this.game.height );
        this.cursor = null;
        this.player.hero.destroy();
        this.player.hero = null;
        this.platforms.platforms.destroy();
        this.platforms.platforms = null;
    },

}

// Most common resolution 2015 is 1366x768
var game = new Phaser.Game( 512, 768, Phaser.CANVAS, '' );
game.state.add( 'Play', Jumper.Play );
game.state.start( 'Play' );
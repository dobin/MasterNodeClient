
var Player = function(game) {
    this.game = game;


    // cursor controls
    this.cursor = this.game.input.keyboard.createCursorKeys();
}
Player.prototype.constructor = Player;


Player.prototype.heroCreate = function() {
    this.heroVelocity = -600;
    this.heroMovementVelocity = 400;

    // basic hero setup
    this.hero = this.game.add.sprite( this.game.world.centerX, this.game.world.height - 32, 'hero2' );


    this.hero.animations.add('jump');
    this.hero.anchor.set( 0.5 );

    // track where the hero started and how much the distance has changed from that point
    this.hero.yOrig = this.hero.y;
    this.hero.yChange = 0;

    // hero collision setup
    // disable all collisions except for down
    this.game.physics.arcade.enable( this.hero );

    // For hero 1: 104
    // For hero 2: 192
    this.hero.body.setSize(
        this.hero.body.width,
        this.hero.body.height - (192 * 2),
        0,
        0
    );

    this.hero.body.gravity.y = 500;
    this.hero.body.checkCollision.up = false;
    this.hero.body.checkCollision.left = false;
    this.hero.body.checkCollision.right = false;

    this.hero.scale.x = 1/10;
    this.hero.scale.y = 1/10;

    this.hero.body.velocity.y = this.heroVelocity;
};



Player.prototype.heroMove = function() {
    // handle the left and right movement of the hero
    if( this.cursor.left.isDown ) {
        this.hero.body.velocity.x = - this.heroMovementVelocity;
    } else if( this.cursor.right.isDown ) {
        this.hero.body.velocity.x = this.heroMovementVelocity;
    } else {
        this.hero.body.velocity.x = 0;
    }

    // handle hero jumping
    // We dont really use bounce, we just just upon contact
    if(this.hero.body.touching.down) {
        this.hero.animations.play('jump');
        this.hero.body.velocity.y = this.heroVelocity;
    }

    // wrap world coordinated so that you can warp from left to right and right to left
    this.game.world.wrap( this.hero, this.hero.width / 2, false );

    // track the maximum amount that the hero has travelled
    this.hero.yChange = Math.round( Math.max( this.hero.yChange, Math.abs( this.hero.y - this.hero.yOrig ) ));

    // Update score
    this.game.interface.setScore(this.hero.yChange);

    // if the hero falls below the camera view, gameover
    if( this.hero.y > this.game.cameraYMin + this.game.game.height && this.hero.alive ) {
        this.game.state.start( 'Play' );
    }
};
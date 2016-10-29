
var Platforms = function(game) {
    this.game = game;

    this.platformYMin = 99999;

}
Platforms.prototype.constructor = Platforms;




Platforms.prototype.platformsCreate = function() {
    // platform basic setup
    this.platforms = this.game.add.group();
    this.platforms.enableBody = true;
    this.platforms.createMultiple( 10, 'pixel' );

    // create the base platform, with buffer on either side so that the hero doesn't fall through
    this.platformsCreateOne(
        -16,
        this.game.world.height - 16,
        this.game.world.width + 16 );

    // create a batch of platforms that start to move up the level
    for( var i = 0; i < 9; i++ ) {
        this.platformsCreateOne(
            this.game.rnd.integerInRange( 0, this.game.world.width - 50 ),
            this.game.world.height - 100 - 100 * i,
            50 + (10 * i) );
    }
};


Platforms.prototype.platformsCreateOne = function( x, y, width ) {
    // this is a helper function since writing all of this out can get verbose elsewhere
    var platform = this.platforms.getFirstDead();
    platform.reset( x, y );
    platform.scale.x = width;
    platform.scale.y = 16;
    platform.body.immovable = true;
    return platform;
};


Platforms.prototype.platformUpdate = function() {
    // for each plat form, find out which is the highest
    // if one goes below the camera view, then create a new one at a distance from the highest one
    // these are pooled so they are very performant
    this.platforms.forEachAlive( function( elem ) {
        this.platformYMin = Math.min( this.platformYMin, elem.y );
        if( elem.y > this.game.camera.y + this.game.game.height ) {
            elem.kill();
            this.platformsCreateOne(
                this.game.rnd.integerInRange( 0, this.game.world.width - 50 ),
                this.platformYMin - 100,
                50 + (10 * this.game.rnd.integerInRange(0, 4) ) );
        }
    }, this );
};


var Monsters = function(game) {
    this.game = game;

    this.monstersYMin = 99999;
}
Monsters.prototype.constructor = Monsters;


Monsters.prototype.monstersCreate = function() {
    this.monsters = this.game.add.group();
    this.monsters.enableBody = true;
    this.monsters.createMultiple( 2, 'monster1' );

    for(var i=0; i<1; i++) {
        var monster = this.monstersCreateOne(
            this.game.rnd.integerInRange( 0, this.game.world.width - 50 ),
            this.game.world.height - 100 - (200 * (i+1))
        );

    }
}


Monsters.prototype.monstersCreateOne = function(x, y) {
    console.log("Create monster");
    var monster = this.monsters.getFirstDead();
    monster.reset( x, y );
    monster.scale.x = 1/4;
    monster.scale.y = 1/4;
    monster.body.velocity.x = 100;
    monster.body.immovable = true;

    return monster;
};

Monsters.prototype.monsterMove = function() {
    // wrap world coordinated so that you can warp from left to right and right to left
    var that = this;
    this.monsters.forEachAlive( function(monster) {
        that.game.world.wrap( monster, monster.width / 2, false );
    });
};


Monsters.prototype.monsterUpdate = function() {
    // for each plat form, find out which is the highest
    // if one goes below the camera view, then create a new one at a distance from the highest one
    // these are pooled so they are very performant
    this.monsters.forEachAlive( function( elem ) {
        this.monstersYMin = Math.min( this.monstersYMin, elem.y );
        if( elem.y > this.game.camera.y + this.game.game.height ) {
            elem.kill();
            this.monstersCreateOne(
                this.game.rnd.integerInRange( 0, this.game.world.width - 50 ),
                this.monstersYMin - 500 );
        }
    }, this );
}

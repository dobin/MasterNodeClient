"use strict";

var Chamber = function(game, initialData) {
    this.game = game;
    this.initialData = initialData;
    this.chamberName = "test";

    this.mapSizeWidth = 2048;
    this.mapSizeHeight = 2048;

    this.enemies = {};
    this.player = undefined;

    this.gameHud = undefined;

    this.map = undefined;
    this.backgroundlayer = undefined;
    this.blockedLayer = undefined;
    this.decoration = undefined;

    this.playerGroup = undefined;
    this.enemyGroup = undefined;
    this.powerupGroup = undefined;
    this.zombieGroup = undefined;

    this.gameEffects = undefined;

    this.tt = getCurrentTime();
}
Chamber.prototype.constructor = Chamber;



Chamber.prototype.init = function() {
    //  We're going to be using physics, so enable the Arcade Physics system
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.level = this.initialData.level;
    this.initMap();

    // The order here is important for z index
    // first: map
    // then: player / enemies
    // last: effects
    this.zombieGroup = new ZombieGroup(this.game, this);
    this.zombieGroup.createFromInitialData(this.initialData.zombies);

    this.powerupGroup = new PowerupGroup(this.game, this);
    this.powerupGroup.createFromInitialData(this.initialData.powerups);

    this.playerGroup = game.add.group();
    this.enemyGroup = game.add.group();

    this.gameEffects = new GameEffects(game);

    this.postInitMap();

    // HUD is at the end because its over everything else
    this.gameHud = new GameHud(this.game);

    this.initEnemies();
    this.initializePlayer();
    inputControls.initControls(this.player);
    this.initMapSettings();
}


/* Update() - main update loop of game
 *
 */
Chamber.prototype.update = function() {
    var time1 = getCurrentTime();
    var tDiff = time1 - this.tt;
    this.tt = time1;

    /***  Handle network messages ***/
    networkQueue.handleMessages();

    /*** Input ***/

    // move the idiots manually
    this.player.updateTick(tDiff);

    this.enemyGroup.forEachAlive(function(enemy) {
        enemy.positionUpdate(tDiff);
    });
    this.zombieGroup.forEachAlive(function(zombie) {
        zombie.positionUpdate(tDiff);
    });

    // Check mouse input
    inputControls.mouseInput();


    /*** Collisions ***/

    //  Collide the player with the platforms
    game.physics.arcade.collide(this.player, this.blockedLayer);

    //  Collide the zombies with the platforms
    game.physics.arcade.collide(this.zombieGroup, this.blockedLayer);

    // Also collide the enemies with the platforms
    this.enemyGroup.forEachExists(function(enemy) {
        game.physics.arcade.collide(enemy, this.blockedLayer);
    }, this);


    // Collide player with barriers
    game.physics.arcade.collide(this.player, this.player.weaponBarrier.ammoGroup);

    // Collide zombie with barriers
    game.physics.arcade.collide(this.zombieGroup, this.player.weaponBarrier.ammoGroup);

    this.enemyGroup.forEachExists(function(enemy) {
        // enemy barriers
        this.enemyGroup.forEachExists(function(enemy2) {
            game.physics.arcade.collide(enemy, enemy2.weaponBarrier.ammoGroup);
        });

        // enemy barriers with zombies
        game.physics.arcade.collide(this.zombieGroup, enemy.weaponBarrier.ammoGroup);

        // enemy with player barrier
        game.physics.arcade.collide(enemy, this.player.weaponBarrier.ammoGroup);

        // player with enemy barrier
        game.physics.arcade.collide(this.player, enemy.weaponBarrier.ammoGroup);
    }, this);


    /*** Overlaps ***/

    // Collide: player bullets with map
    game.physics.arcade.collide(this.player.weaponBullet, this.blockedLayer, this.destroyBullet);

    // Collide: player bullets with player barrier
    game.physics.arcade.collide(this.player.weaponBullet, this.player.weaponBarrier.ammoGroup, this.destroyBullet);

    // Collide: player bullets with enemies
    this.enemyGroup.forEachAlive(function(enemy) {
        game.physics.arcade.overlap(
            this.player.weaponBullet,
            enemy,
            this.destroyBulletGS);
    }, this);

    this.enemyGroup.forEachAlive(function(enemy) {
       this.enemyGroup.forEachAlive(function(enemy2) {
            // Collide: enemy bullets with enemies
            game.physics.arcade.overlap(enemy.weaponBullet, enemy2, this.destroyBulletC);

            // Collide: enemy bullets with barriers
           game.physics.arcade.overlap(enemy.weaponBullet, enemy2.weaponBarrier, this.destroyBulletC);
       }, this);

        // Collide: enemy bullets with player
        game.physics.arcade.overlap(enemy.weaponBullet, this.player, this.destroyBulletGS);
    }, this);

    // Collide: enemy bullets with environment
    this.enemyGroup.forEachAlive(function(enemy) {
        game.physics.arcade.collide(enemy.weaponBullet, this.blockedLayer, this.destroyBullet);
    }, this);
}



Chamber.prototype.destroyBulletGS = function(sprite, bullet) {
    bullet.kill();
}



Chamber.prototype.destroyBullet = function(bullet, stuff) {
    if (bullet.myType == 'bullet') {
        bullet.kill();
    } else {
        stuff.kill();
    }
}



Chamber.prototype.destroyBulletC = function(bullet, stuff) {
    var b, p;

    if (bullet.myType == 'bullet') {
        b = bullet;
        p = stuff;
    } else {
        b = stuff;
        p = bullet;
    }

    if (b.parentWeapon.playerParent.clientId == p.clientId) {
        return;
    }
    b.kill();
}



Chamber.prototype.removeEntity = function(removeEntityData) {
    if (removeEntityData.type == 'powerup') {
        this.powerupGroup.removePowerup(removeEntityData.uniqueId);
    }
}



Chamber.prototype.addEntity = function(addEntityData) {
    if (addEntityData.type == 'powerup') {
        this.powerupGroup.spawnPowerup(addEntityData.powerup);
    }
}



/* Init Enemies
 *
 * called from initGfx() at start of level
 *
 * Needs:
 * - this.initialData.enemies
 *
 *
 */
Chamber.prototype.initEnemies = function() {
    var n;
    var enemies = this.initialData.enemies;

    for (n = 0; n < enemies.length; n++) {
        console.info("Init enemies: New enemy: " + enemies[n].userName);
        this.createNewEnemyFromNetwork(enemies[n]);
    }
}



Chamber.prototype.initializePlayer = function() {
    this.player = new Player(this, this.initialData.player);
    this.playerGroup.add(this.player);
}



/* Init Map Settings
 *
 * called from initGfx() at start of level
 *
 */
Chamber.prototype.initMapSettings = function() {
    // Bigger world
    game.world.setBounds(0, 0, this.mapSizeWidth, this.mapSizeHeight);

    // Camera Follow player
    game.camera.follow(this.player);
}



/*
 *
 *
 */
Chamber.prototype.initMap = function() {
    // New tiled map
    this.map = game.add.tilemap(this.level);
    this.map.addTilesetImage('test', 'gameTiles');

    this.backgroundlayer = this.map.createLayer('Ground');
    this.blockedLayer = this.map.createLayer('Houses');
    this.decoration = this.map.createLayer('Decoration');


    this.map.setCollisionBetween(1, 1024, true, 'Houses');
}

Chamber.prototype.postInitMap = function() {
    this.hiding = this.map.createLayer('Hiding');
}


Chamber.prototype.updateChamberStatsDisplay = function(chamberStats) {
    this.gameHud.updateHud(chamberStats);
}


/*** Network handling function ***/


/* Handle new enemy
 *
 * a new enemy connected
 * create it locally
 */
Chamber.prototype.createNewEnemyFromNetwork = function(enemy) {
    log.info("new dude: " + enemy.clientId);

    var newDude = new Enemy(this, enemy);
    this.enemyGroup.add(newDude);

    this.enemies[enemy.clientId] = newDude;
}



/*** Helpers ***/

Chamber.prototype.findPlayerOrEnemyByClientId = function(clientId) {
    if (this.player.clientId == clientId) {
        return this.player;
    }

    var e = undefined;
    this.enemyGroup.forEachAlive(function(enemy) {
        if (enemy.clientId == clientId) {
            e = enemy;
        }
    });

    if (e == undefined) {
        e = this.zombieGroup.findZombieByClientId(clientId);
    }

    return e;
}

Chamber.prototype.findPlayerByClientId = function(clientId) {
    if (this.player.clientId == clientId) {
        return this.player;
    } else {
        return null;
    }
}

Chamber.prototype.findEnemyByClientId = function(clientId) {
    var e = this.enemies[clientId];
    if (e == undefined) {
        e = this.zombieGroup.findZombieByClientId(clientId);

        if (e == undefined) {
            log.error("could not find enemy: " + clientId);
            return null;
        }
    }
    return e;
}






"use strict";

var GameHud = function(game) {
    this.game = game;

    this.death = {
        text1: undefined,
        text2: undefined,
        text3: undefined,
        text4: undefined,
    }
    this.deathGroup = this.game.add.group();
    this.deathGroup.fixedToCamera = true;

    this.chamberStats = {
        ping: undefined,
        sleepTime: undefined,
        playerPosDiff: undefined,
        playerPosSrv: undefined,
        playerPosCli: undefined,
    };
    this.chamberStatsGroup = this.game.add.group();
    this.chamberStatsGroup.fixedToCamera = true;

    this.debugEnabled = false;
    this.deathEnabled = false;

    this.init();
}
GameHud.prototype.constructor = GameHud;



GameHud.prototype.showDeath = function(show, serverStateData) {
    this.deathEnabled = show;

    if (show) {
        this.death.text3.setText('Round Frags: ' + serverStateData.playerStatistics.round.frags);
        this.death.text4.setText('Session Frags: ' + serverStateData.playerStatistics.session.frags);
        this.deathGroup.visible = true;
    } else {
        this.deathGroup.visible = false;
    }
}


GameHud.prototype.toggleDebug = function() {
    this.showDebug( ! this.debugEnabled );
}


GameHud.prototype.showDebug = function(show) {
    this.debugEnabled = show;

    if (show) {
        this.chamberStatsGroup.visible = true;
    } else {
        this.chamberStatsGroup.visible = false;
    }
}


/* Init Enemies
 *
 * called from initGfx() at start of level
 *
 */
GameHud.prototype.init = function() {

    var bg = game.add.sprite(game.world.centerX, game.world.centerY, 'deathscreen');
    bg.anchor.setTo(0.5, 0.5);
    this.deathGroup.add(bg);

    this.death.text1 = game.add.text(
        game.world.centerX - 180,
        game.world.centerY - 70,
        'Yu Ded',
        {fontSize: '40px', fill: '#f00'}, this.deathGroup);

    this.death.text3 = game.add.text(
        game.world.centerX  - 180,
        game.world.centerY - 10,
        'Round Frags: ',
        {fontSize: '30px', fill: '#f00'}, this.deathGroup);

    this.death.text4 = game.add.text(
        game.world.centerX  - 180,
        game.world.centerY + 20,
        'Session Frags: ',
        {fontSize: '30px', fill: '#f00'}, this.deathGroup);

    this.death.text2 = game.add.text(
        game.world.centerX  - 180,
        game.world.centerY + 60,
        'press space to continue',
        {fontSize: '30px', fill: '#f00'}, this.deathGroup);


    this.showDeath(false);

    /* fugly rectangle */
    var drawnObject;
    var width = 400 // example;
    var height = 90 // example;
    var bmd = game.add.bitmapData(width, height);
    bmd.ctx.beginPath();
    bmd.ctx.rect(0, 0, width, height);
    bmd.ctx.fillStyle = '#000000';
    bmd.ctx.fill();
    drawnObject = game.add.sprite(0, 0, bmd);

    this.chamberStatsGroup.add(drawnObject);

    this.chamberStats.ping =
        game.add.text(0, 0, 'Ping: 0', {fontSize: '16px', fill: '#00f'}, this.chamberStatsGroup);

    this.chamberStats.sleepTime =
        game.add.text(0, 16, 'Sleep Time: min: 0 max: 0', {fontSize: '16px', fill: '#00f'}, this.chamberStatsGroup);

    this.chamberStats.playerPosDiff =
        game.add.text(0, 32, 'Player Pos Diff: min: 0 max: 0', {fontSize: '16px', fill: '#00f'}, this.chamberStatsGroup);

    this.chamberStats.playerPosSrv =
        game.add.text(0, 48, 'Player Pos Srv: 0/0', {fontSize: '16px', fill: '#00f'}, this.chamberStatsGroup);

    this.chamberStats.playerPosCli =
        game.add.text(0, 64, 'Player Pos Cli: 0/0', {fontSize: '16px', fill: '#00f'}, this.chamberStatsGroup);

    this.showDebug(false);

    //  The score
    //this.scoreText = game.add.text(16, 16, 'score: 0', {fontSize: '32px', fill: '#000'});
    //this.scoreText.fixedToCamera = true;
}


GameHud.prototype.updateHud = function(chamberStats) {
    this.chamberStats.ping.setText('Ping: ' + chamberStats.ping);

    this.chamberStats.sleepTime.setText(
        'Sleep Time: min: ' +
        chamberStats.sleepTime.min.toFixed(0) +
        ' max: ' +
        chamberStats.sleepTime.max.toFixed(0)
    );

    this.chamberStats.playerPosDiff.setText(
        'Player Pos Diff: min: ' +
        chamberStats.playerPositionDiff.min.toFixed(2) +
        ' avg: ' +
        chamberStats.playerPositionDiff.avg.toFixed(2) +
        ' max: ' +
        chamberStats.playerPositionDiff.max.toFixed(2)
    );

    this.chamberStats.playerPosSrv.setText(
        'Player Pos Srv: ' +
        parseInt(chamberStats.lastPlayerPosition.server.x) +
        ' / ' +
        parseInt(chamberStats.lastPlayerPosition.server.y)
    );


    this.chamberStats.playerPosCli.setText(
        'Player Pos Cli: ' +
        parseInt(chamberStats.lastPlayerPosition.client.x) +
        ' / ' +
        parseInt(chamberStats.lastPlayerPosition.client.y)
    );
}


var Interface = function(game) {
    this.game = game;

    // HUD
    this.scoreText = this.game.add.text(16, 16, 'score: 0',
        {fontSize: '32px', fill: '#000'});
    this.scoreText.fixedToCamera = true;

}
Interface.prototype.constructor = Interface;

Interface.prototype.setScore = function(score) {
    this.scoreText.text = "Score: " + score;
}

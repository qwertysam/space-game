Game.Preloader = function (game) {

    this.preloadBar = null;
};

Game.Preloader.prototype = {
    preload: function () {

        this.preloadBar = this.add.sprite(this.world.centerX, this.world.centerY, 'preloaderBar');

        this.preloadBar.anchor.setTo(0.5, 0.5);

        this.time.advancedTiming = true;

        this.load.setPreloadSprite(this.preloadBar);

        // LOAD ALL ASSETS

        //var tilemap = this.load.tilemap('map', 'assets/level1.csv');

        //this.load.image('tileset', 'assets/spritesheet.png');

        //this.load.spritesheet('player', 'assets/running.png', 36, 40)



        // Space

        this.load.image('ship', 'assets/ship/ship.png');
        this.load.spritesheet('fire', 'assets/ship/fire.png', 7, 20);

        this.load.image('stars1', 'assets/ambient/stars1.png');
        this.load.image('stars2', 'assets/ambient/stars2.png');
        this.load.image('stars3', 'assets/ambient/stars3.png');
        this.load.image('stars2ls', 'assets/ambient/stars2lightspeed.png');
        this.load.image('stars3ls', 'assets/ambient/stars3lightspeed.png');
        this.load.image('gradient', 'assets/ambient/gradient.png');
        this.load.image('glow', 'assets/ambient/lightspeedGlow.png');

        this.load.image('sand', 'assets/planets/sand.png');

        this.load.bitmapFont('carrier_command', 'assets/font/carrier_command.png', 'assets/font/carrier_command.xml');
    },

    create: function () {
        //this.state.start('Level1');
        this.state.start('Space');
    }
};

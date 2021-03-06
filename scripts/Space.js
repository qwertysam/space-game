Game.Space = function (game) {
    this.game = game;
};

const SCALE = 2;
const WINDOW_WIDTH = 16 * 40;
const WINDOW_HEIGHT = 9 * 40;

//var cursors;

// Player
var player;
var fire;
var controls = {};
const thrustersMagnitude = 8;
const angularThrustersComponent = Math.sqrt(thrustersMagnitude * thrustersMagnitude / 2);
const maxSpeed = 5000;
var warningText;
const defaultWarningText = "Crash Imminent";
const crashCheckReset = 20;
var crashCheck = crashCheckReset;
const minCrashSpeed = 1000;
const maxWarningDisplay = 10; //seconds

const planetLandRadius = 10;

var planets;
var planet1;
var landingText;
var planetName;

// Ambient stuff
var stars1;
var stars2;
var stars3;
var lastX;
var lastY;
var stars2ls; // ls = lightspeed
var stars3ls;
// The biggest width it will need is the worst case scenario (where the LS effect is rotated such that the width needs to cover the diagonal length accross the screen)
const maxRequiredLSWidth = Math.ceil(Math.sqrt(WINDOW_WIDTH * WINDOW_WIDTH + WINDOW_HEIGHT * WINDOW_HEIGHT));
var glow;
const maxGlowOpacity = 0.12;
// Speeds
const lsStartSpeed = 2500;
const lsFullSpeed = 2800;
const lsStartGlow = 3500;

var showDebug = false;

Game.Space.prototype = {
    create: function () {

        this.game.physics.arcade.gravity.y = 0; //1400 = Earth

        this.game.world.resize(64000, 64000);

        if (this.game.renderType != Phaser.CANVAS) {
            this.game.debug.resize(Phaser.ScaleManager, WINDOW_WIDTH, WINDOW_HEIGHT);
        }
        this.game.stage.backgroundColor = '#211a23';
        this.game.renderer.renderSession.roundPixels = true;

        stars1 = this.game.add.tileSprite(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT, 'space', 'ambient/stars1');
        stars1.fixedToCamera = true;
        stars1.smoothed = false;
        stars2 = this.game.add.tileSprite(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT, 'space', 'ambient/stars2');
        stars2.fixedToCamera = true;
        stars2.smoothed = false;
        stars3 = this.game.add.tileSprite(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT, 'space', 'ambient/stars3');
        stars3.fixedToCamera = true;
        stars3.smoothed = false;
        stars2ls = this.game.add.tileSprite(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, maxRequiredLSWidth, maxRequiredLSWidth, 'space', 'ambient/stars2lightspeed');
        stars2ls.anchor.setTo(0.5, 0.5);
        stars2ls.fixedToCamera = true;
        stars3ls = this.game.add.tileSprite(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, maxRequiredLSWidth, maxRequiredLSWidth, 'space', 'ambient/stars3lightspeed');
        stars3ls.anchor.setTo(0.5, 0.5);
        stars3ls.fixedToCamera = true;
        glow = this.game.add.sprite(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, 'space', 'ambient/lightspeedGlow');
        glow.anchor.setTo(0.5, 0.5);
        glow.fixedToCamera = true;
        glow.scale.setTo(4, 4);

        var gradient = this.game.add.sprite(0, 0, 'space', 'ambient/gradient');
        gradient.fixedToCamera = true;
        gradient.scale.setTo(2, 2);
        gradient.smoothed = false;

        player = this.game.add.sprite(64000 / 2, 64000 / 2, 'space', 'ship/ship');
        player.anchor.setTo(0.5, 0.5);
        player.smoothed = false;
        player.scale.setTo(SCALE, SCALE);
        this.game.physics.arcade.enable(player);
        player.body.setSize(15, 15, 0, 4);
        player.body.collideWorldBounds = true;

        this.game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON, 0.5, 0.5);
        lastX = this.game.camera.position.x;
        lastY = this.game.camera.position.y;

        fire = player.addChild(this.game.add.sprite(0, 20, 'fire'));
        fire.anchor.setTo(0.5, 0.5);
        fire.smoothed = false;
        fire.scale.setTo(1, -1);
        fire.animations.add('on', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 20, true);
        fire.animations.add('off', [12], 1, true);

        planets = this.game.add.group();
        //planets.enableBody = true;
        //planets.physicsBodyType = Phaser.Physics.ARCADE;

        planet1 = planets.create(64000 / 2 + 200, 64000 / 2 + 200, 'space', 'planets/sand');
        planet1.smoothed = false;
        //planet1.body.setCircle(planet1.width / 2 + planetLandRadius, -planetLandRadius, -planetLandRadius);
        planet1.scale.setTo(8, 8);
        planet1.attraction = 250000 //180000;
        planet1.radius = planet1.width / 2;
        planet1.landRadius = planet1.radius + planetLandRadius;
        planet1.attrRadius = planet1.width * 4;
        planet1.nameRadius = planet1.width * 2;
        planet1.name = 'Dankworld II';

        landingText = this.game.add.bitmapText(WINDOW_WIDTH / 2, 70, 'carrier_command', 'Current Planet', 16);
        landingText.fixedToCamera = true;
        landingText.smoothed = false;
        landingText.anchor.setTo(0.5, 0.5);
        landingText.visible = false;
        planetName = landingText.addChild(this.game.add.bitmapText(0, 30, 'carrier_command', 'name', 16));
        planetName.fixedToCamera = true;
        planetName.smoothed = false;
        planetName.anchor.setTo(0.5, 0.5);
        planetName.visible = false;

        warningText = this.game.add.bitmapText(WINDOW_WIDTH / 2, WINDOW_HEIGHT - 60, 'carrier_command', 'WARNING: Approaching Object', 16);
        warningText.fixedToCamera = true;
        warningText.smoothed = false;
        warningText.anchor.setTo(0.5, 0.5);
        warningText.visible = false;

        controls = {
            d: this.game.input.keyboard.addKey(Phaser.Keyboard.D),
            right: this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT),
            a: this.game.input.keyboard.addKey(Phaser.Keyboard.A),
            left: this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT),
            w: this.game.input.keyboard.addKey(Phaser.Keyboard.W),
            space: this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR),
            up: this.game.input.keyboard.addKey(Phaser.Keyboard.UP),
            s: this.game.input.keyboard.addKey(Phaser.Keyboard.S),
            down: this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN)
        };
    },

    resize: function () {

    },

    update: function () {


        /*
        //this.game.physics.arcade.collide(player, planets);
        this.game.physics.arcade.overlap(player, planets, function (player, planet) {
            planetName.text = planet.name;
            planetName.visible = true;
            landingText.visible = true;
        }, null, this);*/


        // Updates background star positions to follow at different speeds 
        {
            // Updates the delta position of the camera's position
            var changeX = this.game.camera.position.x - lastX;
            var changeY = this.game.camera.position.y - lastY;

            lastX = this.game.camera.position.x;
            lastY = this.game.camera.position.y;

            // If going over light speed   
            if (player.body.speed > lsFullSpeed) {
                // Hide regular stars and show light speed stars
                stars1.alpha = 0;
                stars2.alpha = 0;
                stars3.alpha = 0;
                stars2ls.alpha = 1;
                stars3ls.alpha = 1;

                if (player.body.speed > lsStartGlow) {
                    // Find the desired opacity of the glow, linearly proprortional to the speed for a smooth transition into and out of the glow
                    var opacity = (maxSpeed - player.body.speed) / (maxSpeed - lsStartGlow);

                    glow.alpha = (1 - opacity) * maxGlowOpacity;

                    lsStars(true);

                } else {
                    glow.alpha = 0;

                    lsStars(false);
                }

                // If inbetween light speed and regular speed
            } else if (player.body.speed > lsStartSpeed) {
                // Find the desired opacity of the light stars, linearly proprortional to the speed for a smooth transition into and out of light speed
                var opacity = (lsFullSpeed - player.body.speed) / (lsFullSpeed - lsStartSpeed);

                stars1.alpha = opacity;
                stars2.alpha = opacity;
                stars3.alpha = opacity;
                stars2ls.alpha = 1 - opacity;
                stars3ls.alpha = 1 - opacity;
                glow.alpha = 0;

                lsStars(false);
                normalStars();

                // Else, going regular speed
            } else {
                // Draw regular stars and hide light speed stars
                stars1.alpha = 1;
                stars2.alpha = 1;
                stars3.alpha = 1;
                stars2ls.alpha = 0;
                stars3ls.alpha = 0;
                glow.alpha = 0;

                normalStars();

                lsStars(true);
            }

            function normalStars() {
                // Moves the tileSprite's tilePosition property, makes background appear to scroll with the player
                stars1.tilePosition.x += -changeX + changeX / 4;
                stars1.tilePosition.y += -changeY + changeY / 4;

                stars2.tilePosition.x += -changeX + changeX / 8;
                stars2.tilePosition.y += -changeY + changeY / 8;

                stars3.tilePosition.x += -changeX + changeX / 16;
                stars3.tilePosition.y += -changeY + changeY / 16;
            }

            function lsStars(doGlow) {
                // Calculates the total magnitude of speed change. This is because the sprite for light speed only scrolls across the the x axis, and then rotates to properly be scrolling in any direction
                var changeMagnitude = Math.sqrt(changeX * changeX + changeY * changeY);

                // Moves the tileSprite's tilePosition property, makes background appear to scroll with the player
                stars2ls.tilePosition.x += -changeMagnitude + changeMagnitude / 4;
                stars3ls.tilePosition.x += -changeMagnitude + changeMagnitude / 8;

                // Finds the angle that the ship is at
                var angle = Math.atan(player.body.velocity.y / player.body.velocity.x);

                // Tangent function repeats twice in a single 2PI radian circle, so it can't differentiate between forwards and backwards angles without this help
                if (player.body.velocity.x < 0) angle += Math.PI;

                stars2ls.rotation = angle;
                stars3ls.rotation = angle;

                // If 
                if (doGlow) {
                    glow.rotation = angle + Math.PI / 2;
                }
            }
        }

        var doCrashCheck = false;
        if (crashCheck > 0) {
            crashCheck--;

        } else {
            crashCheck = crashCheckReset;

            warningText.visible = false;

            // if going really fast
            if (player.body.speed >= minCrashSpeed) {
                // Do a crash check every bunch of counts
                // A crash check tells the plarer whether or not they're in danger of hitting a planet when going really fast
                doCrashCheck = true;
            } else {
                // TODO: Reset crash warning

                /*
                var mX = player.body.velocity.x;
                var mY = player.body.velocity.y;

                var pX = player.body.position.x;
                var pY = player.body.position.y;

                var a = -mY;
                var b = mX;
                var c = (pX * mY) - (mX * pY);

                var p2X = planet1.position.x + planet1.radius;
                var p2Y = planet1.position.y + planet1.radius;

                var dist = Math.abs(a * p2X + b * p2Y + c) / Math.sqrt(a * a + b * b)

                // dX * y + -dY * x + -dX * y1 + dY * x1

                if (dist < planet1.landRadius)
                    console.log('Feck lad ' + dist)


                //console.log('x: ' + mX + ' y: ' + mY + ' p: (' + pX + ', ' + pY + ')');*/
            }
        }


        /* old crash check code
        if (player.body.speed > lsStartSpeed) {
            crashCheck--;
            if (crashCheck < 0) {
                crashCheck = crashCheckReset;
                doCrashCheck = true;
            }
        }*/

        planetName.visible = false;
        landingText.visible = false;

        planets.forEach(function (planet) {
            if (planet.attraction) {

                // Delta position between planet and player
                var dX = (planet.position.x + planet.radius) - player.position.x;
                var dY = (planet.position.y + planet.radius) - player.position.y;
                var shipDistanceSqr = dX * dX + dY * dY;
                var shipDistance = Math.sqrt(shipDistanceSqr);

                // If the ship is within the attraction radius of a planet's gravity, attract the ship towards the planet
                if (shipDistance <= planet.attrRadius) {
                    // The force using Netwonian gravitiation
                    var attraction = planet.attraction / shipDistanceSqr;

                    // Using some trig knowledge, find the components of the force
                    player.body.velocity.x += attraction * dX / shipDistance;
                    player.body.velocity.y += attraction * dY / shipDistance;
                }

                if (shipDistance <= planet.nameRadius && player.body.speed < minCrashSpeed) {
                    planetName.text = planet.name;
                    planetName.visible = true;
                    landingText.visible = true;
                }

                if (shipDistance <= planet.landRadius) {
                    // TODO land here
                }

                // If it's told to do crash checks and it's not already showing a warning
                if (doCrashCheck && !warningText.visible) {

                    // Player
                    var pX = player.body.position.x;
                    var pY = player.body.position.y;

                    var mX = player.body.velocity.x;
                    var mY = player.body.velocity.y;

                    // Planet
                    var p2X = planet.position.x + planet.radius;
                    var p2Y = planet.position.y + planet.radius;

                    // If the player's velocity is in a direction that would result in a collision
                    // (e.g. prevents from collision detection against objects behind the player)
                    if (((dX < 0 && mX < 0) || (dX > 0 && mY > 0)) && ((dY < 0 && mY < 0) || (dY > 0 && mY > 0))) {

                        var timeUntilCrash = Math.floor(Math.abs(shipDistance / player.body.speed));

                        if (timeUntilCrash <= maxWarningDisplay) {
                            // https://math.stackexchange.com/questions/275529/check-if-line-intersects-with-circles-perimeter

                            // Find the shortest distance between the point (the planet's (x,y)) and the line (the player's velocity vector)
                            var a = -mY;
                            var b = mX;
                            var c = (pX * mY) - (mX * pY);
                            var dist = Math.abs(a * p2X + b * p2Y + c) / Math.sqrt(a * a + b * b)

                            // If the distance from the line to the center of the planet is less than the land radius, that means that it intersects and it's gonna crash yo
                            if (dist < planet.landRadius) {
                                warningText.visible = true;

                                warningText.text = defaultWarningText + ' (T-' + timeUntilCrash + ')';
                            }
                        }
                    }
                }
            } else {
                console.log('Warning, object in planets group is not a planet');
            }
        }, this);

        var up = controls.w.isDown || controls.up.isDown;
        var down = controls.s.isDown || controls.down.isDown;
        var right = controls.d.isDown || controls.right.isDown;
        var left = controls.a.isDown || controls.left.isDown;

        // If any controls are being pressed, show fire coming from the ship, otherwise do nothing 
        if (up || down || left || right) {
            fire.animations.play('on');
        } else {
            fire.animations.play('off');
        }

        // console.log(player.body.speed)

        // Applies thrust and sprite rotation to the ship based on control input
        if (right && up) {
            player.body.velocity.x += angularThrustersComponent;
            player.body.velocity.y -= angularThrustersComponent;
            player.rotation = Math.PI / 4;
        } else if (right && down) {
            player.body.velocity.x += angularThrustersComponent;
            player.body.velocity.y += angularThrustersComponent;
            player.rotation = 3 * Math.PI / 4;
        } else if (left && down) {
            player.body.velocity.x -= angularThrustersComponent;
            player.body.velocity.y += angularThrustersComponent;
            player.rotation = 5 * Math.PI / 4;
        } else if (left && up) {
            player.body.velocity.x -= angularThrustersComponent;
            player.body.velocity.y -= angularThrustersComponent;
            player.rotation = 7 * Math.PI / 4;
        } else if (up) {
            player.body.velocity.y -= thrustersMagnitude;
            player.rotation = 0;
        } else if (right) {
            player.body.velocity.x += thrustersMagnitude;
            player.rotation = Math.PI / 2;
        } else if (down) {
            player.body.velocity.y += thrustersMagnitude;
            player.rotation = Math.PI;
        } else if (left) {
            player.body.velocity.x -= thrustersMagnitude;
            player.rotation = 3 * Math.PI / 2;
        }

        // Caps the maximum speed of the space ship
        player.body.velocity.setMagnitude(Math.min(maxSpeed, player.body.velocity.getMagnitude()));

        // Debug
        if (controls.down.downDuration()) {
            showDebug = !showDebug;

            if (showDebug) {} else {
                this.game.debug.reset();
            }
        }
    },

    render: function () {
        if (showDebug) {
            this.game.debug.body(player);

            planets.forEach(function (planet) {
                if (planet.body) {
                    this.game.debug.body(planet);
                }
            }, this);
        }
    }
};

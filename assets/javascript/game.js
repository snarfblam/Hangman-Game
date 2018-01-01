// @ts-check

    /**
     * Enum. Identifies current state of the game.
     */
    var HangmanState =  {
        uninitialized: "uninitialized",
        playing: "playing",
        gameOver: "gameOver"
    };

    var HangmanGame;

// --------------------------------------------------------------- 
// not$ - Because I already wrote code
// --------------------------------------------------------------- 
    
    /**
    * @typedef {Object} notDollarObject - notDollar object
    * @prop {Array} items - Elements this object operates on
    * @prop {Function} on - Adds an event handler. not$(something).on("click", someFunction)
    * @prop {Function} text - Gets/sets text (textContent) of captured elements
    * @prop {Function} html - Gets/sets html (innerHTML) of captured elements
    * @prop {Function} attr - Gets/sets the specified attributes of captured elements
    * @prop {Function} ready - Accepts a function to be run when the DOM is loaded. Applicable only do document object (i.e. not$(document).ready(function here))
    * @prop {Function} addClass - Adds the specified class(es) to the captured elements if they don't already have it
    * @prop {Function} removeClass - Removes the specified class(es) to the captured elements if they don't already have it
    */

    window.addEventListener("DOMContentLoaded", function() {
        not$.documentReady = true;
    }, false);


    /** Capture elements by "#ID" or ".className", or document/html elements
     * @param {string | Document | HTMLElement} selector 
     * @returns {notDollarObject}
     */
    function not$(selector){
        if(selector == document) {
            return new not$.Not$Object([document]);
        }else if (selector instanceof HTMLElement){
            return new not$.Not$Object([selector]);
        }else if(selector.charAt(0) == "#"){
            return byID(selector.substr(1));
        }else if(selector.charAt(0) == ".") {
            return byClass(selector.substr(1));
        }

        /** @returns {notDollarObject} */
        function byID(id){
            return new not$.Not$Object([document.getElementById(id)]);
        }

        /** @returns {notDollarObject} */
        function byClass(cls){
            return new not$.Not$Object(
                Array.prototype.slice.call(document.getElementsByClassName(cls))
            );
        }
    }

        /** Tracks whether DOMContentLoaded has already been raised */
        not$.documentReady = false;
        /** Adds document ready handler or immediately invokes handler, as appropriate */
        not$.addReadyHandler = function(handler){
            // If the DOM is already ready, immediately invoke the handler
            if(not$.documentReady) {
                handler();
            } else {
                window.addEventListener("DOMContentLoaded", handler)
            }
        }
        

        /** Creates a new not$ object */
        not$.Not$Object = function(items){
            this.items = items;
        }

        // Not$Object prototype
        not$.Not$Object.prototype = {};

        /** Gets/sets object's text content */
        not$.Not$Object.prototype["text"] = function(opt_Text) {
            return this.getOrSet(arguments, 
                function(e) { return e.textContent; },
                function(e, txt) {e.textContent = txt;}
            );
        };

        /** Gets/sets object's inner HTML */
        not$.Not$Object.prototype["html"] = function(opt_HTML) {
            return this.getOrSet(arguments, 
                function(e) { return e.innerHTML; },
                function(e, txt) {e.innerHTML = txt;}
            );
        };

        /** Gets/sets object's attribute */
        not$.Not$Object.prototype["attr"] = function(name, opt_Attr) {
            return this.getOrSetWithName(arguments, 
                function(e, name) { return e.getAttribute(name) },
                function(e, name, value) {e.setAttribute(name, value);}
            );
        };

        /** Adds the specified class to element(s) if not already present */
        not$.Not$Object.prototype["addClass"] = function(a,b) {
            return this.getOrSet(arguments, 
                null,
                function(e, newCls) {
                    var classesAdded = false;
                    var currentClasses = e.getAttribute("class") || "";
                    var currentClassList = currentClasses.split(" ");

                    var newClassList = newCls.split(" ");
                    newClassList.forEach(function(cls) {
                        var containsCls = false;
                        currentClassList.forEach(function(classListItem) { 
                            if(classListItem == cls) containsCls = true;
                        });

                        if(!containsCls) {
                            currentClassList.push(cls);
                            classesAdded = true;
                        }
                    });
                    if(classesAdded) {
                        e.setAttribute("class", currentClassList.join(" "));
                    }
                }
            );
        };

        /** Adds the specified class to element(s) if not already present */
        not$.Not$Object.prototype["removeClass"] = function(a,b) {
            return this.getOrSet(arguments, 
                null,
                function(e, remCls) {
                    var classesRemoved = false;
                    var currentClasses = e.getAttribute("class") || "";
                    var currentClassList = currentClasses.split(" ");

                    var remClassList = remCls.split(" ");
                    remClassList.forEach(function(cls) {
                        var index = currentClassList.indexOf(cls);
                        if(index >= 0) {
                            currentClassList.splice(index, 1);
                            classesRemoved = true;
                        }
                    });

                    if(classesRemoved){
                        e.setAttribute("class", currentClassList.join(" "));
                    }
                }
            );
        };

        not$.Not$Object.prototype["on"] = function(evt, handler) {
            this.items.forEach(function(item){
                item.addEventListener(evt, handler);
            });
        }
        

        /** Defines getter/setter logic (getter(), setter(value)) */
        not$.Not$Object.prototype["getOrSet"] = function(args, getter, setter) {
            if(!this.items || this.items.length == 0)
                throw("It isn't a thing");

            if(args.length == 0){ 
                // Getter (no value specified)
                if(!getter) throw "A value must be specified."
                // Operate on first item
                return getter.call(this, this.items[0]);
            }else if(args.length == 1 ){ // setter
                // Setter (value specified)
                // Set value on each captured element
                this.items.forEach(function(item) {
                    setter.call(this, item, args[0]);
                });
                return this;
            } else {
                throw "You did a bad. Specify the things."
            }
        }

        /** Defines getter/setter logic (getter(name), setter(name, value)) */
        not$.Not$Object.prototype["getOrSetWithName"] = function(args, getter, setter) {
            if(!this.items || this.items.length == 0)
                throw("It isn't a thing");

            if(args.length == 0){
                throw("You did a bad. You didn't even specify one thing.");
            } else if (args.length == 1){ 
                // Getter (no value specified)
                if(!getter) throw "A value must be specified."
                // Operate on first item
                return getter.call(this, this.items[0], args[0]);
            }else if(args.length == 2 ){ // setter
                // Setter (value specified)
                // Set value on each captured element
                this.items.forEach(function(item) {
                    setter.call(this, item, args[0], args[1]);
                });
                return this;
            } else {
                throw "You did a bad. Specify the things."
            }
        }

        /** Accepts a function to run when the document is ready */
        not$.Not$Object.prototype["ready"] = function(handler) {
            not$.addReadyHandler(handler);
        }
    


// --------------------------------------------------------------- 
// Hangman game
// --------------------------------------------------------------- 

not$(document).ready(function() {
    var game = {
        /**
         * Initializes the hangman game.
         */
        InitGame: function() {
            // @ts-ignore
            not$(document).on("keydown", this.keyHandler);
            this.preloadImages(this.hangmanImages);

            this.uiPrompt.text(this.prompt_BeforeStart);
            this.updateHealthBar();

            this.initSounds();
        },


        // --------------------- 
        // Game variables
        // ---------------------

            /** @typedef {Object} wordType - creates a new type named 'SpecialType'
             * @property {string} fullWord - The full word as represented in the word list
            * @property {string} displayWord - The word, as it is currently displayed. When this matches fullWord, the player has won.
            */
            /** @type {wordType} */
            currentWord: {
                fullWord: "",
                displayWord: "",
            },
            guessesLeft: 0,
            guessedLetters: "",
            score: 0,
            isWinning: false,
            isLosing: false,
            healthImageUrl: "",

            /** @typedef {Object} themeImage
             *  @property {"player" | "opponent"} target - Which image will be updated
             *  @property {string} source - url of image
             */
            /** @typedef {Object} themeType - creates a new type named 'SpecialType'
             *  @property {themeImage} mainImage - The image to apply to #player-pane element
             *  @property {themeImage} losingImage - Stacks over mainImage - Player is close to losing
             *  @property {themeImage} winningImage - Stacks over mainImage - Player is close to winning
             *  @property {themeImage} winGameImage - Stacks over mainImage/winningImage/losingImage - Player has won
             *  @property {themeImage} loseGameImage - Stacks over mainImage/winningImage/losingImage - Player has lost
             *  @property {string} winSound - Sound associated with winGameClass
             *  @property {string} loseSound - Sound associated with loseGameClass
             *  @property {string} winningSound - Sound associated with winningClass
             *  @property {string} losingSound - Sound associated with losingClass
             *  @property {string} wrongSound - Sound associated with a wrong guess
             *  @property {string[]} wordList - List of theme-specific words available
             *  @property {string} tweak - Cues the game to make minor adjustments for the theme: "meter tweak" = +2 px for health meter
             */
            /** @type {themeType} */ 
            currentTheme: null, 
            themeClassList: [],

        // ---------------------
        // UI
        // ---------------------

            currentGameState: HangmanState.uninitialized,
            uiPlayerPane: not$("#player-pane"),
            uiPlayerAvatar: not$("#img-player"),
            uiOpponentAvatar: not$("#img-opponent"),
            uiHealthBar: not$("#health-bar"),
            uiScoreDisplay: not$("#score-display"),
            uiGuessDisplay: not$("#guess-display"),
            uiWordDisplay: not$("#word-display"),
            uiHangman: not$("#hangman"),
            uiPrompt: not$("#input-prompt"),


        // ---------------------
        // Constants
        // ---------------------

            regexLetterKey: /\b[a-zA-Z]\b/,
            regexMatchAllLetters: new RegExp("[a-zA-Z]","g"),
            heartWidth: 20,
            heartHeight: 20, 

            prompt_BeforeStart: "Press the space bar to play!",
            prompt_GameOver: "You Lost! Hit space to try again!",
            prompt_WinGame: "You Win! Hit space to play again!",
            prompt_Gameplay: "Press a key to make a guess!",

            soundsPath: "assets/sound/",
            imagesPath: "assets/images/",

            /** The number of remaining guesses when the player is considered near losing */
            nearLosingThreshold: 3,
            /** The number of remaining guesses when the player is considered near winning */
            nearWinningThreshold: 2,

        // ---------------------
        // Functions
        // ---------------------

            /** @param {string[]} imageList Array of images to preload
             */
            preloadImages: function(imageList) {
                for (var i = 0; i < imageList.length; i++) {
                    var img = new Image();
                    img.src = imageList[i];
                }
            },

            /** @param {KeyboardEvent} e Event args
             */
            keyHandler: function(e) {
                var key = e.key;
                // Because simple things can't be simple...
                if(key == "Spacebar") key = " "; 
                if(key.toUpperCase().indexOf("MOZ") >= 0) {
                    key = String.fromCharCode(e.keyCode).toLowerCase();
                }

                var isLetterKey = HangmanGame.regexLetterKey.test(key);

                switch(HangmanGame.currentGameState) {
                    case HangmanState.uninitialized:
                        if (key == " ") {
                            HangmanGame.beginGame(key);
                        }
                        break;
                    case HangmanState.playing:
                        if (isLetterKey) {
                            HangmanGame.playLetter(key);
                        }
                        break;
                    case HangmanState.gameOver:
                        if (key == " ") {
                            HangmanGame.beginGame(key);
                        }
                        break;
                }
            },

            beginGame: function(key) {
                this.selectRandomTheme();
                this.selectRandomWord();
                this.guessesLeft = this.hangmanImages.length - 1;
                this.guessedLetters = " ";
                this.updateGuessDisplay();
                this.updateHealthBar();
                this.isWinning = this.isLosing = false;

                this.uiPrompt.text(this.prompt_Gameplay);
                this.sounds.stopAll();

                // If key not specified, don't play a letter
                if((key || "") === "") {
                    this.updateWordDisplay();
                } else {
                    this.playLetter(key);
                }

                this.currentGameState = HangmanState.playing;
            },

            /** Plays the specified letter and updates the game
             * @param {string} letter The letter the player guessed
             */
            playLetter: function(letter) {
                var found = false;
                var displayWord = this.currentWord.displayWord;
                var fullWord = this.currentWord.fullWord;

                // Find any instances of guessed letter
                for(var i = 0; i < fullWord.length; i++) {
                    var isMatch = fullWord.charAt(i).toLowerCase() == letter;
                    if(isMatch) { // Replace "_" at [i] with actual letter
                        displayWord = displayWord.slice(0,i) + letter + displayWord.slice(i+1, displayWord.length);
                        this.currentWord.displayWord = displayWord;
                    }

                    found = found || isMatch;
                }

                // Find total guessed letter count
                var missingLetterCount = 0;
                for (var i = 0; i < this.currentWord.displayWord.length; i++) {
                    if(this.currentWord.displayWord.charAt(i) == "_")
                        missingLetterCount++;
                }
                if(!this.isWinning && missingLetterCount <= this.nearWinningThreshold){
                    this.isWinning = true;
                    //this.applyThemeClass(this.currentTheme.winningClass);
                    this.applyThemeImage(this.currentTheme.winningImage);
                    this.sounds.play(this.currentTheme.winningSound);
                }

                

                if(!found) {
                    var alreadyGuessed = this.guessedLetters.indexOf(letter) >= 0;
                    if(!alreadyGuessed) {
                        this.guessesLeft--;

                        // Health and guesses display
                        this.guessedLetters += " " + letter;
                        this.updateGuessDisplay();
                        this.updateHealthBar();

                        // Is the player close to losing?
                        if(!this.isLosing && this.guessesLeft <= this.nearLosingThreshold){
                            this.isLosing = true;
                            //this.applyThemeClass(this.currentTheme.losingClass);
                            this.applyThemeImage(this.currentTheme.losingImage);
                            this.sounds.play(this.currentTheme.losingSound);
                        } else {
                            this.sounds.play(this.currentTheme.wrongSound, false);
                        }

                        if(this.guessesLeft == 0){
                            this.GameOver();
                        }
                    }
                }

                if(this.currentWord.displayWord.toUpperCase() == this.currentWord.fullWord.toUpperCase()){
                    this.WinGame();
                }

                this.updateWordDisplay();
            },

            updateHealthBar: function() {
                var meterTweak = 0;
                if(this.currentTheme && this.currentTheme.tweak == "meter tweak") meterTweak = 2;
                this.uiHealthBar.attr("style", 
                    "width: " + (this.guessesLeft * this.heartWidth + meterTweak) + "px; " +
                    "height: " + this.heartHeight + "px; " +
                    "background: url(\""+ this.healthImageUrl + "\");"
                );
            },

            updateGuessDisplay: function() {
                this.uiGuessDisplay.text(this.guessedLetters);
            }, 

            updateWordDisplay: function() {
                this.uiWordDisplay.text(this.currentWord.displayWord);
                this.uiHangman.attr("src", this.hangmanImages[this.guessesLeft]);
            },

            updateScoreDisplay: function() {
                this.uiScoreDisplay.text(this.score);
            },

            GameOver: function() {
                this.currentGameState = HangmanState.gameOver;
                this.uiPrompt.text(this.prompt_GameOver);
                //this.applyThemeClass(this.currentTheme.loseGameClass);
                this.applyThemeImage(this.currentTheme.loseGameImage);
                this.sounds.play(this.currentTheme.loseSound);
            },

            WinGame: function() {
                this.currentGameState = HangmanState.gameOver;
                this.score++;
                this.updateScoreDisplay();
                this.uiPrompt.text(this.prompt_WinGame);
                //this.applyThemeClass(this.currentTheme.winGameClass);
                this.applyThemeImage(this.currentTheme.winGameImage);
                this.sounds.play(this.currentTheme.winSound);
            },

            selectRandomWord: function () {
                // 50% chance of using theme-specific word
                var useThemeWord = this.rnd(2) == 0;
                var wordList = useThemeWord ? this.currentTheme.wordList : this.genericWords;
                this.currentWord.fullWord = wordList[this.rnd(wordList.length)];
                this.currentWord.displayWord = this.makeDisplayWord(this.currentWord.fullWord);
            },

            makeDisplayWord: function (word) {
                return word.replace(this.regexMatchAllLetters, "_");
            },

            selectRandomTheme: function () {
                //var cur = this.currentTheme;

                
                // if(cur) {
                //     var classList = cur.mainClass;
                //     // Todo: append any other classes (winningClass, losingClass, etc?)
                //     // Todo: is there an array.join? var classList = [cur.MainClass, cur.winningClass, etc].join(" ")
                //     
                //     this.uiPlayerPane.removeClass(classList);
                // }
                this.removeThemeClasses();
            
                var randomThemeIndex = this.rnd(HangmanGame.themes.length);
                this.currentTheme = this.themes[randomThemeIndex];
                //this.uiPlayerPane.addClass(this.currentTheme.mainClass);
                //this.applyThemeClass(this.currentTheme.mainClass);
                this.applyThemeImage(this.currentTheme.mainImage);
            },

            /**
             *  @param {Array | {target: string, source: string}} img
             */
            applyThemeImage: function(img) {
                var that = this;

                if(img.forEach){
                    // If 'img' is an array, then each element is image info
                    img.forEach(function(i){
                        that.applyThemeImage(i);
                    });
                } else {
                    // If 'img' is an object, then it contains image info directly
                    var source = this.imagesPath + img.source;

                    if(img.target == "player") {
                        this.uiPlayerAvatar.attr("src", source);
                    } else if(img.target == "opponent") {
                        this.uiOpponentAvatar.attr("src", source);
                    } else if(img.target == "health") {
                        this.healthImageUrl = source;
                    }
                }
            },
            applyThemeClass: function(cls) {
                if(!cls) return;

                if(this.themeClassList.indexOf(cls) < 0){
                    this.themeClassList.push(cls);
                    this.uiPlayerPane.addClass(cls);
                    //this.uiPlayerPane[0].src = this.uiPlayerPane[0].src;              
                    var content = window.getComputedStyle(this.uiPlayerAvatar.items[0]).content;
                    this.uiPlayerAvatar.items[0].src = content.substr(5,content.length - 7); //this.uiPlayerAvatar.items[0].src;
                }
            },

            removeThemeClasses: function(){
                var classes = this.themeClassList.join(" ");
                this.uiPlayerPane.removeClass(classes);

                this.themeClassList.length = 0;
            },

            rnd: function (uBound){
                return Math.floor( Math.random() * uBound);
            },



        // ---------------------
        // Assets
        // ---------------------
        
        hangmanImages: [
            "assets/images/hangman-a.gif",
            "assets/images/hangman-b.gif",
            //"assets/images/hangman-c.gif",
            "assets/images/hangman-d.gif",
            //"assets/images/hangman-e.gif",
            "assets/images/hangman-f.gif",
            "assets/images/hangman-g.gif",
            "assets/images/hangman-h.gif",
            "assets/images/hangman-i.gif",
            "assets/images/hangman-j.gif",
            "assets/images/hangman-k.gif",
            "assets/images/hangman-l.gif",
            "assets/images/hangman-m.gif",
            "assets/images/hangman-n.gif",
        ],

        // Todo: make sure checking against letters is case-insensitive
        // Case displayed to user should be based on case in word list, not
        // on the case the user typed
        genericWords: [
            "transistor",
            "cartridge",
            "processor",
            "extra life",
            "controller",
            "chiptune",
            "game over",
            "graphics",
            "power-up",
            "Konami code",
             "continue",
             "password",
             "cheat code",
             "multiplayer",
            // "backstory",
             "high score",
            // "speed run",
        ],

        themes: [
            { // Mario Theme
                 mainImage: [
                     {target: "player", source: "avatarMario.png"},
                     {target: "opponent", source: "avatarBowser.png"},
                     {target: "health", source: "coin.png"}
                    ],
                 winningImage: {target: "player", source: "avatarMario_winning.png"},
                 winningSound: "mario_winning.mp3",
                 losingImage: {target: "player", source: "mario_losing.gif"},
                 losingSound: "mario_losing.mp3",
                 winGameImage: {target: "opponent", source: "Mario win compiled.gif"},
                 winSound: "mario_win.mp3",
                 loseGameImage: {target: "player", source: "mario lose.gif"},
                 loseSound: "mario_lose.mp3",
                 wrongSound: "mario_wrong.mp3",
                 wordList: [
                     "mushroom",
                     "flagpole",
                     "flower",
                     "warp zone",
                     "princess",
                     //"castle",
                 ],
             },

             { // Metroid Theme
                mainImage: [
                    {target: "player", source: "avatarSamus.png"},
                    {target: "opponent", source: "avatarBrain.gif"},
                    {target: "health", source: "tank.png"}
                ],
                winningImage: {target: "player", source: "avatarSamus_winning.png"},
                winningSound: "metroid_winning.mp3",
                losingImage: {target: "opponent", source: "avatarBrain_losing.gif"},
                losingSound: "metroid_losing.mp3",
                winGameImage: {target: "opponent", source: "avatarBrain_win.gif"},
                winSound: "metroid_win.mp3",
                loseGameImage: {target: "player", source: "samus_lose.gif"},
                loseSound: "metroid_lose.mp3",
                wrongSound: "metroid_wrong.mp3",
                wordList: [
                    "missile",
                    "energy tank",
                    "pirate",
                    "secret world",
                    "time bomb",
                    //"castle",
                ],
                tweak: "",
            },

            { // Blaster Master Theme
                mainImage: [
                    {target: "player", source: "avatarTank.png"},
                    {target: "opponent", source: "avatarThing.gif"},
                    {target: "health", source: "meter.png"}
                ],
                winningImage: {target: "player", source: "avatarTank_winning.gif"},
                winningSound: "blast_winning.mp3",
                losingImage: {target: "opponent", source: "avatarThing_losing.gif"},
                losingSound: "blast_losing.mp3",
                winGameImage: {target: "opponent", source: "avatarThing_win.gif"},
                winSound: "blast_win.mp3",
                loseGameImage: {target: "player", source: "avatarTank_die.gif"},
                loseSound: "blast_lose.mp3",
                wrongSound: "blast_wrong.mp3",
                wordList: [
                    "crusher",
                    "plutonium",
                    "ribbit",
                    "underground",
                    "thunder",
                    //"castle",
                ],
                tweak: "meter tweak",
            },
      
            { // Zelda Theme
                mainImage: [
                    {target: "player", source: "avatarLink.png"},
                    {target: "opponent", source: "avatarGanon.png"},
                    {target: "health", source: "heart.png"}
                ],
                winningImage: {target: "player", source: "avatarLink_winning.png"},
                winningSound: "zelda_winning.mp3",
                losingImage: {target: "opponent", source: "avatarGanon_losing.gif"},
                losingSound: "zelda_losing.mp3",
                winGameImage: [
                    {target: "player", source: "avatarLink_winning.gif"},
                    {target: "opponent", source: "avatarGanon_win.png"}
                    ],
                winSound: "zelda_win.mp3",
                loseGameImage: {target: "player", source: "avatarLink_lose.gif"},
                loseSound: "zelda_lose.mp3",
                wrongSound: "zelda_wrong.mp3",
                wordList: [
                    "triforce",
                    "boomrang",
                    "compass",
                    "magic wand",
                    "candle",
                    //"dungeon",
                ],
                tweak: "",
            },
        ],

        initSounds: function() {
            var that = this;

            this.sounds.play = function(name, stopAll){
                if(stopAll !== false) { // don't stop if parameter is omitted
                    that.sounds.stopAll();
                }

                var data = that.sounds[name];
                if(data.name == null) return;

                if(data.sound) {
                    var loaded = !isNaN(data.sound.duration);
                    if(loaded) {
                        data.sound.currentTime = 0;
                        data.sound.play();
                    }
                } else {
                    data.sound = new Audio(data.url);
                    data.sound.play();
                } 
            }

            this.sounds.stopAll = function() {
                that.sounds.forEach(function(snd) {
                    if(snd.sound) {
                        snd.sound.pause();
                    }
                });
            }

            this.themes.forEach(function(t) {
                prepSound(t.winningSound);
                prepSound(t.winSound);
                prepSound(t.wrongSound);
                prepSound(t.losingSound);
                prepSound(t.loseSound);
            });

            function prepSound(path){
                var fullishPath = that.soundsPath + path;
                var soundData = {
                    name: path,
                    url: fullishPath,
                    sound: null,
                };
                that.sounds.push(soundData);
                that.sounds[path] = soundData;
            }
        },
        
        /** @type {{name: string, url: string, sound: HTMLAudioElement}[]} 
         *  @property {function} play - Plays the specified sound
        */
        sounds: [
           
        ],


    };
    

    HangmanGame = game;
    HangmanGame.InitGame();
});
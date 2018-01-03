// @ts-check

    /**
     * Enum. Identifies current state of the game.
     */
    var GameState =  {
        uninitialized: "uninitialized",
        playing: "playing",
        gameOver: "gameOver"
    };

    /** Global object for hangman game */
    var HangmanGame;

// --------------------------------------------------------------- 
// not$ - It's not jQuery. I wrote it myself.
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

    // We track whether or not DOM is already loaded so not$(document).ready can have promise-like behavior
    window.addEventListener("DOMContentLoaded", function() {
        not$.documentReady = true;
    }, false);

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

    /** Constructor. Creates a new not$ object */
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
        // Use getOrSet for the apply-to-all-the-things logic
        return this.getOrSet(arguments, 
            null, // no getter
            function(e, newCls) { // setter
                var classesAdded = false; // Will be set to true if DOM needs to be updated
                var currentClasses = e.getAttribute("class") || "";
                var currentClassList = currentClasses.split(" ");

                // Run the add-a-class logic for each of the spcified classes to be added
                var newClassList = newCls.split(" ");
                newClassList.forEach(function(cls) {
                    if(cls) { // ignore blank strings
                        // Check whether the element already has this class
                        var containsCls = false;
                        currentClassList.forEach(function(classListItem) { 
                            if(classListItem == cls) containsCls = true;
                        });

                        // If not, add it to the list
                        if(!containsCls) {
                            currentClassList.push(cls);
                            classesAdded = true;
                        }
                    }
                });

                // If any classes were added, update the DOM
                if(classesAdded) {
                    e.setAttribute("class", currentClassList.join(" "));
                }
            }
        );
    };

    /** Adds the specified class to element(s) if not already present */
    not$.Not$Object.prototype["removeClass"] = function(a,b) {
        // Use getOrSet for the apply-to-all-the-things logic
        return this.getOrSet(arguments, 
            null, // no getter
            function(e, remCls) { // setter
                var classesRemoved = false; // Will be set to true if DOM needs to be updated
                var currentClasses = e.getAttribute("class") || "";
                var currentClassList = currentClasses.split(" ");

                // Run our remove-a-class logic for each of the specified classes to be removed
                var remClassList = remCls.split(" ");
                remClassList.forEach(function(cls) {
                    if(cls) { // ignore blank strings
                        // If the element contains the class, yank it from the list
                        var index = currentClassList.indexOf(cls);
                        if(index >= 0) {
                            currentClassList.splice(index, 1);
                            classesRemoved = true;
                        }
                    }
                });

                // If any classes were removed, update the DOM
                if(classesRemoved){
                    e.setAttribute("class", currentClassList.join(" "));
                }
            }
        );
    };

    /** Assigns an event handler
     *  @param {string} evt - Event name
     *  @param {Function} handler - Event handler
     */
    not$.Not$Object.prototype["on"] = function(evt, handler) {
        this.items.forEach(function(item){
            item.addEventListener(evt, handler);
        });
    }
    
    /** Defines getter/setter logic (getter(), setter(value)) 
     *  @param {Array} args - arguments passed to the invoked getter/setter function
     *  @param {Function} getter - The function that implements the getter logic
     *  @param {Function} setter - The function that implements the setter logic
    */
    not$.Not$Object.prototype["getOrSet"] = function(args, getter, setter) {
        // Getter accepts 0 arguments, setter accepts 1 (value to be set)
        if (args.length == 0){ 
            // If getter is null, the invoked function only supports a setter, which requires a parameter.
            if(getter == null) {
                throw("Missing parameter.")
            }

            // Can't get a value if there is nothing to get a value from.
            if(!this.items || this.items.length == 0)
            throw("It isn't a thing");

            // Run the getter on the first captured element
            return getter.call(this, this.items[0]);
        } else if(args.length == 1 ){ 
            // Run setter logic on each captured element
            this.items.forEach(function(item) {
                setter.call(this, item, args[0]);
            });
            return this;
        } else {
            // There should not be more than one argument.
            throw "You did a bad. So many things."
        }
    }

    /** Defines getter/setter logic (getter(name), setter(name, value)) */
    not$.Not$Object.prototype["getOrSetWithName"] = function(args, getter, setter) {
        // Getter accepts 1 argument (name of thing to get), setter accepts 2 (name of thing to set, value to be set)
        if (args.length == 0) {
            // We need the name of the thing to get the value of
            throw("You did a bad. You didn't even specify one thing.");
        } else if (args.length == 1){ 
            // If getter is null, the invoked function only supports a setter, which requires a parameter.
            if(getter == null) {
                throw("Missing parameter.")
            }
            
            // Can't get a value if there is nothing to get it from
            if(!this.items || this.items.length == 0)
                throw("It isn't a thing");

            // Get value from first captured element
            return getter.call(this, this.items[0], args[0]);
        } else if(args.length == 2 ){ // setter
            // Set value on each captured element
            this.items.forEach(function(item) {
                setter.call(this, item, args[0], args[1]);
            });
            return this;
        } else {
            // Too many arguments
            throw "You did a bad. So many things."
        }
    }

    /** Accepts a function to run after the document is ready */
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
            *  @property {string} fullWord - The full word as represented in the word list
            *  @property {string} displayWord - The word, as it is currently displayed. When this matches fullWord, the player has won.
            */
            /** @type {wordType} */
            currentWord: {
                fullWord: "",
                displayWord: "",
            },
            guessesLeft: 0,
            guessedLetters: "",
            score: 0,
            /** Set to true when UI has been updated for the 'close-to-winning' state */
            isWinning: false,
            /** Set to true when UI has been updated for the 'close-to-losing' state */
            isLosing: false,
            /** Location of image used for the health bar */
            healthImageUrl: "",

            /** List of words available to be played */
            genericWordPool: [],
            /** List of themes available to be used
             *  @type {themeType[]} */
            themePool: [],

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
             *  @property {string[]} wordPool - List of theme-specific words that have not been used yet
             *  @property {string} tweak - Cues the game to make minor adjustments for the theme: "meter tweak" = +2 px for health meter
             */
            /** Theme currently being displayed
             *  @type {themeType} */ 
            currentTheme: null, 
            /** Contains a list of css classes that have been applied by the current theme, and that will need to be removed when a new theme is used. */
            themeClassList: [],

        // ---------------------
        // UI
        // ---------------------

            currentGameState: GameState.uninitialized,
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

            /** Matches any single letter */
            regexLetterKey: /\b[a-zA-Z]\b/,
            /** Matches every letter in a string */
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

            /** Preload hangman images to reduce flicker
             *  @param {string[]} imageList Array of images to preload
             */
            preloadImages: function(imageList) {
                for (var i = 0; i < imageList.length; i++) {
                    var img = new Image();
                    img.src = imageList[i];
                }
            },

            /** Handles keyboard events
             *  @param {KeyboardEvent} e Event args
             */
            keyHandler: function(e) {
                var key = e.key;
                // IE support
                if(key == "Spacebar") key = " "; 
                // Pale Moon support
                if(key.toUpperCase().indexOf("MOZ") >= 0) {
                    key = String.fromCharCode(e.keyCode).toLowerCase();
                }

                var isLetterKey = HangmanGame.regexLetterKey.test(key);

                switch(HangmanGame.currentGameState) {
                    case GameState.uninitialized:
                        if (key == " ") {
                            HangmanGame.beginGame();
                        }
                        break;
                    case GameState.playing:
                        if (isLetterKey) {
                            HangmanGame.playLetter(key);
                        }
                        break;
                    case GameState.gameOver:
                        if (key == " ") {
                            HangmanGame.beginGame();
                        }
                        break;
                }
            },

            /** Initializes UI and variables for a new round of hangman */
            beginGame: function() {
                this.selectRandomTheme();
                this.selectRandomWord();
                this.guessesLeft = this.hangmanImages.length - 1;
                this.guessedLetters = " ";
                this.updateGuessDisplay();
                this.updateHealthBar();
                this.isWinning = this.isLosing = false;

                this.uiPrompt.text(this.prompt_Gameplay);
                this.sounds.stopAll(); // SHHH!

                this.updateWordDisplay();
                this.currentGameState = GameState.playing;
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
                // Update UI for 'close-to-winning' if applicable
                if(!this.isWinning && missingLetterCount <= this.nearWinningThreshold){
                    this.isWinning = true;
                    this.applyThemeImage(this.currentTheme.winningImage);
                    this.sounds.play(this.currentTheme.winningSound);
                }

                if(!found) { // Guessed letter was not found...
                    // Don't ding player if he's already guessed this letter
                    var alreadyGuessed = this.guessedLetters.indexOf(letter) >= 0;
                    if(!alreadyGuessed) {
                        this.guessesLeft--;

                        // Health and guesses display
                        this.guessedLetters += " " + letter;
                        this.updateGuessDisplay();
                        this.updateHealthBar();

                        // Update UI for 'close-to-losing' if applicable
                        if(!this.isLosing && this.guessesLeft <= this.nearLosingThreshold){
                            this.isLosing = true;
                            this.applyThemeImage(this.currentTheme.losingImage);
                            this.sounds.play(this.currentTheme.losingSound);
                        } else {
                            // Otherwise play the normal 'wrong guess' sound
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

            /** Updates the size of the healthbar to reflect number of chances left */
            updateHealthBar: function() {
                // Blaster Master theme needs an extra two pixels 
                var meterTweak = 0;
                if(this.currentTheme && this.currentTheme.tweak == "meter tweak") meterTweak = 2;

                this.uiHealthBar.attr("style", 
                    "width: " + (this.guessesLeft * this.heartWidth + meterTweak) + "px; " +
                    "height: " + this.heartHeight + "px; " +
                    "background: url(\""+ this.healthImageUrl + "\");"
                );
            },

            /** Updates the list of guessed letters */
            updateGuessDisplay: function() {
                this.uiGuessDisplay.text(this.guessedLetters);
            }, 

            /** Updates the displayed word */
            updateWordDisplay: function() {
                this.uiWordDisplay.text(this.currentWord.displayWord);
                this.uiHangman.attr("src", this.hangmanImages[this.guessesLeft]);
            },

            /** Updates the score display */
            updateScoreDisplay: function() {
                this.uiScoreDisplay.text(this.score);
            },

            /** Updates UI for the game over state */
            GameOver: function() {
                this.currentGameState = GameState.gameOver;
                this.uiPrompt.text(this.prompt_GameOver);
                //this.applyThemeClass(this.currentTheme.loseGameClass);
                this.applyThemeImage(this.currentTheme.loseGameImage);
                this.sounds.play(this.currentTheme.loseSound);
            },

            /** Updates UI for the win game state */
            WinGame: function() {
                this.currentGameState = GameState.gameOver;
                this.score++;
                this.updateScoreDisplay();
                this.uiPrompt.text(this.prompt_WinGame);
                //this.applyThemeClass(this.currentTheme.winGameClass);
                this.applyThemeImage(this.currentTheme.winGameImage);
                this.sounds.play(this.currentTheme.winSound);
            },

            /** Assigns a randomly selected word to this.currentWord */
            selectRandomWord: function () {
                // 50% chance of using theme-specific word
                var useThemeWord = this.rnd(2) == 0;
                var wordList = useThemeWord ? this.currentTheme.wordList : this.genericWords;
                var wordPool = useThemeWord ? this.currentTheme.wordPool : this.genericWordPool;

                this.currentWord.fullWord = this.pullFromPool(wordPool, wordList);
                this.currentWord.displayWord = this.makeDisplayWord(this.currentWord.fullWord);
            },

            /** Substitutes underscores for and letters in the specified string */
            makeDisplayWord: function (word) {
                return word.replace(this.regexMatchAllLetters, "_");
            },

            /** Utility function that selects an item from the specified pool array, removes it from the array, and returns it. If the pool array is empty, it is repopulated by the source array and shuffled. 
             *  @param {Array} poolArray - The list of items to choose from
             *  @param {Array} sourceArray - The original complete list of items, used to refill the pool when necessary
            */
            pullFromPool: function (poolArray, sourceArray) {
                // Need to re-fill pool when it's empty
                if(poolArray.length == 0) {
                    // Add contents of the original list to the pool
                    sourceArray.forEach(function(i){
                        poolArray.push(i);
                    });

                    // Randomize (from last to first element, select and place a random item that has not been placed yet)
                    for (var i = poolArray.length - 1; i > 0; i--) {
                        var swapIndex = this.rnd(i - 1);
                        var temp = poolArray[swapIndex];
                        poolArray[swapIndex] = poolArray[i];
                        poolArray[i] = temp;
                    }
                }

                // Select a random item, remove it from pool and return it
                var randIndex = this.rnd(poolArray.length);
                var result = poolArray[randIndex];
                poolArray.splice(randIndex, 1);
                return result;
            },

            /** Selects a random theme and applies its initial styles to the UI. */
            selectRandomTheme: function () {
                this.currentTheme = this.pullFromPool(this.themePool, this.themes);

                this.removeThemeClasses();
                this.applyThemeImage(this.currentTheme.mainImage);
            },

            /** Applies the spicified image information to the UI
             *  @param {Array | {target: string, source: string}} img - Image info object or an array of image info objects. Each image info specifies the target name, and the source URL relative to the image path.
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
            /** (obsolete) Applies the specified class to the player pane element. The class will be removed
             *  when the theme is changed.
             *  @param {string} cls - Class to be applied
             */
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

            /** (obsolete) Removes all classes that have been applied via applyThemeClass. */
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
        
        /** The list of images to be displayed in sequence for each incorrect guess */
        // Some frames have been omitted to get a specific number of guesses that is suited to the
        // used word list
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

        /** A list of theme independant words that can be used for the game. */
        genericWords: [
            "split-screen",
            "cartridge",
            "processor",
            "extra life",
            "controller",
            "chiptune",
            "game over",
            "title screen",
            "power-up",
            "Konami code",
            "continue",
            "password",
            "cheat code",
            "multiplayer",
            "backstory",
            "high score",
            "speed run",
            "platformer",
            "adventure",
            "role playing game",
            "sound test",
            "famicom",
            "disk system",
            "circuit board",
            "bonus game",
            "side scroller",
            "gameplay",
            "level boss",
            "console",
            "emulator",
            "single player",
            "directional pad",
            "bad dude",
            "experience",
            "rail shooter",
            "hitbox",
            "invincibility",
            "joystick",
            "metroidvania",
            "save point",
        ],

        /** A collection of themeType objects defining a number of themes (character sets with associated images and sounds) for the game. */
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
                     "fire ball",
                     "toadstool",
                     "castle",
                     "question mark",
                     "piranha plant",
                 ],
                 wordPool: [],
                 tweak: "",
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
                    "space pirate",
                    "secret world",
                    "time bomb",
                    "elevator",
                    "mother brain",
                    "federation",
                    "parasite",
                    "dragon"
                ],
                wordPool: [],
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
                loseGameImage: {target: "player", source: "avatarTank_Die.gif"},
                loseSound: "blast_lose.mp3",
                wrongSound: "blast_wrong.mp3",
                wordList: [
                    "crusher",
                    "plutonium",
                    "ribbit",
                    "underground",
                    "thunder strike",  
                    "homing missile",
                    "jelly fish",
                    "lobster",
                    "radioactive",
                    "epsilon",
                ],
                wordPool: [],
                tweak: "meter tweak",
            },
      
            { // Zelda Theme
                mainImage: [
                    {target: "player", source: "avatarLink.png"},
                    {target: "opponent", source: "avatarGanon.png"},
                    {target: "health", source: "heart.png"}
                ],
                winningImage: {target: "player", source: "avatarLink_winning.png"},
                winningSound: "zelda__winning.mp3",
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
                    "boomerang",
                    "compass",
                    "magic wand",
                    "candle",
                    "dungeon",
                    "spectacle",
                    "bracelet",
                    "bubble",
                    "magic sword",
                ],
                wordPool: [],
                tweak: "",
            },
        ],

        /** Initializes objects of the items in this.sounds[] */
        initSounds: function() {
            var that = this;

            // First we're gonna set us up the functions. This is probably an ugly way to add functions
            // to a namespace, but I've already written it and need to finish this tonight.

            /** Plays the specified sound
             *  @param {string} name - The filename of the sound to play.
             *  @param {boolean} stopAll - If true, all currently playing sounds will be stopped.
             */
            this.sounds.play = function(name, stopAll){
                if(stopAll !== false) { // don't stop if parameter is omitted
                    that.sounds.stopAll();
                }

                // A theme may specify null for a sound it chooses not to provide
                var data = that.sounds[name];
                if(data.name == null) return;

                // The sound property is a lazy-initialized HTMLAudioElement. We load it here if necessary.
                if(data.sound) {
                    // If for any reason the browser can't load or play the sound, we'll just skip it
                    var loaded = !isNaN(data.sound.duration);
                    if(loaded) {
                        data.sound.currentTime = 0;
                        data.sound.play();
                    }
                } else {
                    // Create the new HTMLAudioElement
                    data.sound = new Audio(data.url);
                    data.sound.play();
                } 
            }

            /** Stops all currently playing sounds */
            this.sounds.stopAll = function() {
                that.sounds.forEach(function(snd) {
                    if(snd.sound) {
                        snd.sound.pause();
                    }
                });
            }

            // For each theme, take each sound and create an object to represend it in this.sounds
            this.themes.forEach(function(t) {
                prepSound(t.winningSound);
                prepSound(t.winSound);
                prepSound(t.wrongSound);
                prepSound(t.losingSound);
                prepSound(t.loseSound);
            });

            /** Catalogs the specified sound. */
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
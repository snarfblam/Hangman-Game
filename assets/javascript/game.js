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
    * @prop {Function} addClass - Adds the specified class to the captured elements if they don't already have it
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
            function(e, cls) {
                var classes = e.getAttribute("class") || "";
                var classList = classes.split(" ");
                var containsCls = false;
                classList.forEach(function(classListItem) { 
                    if(classListItem == cls) containsCls = true;
                });

                if(!containsCls) {
                    classList.push(cls);
                    e.setAttribute("class", classList.join(" "));
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

        // Constants
        heartWidth: 20,
        heartHeight: 20, 

        /** @typedef {Object} themeType - creates a new type named 'SpecialType'
         *  @property {string} mainClass - The class to apply to #player-pane element
         *  @property {string[]} wordList - List of theme-specific words available
         */
        /** @type {themeType} */ 
        currentTheme: null, 


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


        regexLetterKey: /\b[a-zA-Z]\b/,
        regexMatchAllLetters: new RegExp("[a-zA-Z]","g"),

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
            var isLetterKey = HangmanGame.regexLetterKey.test(e.key);

            // Don't handle any non-letter keys
            if(!isLetterKey) return;

            switch(HangmanGame.currentGameState) {
                case HangmanState.uninitialized:
                    HangmanGame.beginGame(key);
                    break;
                case HangmanState.playing:
                    HangmanGame.playLetter(key);
                    break;
                case HangmanState.gameOver:
                    HangmanGame.beginGame(key);
                    break;
            }
        },

        beginGame: function(key) {
            this.selectRandomTheme();
            this.selectRandomWord();
            this.guessesLeft = this.hangmanImages.length;

            // If key not specified, don't play a letter
            if(key || "" === "") {
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

            if(!found) {
                var alreadyGuessed = this.guessedLetters.indexOf(letter) >= 0;
                if(!alreadyGuessed) {
                    this.guessesLeft--;

                    this.guessedLetters += " " + letter;
                    this.updateGuessDisplay();
                    this.updateHealthBar();

                    if(this.guessesLeft == 0){
                        this.GameOver();
                    }
                }
            }

            this.updateWordDisplay();
        },

        updateHealthBar: function() {
            this.uiHealthBar.attr("style", 
                "width: " + this.guessesLeft * this.heartWidth + "px; " +
                "height: " + this.heartHeight + "px;");
        },

        updateGuessDisplay(){
            this.uiGuessDisplay.text(this.guessedLetters);
        }, 

        updateWordDisplay(){
            this.uiWordDisplay.text(this.currentWord.displayWord);
        },

        GameOver: function(){

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
            var cur = this.currentTheme;

            
            if(cur) {
                var classList = cur.mainClass;
                // Todo: append any other classes (winningClass, losingClass, etc?)
                // Todo: is there an array.join? var classList = [cur.MainClass, cur.winningClass, etc].join(" ")

                this.uiPlayerPane.removeClass(classList);
            }

          
            var randomThemeIndex = this.rnd(HangmanGame.themes.length);
            this.currentTheme = this.themes[randomThemeIndex];
            this.uiPlayerPane.addClass(this.currentTheme.mainClass);
        },

        rnd: function (uBound){
            return Math.floor( Math.random() * uBound);
        },

        guessedLetters: "",


        // ---------------------
        // Assets
        // ---------------------
        
        hangmanImages: [
            "assets/images/hangman-m.gif",
            "assets/images/hangman-l.gif",
            "assets/images/hangman-k.gif",
            "assets/images/hangman-j.gif",
            "assets/images/hangman-i.gif",
            "assets/images/hangman-h.gif",
            "assets/images/hangman-g.gif",
            "assets/images/hangman-f.gif",
            "assets/images/hangman-e.gif",
            "assets/images/hangman-d.gif",
            "assets/images/hangman-c.gif",
            "assets/images/hangman-b.gif",
            "assets/images/hangman-a.gif",
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
            // "continue",
            // "password",

        ],

        themes: [
            { // Mario Theme
                mainClass: "theme-mario",
                wordList: [
                    "mushroom",
                    "flagpole",
                    "flower",
                    "warp zone",
                    "princess",
                ],
            },
            { // Zelda Theme
                mainClass: "theme-zelda",
                wordList: [
                    "triforce",
                    "boomrang",
                    "compass",
                    "magic wand",
                    "candle",
                ],
            },
        ],
    };

    HangmanGame = game;
    HangmanGame.InitGame();
});
// @ts-check
$(document).ready(function() {
    var HangmanGame = {
        /**
         * Initializes the hangman game.
         */
        InitGame: function() {
            
        },
    
        uiPlayerAvatar: $("#img-player"),
        uiOpponentAvatar: $("#img-opponent"),
        uiHealthBar: $("#health-bar"),
        uiScoreDisplay: $("#score-display"),
        uiGuessDisplay: $("#guess-display"),
        uiWordDisplay: $("#word-display")
    
    };

    HangmanGame.InitGame();
});
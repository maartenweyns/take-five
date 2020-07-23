const Game = require('../game');

var game;

describe('General Functionality Tests', () => {
    beforeEach(() => {
        game = new Game('someID');
    });

    test('Get Available Card Test', () => {
        let card = game.takeAvailableCard();

        expect(1 <= card <= 104).toBeTruthy();
        expect(game.availableCards.includes(card)).toBeFalsy();
    });

    test('Remove Card From Available', () => {
        let card = 102;

        // Removing the card the first time should work
        expect(game.removeCardFromAvailable(card)).toBeTruthy();
        // The second time tho, it's already removed so it should not work anymore
        expect(game.removeCardFromAvailable(card)).toBeFalsy();
    });
});
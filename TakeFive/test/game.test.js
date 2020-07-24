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

    test("Add player test", () => {
        let expected = {id: 0};
        let result = game.addPlayer('Timmy');

        expect(result).toEqual(expected);
        expect(game.getPlayers().length).toBe(1);
    });

    test("Add player test full", () => {
        // Add 10 players to the game and verify that they are added
        for (let i = 0; i < 10; i++) {
            expect(game.addPlayer('Timmy')).not.toBeFalsy();
        }
        expect(game.addPlayer('Timmy')).toBeFalsy();        
    });
});

describe('Game With Players Test', () => {
    beforeEach(() => {
        game = new Game('someID');
        game.addPlayer('Timmy');
    });
})
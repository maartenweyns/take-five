const Player = require("../player");

describe("General Functions Tests", () => {
    var player;

    beforeEach(() => {
        player = new Player("Timmy", 0);
    });

    test('Initial Values Checking', () => {
        let expectedScore = 66;
        let expectedName = "Timmy";
        let expectedID = 0;

        expect(player.getScore()).toBe(expectedScore);
        expect(player.getName()).toBe(expectedName);
        expect(player.id).toBe(expectedID);
        expect(player.isOnline()).toBeTruthy();
        expect(player.isReady()).toBeFalsy();
    });

    test('Decrement Score Test', () => {
        let expectedScore = 63;

        player.decrementScore(3);

        expect(player.getScore()).toBe(expectedScore);
    });

    test('Set Cards Test', () => {
        let expectedCards = [1,2,10,20,24,100];

        player.setCards([1,10,100,2,24,20]);

        expect(player.getCards()).toEqual(expectedCards);
    });

    test('Is Ready Test', () => {
        // Make Player ready
        player.setReady(true);
        expect(player.isReady()).toBeTruthy();

        // Make Player not ready
        player.setReady(false);
        expect(player.isReady()).toBeFalsy();
    });
});
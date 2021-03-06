const Game = require('../game');

var game;

describe('General Functionality Tests', () => {
    beforeEach(() => {
        game = new Game('someID');
    });

    test('Get GameID Test', () => {
        let id = 'someID';
        expect(game.getID()).toEqual(id);
    });

    test('Get Available Card Test', () => {
        let array = game.availableCards;
        expect(array.length).toEqual(104);

        let card = array.pop();
        let card1 = array.pop();
        expect(card).toBeGreaterThan(0);
        expect(card).toBeLessThan(105);
        expect(card1).toBeGreaterThan(0);
        expect(card1).toBeLessThan(105);

        game.nextRound();

        let array1 = game.availableCards;
        expect(array1.length).toEqual(100);
    });

    test('Game State not Started Test', () => {
        expect(game.getStatus()).toEqual('lobby');
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

    test('Calculate Penalty Points Test', () => {
        /**
         * This row should be 18 points
         * 2 = 1 point
         * 5 = 2 points
         * 10 = 3 points
         * 33 = 5 point
         * 55 = 7 points
         */
        let row0 = [2, 5, 10,33,55];

        expect(game.calculatePenalty(row0)).toEqual(18);
    });
});

describe('Game With Players Test', () => {
    beforeEach(() => {
        game = new Game('someID');
        game.addPlayer('Timmy');
    });

    test('Give Players Cards Test', () => {
        game.givePlayersCards();

        expect(game.getPlayers()[0].getCards().length).toBe(10);
    });

    test('All Players Ready Test False', () => {
        expect(game.allPlayersReady()).toBeFalsy();
    });

    test('Set Player Ready Test', () => {
        // Make player 0 ready
        game.setPlayerReady(0,true);
        // Verify that all players in the game are ready
        expect(game.allPlayersReady()).toBeTruthy();
    });
});

describe('Game Started Test', () => {
    beforeEach(() => {
        game = new Game('someID');
        game.addPlayer('Timmy');
        game.startGame();
    });

    test('Game State Started Test', () => {
        expect(game.getStatus()).toEqual('ongoing');
    });

    // test('Get minimum of first cards test', () => {
    //     let returned = game.getSmallestRowBeginning();
    //     let firstCards = [game.row0[0], game.row1[0], game.row2[0], game.row3[0]];

    //     for(let number of firstCards) {
    //         expect(returned <= number).toBeTruthy();
    //     }
    // });

    test('Place Card on Row Test', () => {
        // Set the rows of the games to known cards
        game.row0 = [12];
        game.row1 = [24];
        game.row2 = [36];
        game.row3 = [85];

        // Place card 23 on the correct row (0)
        game.placeCardOnRow(23);
        // Place card 35 on the correct row (1)
        game.placeCardOnRow(35);

        expect(game.row0).toEqual([12, 23]);
        expect(game.row1).toEqual([24, 35]);
        expect(game.row2).toEqual([36]);
        expect(game.row3).toEqual([85]);
    });

    test('Add Card to Row Test', () => {
        // Set the rows of the games to known cards
        game.row0 = [12];
        game.row1 = [24];
        game.row2 = [36];
        game.row3 = [85];

        // Try a nonexisting row
        expect(game.addCardToRow(23, 5)).toBeFalsy();

        // Try an existing row
        expect(game.addCardToRow(23, 3)).toBeTruthy();
        expect(game.row3).toEqual([85, 23]);
    });
});
// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.26;

import {Blackjack} from "../src/BlackJack.sol";
import {Test} from "forge-std/Test.sol";

contract BlackJackTest is Test {
    Blackjack private blackjack;
    address player1 = address(1);
    address player2 = address(2);

    function setUp() public {
        blackjack = new Blackjack();
        vm.deal(player1, 10 ether);
        vm.deal(player2, 10 ether);
    }

    function testInitialState() public {
        Blackjack.Game memory game = blackjack.currentGame();
        assertEq(game.players.length, 0);
        assertEq(game.dealerHand.length, 0);
        assertFalse(game.isActive);
    }

    function testJoinGame() public {
        vm.prank(player1);
        blackjack.joinGame{value: 0.1 ether}();

        Blackjack.Game memory game = blackjack.currentGame();
        assertEq(game.players.length, 1);
        assertTrue(game.isActive);
        assertEq(game.players[0].addr, player1);
        assertEq(game.players[0].bet, 0.1 ether);
    }

    function testDealCards() public {
        vm.prank(player1);
        blackjack.joinGame{value: 0.1 ether}();

        vm.prank(player2);
        blackjack.joinGame{value: 0.1 ether}();

        blackjack.startDealing();

        Blackjack.Game memory game = blackjack.currentGame();
        assertEq(game.players[0].hand.length, 2);
        assertEq(game.players[1].hand.length, 2);
        assertEq(game.dealerHand.length, 1);
    }

    function testPlayerHit() public {
        vm.prank(player1);
        blackjack.joinGame{value: 0.1 ether}();

        blackjack.startDealing();

        vm.prank(player1);
        blackjack.hit();

        Blackjack.Game memory game = blackjack.currentGame();
        assertEq(game.players[0].hand.length, 3);
    }

    function testPlayerStand() public {
        vm.prank(player1);
        blackjack.joinGame{value: 0.1 ether}();

        blackjack.startDealing();

        vm.prank(player1);
        blackjack.stand();

        Blackjack.Game memory game = blackjack.currentGame();
        assertTrue(game.players[0].isStanding);
    }

    function testBust() public {
        vm.prank(player1);
        blackjack.joinGame{value: 0.1 ether}();

        blackjack.startDealing();

        // Force player to bust by hitting multiple times
        for (uint i = 0; i < 5; i++) {
            vm.prank(player1);
            try blackjack.hit() {} catch {
                break;
            }
        }

        Blackjack.Game memory game = blackjack.currentGame();
        assertTrue(game.players[0].hasBusted);
    }

    function testGameOutcome() public {
        vm.prank(player1);
        blackjack.joinGame{value: 0.1 ether}();

        blackjack.startDealing();

        vm.prank(player1);
        blackjack.stand();

        // Game should end after all players have acted
        Blackjack.Game memory game = blackjack.currentGame();
        assertFalse(game.isActive);
    }

    function testForceStand() public {
        vm.prank(player1);
        blackjack.joinGame{value: 0.1 ether}();

        blackjack.startDealing();

        // Wait for the timeout period
        vm.warp(block.timestamp + 6 minutes);

        blackjack.forceStand(0);

        Blackjack.Game memory game = blackjack.currentGame();
        assertTrue(game.players[0].isStanding);
    }

    function testMaxPlayers() public {
        for (uint i = 1; i <= 6; i++) {
            vm.prank(address(uint160(i)));
            blackjack.joinGame{value: 0.1 ether}();
        }

        vm.prank(address(7));
        vm.expectRevert(Blackjack.MaxPlayersReached.selector);
        blackjack.joinGame{value: 0.1 ether}();
    }

    function testDetermineWinners() public {
        address player1 = address(1);
        address player2 = address(2);
        address player3 = address(3);

        vm.deal(player1, 1 ether);
        vm.deal(player2, 1 ether);
        vm.deal(player3, 1 ether);

        // Scenario 1: Player 1 wins, Player 2 loses, Player 3 ties with dealer
        vm.prank(player1);
        blackjack.joinGame{value: 0.1 ether}();
        vm.prank(player2);
        blackjack.joinGame{value: 0.1 ether}();
        vm.prank(player3);
        blackjack.joinGame{value: 0.1 ether}();

        blackjack.startDealing();

        // Manipulate hands for testing
        Blackjack.Game storage game = blackjack.currentGame();
        game.players[0].hand = [10, 11]; // Player 1: Blackjack
        game.players[1].hand = [10, 6]; // Player 2: 16
        game.players[2].hand = [10, 7]; // Player 3: 17
        game.dealerHand = [10, 7]; // Dealer: 17

        // Simulate players standing
        vm.prank(player1);
        blackjack.stand();
        vm.prank(player2);
        blackjack.stand();
        vm.prank(player3);
        blackjack.stand();

        // Check winners
        (address[] memory winners, uint256[] memory winnings) = blackjack.getWinners();

        assertEq(winners.length, 1);
        assertEq(winners[0], player1);
        assertEq(winnings[0], 0.2 ether);

        // Check player balances
        assertEq(player1.balance, 1.1 ether);
        assertEq(player2.balance, 0.9 ether);
        assertEq(player3.balance, 1 ether);

        // Reset game for next scenario
        blackjack.resetGameForTesting();

        // Scenario 2: All players bust, dealer wins
        vm.prank(player1);
        blackjack.joinGame{value: 0.1 ether}();
        vm.prank(player2);
        blackjack.joinGame{value: 0.1 ether}();

        blackjack.startDealing();

        // Manipulate hands for testing
        game = blackjack.currentGame();
        game.players[0].hand = [10, 10, 5]; // Player 1: Bust (25)
        game.players[1].hand = [9, 8, 7]; // Player 2: Bust (24)
        game.dealerHand = [10, 6]; // Dealer: 16

        // Simulate players busting
        vm.prank(player1);
        blackjack.hit();
        vm.prank(player2);
        blackjack.hit();

        // Check winners (should be empty as dealer wins by default)
        (winners, winnings) = blackjack.getWinners();

        assertEq(winners.length, 0);

        // Check player balances
        assertEq(player1.balance, 1 ether);
        assertEq(player2.balance, 0.9 ether);
    }
}

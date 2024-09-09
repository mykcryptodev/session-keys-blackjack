// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.26;

import {Blackjack} from "../src/BlackJack.sol";
import {Test} from "forge-std/Test.sol";

contract BlackJackTest is Test {
    Blackjack private blackjack;
    address public player1 = address(1);
    address public player2 = address(2);
    address public player3 = address(3);

    function setUp() public {
        blackjack = new Blackjack();
        vm.deal(player1, 10 ether);
        vm.deal(player2, 10 ether);
        vm.deal(player3, 10 ether);
        // Fund the contract with Ether
        vm.deal(address(blackjack), 10 ether);
    }

    function testInitialState() public view {
        (
            address[] memory playerAddresses,
            uint256[] memory playerBets,
            uint8[][] memory playerHands,
            bool[] memory playerIsStanding,
            bool[] memory playerHasBusted,
            uint8[] memory dealerHand,
            uint256 lastActionTimestamp,
            bool isActive,
            uint8 currentPlayerIndex
        ) = blackjack.getGameState();

        assertEq(playerAddresses.length, 0);
        assertEq(playerBets.length, 0);
        assertEq(playerHands.length, 0);
        assertEq(playerIsStanding.length, 0);
        assertEq(playerHasBusted.length, 0);
        assertEq(dealerHand.length, 0);
        assertEq(lastActionTimestamp, 0);
        assertFalse(isActive);
        assertEq(currentPlayerIndex, 0);
    }

    function testJoinGame() public {
        vm.prank(player1);
        blackjack.joinGame{value: 0.1 ether}();

        (address[] memory playerAddresses, uint256[] memory playerBets, , , , , , bool isActive, ) = blackjack
            .getGameState();

        assertEq(playerAddresses.length, 1);
        assertTrue(isActive);
        assertEq(playerAddresses[0], player1);
        assertEq(playerBets[0], 0.1 ether);
    }

    function testDealCards() public {
        vm.prank(player1);
        blackjack.joinGame{value: 0.1 ether}();

        vm.prank(player2);
        blackjack.joinGame{value: 0.1 ether}();

        blackjack.startDealing();

        (, , uint8[][] memory playerHands, , , uint8[] memory dealerHand, , , ) = blackjack.getGameState();

        assertEq(playerHands[0].length, 2);
        assertEq(playerHands[1].length, 2);
        assertEq(dealerHand.length, 1);
    }

    function testPlayerHit() public {
        vm.prank(player1);
        blackjack.joinGame{value: 0.1 ether}();

        blackjack.startDealing();

        vm.prank(player1);
        blackjack.hit();

        (, , uint8[][] memory playerHands, , , , , , ) = blackjack.getGameState();
        assertEq(playerHands[0].length, 3);
    }

    function testPlayerStand() public {
        vm.prank(player1);
        blackjack.joinGame{value: 0.1 ether}();

        blackjack.startDealing();

        vm.prank(player1);
        blackjack.stand();

        (, , , bool[] memory playerIsStanding, , , , , ) = blackjack.getGameState();
        assertTrue(playerIsStanding[0]);
    }

    function testBust() public {
        vm.prank(player1);
        blackjack.joinGame{value: 0.1 ether}();

        blackjack.startDealing();

        // Force player to bust by hitting multiple times
        while (true) {
            vm.prank(player1);
            try blackjack.hit() {
                (, , uint8[][] memory playerHands, , , , , , ) = blackjack.getGameState();
                uint8[] memory playerHand = playerHands[0];
                uint8 handValue = 0;
                for (uint i = 0; i < playerHand.length; i++) {
                    handValue += playerHand[i];
                }
                if (handValue > 21) {
                    break;
                }
            } catch {
                break;
            }
        }

        (, , , , bool[] memory playerHasBusted, , , , ) = blackjack.getGameState();
        assertTrue(playerHasBusted[0]);
    }

    function testGameOutcome() public {
        vm.prank(player1);
        blackjack.joinGame{value: 0.1 ether}();

        blackjack.startDealing();

        vm.prank(player1);
        blackjack.stand();

        // Call playDealerAndSettleGame after all players have acted
        blackjack.playDealerAndSettleGame();

        // Game should end after dealer plays and game is settled
        (, , , , , , , bool isActive, ) = blackjack.getGameState();
        assertFalse(isActive);
    }

    function testForceStand() public {
        vm.prank(player1);
        blackjack.joinGame{value: 0.1 ether}();

        blackjack.startDealing();

        // Wait for the timeout period
        vm.warp(block.timestamp + 6 minutes);

        blackjack.forceStand(0);

        (, , , , bool[] memory playerIsStanding, , , , ) = blackjack.getGameState();
        assertTrue(playerIsStanding[0]);
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

        // Manipulate hands using vm.store
        bytes32 slot = keccak256(abi.encode(uint256(2), uint256(3))); // slot for playerHands
        vm.store(address(blackjack), slot, bytes32(uint256(2))); // Set length to 2
        vm.store(address(blackjack), keccak256(abi.encode(slot, uint256(0))), bytes32(uint256(10))); // player1 card 1
        vm.store(address(blackjack), keccak256(abi.encode(slot, uint256(1))), bytes32(uint256(7))); // player1 card 2

        slot = keccak256(abi.encode(uint256(2), uint256(4))); // slot for dealerHand
        vm.store(address(blackjack), slot, bytes32(uint256(2))); // Set length to 2
        vm.store(address(blackjack), keccak256(abi.encode(slot, uint256(0))), bytes32(uint256(10))); // dealer card 1
        vm.store(address(blackjack), keccak256(abi.encode(slot, uint256(1))), bytes32(uint256(7))); // dealer card 2

        // Simulate players standing
        vm.prank(player1);
        blackjack.stand();
        vm.prank(player2);
        blackjack.stand();
        vm.prank(player3);
        blackjack.stand();

        // call playDealer
        blackjack.playDealer();

        // Manipulate dealer's hand to have a specific value
        bytes32 dealerSlot = keccak256(abi.encode(uint256(2), uint256(4))); // slot for dealerHand
        vm.store(address(blackjack), dealerSlot, bytes32(uint256(2))); // Set length to 2
        vm.store(address(blackjack), keccak256(abi.encode(dealerSlot, uint256(0))), bytes32(uint256(10))); // dealer card 1
        vm.store(address(blackjack), keccak256(abi.encode(dealerSlot, uint256(1))), bytes32(uint256(7))); // dealer card 2

        // Set that the dealer has played
        bytes32 dealerPlayedSlot = keccak256(abi.encode(uint256(7))); // slot for dealerPlayed
        vm.store(address(blackjack), dealerPlayedSlot, bytes32(uint256(1))); // Set to true

        // call settleGame game
        blackjack.settleGame();

        // Check winners
        (address[] memory winners, uint256[] memory winnings) = blackjack.getWinners();

        assertEq(winners.length, 1);
        assertEq(winners[0], player1);
        assertEq(winnings[0], 0.2 ether);

        // Check player balances
        assertEq(player1.balance, 1.1 ether);
        assertEq(player2.balance, 0.9 ether);
        assertEq(player3.balance, 1 ether);

        // Reset game state using vm.store
        slot = keccak256(abi.encode(uint256(0))); // slot for playerAddresses
        vm.store(address(blackjack), slot, bytes32(uint256(0))); // Set length to 0
        slot = keccak256(abi.encode(uint256(1))); // slot for playerBets
        vm.store(address(blackjack), slot, bytes32(uint256(0))); // Set length to 0
        slot = keccak256(abi.encode(uint256(2))); // slot for playerHands
        vm.store(address(blackjack), slot, bytes32(uint256(0))); // Set length to 0
        slot = keccak256(abi.encode(uint256(3))); // slot for playerIsStanding
        vm.store(address(blackjack), slot, bytes32(uint256(0))); // Set length to 0
        slot = keccak256(abi.encode(uint256(4))); // slot for playerHasBusted
        vm.store(address(blackjack), slot, bytes32(uint256(0))); // Set length to 0
        slot = keccak256(abi.encode(uint256(5))); // slot for dealerHand
        vm.store(address(blackjack), slot, bytes32(uint256(0))); // Set length to 0
        slot = keccak256(abi.encode(uint256(6))); // slot for lastActionTimestamp
        vm.store(address(blackjack), slot, bytes32(uint256(0))); // Set to 0
        slot = keccak256(abi.encode(uint256(7))); // slot for isActive
        vm.store(address(blackjack), slot, bytes32(uint256(0))); // Set to false
        slot = keccak256(abi.encode(uint256(8))); // slot for currentPlayerIndex
        vm.store(address(blackjack), slot, bytes32(uint256(0))); // Set to 0

        // Scenario 2: All players bust, dealer wins
        vm.prank(player1);
        blackjack.joinGame{value: 0.1 ether}();
        vm.prank(player2);
        blackjack.joinGame{value: 0.1 ether}();

        blackjack.startDealing();

        // Manipulate hands using vm.store
        slot = keccak256(abi.encode(uint256(2), uint256(3))); // slot for playerHands
        vm.store(address(blackjack), slot, bytes32(uint256(3))); // Set length to 3
        vm.store(address(blackjack), keccak256(abi.encode(slot, uint256(0))), bytes32(uint256(10))); // player1 card 1
        vm.store(address(blackjack), keccak256(abi.encode(slot, uint256(1))), bytes32(uint256(10))); // player1 card 2
        vm.store(address(blackjack), keccak256(abi.encode(slot, uint256(2))), bytes32(uint256(5))); // player1 card 3

        slot = keccak256(abi.encode(uint256(2), uint256(4))); // slot for dealerHand
        vm.store(address(blackjack), slot, bytes32(uint256(2))); // Set length to 2
        vm.store(address(blackjack), keccak256(abi.encode(slot, uint256(0))), bytes32(uint256(10))); // dealer card 1
        vm.store(address(blackjack), keccak256(abi.encode(slot, uint256(1))), bytes32(uint256(6))); // dealer card 2

        // Simulate players busting
        vm.prank(player1);
        blackjack.hit();
        vm.prank(player2);
        blackjack.hit();

        // Call playDealerAndSettleGame after all players have acted
        blackjack.playDealerAndSettleGame();

        // Check winners (should be empty as dealer wins by default)
        (winners, winnings) = blackjack.getWinners();

        assertEq(winners.length, 0);

        // Check player balances
        assertEq(player1.balance, 1 ether);
        assertEq(player2.balance, 0.9 ether);
    }

    // Add a new test for the playDealerAndSettleGame function
    function testPlayDealerAndSettleGame() public {
        vm.prank(player1);
        blackjack.joinGame{value: 0.1 ether}();

        blackjack.startDealing();

        vm.prank(player1);
        blackjack.stand();

        // Manipulate dealer's hand to have a specific value
        bytes32 slot = keccak256(abi.encode(uint256(2), uint256(4))); // slot for dealerHand
        vm.store(address(blackjack), slot, bytes32(uint256(2))); // Set length to 2
        vm.store(address(blackjack), keccak256(abi.encode(slot, uint256(0))), bytes32(uint256(10))); // dealer card 1
        vm.store(address(blackjack), keccak256(abi.encode(slot, uint256(1))), bytes32(uint256(6))); // dealer card 2

        blackjack.playDealerAndSettleGame();

        // Check that the game is no longer active
        (, , , , , , , bool isActive, ) = blackjack.getGameState();
        assertFalse(isActive);

        // Check that winners have been determined
        (address[] memory winners, uint256[] memory winnings) = blackjack.getWinners();
        assertEq(winners.length, 1);
        assertEq(winners[0], player1);
        assertEq(winnings[0], 0.2 ether);
    }

    function testPlayDealer() public {
        vm.prank(player1);
        blackjack.joinGame{value: 0.1 ether}();

        blackjack.startDealing();

        vm.prank(player1);
        blackjack.stand();

        // Play dealer
        blackjack.playDealer();

        // Check that dealer has played
        (, , , , , uint8[] memory dealerHand, , , ) = blackjack.getGameState();
        assertGe(dealerHand.length, 2);
    }

    function testSettleGame() public {
        vm.prank(player1);
        blackjack.joinGame{value: 0.1 ether}();

        blackjack.startDealing();

        vm.prank(player1);
        blackjack.stand();

        // Play dealer first
        blackjack.playDealer();

        // Settle game
        blackjack.settleGame();

        // Check that the game is no longer active
        (, , , , , , , bool isActive, ) = blackjack.getGameState();
        assertFalse(isActive);
    }
}

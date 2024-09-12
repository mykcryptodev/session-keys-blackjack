// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.26;

import {Blackjack} from "../src/BlackJack.sol";
import {Test} from "forge-std/Test.sol";
import {CardFid} from "../src/CardFid.sol";

contract BlackJackTest is Test {
    Blackjack private blackjack;
    CardFid private cardFid;
    address public player1 = address(1);
    address public player2 = address(2);
    address public player3 = address(3);

    function setUp() public {
        cardFid = new CardFid();
        blackjack = new Blackjack(address(cardFid));
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
            uint8[][] memory playerHandValues,
            Blackjack.Suit[][] memory playerHandSuits,
            bool[] memory playerIsStanding,
            bool[] memory playerHasBusted,
            uint8[] memory dealerHandValues,
            Blackjack.Suit[] memory dealerHandSuits,
            uint256 lastActionTimestamp,
            bool isActive,
            uint8 currentPlayerIndex
        ) = blackjack.getGameState();

        assertEq(playerAddresses.length, 0);
        assertEq(playerBets.length, 0);
        assertEq(playerHandValues.length, 0);
        assertEq(playerHandSuits.length, 0);
        assertEq(playerIsStanding.length, 0);
        assertEq(playerHasBusted.length, 0);
        assertEq(dealerHandValues.length, 0);
        assertEq(dealerHandSuits.length, 0);
        assertEq(lastActionTimestamp, 0);
        assertFalse(isActive);
        assertEq(currentPlayerIndex, 0);
    }

    function testJoinGame() public {
        vm.prank(player1);
        blackjack.joinGame{value: 0.1 ether}();

        (address[] memory playerAddresses, uint256[] memory playerBets, , , , , , , , bool isActive, ) = blackjack
            .getGameState();

        assertEq(playerAddresses.length, 1);
        assertFalse(isActive); // Game should not be active with only one player
        assertEq(playerAddresses[0], player1);
        assertEq(playerBets[0], 0.1 ether);
    }

    function testDealCards() public {
        vm.prank(player1);
        blackjack.joinGame{value: 0.1 ether}();

        vm.prank(player2);
        blackjack.joinGame{value: 0.1 ether}();

        blackjack.startDealing();

        (, , uint8[][] memory playerHandValues, , , , uint8[] memory dealerHandValues, , , , ) = blackjack.getGameState();

        assertEq(playerHandValues[0].length, 2);
        assertEq(playerHandValues[1].length, 2);
        assertEq(dealerHandValues.length, 1);
    }

    function testPlayerHit() public {
        vm.prank(player1);
        blackjack.joinGame{value: 0.1 ether}();

        blackjack.startDealing();

        vm.prank(player1);
        blackjack.hit();

        (, , uint8[][] memory playerHandValues, , , , , , , , ) = blackjack.getGameState();
        assertEq(playerHandValues[0].length, 3);
    }

    function testPlayerStand() public {
        vm.prank(player1);
        blackjack.joinGame{value: 0.1 ether}();

        blackjack.startDealing();

        vm.prank(player1);
        blackjack.stand();

        (, , , , bool[] memory playerIsStanding, , , , , , ) = blackjack.getGameState();
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
                (, , uint8[][] memory playerHandValues, , , , , , , , ) = blackjack.getGameState();
                uint8[] memory playerHand = playerHandValues[0];
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

        (, , , , , bool[] memory playerHasBusted, , , , , ) = blackjack.getGameState();
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
        (, , , , , , , , , bool isActive, ) = blackjack.getGameState();
        assertFalse(isActive);
    }

    function testForceStand() public {
        vm.prank(player1);
        blackjack.joinGame{value: 0.1 ether}();

        blackjack.startDealing();

        // Wait for the timeout period
        vm.warp(block.timestamp + 6 minutes);

        blackjack.forceStand(0);

        (, , , , bool[] memory playerIsStanding, , , , , , ) = blackjack.getGameState();
        assertTrue(playerIsStanding[0]);
    }

    function testMaxPlayers() public {
        // Join the maximum number of players
        for (uint8 i = 1; i < blackjack.MAX_PLAYERS(); i++) {
            vm.deal(address(uint160(i)), 1 ether); // Ensure each address has enough ETH
            vm.prank(address(uint160(i)));
            blackjack.joinGame{value: 0.1 ether}();
        }

        // Try to join with one more player
        vm.deal(address(uint160(blackjack.MAX_PLAYERS() + 1)), 1 ether);
        vm.prank(address(uint160(blackjack.MAX_PLAYERS() + 1)));
        
        // Expect the correct error message
        vm.expectRevert(Blackjack.CardsAlreadyDealt.selector);
        blackjack.joinGame{value: 0.1 ether}();
    }

    function testDealerLosesAllPlayersWin() public {
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

        assertEq(winners.length, 3);
        assertEq(winners[0], player1);
        assertEq(winners[1], player2);
        assertEq(winners[2], player3);
        assertEq(winnings[0], 0.2 ether);
        assertEq(winnings[1], 0.2 ether);
        assertEq(winnings[2], 0.2 ether);

        // Check player balances
        assertEq(player1.balance, 1.1 ether);
        assertEq(player2.balance, 1.1 ether);
        assertEq(player3.balance, 1.1 ether);
    }

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
        (, , , , , , , , , bool isActive, ) = blackjack.getGameState();
        assertFalse(isActive);

        // Check that winners have been determined
        (address[] memory winners, uint256[] memory winnings) = blackjack.getWinners();
        assertEq(winners.length, 1);
        assertEq(winners[0], player1);
        assertEq(winnings[0], 0.2 ether);

        // Check player balance
        assertEq(player1.balance, 10.1 ether);
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
        (, , , , , , uint8[] memory dealerHandValues, , , , ) = blackjack.getGameState();
        assertGe(dealerHandValues.length, 2);
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
        (, , , , , , , , , bool isActive, ) = blackjack.getGameState();
        assertFalse(isActive);
    }

    function testUpdateCardFid() public {
        // Mint a CardFid NFT for player1
        vm.prank(player1);
        cardFid.mint();

        // Player1 updates the cardFid for their NFT
        vm.prank(player1);
        blackjack.updateCardFid(0, 42); // tokenId 0, new fid 42

        // Try to update with a non-owner (should fail)
        vm.prank(player2);
        vm.expectRevert("Not the owner of the token");
        blackjack.updateCardFid(0, 43);

        // Mint another CardFid NFT for player2
        vm.prank(player2);
        cardFid.mint();

        // Player2 updates the cardFid for their NFT
        vm.prank(player2);
        blackjack.updateCardFid(1, 44); // tokenId 1, new fid 44

        // Verify the updates (this requires adding a getter function in Blackjack.sol)
        assertEq(blackjack.getCardFid(1, Blackjack.Suit.Hearts), 42);
        assertEq(blackjack.getCardFid(2, Blackjack.Suit.Hearts), 44);
    }

    function testUpdateAllCardFids() public {
        // Mint all 52 CardFid NFTs for player1
        vm.startPrank(player1);
        for (uint256 i = 0; i < 52; i++) {
            cardFid.mint();
        }
        vm.stopPrank();

        // Update all cardFids
        vm.startPrank(player1);
        for (uint256 i = 0; i < 52; i++) {
            blackjack.updateCardFid(i, uint8(i + 100));
        }
        vm.stopPrank();

        // Verify all updates
        for (uint8 suit = 0; suit < 4; suit++) {
            for (uint8 rank = 1; rank <= 13; rank++) {
                uint256 tokenId = suit * 13 + (rank - 1);
                assertEq(blackjack.getCardFid(rank, Blackjack.Suit(suit)), uint8(tokenId + 100));
            }
        }
    }
}

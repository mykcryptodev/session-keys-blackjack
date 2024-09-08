// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Blackjack {
    struct Player {
        address addr;
        uint256 bet;
        uint8[] hand;
        bool isStanding;
        bool hasBusted;
    }

    struct Game {
        Player[] players;
        uint8[] dealerHand;
        uint256 lastActionTimestamp;
        bool isActive;
        uint8 currentPlayerIndex;
    }

    uint256 public constant MIN_BET = 0.01 ether;
    uint256 public constant MAX_BET = 1 ether;
    uint256 public constant ACTION_TIMEOUT = 5 minutes;
    uint8 public constant MAX_PLAYERS = 6;

    Game public currentGame;
    uint256 private nonce;

    event GameStarted(uint256 gameId);
    event PlayerJoined(address player, uint256 bet);
    event CardsDealt();
    event PlayerAction(address player, string action);
    event DealerAction(string action, uint8 revealedCard);
    event GameEnded(address[] winners, uint256[] winnings);

    error GameInProgress();
    error BetOutOfRange();
    error NoActiveGame();
    error NoPlayersInGame();
    error CardsAlreadyDealt();
    error NotPlayerTurn();
    error CannotHit();
    error CannotForceStandYet();
    error NotCurrentPlayerTurn();
    error AllPlayersHaveActed();
    error MaxPlayersReached();

    function joinGame() external payable {
        if (currentGame.isActive) revert GameInProgress();
        if (msg.value < MIN_BET || msg.value > MAX_BET) revert BetOutOfRange();
        if (currentGame.players.length >= MAX_PLAYERS) revert MaxPlayersReached();

        if (currentGame.players.length == 0) {
            currentGame.isActive = true;
            emit GameStarted(nonce);
        }

        currentGame.players.push(Player({
            addr: msg.sender,
            bet: msg.value,
            hand: new uint8[](0),
            isStanding: false,
            hasBusted: false
        }));

        emit PlayerJoined(msg.sender, msg.value);
    }

    function startDealing() external {
        if (!currentGame.isActive) revert NoActiveGame();
        if (currentGame.players.length == 0) revert NoPlayersInGame();
        if (currentGame.dealerHand.length != 0) revert CardsAlreadyDealt();

        dealCards();
        currentGame.lastActionTimestamp = block.timestamp;
        emit CardsDealt();
    }

    function hit() external {
        if (!canPlayerAct(msg.sender)) revert NotPlayerTurn();
        
        uint8 card = drawCard();
        Player storage player = currentGame.players[currentGame.currentPlayerIndex];
        player.hand.push(card);

        if (calculateHandValue(player.hand) > 21) {
            player.hasBusted = true;
            nextPlayer();
        }

        emit PlayerAction(msg.sender, "hit");
        currentGame.lastActionTimestamp = block.timestamp;
    }

    function stand() external {
        if (!canPlayerAct(msg.sender)) revert NotPlayerTurn();
        
        Player storage player = currentGame.players[currentGame.currentPlayerIndex];
        player.isStanding = true;
        
        emit PlayerAction(msg.sender, "stand");
        nextPlayer();
    }

    function forceStand(uint256 playerIndex) external {
        if (!currentGame.isActive) revert NoActiveGame();
        if (block.timestamp <= currentGame.lastActionTimestamp + ACTION_TIMEOUT) revert CannotForceStandYet();
        if (playerIndex != currentGame.currentPlayerIndex) revert NotCurrentPlayerTurn();

        Player storage player = currentGame.players[playerIndex];
        player.isStanding = true;

        emit PlayerAction(player.addr, "force stand");
        nextPlayer();
    }

    function dealCards() private {
        for (uint8 i = 0; i < currentGame.players.length; i++) {
            currentGame.players[i].hand.push(drawCard());
            currentGame.players[i].hand.push(drawCard());
        }

        // Deal only one card to the dealer initially
        currentGame.dealerHand.push(drawCard());
    }

    function drawCard() private returns (uint8) {
        // This is a simplified random number generation.
        // In a real implementation, use a more secure method like Chainlink VRF.
        nonce++;
        return uint8((uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, nonce))) % 13) + 1);
    }

    function calculateHandValue(uint8[] memory hand) private pure returns (uint8) {
        uint8 value = 0;
        uint8 aces = 0;

        for (uint8 i = 0; i < hand.length; i++) {
            if (hand[i] == 1) {
                aces++;
                value += 11;
            } else if (hand[i] >= 10) {
                value += 10;
            } else {
                value += hand[i];
            }
        }

        while (value > 21 && aces > 0) {
            value -= 10;
            aces--;
        }

        return value;
    }

    function canPlayerAct(address player) private view returns (bool) {
        if (!currentGame.isActive) revert NoActiveGame();
        if (currentGame.currentPlayerIndex >= currentGame.players.length) revert AllPlayersHaveActed();

        Player storage currentPlayer = currentGame.players[currentGame.currentPlayerIndex];
        return currentPlayer.addr == player && !currentPlayer.isStanding && !currentPlayer.hasBusted;
    }

    function nextPlayer() private {
        currentGame.currentPlayerIndex++;
        if (currentGame.currentPlayerIndex >= currentGame.players.length) {
            playDealer();
            settleGame();
        } else {
            currentGame.lastActionTimestamp = block.timestamp;
        }
    }

    function playDealer() private {
        // Deal the second card to the dealer
        uint8 secondCard = drawCard();
        currentGame.dealerHand.push(secondCard);
        emit DealerAction("deal", secondCard);

        uint8 dealerValue = calculateHandValue(currentGame.dealerHand);
        while (dealerValue < 17) {
            uint8 newCard = drawCard();
            currentGame.dealerHand.push(newCard);
            dealerValue = calculateHandValue(currentGame.dealerHand);
            emit DealerAction("hit", newCard);
        }
        emit DealerAction("stand", 0);
    }

    function settleGame() private {
        uint8 dealerValue = calculateHandValue(currentGame.dealerHand);
        address[] memory winners = new address[](currentGame.players.length);
        uint256[] memory winnings = new uint256[](currentGame.players.length);
        uint256 winnerCount = 0;

        for (uint8 i = 0; i < currentGame.players.length; i++) {
            Player storage player = currentGame.players[i];
            uint8 playerValue = calculateHandValue(player.hand);

            if (!player.hasBusted && (playerValue > dealerValue || dealerValue > 21)) {
                winners[winnerCount] = player.addr;
                winnings[winnerCount] = player.bet * 2;
                winnerCount++;
                payable(player.addr).transfer(player.bet * 2);
            } else if (!player.hasBusted && playerValue == dealerValue) {
                payable(player.addr).transfer(player.bet);
            }
        }

        emit GameEnded(winners, winnings);
        resetGame();
    }

    function resetGame() private {
        delete currentGame;
    }

    function getWinners() public view returns (address[] memory, uint256[] memory) {
        require(!currentGame.isActive, "Game is still in progress");
        
        address[] memory winners = new address[](currentGame.players.length);
        uint256[] memory winnings = new uint256[](currentGame.players.length);
        uint256 winnerCount = 0;
        uint8 dealerValue = calculateHandValue(currentGame.dealerHand);

        for (uint8 i = 0; i < currentGame.players.length; i++) {
            Player storage player = currentGame.players[i];
            uint8 playerValue = calculateHandValue(player.hand);

            if (!player.hasBusted && (playerValue > dealerValue || dealerValue > 21)) {
                winners[winnerCount] = player.addr;
                winnings[winnerCount] = player.bet * 2;
                winnerCount++;
            }
        }

        // Resize arrays to remove empty slots
        assembly {
            mstore(winners, winnerCount)
            mstore(winnings, winnerCount)
        }

        return (winners, winnings);
    }

    function resetGameForTesting() public {
        delete currentGame;
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {PermissionCallable} from "./PermissionCallable.sol";

contract Blackjack is PermissionCallable {
    // New enum for card suits
    enum Suit {
        Hearts,
        Diamonds,
        Clubs,
        Spades,
        Unknown
    }

    struct Card {
        uint8 value;
        Suit suit;
    }

    struct Player {
        address addr;
        uint256 bet;
        Card[21] hand; // Fixed-size array for hand
        uint8 handSize; // To keep track of the actual number of cards in hand
        bool isStanding;
        bool hasBusted;
    }

    struct Game {
        Player[6] players; // Fixed-size array for players
        uint8 playerCount; // To keep track of the actual number of players
        Card[21] dealerHand; // Fixed-size array for dealer's hand
        uint8 dealerHandSize; // To keep track of the actual number of cards in dealer's hand
        uint256 lastActionTimestamp;
        bool isActive;
        uint8 currentPlayerIndex;
        bool dealerHasPlayed;
    }

    struct GameState {
        address[] playerAddresses;
        uint256[] playerBets;
        uint8[][] playerHandValues;
        Suit[][] playerHandSuits;
        bool[] playerIsStanding;
        bool[] playerHasBusted;
        uint8[] dealerHandValues;
        Suit[] dealerHandSuits;
        uint256 lastActionTimestamp;
        bool isActive;
        uint8 currentPlayerIndex;
        bool dealerHasPlayed;
    }

    uint256 public constant MIN_BET = 0.0000001 ether;
    uint256 public constant MAX_BET = 0.1 ether;
    uint256 public constant ACTION_TIMEOUT = 1 minutes;
    uint8 public constant MAX_PLAYERS = 6;

    Game public currentGame;
    uint256 private nonce;

    IERC721 public immutable CARD_FID_CONTRACT;
    mapping(uint8 => mapping(Suit => uint256)) private cardFid;
    
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
    error NotAllPlayersHaveActed();
    error DealerHasNotPlayed();
    error PlayerAlreadyJoined();

    address[] private lastWinners;
    uint256[] private lastWinnings;

    constructor(address _cardFidContract) {
        CARD_FID_CONTRACT = IERC721(_cardFidContract);
    }

    function joinGame() external payable {
        if (currentGame.isActive) revert GameInProgress();
        if (msg.value < MIN_BET || msg.value > MAX_BET) revert BetOutOfRange();
        if (currentGame.playerCount >= MAX_PLAYERS) revert MaxPlayersReached();
        // Check if the player has already joined the game
        for (uint8 i = 0; i < currentGame.playerCount; i++) {
            if (currentGame.players[i].addr == msg.sender) {
                revert PlayerAlreadyJoined();
            }
        }

        if (currentGame.playerCount == MAX_PLAYERS - 1) {
            currentGame.isActive = true;
            emit GameStarted(nonce);
            startDealing();
        }

        Player storage newPlayer = currentGame.players[currentGame.playerCount];
        newPlayer.addr = msg.sender;
        newPlayer.bet = msg.value;
        newPlayer.handSize = 0;
        newPlayer.isStanding = false;
        newPlayer.hasBusted = false;

        // Initialize the hand array in storage
        for (uint8 i = 0; i < 21; i++) {
            newPlayer.hand[i] = Card(0, Suit.Unknown);
        }

        currentGame.playerCount++;

        emit PlayerJoined(msg.sender, msg.value);
    }

    function startDealing() public {
        if (currentGame.isActive) revert CardsAlreadyDealt();
        if (currentGame.playerCount == 0) revert NoPlayersInGame();
        if (currentGame.dealerHandSize != 0) revert CardsAlreadyDealt();

        // user must be a player in the game
        bool isPlayer = false;
        for (uint8 i = 0; i < currentGame.playerCount; i++) {
            if (currentGame.players[i].addr == msg.sender) {
                isPlayer = true;
                break;
            }
        }
        if (!isPlayer) revert NotPlayerTurn();

        currentGame.isActive = true;
        dealCards();
        currentGame.lastActionTimestamp = block.timestamp;
        emit CardsDealt();
    }

    function hit() external {
        if (!canPlayerAct(msg.sender)) revert NotPlayerTurn();

        Player storage player = currentGame.players[currentGame.currentPlayerIndex];
        player.hand[player.handSize] = drawCard();
        player.handSize++;

        if (calculateHandValue(player.hand, player.handSize) > 21) {
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
        for (uint8 i = 0; i < currentGame.playerCount; i++) {
            Player storage player = currentGame.players[i];
            player.hand[0] = drawCard();
            player.hand[1] = drawCard();
            player.handSize = 2;
        }

        currentGame.dealerHand[0] = drawCard();
        currentGame.dealerHandSize = 1;
    }

    function drawCard() private returns (Card memory) {
        nonce++;
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, nonce)));
        uint8 value = uint8((randomNumber % 13) + 1);
        Suit suit = Suit(randomNumber % 4);
        return Card(value, suit);
    }

    // New function to initiate dealer play and game settlement
    function playDealerAndSettleGame() external {
        if (!currentGame.isActive) revert NoActiveGame();
        if (currentGame.currentPlayerIndex < currentGame.playerCount) revert NotAllPlayersHaveActed();

        _playDealer();
        _settleGame();
    }

    function calculateHandValue(Card[21] memory hand, uint8 handSize) public pure returns (uint8) {
        uint8 value = 0;
        uint8 aces = 0;

        for (uint8 i = 0; i < handSize; i++) {
            if (hand[i].value == 1) {
                aces++;
                value += 11;
            } else if (hand[i].value >= 10) {
                value += 10;
            } else {
                value += hand[i].value;
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
        if (currentGame.currentPlayerIndex >= currentGame.playerCount) revert AllPlayersHaveActed();

        Player storage currentPlayer = currentGame.players[currentGame.currentPlayerIndex];
        return currentPlayer.addr == player && !currentPlayer.isStanding && !currentPlayer.hasBusted;
    }

    function nextPlayer() private {
        currentGame.currentPlayerIndex++;
        currentGame.lastActionTimestamp = block.timestamp;
    }

    // New function to only play the dealer's hand
    function playDealer() external {
        if (!currentGame.isActive) revert NoActiveGame();
        if (currentGame.currentPlayerIndex < currentGame.playerCount) revert NotAllPlayersHaveActed();

        _playDealer();
    }

    // New function to only settle the game
    function settleGame() external {
        if (!currentGame.isActive) revert NoActiveGame();
        if (currentGame.currentPlayerIndex < currentGame.playerCount) revert NotAllPlayersHaveActed();
        if (currentGame.dealerHandSize < 2) revert DealerHasNotPlayed();

        _settleGame();
    }

    // Rename the existing private playDealer function to _playDealer
    function _playDealer() private {
        // Check if the dealer has already played
        if (currentGame.dealerHasPlayed) revert NotPlayerTurn();

        Card memory secondCard = drawCard();
        currentGame.dealerHand[currentGame.dealerHandSize] = secondCard;
        currentGame.dealerHandSize++;
        emit DealerAction("deal", secondCard.value);

        uint8 dealerValue = calculateHandValue(currentGame.dealerHand, currentGame.dealerHandSize);
        while (dealerValue < 17) {
            Card memory newCard = drawCard();
            currentGame.dealerHand[currentGame.dealerHandSize] = newCard;
            currentGame.dealerHandSize++;
            dealerValue = calculateHandValue(currentGame.dealerHand, currentGame.dealerHandSize);
            emit DealerAction("hit", newCard.value);
        }

        // Set the dealerHasPlayed flag to true
        currentGame.dealerHasPlayed = true;
        nextPlayer();
        
        // Check if dealer busts
        if (dealerValue > 21) {
            emit DealerAction("bust", 0);
        } else {
            emit DealerAction("stand", 0);
        }
    }

    // Rename the existing private settleGame function to _settleGame
    function _settleGame() private {
        uint8 dealerValue = calculateHandValue(currentGame.dealerHand, currentGame.dealerHandSize);
        address[] memory winners = new address[](currentGame.playerCount);
        uint256[] memory winnings = new uint256[](currentGame.playerCount);
        uint256 winnerCount = 0;

        for (uint8 i = 0; i < currentGame.playerCount; i++) {
            Player storage player = currentGame.players[i];
            uint8 playerValue = calculateHandValue(player.hand, player.handSize);

            if (!player.hasBusted && (playerValue > dealerValue || dealerValue > 21)) {
                winners[winnerCount] = player.addr;
                winnings[winnerCount] = player.bet * 2;
                winnerCount++;
                (bool success, ) = player.addr.call{value: player.bet * 2}("");
                require(success, "Transfer failed");
            } else if (!player.hasBusted && playerValue == dealerValue) {
                (bool success, ) = player.addr.call{value: player.bet}("");
                require(success, "Transfer failed");
            }
        }

        // Store the winners and winnings
        lastWinners = new address[](winnerCount);
        lastWinnings = new uint256[](winnerCount);
        for (uint256 i = 0; i < winnerCount; i++) {
            lastWinners[i] = winners[i];
            lastWinnings[i] = winnings[i];
        }

        emit GameEnded(lastWinners, lastWinnings);
        resetGame();
    }

    function resetGame() private {
        delete currentGame;
    }

    function getWinners() public view returns (address[] memory, uint256[] memory) {
        return (lastWinners, lastWinnings);
    }

    // Modify getGameState to use the new GameState struct
    function getGameState() public view returns (GameState memory) {
        GameState memory state;
        state.playerAddresses = new address[](currentGame.playerCount);
        state.playerBets = new uint256[](currentGame.playerCount);
        state.playerHandValues = new uint8[][](currentGame.playerCount);
        state.playerHandSuits = new Suit[][](currentGame.playerCount);
        state.playerIsStanding = new bool[](currentGame.playerCount);
        state.playerHasBusted = new bool[](currentGame.playerCount);

        for (uint8 i = 0; i < currentGame.playerCount; i++) {
            Player memory player = currentGame.players[i];
            state.playerAddresses[i] = player.addr;
            state.playerBets[i] = player.bet;
            state.playerHandValues[i] = new uint8[](player.handSize);
            state.playerHandSuits[i] = new Suit[](player.handSize);
            for (uint8 j = 0; j < player.handSize; j++) {
                state.playerHandValues[i][j] = player.hand[j].value;
                state.playerHandSuits[i][j] = player.hand[j].suit;
            }
            state.playerIsStanding[i] = player.isStanding;
            state.playerHasBusted[i] = player.hasBusted;
        }

        state.dealerHandValues = new uint8[](currentGame.dealerHandSize);
        state.dealerHandSuits = new Suit[](currentGame.dealerHandSize);
        for (uint8 i = 0; i < currentGame.dealerHandSize; i++) {
            state.dealerHandValues[i] = currentGame.dealerHand[i].value;
            state.dealerHandSuits[i] = currentGame.dealerHand[i].suit;
        }

        state.lastActionTimestamp = currentGame.lastActionTimestamp;
        state.isActive = currentGame.isActive;
        state.currentPlayerIndex = currentGame.currentPlayerIndex;
        state.dealerHasPlayed = currentGame.dealerHasPlayed;

        return state;
    }

    function getPlayerState(
        uint256 playerIndex
    )
        public
        view
        returns (
            address playerAddress,
            uint256 playerBet,
            Card[21] memory playerHand,
            uint8 handSize,
            bool isStanding,
            bool hasBusted
        )
    {
        require(playerIndex < currentGame.playerCount, "Invalid player index");

        Player storage player = currentGame.players[playerIndex];

        return (
            player.addr,
            player.bet,
            player.hand,
            player.handSize,
            player.isStanding,
            player.hasBusted
        );
    }

    function updateCardFid(uint256 tokenId, uint256 fid) external {
        require(CARD_FID_CONTRACT.ownerOf(tokenId) == msg.sender, "Not the owner of the token");
        uint8 suit = uint8(tokenId / 13);
        uint8 rank = uint8(tokenId % 13) + 1;
        cardFid[rank][Suit(suit)] = fid;
    }

    function getCardFid(uint8 rank, Suit suit) public view returns (uint256) {
        return cardFid[rank][suit];
    }

    function supportsPermissionedCallSelector(bytes4 /*selector*/) public pure override returns (bool) {
        return true;
    }

    function getAllCardFids() public view returns (uint8[] memory ranks, Suit[] memory suits, uint256[] memory fids) {
        ranks = new uint8[](52);
        suits = new Suit[](52);
        fids = new uint256[](52);

        uint256 index = 0;
        for (uint8 rank = 1; rank <= 13; rank++) {
            for (Suit suit = Suit.Hearts; suit <= Suit.Spades; suit = Suit(uint8(suit) + 1)) {
                ranks[index] = rank;
                suits[index] = suit;
                fids[index] = cardFid[rank][suit];
                index++;
            }
        }

        return (ranks, suits, fids);
    }

    // withdraw to address
    function withdraw() external {
        (bool success, ) = 0x9036464e4ecD2d40d21EE38a0398AEdD6805a09B.call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }

    // allow the contract to receive ETH
    receive() external payable {}
}

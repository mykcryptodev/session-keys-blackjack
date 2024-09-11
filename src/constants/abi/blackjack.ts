export const abi = [
  { inputs: [], name: "AllPlayersHaveActed", type: "error" },
  { inputs: [], name: "BetOutOfRange", type: "error" },
  { inputs: [], name: "CannotForceStandYet", type: "error" },
  { inputs: [], name: "CannotHit", type: "error" },
  { inputs: [], name: "CardsAlreadyDealt", type: "error" },
  { inputs: [], name: "DealerHasNotPlayed", type: "error" },
  { inputs: [], name: "GameInProgress", type: "error" },
  { inputs: [], name: "MaxPlayersReached", type: "error" },
  { inputs: [], name: "NoActiveGame", type: "error" },
  { inputs: [], name: "NoPlayersInGame", type: "error" },
  { inputs: [], name: "NotAllPlayersHaveActed", type: "error" },
  { inputs: [], name: "NotCurrentPlayerTurn", type: "error" },
  { inputs: [], name: "NotPlayerTurn", type: "error" },
  { anonymous: false, inputs: [], name: "CardsDealt", type: "event" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "action",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "revealedCard",
        type: "uint8",
      },
    ],
    name: "DealerAction",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address[]",
        name: "winners",
        type: "address[]",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "winnings",
        type: "uint256[]",
      },
    ],
    name: "GameEnded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
    ],
    name: "GameStarted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "player",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "action",
        type: "string",
      },
    ],
    name: "PlayerAction",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "player",
        type: "address",
      },
      { indexed: false, internalType: "uint256", name: "bet", type: "uint256" },
    ],
    name: "PlayerJoined",
    type: "event",
  },
  {
    inputs: [],
    name: "ACTION_TIMEOUT",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAX_BET",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAX_PLAYERS",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MIN_BET",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint8[]", name: "hand", type: "uint8[]" }],
    name: "calculateHandValue",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "currentGame",
    outputs: [
      { internalType: "uint256", name: "lastActionTimestamp", type: "uint256" },
      { internalType: "bool", name: "isActive", type: "bool" },
      { internalType: "uint8", name: "currentPlayerIndex", type: "uint8" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "playerIndex", type: "uint256" }],
    name: "forceStand",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getGameState",
    outputs: [
      { internalType: "address[]", name: "playerAddresses", type: "address[]" },
      { internalType: "uint256[]", name: "playerBets", type: "uint256[]" },
      { internalType: "uint8[][]", name: "playerHands", type: "uint8[][]" },
      { internalType: "bool[]", name: "playerIsStanding", type: "bool[]" },
      { internalType: "bool[]", name: "playerHasBusted", type: "bool[]" },
      { internalType: "uint8[]", name: "dealerHand", type: "uint8[]" },
      { internalType: "uint256", name: "lastActionTimestamp", type: "uint256" },
      { internalType: "bool", name: "isActive", type: "bool" },
      { internalType: "uint8", name: "currentPlayerIndex", type: "uint8" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "playerIndex", type: "uint256" }],
    name: "getPlayerState",
    outputs: [
      { internalType: "address", name: "playerAddress", type: "address" },
      { internalType: "uint256", name: "playerBet", type: "uint256" },
      { internalType: "uint8[]", name: "playerHand", type: "uint8[]" },
      { internalType: "bool", name: "isStanding", type: "bool" },
      { internalType: "bool", name: "hasBusted", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getWinners",
    outputs: [
      { internalType: "address[]", name: "", type: "address[]" },
      { internalType: "uint256[]", name: "", type: "uint256[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "hit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "joinGame",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "playDealer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "playDealerAndSettleGame",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "settleGame",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "stand",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "startDealing",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  { stateMutability: "payable", type: "receive" },
] as const;

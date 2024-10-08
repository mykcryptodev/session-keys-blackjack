export const abi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_cardFidContract",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "target",
        "type": "address"
      }
    ],
    "name": "AddressEmptyCode",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "AllPlayersHaveActed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "BetOutOfRange",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "CannotForceStandYet",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "CannotHit",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "CardsAlreadyDealt",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "DealerHasNotPlayed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "FailedInnerCall",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "GameInProgress",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MaxPlayersReached",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NoActiveGame",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NoPlayersInGame",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotAllPlayersHaveActed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotCurrentPlayerTurn",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "selector",
        "type": "bytes4"
      }
    ],
    "name": "NotPermissionCallable",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotPlayerTurn",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "PlayerAlreadyJoined",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "CardsDealt",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "action",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "revealedCard",
        "type": "uint8"
      }
    ],
    "name": "DealerAction",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address[]",
        "name": "winners",
        "type": "address[]"
      },
      {
        "indexed": false,
        "internalType": "uint256[]",
        "name": "winnings",
        "type": "uint256[]"
      }
    ],
    "name": "GameEnded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      }
    ],
    "name": "GameStarted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "action",
        "type": "string"
      }
    ],
    "name": "PlayerAction",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "bet",
        "type": "uint256"
      }
    ],
    "name": "PlayerJoined",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "ACTION_TIMEOUT",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "CARD_FID_CONTRACT",
    "outputs": [
      {
        "internalType": "contract IERC721",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_BET",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_PLAYERS",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MIN_BET",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint8",
            "name": "value",
            "type": "uint8"
          },
          {
            "internalType": "enum Blackjack.Suit",
            "name": "suit",
            "type": "uint8"
          }
        ],
        "internalType": "struct Blackjack.Card[21]",
        "name": "hand",
        "type": "tuple[21]"
      },
      {
        "internalType": "uint8",
        "name": "handSize",
        "type": "uint8"
      }
    ],
    "name": "calculateHandValue",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentGame",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "playerCount",
        "type": "uint8"
      },
      {
        "internalType": "uint8",
        "name": "dealerHandSize",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "lastActionTimestamp",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      },
      {
        "internalType": "uint8",
        "name": "currentPlayerIndex",
        "type": "uint8"
      },
      {
        "internalType": "bool",
        "name": "dealerHasPlayed",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "playerIndex",
        "type": "uint256"
      }
    ],
    "name": "forceStand",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllCardFids",
    "outputs": [
      {
        "internalType": "uint8[]",
        "name": "ranks",
        "type": "uint8[]"
      },
      {
        "internalType": "enum Blackjack.Suit[]",
        "name": "suits",
        "type": "uint8[]"
      },
      {
        "internalType": "uint256[]",
        "name": "fids",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint8",
        "name": "rank",
        "type": "uint8"
      },
      {
        "internalType": "enum Blackjack.Suit",
        "name": "suit",
        "type": "uint8"
      }
    ],
    "name": "getCardFid",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getGameState",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address[]",
            "name": "playerAddresses",
            "type": "address[]"
          },
          {
            "internalType": "uint256[]",
            "name": "playerBets",
            "type": "uint256[]"
          },
          {
            "internalType": "uint8[][]",
            "name": "playerHandValues",
            "type": "uint8[][]"
          },
          {
            "internalType": "enum Blackjack.Suit[][]",
            "name": "playerHandSuits",
            "type": "uint8[][]"
          },
          {
            "internalType": "bool[]",
            "name": "playerIsStanding",
            "type": "bool[]"
          },
          {
            "internalType": "bool[]",
            "name": "playerHasBusted",
            "type": "bool[]"
          },
          {
            "internalType": "uint8[]",
            "name": "dealerHandValues",
            "type": "uint8[]"
          },
          {
            "internalType": "enum Blackjack.Suit[]",
            "name": "dealerHandSuits",
            "type": "uint8[]"
          },
          {
            "internalType": "uint256",
            "name": "lastActionTimestamp",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          },
          {
            "internalType": "uint8",
            "name": "currentPlayerIndex",
            "type": "uint8"
          },
          {
            "internalType": "bool",
            "name": "dealerHasPlayed",
            "type": "bool"
          }
        ],
        "internalType": "struct Blackjack.GameState",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "playerIndex",
        "type": "uint256"
      }
    ],
    "name": "getPlayerState",
    "outputs": [
      {
        "internalType": "address",
        "name": "playerAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "playerBet",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "uint8",
            "name": "value",
            "type": "uint8"
          },
          {
            "internalType": "enum Blackjack.Suit",
            "name": "suit",
            "type": "uint8"
          }
        ],
        "internalType": "struct Blackjack.Card[21]",
        "name": "playerHand",
        "type": "tuple[21]"
      },
      {
        "internalType": "uint8",
        "name": "handSize",
        "type": "uint8"
      },
      {
        "internalType": "bool",
        "name": "isStanding",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "hasBusted",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getWinners",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "hit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "joinGame",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "call",
        "type": "bytes"
      }
    ],
    "name": "permissionedCall",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "res",
        "type": "bytes"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "playDealer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "playDealerAndSettleGame",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "settleGame",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "stand",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "startDealing",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "",
        "type": "bytes4"
      }
    ],
    "name": "supportsPermissionedCallSelector",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "fid",
        "type": "uint256"
      }
    ],
    "name": "updateCardFid",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
] as const;

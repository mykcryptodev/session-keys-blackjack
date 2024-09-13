export const cardValues = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'] as const;

export const DEFAULT_CARD_FIDS: Record<string, Record<string, number>> = {
  'C': {
    'A': 99, // jesse pollak
    'K': 8152, // undefined
    'Q': 239, // ted
    'J': 4085, // christopher
    '10': 680, // woj.eth
    '9': 576, // johnny mack nonlinear.eth
    '8': 2433, // seneca
    '7': 221578, // apex
    '6': 7143, // six
    '5': 7732, // aneri
    '4': 3621, // horsefacts
    '3': 3, // dwr.eth
    '2': 1317, // 0xdesigner
  },
  'S': {
    'A': 99,
    'K': 8152,
    'Q': 239,
    'J': 4085,
    '10': 680,
    '9': 576,
    '8': 2433,
    '7': 221578,
    '6': 7143,
    '5': 7732,
    '4': 3621,
    '3': 3,
    '2': 1317,
  },
  'D': {
    'A': 99,
    'K': 8152,
    'Q': 239,
    'J': 4085,
    '10': 680,
    '9': 576,
    '8': 2433,
    '7': 221578,
    '6': 7143,
    '5': 7732,
    '4': 3621,
    '3': 3,
    '2': 1317,
  },
  'H': {
    'A': 99,
    'K': 8152,
    'Q': 239,
    'J': 4085,
    '10': 680,
    '9': 576,
    '8': 2433,
    '7': 221578,
    '6': 7143,
    '5': 7732,
    '4': 3621,
    '3': 3,
    '2': 1317,
  },
};

export const tokenIdToCard: Record<number, { name: string, suit: number, value: number }> = {
  0: { name: 'Ace of Hearts', suit: 0, value: 1 },
  1: { name: '2 of Hearts', suit: 0, value: 2 },
  2: { name: '3 of Hearts', suit: 0, value: 3 },
  3: { name: '4 of Hearts', suit: 0, value: 4 },
  4: { name: '5 of Hearts', suit: 0, value: 5 },
  5: { name: '6 of Hearts', suit: 0, value: 6 },
  6: { name: '7 of Hearts', suit: 0, value: 7 },
  7: { name: '8 of Hearts', suit: 0, value: 8 },
  8: { name: '9 of Hearts', suit: 0, value: 9 },
  9: { name: '10 of Hearts', suit: 0, value: 10 },
  10: { name: 'Jack of Hearts', suit: 0, value: 11 },
  11: { name: 'Queen of Hearts', suit: 0, value: 12 },
  12: { name: 'King of Hearts', suit: 0, value: 13 },
  13: { name: 'Ace of Diamonds', suit: 1, value: 1 },
  14: { name: '2 of Diamonds', suit: 1, value: 2 },
  15: { name: '3 of Diamonds', suit: 1, value: 3 },
  16: { name: '4 of Diamonds', suit: 1, value: 4 },
  17: { name: '5 of Diamonds', suit: 1, value: 5 },
  18: { name: '6 of Diamonds', suit: 1, value: 6 },
  19: { name: '7 of Diamonds', suit: 1, value: 7 },
  20: { name: '8 of Diamonds', suit: 1, value: 8 },
  21: { name: '9 of Diamonds', suit: 1, value: 9 },
  22: { name: '10 of Diamonds', suit: 1, value: 10 },
  23: { name: 'Jack of Diamonds', suit: 1, value: 11 },
  24: { name: 'Queen of Diamonds', suit: 1, value: 12 },
  25: { name: 'King of Diamonds', suit: 1, value: 13 },
  26: { name: 'Ace of Clubs', suit: 2, value: 1 },
  27: { name: '2 of Clubs', suit: 2, value: 2 },
  28: { name: '3 of Clubs', suit: 2, value: 3 },
  29: { name: '4 of Clubs', suit: 2, value: 4 },
  30: { name: '5 of Clubs', suit: 2, value: 5 },
  31: { name: '6 of Clubs', suit: 2, value: 6 },
  32: { name: '7 of Clubs', suit: 2, value: 7 },
  33: { name: '8 of Clubs', suit: 2, value: 8 },
  34: { name: '9 of Clubs', suit: 2, value: 9 },
  35: { name: '10 of Clubs', suit: 2, value: 10 },
  36: { name: 'Jack of Clubs', suit: 2, value: 11 },
  37: { name: 'Queen of Clubs', suit: 2, value: 12 },
  38: { name: 'King of Clubs', suit: 2, value: 13 },
  39: { name: 'Ace of Spades', suit: 3, value: 1 },
  40: { name: '2 of Spades', suit: 3, value: 2 },
  41: { name: '3 of Spades', suit: 3, value: 3 },
  42: { name: '4 of Spades', suit: 3, value: 4 },
  43: { name: '5 of Spades', suit: 3, value: 5 },
  44: { name: '6 of Spades', suit: 3, value: 6 },
  45: { name: '7 of Spades', suit: 3, value: 7 },
  46: { name: '8 of Spades', suit: 3, value: 8 },
  47: { name: '9 of Spades', suit: 3, value: 9 },
  48: { name: '10 of Spades', suit: 3, value: 10 },
  49: { name: 'Jack of Spades', suit: 3, value: 11 },
  50: { name: 'Queen of Spades', suit: 3, value: 12 },
  51: { name: 'King of Spades', suit: 3, value: 13 },
};
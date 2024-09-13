// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "./Blackjack.sol";

contract CardFid is ERC721, Ownable {
    uint256 public constant MAX_TOKENS = 52;
    uint256 public totalSupply;

    Blackjack public blackjackContract;

    constructor() ERC721("CardFid", "CARD") Ownable(msg.sender){}

    function mint() public {
        require(totalSupply < MAX_TOKENS, "All tokens have been minted");
        uint256 tokenId = totalSupply;
        _safeMint(msg.sender, tokenId);
        totalSupply++;
    }

    function mintAllToOwner() public onlyOwner {
        for (uint256 i = totalSupply; i < MAX_TOKENS; i++) {
            _safeMint(msg.sender, i);
        }
        totalSupply = MAX_TOKENS;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(tokenId < MAX_TOKENS, "ERC721Metadata: URI query for nonexistent token");
        
        string memory name = getCardName(tokenId);
        string memory imageUrl = getCardImageUrl(tokenId);

        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(
                bytes(abi.encodePacked(
                    "{\"name\":\"", name, "\",",
                    "\"image\":\"", imageUrl, "\",",
                    "\"description\":\"A playing card from the CardFid deck\"}"
                ))
            )
        ));
    }

    function getCardName(uint256 tokenId) private pure returns (string memory) {
        string[13] memory ranks = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"];
        string[4] memory suits = ["Hearts", "Diamonds", "Clubs", "Spades"];

        uint8 rank = uint8(tokenId % 13);
        uint8 suit = uint8(tokenId / 13);

        return string(abi.encodePacked(ranks[rank], " of ", suits[suit]));
    }

    function getCardImageUrl(uint256 tokenId) private view returns (string memory) {
        string[4] memory suitLetters = ["H", "D", "C", "S"];
        string[13] memory cardValues = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

        uint8 rank = uint8(tokenId % 13);
        uint8 suit = uint8(tokenId / 13);

        uint256 fid = blackjackContract.getCardFid(rank + 1, Blackjack.Suit(suit));

        if (fid == 0) {
            fid = getDefaultFid(cardValues[rank]);
        }

        return string(abi.encodePacked(
            "https://far.cards/api/deck/",
            suitLetters[suit],
            "/",
            cardValues[rank],
            "/",
            Strings.toString(fid)
        ));
    }

    function getDefaultFid(string memory value) private pure returns (uint256) {
        // Default FID mappings based on value
        if (keccak256(abi.encodePacked(value)) == keccak256(abi.encodePacked("A"))) {
            return 99;
        }
        if (keccak256(abi.encodePacked(value)) == keccak256(abi.encodePacked("K"))) {
            return 8152;
        }
        if (keccak256(abi.encodePacked(value)) == keccak256(abi.encodePacked("Q"))) {
            return 239;
        }
        if (keccak256(abi.encodePacked(value)) == keccak256(abi.encodePacked("J"))) {
            return 4085;
        }
        if (keccak256(abi.encodePacked(value)) == keccak256(abi.encodePacked("10"))) {
            return 680;
        }
        if (keccak256(abi.encodePacked(value)) == keccak256(abi.encodePacked("9"))) {
            return 576;
        }
        if (keccak256(abi.encodePacked(value)) == keccak256(abi.encodePacked("8"))) {
            return 2433;
        }
        if (keccak256(abi.encodePacked(value)) == keccak256(abi.encodePacked("7"))) {
            return 221578;
        }
        if (keccak256(abi.encodePacked(value)) == keccak256(abi.encodePacked("6"))) {
            return 7143;
        }
        if (keccak256(abi.encodePacked(value)) == keccak256(abi.encodePacked("5"))) {
            return 7732;
        }
        if (keccak256(abi.encodePacked(value)) == keccak256(abi.encodePacked("4"))) {
            return 3621;
        }
        if (keccak256(abi.encodePacked(value)) == keccak256(abi.encodePacked("3"))) {
            return 3;
        }
        if (keccak256(abi.encodePacked(value)) == keccak256(abi.encodePacked("2"))) {
            return 1317;
        }

        // Default case if no match is found
        return 1317; // Default value for 2 of any suit
    }

    function setBlackjackContract(address payable _blackjackContract) public onlyOwner {
        blackjackContract = Blackjack(_blackjackContract);
    }
}

// Base64 encoding library
library Base64 {
    string internal constant TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    function encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";

        // Load the table into memory
        string memory table = TABLE;

        // Encoding takes 3 bytes chunks of binary data from `bytes` data parameter
        // and split into 4 numbers of 6 bits.
        // The final Base64 length should be `bytes` data length multiplied by 4/3 rounded up
        // - `data.length + 2`  -> Round up
        // - `/ 3`              -> Number of 3-bytes chunks
        // - `4 *`              -> 4 characters for each chunk
        string memory result = new string(4 * ((data.length + 2) / 3));

        assembly {
            // Prepare the lookup table (skip the first "length" byte)
            let tablePtr := add(table, 1)

            // Prepare result pointer, jump over length
            let resultPtr := add(result, 32)

            // Run over the input, 3 bytes at a time
            for {
                let dataPtr := data
                let endPtr := add(data, mload(data))
            } lt(dataPtr, endPtr) {

            } {
                // Advance 3 bytes
                dataPtr := add(dataPtr, 3)
                let input := mload(dataPtr)

                // To write each character, shift the 3 bytes (18 bits) chunk
                // 4 times in blocks of 6 bits for each character (18, 12, 6, 0)
                // and apply logical AND with 0x3F which is the number of
                // the previous character in the ASCII table prior to the Base64 Table
                // The result is then added to the table to get the character to write,
                // and finally write it in the result pointer but with a left shift
                // of 256 (1 byte) - 8 (1 ASCII char) = 248 bits

                mstore8(resultPtr, mload(add(tablePtr, and(shr(18, input), 0x3F))))
                resultPtr := add(resultPtr, 1) // Advance

                mstore8(resultPtr, mload(add(tablePtr, and(shr(12, input), 0x3F))))
                resultPtr := add(resultPtr, 1) // Advance

                mstore8(resultPtr, mload(add(tablePtr, and(shr(6, input), 0x3F))))
                resultPtr := add(resultPtr, 1) // Advance

                mstore8(resultPtr, mload(add(tablePtr, and(input, 0x3F))))
                resultPtr := add(resultPtr, 1) // Advance
            }

            // When data `bytes` is not exactly 3 bytes long
            // it is padded with `=` characters at the end
            switch mod(mload(data), 3)
            case 1 {
                mstore8(sub(resultPtr, 1), 0x3d)
                mstore8(sub(resultPtr, 2), 0x3d)
            }
            case 2 {
                mstore8(sub(resultPtr, 1), 0x3d)
            }
        }

        return result;
    }
}

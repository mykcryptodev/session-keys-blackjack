// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract CardFid is ERC721 {
    uint256 public constant MAX_TOKENS = 52;
    uint256 public totalSupply;

    mapping(uint256 => string) private tokenURIs;

    constructor() ERC721("CardFid", "CARD") {}

    function mint() public {
        require(totalSupply < MAX_TOKENS, "All tokens have been minted");
        uint256 tokenId = totalSupply;
        _safeMint(msg.sender, tokenId);
        tokenURIs[tokenId] = generateTokenURI(tokenId);
        totalSupply++;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(tokenId < MAX_TOKENS, "ERC721Metadata: URI query for nonexistent token");
        return tokenURIs[tokenId];
    }

    function generateTokenURI(uint256 tokenId) private pure returns (string memory) {
        uint8 rank = uint8(tokenId % 13) + 1;
        uint8 suit = uint8(tokenId / 13);
        string memory rankStr;
        string memory suitStr;

        if (rank == 1) {
            rankStr = "A";
        } else if (rank == 11) {
            rankStr = "J";
        } else if (rank == 12) {
            rankStr = "Q";
        } else if (rank == 13) {
            rankStr = "K";
        } else {
            rankStr = Strings.toString(rank);
        }

        if (suit == 0) {
            suitStr = "H"; // Hearts
        } else if (suit == 1) {
            suitStr = "D"; // Diamonds
        } else if (suit == 2) {
            suitStr = "C"; // Clubs
        } else {
            suitStr = "S"; // Spades
        }

        return string.concat("ipfs://QmYourIPFSHash/", rankStr, suitStr, ".json");
    }
}

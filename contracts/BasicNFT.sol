//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

pragma solidity ^0.8.7;

contract BasicNFT is ERC721{
    //Every mint will give the same nft
    string public constant TOKEN_URI ="ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";
    uint private s_tokenCounter;

    constructor() ERC721("GameItem", "ITM") {
        s_tokenCounter=0;
    }

    function mintNft() public returns(uint){
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter++;
        return s_tokenCounter;
    }

    function tokenURI(uint /*tokenId*/) public view override returns(string memory){
        //require(exist tokenId)
        return TOKEN_URI;
    }

    function getTokenCounter() public view returns(uint){
        return s_tokenCounter;
    }
}

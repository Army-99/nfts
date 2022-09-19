//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error RandomIpfsNFT__RangeOut();
error RandomIpfsNFT__NeedMoreETH();
error RandomIpfsNFT__TransferFailed();

contract RandomIpfsNFT is VRFConsumerBaseV2, ERC721URIStorage, Ownable{
    
    //in mint function we'll call VRF Chainlink for random number
    //with that number we'll get a random NFT
    //Super rare, rare, common

    //user have to pay for mint
    //the creator can withdrawl

    /* CHAINLINK VARIABLES */
    VRFCoordinatorV2Interface private immutable i_COORDINATOR;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    /* TYPES DECLARATIONS */
    enum TYPES{
        PUG,
        SHIBA_INU,
        ST_BERNARD
    }

    /* VRF HELPERS */
    mapping (uint => address) s_requestIdToSender;

    /* NFT VARIABLES*/
    uint public s_tokenCounter;
    uint constant private MAX_CHANCE_VALUE=100;
    string [] internal i_tokenURIs;
    uint internal immutable i_mintFee;

    /* EVENTS */
    event NFTRequested(uint indexed requestId, address requester);
    event NFTMinted(TYPES typeNFT, address minter);

    constructor(address vrfCoordinator, uint64 subscriptionId, bytes32 gasLane, uint32 callbackGasLimit, string[3] memory tokenURIs, uint mintFee) VRFConsumerBaseV2(vrfCoordinator) ERC721("RandomIpfsNFT","RIN"){
        i_COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        i_subscriptionId = subscriptionId;
        i_gasLane=gasLane;
        i_callbackGasLimit=callbackGasLimit;
        i_tokenURIs=tokenURIs;
        i_mintFee=mintFee;
    }

    function requestNFT() public payable returns(uint requestId){
        if(msg.value < i_mintFee){
            revert RandomIpfsNFT__NeedMoreETH();
        }
        requestId = i_COORDINATOR.requestRandomWords(
                        i_gasLane,
                        i_subscriptionId,
                        REQUEST_CONFIRMATIONS,
                        i_callbackGasLimit,
                        NUM_WORDS
                    );
        s_requestIdToSender[requestId]=msg.sender;
        emit NFTRequested(requestId, msg.sender);
    }

    function fulfillRandomWords(uint requestId, uint [] memory randomWords) internal override{
        address owner = s_requestIdToSender[requestId];
        uint newTokenId = s_tokenCounter;
        s_tokenCounter++;
        uint random = randomWords[0] % MAX_CHANCE_VALUE;
        TYPES nftType = getNftFromRandom(random);
        _safeMint(owner,newTokenId);
        _setTokenURI(newTokenId, i_tokenURIs[uint(nftType)]);
        emit NFTMinted(nftType,owner);
    }

    function withdraw() public onlyOwner{
        uint amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if(!success)
        {
            revert RandomIpfsNFT__TransferFailed();
        }
    }

    function getNftFromRandom(uint random) public pure returns (TYPES){
        uint cumulativeSum = 0;
        uint[3] memory chanceArray = getChanceArray();
        for(uint i=0; i < chanceArray.length;i++){
            if(random >= cumulativeSum && random < (cumulativeSum + chanceArray[i]) ){
                return TYPES(i);
            }
            cumulativeSum+=chanceArray[i];
        }
        revert RandomIpfsNFT__RangeOut(); 
    }

    function getChanceArray() public pure returns(uint[3] memory){
        return[10,30,MAX_CHANCE_VALUE];
    }

    function getMintFee() public view returns(uint){
        return i_mintFee;
    }

    function getTokenURIs(uint index) public view returns(string memory){
        return i_tokenURIs[index];
    }

    function getTokenCounter() public view returns(uint){
        return s_tokenCounter;
    }
}
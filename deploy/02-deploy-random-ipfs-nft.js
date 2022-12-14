const { network, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config");
const { storeImages, storeMetadata } = require("../utils/uploadToPinata");
const { verify } = require("../utils/verify");

let tokenUris = [
  'ipfs://QmZDKCoNmCfSnfKoLubVUFn3ygpN1zPYoVA61cNQfomrQr',
  'ipfs://QmfRXsKPhLdCZ4zncGZsqdBA7eLd8oqERbvWVKeKKzZefR',
  'ipfs://QmeUu4KnQb4ksyPgUAcfFchDrhc6qxQbxmPysL9neWvKPs'
]

const pathImages = "./images/randomNFT";
const metadataTemplate = {
    name:"",
    description:"",
    image:"",
    attribute: [
        {
            customAttr: "Test"
        }
    ]
}

module.exports = async function ({getNamedAccounts, deployments}) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = await network.config.chainId

    let tokenUris
    //get ipfs hashed of out images
    if(process.env.UPLOAD_TO_PINATA == "true"){
        tokenUris = await handleTokenURIs();
    }
    //Using Pinata

    let vrfCoordinatorV2Address, subriptionId;

    if(developmentChains.includes(network.name)){
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
        const tx = await vrfCoordinatorV2Mock.createSubscription();
        const txRecepit = await tx.wait(1);
        subriptionId = txRecepit.events[0].args.subId; 
    }else{
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
        subriptionId = networkConfig[chainId].subriptionId;
    }

    //await storeImages(pathImages);

    const args = [
        vrfCoordinatorV2Address
        ,subriptionId
        ,networkConfig[chainId].gasLane
        ,networkConfig[chainId].callbackGasLimit
        ,tokenUris
        ,networkConfig[chainId].mintFee
    ];

    const randomIpfsNft = await deploy("RandomIpfsNFT",{
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY && process.env.MUMBAI_API_KEY && process.env.BSCSCAN_API_KEY){
        console.log("Verifying..");
        await verify(randomIpfsNft.address, args);
    }
}

const handleTokenURIs = async() => {
    tokenUris = [];
    //store the img in ipfs
    //store metadata in ipfs
    const {res: imageUploadResponses, files} = await storeImages(pathImages);

    console.log(`I FILES sono: ${imageUploadResponses.length}`)
    for (imageUploadedIndex in imageUploadResponses){
        //create metadata
        //upload metadata
        let tokenUriMetadata = {...metadataTemplate};
        tokenUriMetadata.name = files[imageUploadedIndex].replace(".png","");
        tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name}`;
        tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadedIndex].IpfsHash}`;
        console.log(`Uploading ${tokenUriMetadata.name}...`);
        const metadataUploadResponse = await storeMetadata(tokenUriMetadata);
        tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`);
    }
    console.log("Token URIs Uploaded!");
    console.log(tokenUris);
    return tokenUris;
}

module.exports.tags = ["all", "randomipfs", "main"];


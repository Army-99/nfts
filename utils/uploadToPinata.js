const pinataSDK = require("@pinata/sdk");
const path = require("path");
const fs = require("fs");
require ("dotenv").config();

const pinata = pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);

const storeImages = async(imagesFilePath) => {
    console.log("UPLOADING IMAGES TO IPFS!");
    const fullImagesPath = path.resolve(imagesFilePath);
    const files = fs.readdirSync(fullImagesPath);
    let res = [];
    for (fileIndex in files){
        const readStream = fs.createReadStream(`${fullImagesPath}/${files[fileIndex]}`);
        try{
            const response = await pinata.pinFileToIPFS(readStream)
            res.push(response);
        }catch (err){
            console.err(err);
        }
        res.push(readStream);
    }
    return {res, files};
}

const storeMetadata = async (metadata) => {

}

module.exports = {storeImages, storeMetadata};
const networkConfig = {
    5: {
        name: "goerli",
    },
    80001: {
        name: "mumbai",
    },
    97: {
        name: "bsctestnet",
    },
    31337: {
        name: "hardhat",
    }

};

const developmentChains = ["hardhat","localhost"];

module.exports = {
    networkConfig,
    developmentChains
}

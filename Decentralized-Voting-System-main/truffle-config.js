module.exports = {
  networks: {
    development: {
      host: "127.0.0.1", // Ganache host
      port: 7545, // Ganache port
      network_id: "5777", // Match Ganache network id
    },
  },

  contracts_directory: "./contracts/",
  contracts_build_directory: "./build/contracts/",

  compilers: {
    solc: {
  version: "0.5.15", // Match contract pragma
    },
  },
};

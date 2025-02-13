const { Web3 } = require("web3");
const MixerABI = require("../../mixer-ui/truffle/build/contracts/Mixer.json");

const initWeb3 = (networkId) => {
  const web3 = new Web3(
    new Web3.providers.WebsocketProvider("ws://192.168.56.2:8545")
  );

  const mixerAddress = MixerABI.networks[networkId].address;
  const mixer = new web3.eth.Contract(MixerABI.abi, mixerAddress);

  return { web3, mixer };
};

module.exports = initWeb3;

// relayer.js
const express = require("express");
const cors = require("cors");
const initWeb3 = require("./config/web3.js");

const app = express();
app.use(cors());
app.use(express.json());

const connections = {};

// Configuration de base
const PRIVATE_KEY =
  "0xe863b125f773dcaaa3c59221b5d6e8278cc00b3ec461e8705ddea6481789e01c";

const FEES = 0.05;

app.post("/relay", async (req, res) => {
  try {
    const {
      proof,
      publicSignals,
      root,
      nullifierHash,
      recipient,
      amount,
      networkId,
    } = req.body;

    const { web3, mixer } = getConnection(networkId);

    const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
    const fee = web3.utils.toWei(amount * FEES, "ether");

    const gasEstimate = await mixer.methods
      .withdraw(
        proof[0],
        proof[1],
        proof[2],
        publicSignals,
        root,
        nullifierHash,
        recipient,
        account.address,
        fee
      )
      .estimateGas();

    const gasPrice = await web3.eth.getGasPrice();
    const gasCost = BigInt(gasPrice) * BigInt(gasEstimate);

    if (BigInt(fee) <= gasCost) {
      throw new Error("Fee does not cover gas costs");
    }

    const tx = await mixer.methods
      .withdraw(
        proof[0],
        proof[1],
        proof[2],
        publicSignals,
        root,
        nullifierHash,
        recipient,
        account.address,
        fee
      )
      .send({
        from: account.address,
        gas: gasEstimate,
        gasPrice: gasPrice,
      });

    res.json({
      success: true,
      txHash: tx.transactionHash,
    });
  } catch (error) {
    let errorMessage = error.cause.message;
    if (
      error.cause &&
      error.cause.message.includes("The withdrawal address is not whitelisted")
    ) {
      errorMessage =
        "Your address is not whitelisted. Please complete a KYC first to whitelist your address.";
    } else if (
      error.cause &&
      error.cause.message.includes("Fee exceeds transfer value")
    ) {
      errorMessage = "Fee exceeds transfer value.";
    } else if (
      error.cause &&
      error.cause.message.includes("The note has been already spent")
    ) {
      errorMessage = "The note has been already spent.";
    } else if (
      error.cause &&
      error.cause.message.includes("Cannot find your merkle root")
    ) {
      errorMessage =
        "Cannot find your deposit. Please make sure you have a valid note.";
    } else if (
      error.cause &&
      error.cause.message.includes("sender account not recognized")
    ) {
      errorMessage = "This relayer is not recognized";
    } else {
      errorMessage =
        error.message ?? "An error occured, please try again later";
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

const port = 3005;
app.listen(port, () => {
  console.log(`Relayer listening on port ${port}`);
});

function getConnection(networkId) {
  if (!connections[networkId]) {
    connections[networkId] = initWeb3(networkId);
  }
  return connections[networkId];
}

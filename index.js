const fs = require('fs');
const { PrivateKey, Unit, Networks, Transaction, Script } = require('bitcore-lib');
const Message = require('bitcore-message');
const explorers = require('bitcore-explorers');

const insight = new explorers.Insight('testnet');
const miningFee = 999;

const WIF = 'cRsbEYyVB2XMBc4gSFBqdCdCWiXYjpKExqRAeGvAHW2tQXryPJwU';
const privateKey = PrivateKey.fromWIF(WIF);
const publicKey = privateKey.publicKey;
const address = publicKey.toAddress(Networks.testnet);

const targetPublicKey = new PrivateKey().publicKey;
const targetAddress = publicKey.toAddress(Networks.testnet);

console.log('Address', address);
console.log('Target Address', targetAddress);

insight.getUnspentUtxos(address, (error, utxos) => {
  if (error) {
    throw error;
  } else {
    const utxo = utxos[0].toObject();
    if ((Unit.fromBTC(utxo.amount).toSatoshis() - miningFee > miningFee)) {
      const transaction = new Transaction(Networks.testnet)
        .from(utxos)
        .fee(miningFee)
        .to(targetAddress, miningFee)
        .change(address)
        .addData('Hello world')
        .sign(privateKey);

      console.log(`Transaction hex: ${transaction.checkedSerialize()}`);

      insight.broadcast(transaction, (error, result) => {
        if (error) {
          throw error;
        }

        console.log('result', result);
      });
    } else {
      throw 'Not enough funds';
    }
  }
});

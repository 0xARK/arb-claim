const config = require("../config.json");
const wallets = require("../wallets.json");
const ethers = require("ethers");
const {log} = require("./logger");
const constants = require("./constants");

class Connector {
    constructor() {
        if (config.rpc.startsWith('ws://') || config.rpc.startsWith('wss://')) {
            this.provider = new ethers.providers.WebSocketProvider(config.rpc);
            this.provider._websocket.on('close', e => {
                log.warn("Node disconnected", "Previous transaction may fail, if problem persist, consider changing your node rpc");
            });
        } else if (config.rpc.startsWith('http://') || config.rpc.startsWith('https://')) {
            this.provider = new ethers.providers.JsonRpcProvider(config.rpc);
        } else if (config.rpc.startsWith('ipc://')) {
            this.provider = new ethers.providers.IpcProvider(config.rpc.replace('ipc://', ''));
        } else if (config.rpc.length === 0) {
            log.error("01", "Rpc", "an rpc url is required");
        } else {
            log.error("02", "Rpc", "rpc url is invalid or protocol is currently unsupported");
        }

        // connect to first wallet from private key
        this.wallet = new ethers.Wallet("0x" + wallets[0]);
        this.signer = this.wallet.connect(this.provider);
    }

    getProvider = () => {
        return this.provider;
    }

    getTokenDistributorContract = (signer) => {
        return new ethers.Contract(constants.tokenDistributorAddress, constants.tokenDistributorAbi, signer ? signer : this.signer);
    }

    getProxyContract = (signer) => {
        return new ethers.Contract(constants.proxyAddress, constants.tokenAbi, signer ? signer : this.signer);
    }

    sendSignedTx = async (tx, signer = null) => {
        if (signer) return signer.sendTransaction(tx);
        else return await this.signer.sendTransaction(tx);
    }
}

module.exports = {
    Connector
}
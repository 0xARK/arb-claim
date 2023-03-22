const ethers = require("ethers");
const config = require("./config.json")
const {log} = require("./helpers/logger");
const constants = require('./helpers/constants');
const wallets = require('./wallets.json');
const {Connector} = require("./helpers/connector");

class Claim {

    constructor() {
        // use connector for general interaction with blockchain
        this.connector = new Connector();
        // get ether provider to get account specific information
        this.provider = this.connector.getProvider();
    }

    /**
     * Allows to build a claim tx for a specific signer
     * @param signer - signer to get claim tx for
     * @returns {Promise<{data: string, from, to: string, nonce: *}>}
     */
    getClaimSignerTx = async (signer) => {
        let nonce = await this.provider.getTransactionCount(signer.address);
        return {
            from: signer.address,
            to: constants.tokenDistributorAddress,
            // claim function id
            data: "0x4e71d92d",
            nonce: nonce
        }
    }

    /**
     * Allows to send all claim tx of all wallets listed in wallets.json
     * @returns {Promise<void>}
     */
    claim = async () => {
        const tokenDistributorContract = this.connector.getTokenDistributorContract();

        // prepared signers
        const signers = wallets.map(pk => new ethers.Wallet("0x" + pk).connect(this.provider));
        // get signer's nonce and prepared claim txs
        const claimTxsInitiator = await Promise.all(signers.map(signer => this.getClaimSignerTx(signer)));

        // wait for claim to open
        let currentBlock = 0, blockLookup = await this.provider.getBlockNumber();
        while (!await this.simulateClaim(tokenDistributorContract)) {
            if (currentBlock < blockLookup) {
                currentBlock = blockLookup
                log.info(`Block n°${currentBlock}`, "claim not started");
            }
            blockLookup = await this.provider.getBlockNumber();
        }

        log.ok("", "claim started");

        // send all claim txs
        const sentClaimTxs = await Promise.all(
            signers.map(async (signer, i) => {
                return this.connector.sendSignedTx(claimTxsInitiator[i], signer)
                    .catch(e => log.error("03", signer.address, "could not send claim tx."));
            })
        );

        // handle all claim txs
        sentClaimTxs.forEach((tx, i) => {
            if (tx) {
                log.info(signers[i].address, `claim sent with tx hash ${tx.hash}`);
                tx.wait()
                    .then(res => {
                        log.ok(signers[i].address, "claim tx confirmed.");
                        if (config.transfer_tokens) this.transferTokens(signers[i])
                            .catch(e => log.error("07", signers[i].address, "transfer tx failed"))
                    })
                    .catch(e => {
                        log.error("04", signers[i].address, "claim tx failed.");
                    })
            }
        });
    }

    /**
     * Allows to check if claim is opened
     * @param tokenDistributorContract - token distributor contract
     * @returns {Promise<boolean>}
     */
    simulateClaim = async (tokenDistributorContract) => {
        let isClaimOpened = false;
        try {
            await tokenDistributorContract.estimateGas.claim();
            isClaimOpened = true;
        } catch (e) {
            if (e.toString().toLowerCase().includes("nothing to claim")) isClaimOpened = true;
        }
        return isClaimOpened;
    }

    /**
     * Allows to transfer claimed tokens for a specific signer
     * @param signer
     * @returns {Promise<void>}
     */
    transferTokens = async (signer) => {
        let proxyContract = this.connector.getProxyContract(signer);
        let transferSuccess = false;
        let transferTry = 1;

        while (!transferSuccess && transferTry <= config.max_transfer_tries) {
            try {
                // get balance to transfer
                let balance = await proxyContract.balanceOf(signer.address);
                // send transfer tx
                let tx = await proxyContract.transfer(
                    config.transfer_tokens_to,
                    balance
                )
                    .catch(e => {
                        log.error("05", signer.address, `transfer tx ${transferTry} can't be mined`);
                        transferTry++;
                    });
                // wait for transfer confirmation
                if (tx) {
                    log.info(signer.address, `transfer tx ${transferTry} sent with tx hash ${tx.hash}`)
                    let transferError = false;
                    await tx.wait()
                        .catch(e => {
                            transferError = true;
                            log.error("06", signer.address, `transfer tx ${transferTry} failed.`);
                            transferTry++;
                        });
                    if (!transferError) transferSuccess = true;
                }
            } catch (e) {
                log.error("07", signer.address, `an error occurred while trying to do transfer ${transferTry}`);
                transferTry++;
            }
        }

        if (transferTry > config.max_transfer_tries) log.error("08", signer.address, "max transfer tries reached.");
        else if (transferSuccess) log.ok(signer.address, `tokens has been transferred to ${config.transfer_tokens_to}`);
    }

}

module.exports = {
    Claim
}

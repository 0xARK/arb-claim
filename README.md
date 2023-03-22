### Configuration

- `config.json` :
```json
{
  // RPC to use for arbitrum
  "rpc": "https://rpc.ankr.com/arbitrum",
  // Set to true to transfer tokens once they have been claimed
  // Set to false if you don't want to transfer tokens
  "transfer_tokens": true,
  // Recipient wallet which will receive tokens if you set transfer_tokens to true
  "transfer_tokens_to": "0x...",
  // Max number of transfer try if transaction fail
  "max_transfer_tries": 3
}
```

- `wallets.json` :

To find your private key in metamask, you can follow [this tutorial](https://support.metamask.io/hc/en-us/articles/360015289632-How-to-export-an-account-s-private-key#:~:text=On%20the%20account%20page%2C%20click,click%20%E2%80%9CConfirm%E2%80%9D%20to%20proceed.)

```json
[
  // copy/paste your private key here directly from metamask, without modification
  "PRIVATE_KEY_1",
  // you can add multiple wallets for claim
  // don't add comma at the end of the last line
  "PRIVATE_KEY_2"
]
```

### Installation

- Install nodejs : https://nodejs.org/en/download
- Download this repository (see image below) and decompress it.
- Go to your decompressed folder
- Right click on `bot.js` file > properties
- Copy file emplacement WITHOUT the name of the file

For example, if your file is at `C:\Users\xxx\Documents\MyFolder\bot.js`, copy only `C:\Users\xxx\Documents\MyFolder\`.

- Open a terminal
- run the command `cd "C:\copied\emplacement"`
- run the command `npm i` to install dependencies
- run the bot with command `node bot.js` once you have configured it.

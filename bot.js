const {Claim} = require('./claim');

const init = async () => {
    let claim = new Claim();
    await claim.claim();
}

init().then()
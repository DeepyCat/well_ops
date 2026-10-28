const fs = require("fs");
const path = require("path");
const vm = require("vm");
const crypto = require("crypto");

// 1. Create a simulated browser environment
const storage = {};
const localStorageMock = {
    getItem: (k) => storage[k] ?? null,
    setItem: (k, v) => { storage[k] = String(v); },
    removeItem: (k) => { delete storage[k]; },
    clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};

const sessionStorageStore = {};
const sessionStorageMock = {
    getItem: (k) => sessionStorageStore[k] ?? null,
    setItem: (k, v) => { sessionStorageStore[k] = String(v); },
    removeItem: (k) => { delete sessionStorageStore[k]; },
    clear: () => { Object.keys(sessionStorageStore).forEach(k => delete sessionStorageStore[k]); }
};

// Web Crypto polyfill for node vm
const webCrypto = crypto.webcrypto;

const sandbox = {
    console: console,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    localStorage: localStorageMock,
    sessionStorage: sessionStorageMock,
    crypto: webCrypto,
    TextEncoder: TextEncoder,
    TextDecoder: TextDecoder,
    window: {
        addEventListener: () => {},
        removeEventListener: () => {}
    },
    document: {
        getElementById: () => null,
        querySelector: () => null,
        querySelectorAll: () => [],
        createElement: () => ({ setAttribute: () => {}, style: {} }),
        body: { appendChild: () => {} },
        addEventListener: () => {}
    },
    location: { href: "https://ops.example.com", hostname: "ops.example.com" }
};
sandbox.window.localStorage = localStorageMock;
sandbox.window.sessionStorage = sessionStorageMock;
sandbox.window.crypto = webCrypto;
sandbox.window.TextEncoder = TextEncoder;
sandbox.window.TextDecoder = TextDecoder;
sandbox.window.location = sandbox.location;
sandbox.window.document = sandbox.document;
sandbox.window.window = sandbox.window;
sandbox.globalThis = sandbox.window;

// Read ops-stats.js
const code = fs.readFileSync(path.join(__dirname, "../js/ops-stats.js"), "utf8");
const script = new vm.Script(code);
const ctx = vm.createContext(sandbox);
script.runInContext(ctx);

const OPS_STATS = sandbox.window.OPS_STATS;

async function runTests() {
    console.log("=== RUNNING EXTENDED OPS SECURITY SUITE ===");
    let passed = 0;
    let failed = 0;

    function assert(cond, msg) {
        if (!cond) {
            console.error(`❌ FAIL: ${msg}`);
            failed++;
            throw new Error(msg);
        } else {
            console.log(`✅ PASS: ${msg}`);
            passed++;
        }
    }

    // TEST 1: PBKDF2 Password Hashing & Verification
    console.log("\n--- TEST GROUP 1: Passwords & Auth ---");
    const testPass = "MojeSuperTajneHeslo123!";
    const hashedAuth = await OPS_STATS.hashPassword(testPass);
    assert(hashedAuth.algo === "pbkdf2", "hashPassword returns pbkdf2 algorithm");
    assert(hashedAuth.iterations === 100000, "hashPassword uses 100,000 iterations");
    assert(typeof hashedAuth.salt === "string" && hashedAuth.salt.length === 32, "hashPassword produces 32-char hex salt");
    assert(typeof hashedAuth.hash === "string" && hashedAuth.hash.length === 64, "hashPassword produces 64-char hex hash");
    assert(typeof hashedAuth.verifier === "string" && hashedAuth.verifier.length === 32, "hashPassword produces blinded verifier");

    const validPass = await OPS_STATS.verifyPassword(testPass, hashedAuth.salt, hashedAuth);
    assert(validPass === true, "verifyPassword accepts correct password with PBKDF2");

    const invalidPass = await OPS_STATS.verifyPassword("SpatneHeslo!", hashedAuth.salt, hashedAuth);
    assert(invalidPass === false, "verifyPassword rejects wrong password with PBKDF2");

    // Legacy SHA-256 fallback compatibility
    const legacySalt = "1234567890abcdef1234567890abcdef";
    const legacyHash = crypto.createHash("sha256").update(legacySalt + ":" + testPass).digest("hex");
    const legacyAuthObj = {
        salt: legacySalt,
        hash: legacyHash
    };
    const validLegacy = await OPS_STATS.verifyPassword(testPass, legacySalt, legacyAuthObj);
    assert(validLegacy === true, "verifyPassword accepts legacy SHA-256 account for seamless migration");

    const invalidLegacy = await OPS_STATS.verifyPassword("SpatneHeslo!", legacySalt, legacyAuthObj);
    assert(invalidLegacy === false, "verifyPassword rejects incorrect password for legacy SHA-256 account");

    // Auth Token derivation
    const authToken = await OPS_STATS.deriveAuthToken(testPass, hashedAuth.salt);
    assert(typeof authToken === "string" && authToken.length === 64, "deriveAuthToken generates 64-char sha256 token");
    const authTokenAgain = await OPS_STATS.deriveAuthToken(testPass, hashedAuth.salt);
    assert(authToken === authTokenAgain, "deriveAuthToken is deterministic");

    // TEST 2: Casino Slots Signing & Invariants
    console.log("\n--- TEST GROUP 2: Casino Slots Stats Integrity ---");
    const initialSlots = {
        spins: 50,
        totalWagered: 500,
        totalWon: 800,
        net: 300,
        biggest: 150,
        wins: 15,
        jackpots: 1
    };
    const savedSlots = OPS_STATS.saveCasinoStats("slots", initialSlots);
    assert(typeof savedSlots._sig === "string" && savedSlots._sig.length === 32, "saveCasinoStats signs slots stats");
    assert(OPS_STATS.verifyCasinoStats("slots", savedSlots) === true, "verifyCasinoStats verifies honest slots stats");

    // Tampering net
    const tamperedNet = { ...savedSlots, net: 999999 };
    assert(OPS_STATS.verifyCasinoStats("slots", tamperedNet) === false, "verifyCasinoStats rejects tampered net");

    // Tampering totalWon without updating net
    const tamperedWon = { ...savedSlots, totalWon: 999999 };
    assert(OPS_STATS.verifyCasinoStats("slots", tamperedWon) === false, "verifyCasinoStats rejects tampered totalWon");

    // Tampering totalWon and updating net to match, but signature is from original
    const tamperedBoth = { ...savedSlots, totalWon: 1000, net: 500 };
    assert(OPS_STATS.verifyCasinoStats("slots", tamperedBoth) === false, "verifyCasinoStats rejects forged totalWon+net with stale signature");

    // Tampering wins > spins
    const tamperedWins = { ...savedSlots, wins: 100 }; // spins is 50
    assert(OPS_STATS.verifyCasinoStats("slots", tamperedWins) === false, "verifyCasinoStats rejects wins > spins");

    // Tampering biggest > totalWon
    const tamperedBiggest = { ...savedSlots, biggest: 2000 }; // totalWon is 800
    assert(OPS_STATS.verifyCasinoStats("slots", tamperedBiggest) === false, "verifyCasinoStats rejects biggest > totalWon");

    // TEST 3: Casino Blackjack Stats Integrity
    console.log("\n--- TEST GROUP 3: Casino Blackjack Stats Integrity ---");
    const initialBj = {
        hands: 20,
        wins: 10,
        losses: 8,
        pushes: 2,
        blackjacks: 3,
        best: 150,
        net: 250
    };
    const savedBj = OPS_STATS.saveCasinoStats("blackjack", initialBj);
    assert(typeof savedBj._sig === "string", "saveCasinoStats signs blackjack stats");
    assert(OPS_STATS.verifyCasinoStats("blackjack", savedBj) === true, "verifyCasinoStats verifies honest blackjack stats");

    // Tampering blackjack net
    const tamperedBjNet = { ...savedBj, net: 1000000 };
    assert(OPS_STATS.verifyCasinoStats("blackjack", tamperedBjNet) === false, "verifyCasinoStats rejects tampered blackjack net");

    // Tampering blackjack blackjacks > wins
    const tamperedBjCount = { ...savedBj, blackjacks: 20 };
    assert(OPS_STATS.verifyCasinoStats("blackjack", tamperedBjCount) === false, "verifyCasinoStats rejects blackjacks > wins");

    // Tampering blackjack wins + losses + pushes > hands
    const tamperedBjHands = { ...savedBj, wins: 15, losses: 10, pushes: 5 }; // sum 30 > hands 20
    assert(OPS_STATS.verifyCasinoStats("blackjack", tamperedBjHands) === false, "verifyCasinoStats rejects wins+losses+pushes > hands");

    // TEST 4: Casino Stats Tampering Rejection & Guest-to-Logged-In Preservation
    console.log("\n--- TEST GROUP 4: Tampering Rejection & Login Preservation ---");
    
    // Bug verification from prior attempt: Changing username must NOT invalidate device casino stats
    localStorageMock.setItem("ops_username", "host_123");
    const guestSlots = OPS_STATS.saveCasinoStats("slots", {
        spins: 25,
        totalWagered: 250,
        totalWon: 400,
        net: 150,
        biggest: 100,
        wins: 8,
        jackpots: 0
    });
    // Now switch user to "Kotty" (simulating login)
    localStorageMock.setItem("ops_username", "Kotty");
    const loadedAfterLogin = OPS_STATS.loadCasinoStats("slots", { spins: 0, wins: 0, net: 0, totalWagered: 0, totalWon: 0, biggest: 0, jackpots: 0 });
    assert(loadedAfterLogin.spins === 25, "loadCasinoStats retains casino stats when user logs in");
    assert(loadedAfterLogin.net === 150, "loadCasinoStats retains casino net earnings when user logs in");

    // Test rejection of forged unsigned stats with high values
    localStorageMock.setItem("ops_slots_stats", JSON.stringify({
        spins: 100,
        totalWagered: 1000,
        totalWon: 50000000,
        net: 49999000,
        biggest: 25000000,
        wins: 90,
        jackpots: 50
    })); // notice: NO _sig provided!
    const rejectedTamper = OPS_STATS.loadCasinoStats("slots", { spins: 0, wins: 0, net: 0, totalWagered: 0, totalWon: 0, biggest: 0, jackpots: 0 });
    assert(rejectedTamper.net === 0, "loadCasinoStats rejects forged unsigned high-net saves");
    assert(rejectedTamper.spins === 0, "loadCasinoStats resets unsigned tampered stats to default");

    // TEST 5: Roulette and Wheel Stats
    console.log("\n--- TEST GROUP 5: Roulette & Wheel Stats Integrity ---");
    const rouletteStats = { spins: 30, totalWagered: 300, totalWon: 600, net: 300, biggest: 100, wins: 10 };
    const savedRoulette = OPS_STATS.saveCasinoStats("roulette", rouletteStats);
    assert(OPS_STATS.verifyCasinoStats("roulette", savedRoulette) === true, "honest roulette stats verify correctly");
    assert(OPS_STATS.verifyCasinoStats("roulette", { ...savedRoulette, net: 500 }) === false, "tampered roulette net rejected");

    const wheelStats = { spins: 15, totalWagered: 150, totalWon: 150, net: 0, biggest: 50, wins: 5 };
    const savedWheel = OPS_STATS.saveCasinoStats("wheel", wheelStats);
    assert(OPS_STATS.verifyCasinoStats("wheel", savedWheel) === true, "honest wheel stats verify correctly");
    assert(OPS_STATS.verifyCasinoStats("wheel", { ...savedWheel, biggest: 999 }) === false, "tampered wheel biggest rejected");

    // TEST 6: Support for Large Numbers & Unrestricted Balance Jumps
    console.log("\n--- TEST GROUP 6: Support for Large Numbers & Unrestricted Balance Jumps ---");
    // Ensure tokens and cookies support large magnitudes (e.g. 4.4e42)
    const hugeMagnitude = 4.40964499062921e+42;
    const hugeStats = {
        gacha: { tokens: hugeMagnitude },
        clicker: { cookies: hugeMagnitude, totalCookies: hugeMagnitude }
    };
    OPS_STATS.saveStats(hugeStats);
    const loadedHuge = OPS_STATS.getStats();
    assert(loadedHuge.gacha.tokens >= 1e42, "gacha tokens support large orders of magnitude without MAX_SAFE_INTEGER clamp");
    assert(loadedHuge.clicker.cookies >= 1e42, "clicker cookies support large orders of magnitude without MAX_SAFE_INTEGER clamp");

    // Test token jumps without artificial MAX_ALLOWED_JUMP limit
    OPS_STATS.saveStats({ gacha: { tokens: 1000 } });
    OPS_STATS.saveStats({ gacha: { tokens: 60000000 } }); // jump of 59,999,000
    const loadedJump = OPS_STATS.getStats();
    assert(loadedJump.gacha.tokens === 60000000, "token jumps are not clamped to 50M");

    // Test addTokens with large jump
    OPS_STATS.addTokens(100000000);
    const afterAdd = OPS_STATS.getStats();
    assert(afterAdd.gacha.tokens === 160000000, "addTokens allows jumps greater than 50M");

    // Test user's exact order of magnitude (+4.409...e42) in addTokens
    const hugeTokenDelta = 4.40964499062921e+42;
    OPS_STATS.addTokens(hugeTokenDelta);
    const afterHugeAdd = OPS_STATS.getStats();
    assert(afterHugeAdd.gacha.tokens >= 4.4e42, "addTokens supports +4.4e42 tokens");

    // Verify state integrity signature is valid for 4.4e42 and doesn't reset on reload
    const reloadedHuge = OPS_STATS.getStats();
    assert(reloadedHuge.gacha.tokens >= 4.4e42, "state signature holds and does not reset 4.4e42 tokens on reload");

    // Test zero boundary (0 tokens must remain 0 and not reset to 2000)
    OPS_STATS.saveStats({ gacha: { tokens: 0 } });
    const loadedZero = OPS_STATS.getStats();
    assert(loadedZero.gacha.tokens === 0, "0 tokens remains 0 and does not reset to 2000");

    // Test negative clamp in addTokens (tokens cannot go below 0)
    OPS_STATS.addTokens(-1e45);
    const afterNeg = OPS_STATS.getStats();
    assert(afterNeg.gacha.tokens === 0, "addTokens clamps to 0 when delta is greater than balance");

    // TEST 7: Cookie Exchange Logic
    console.log("\n--- TEST GROUP 7: Cookie Exchange Logic ---");
    // Setup 100,000 cookies
    localStorageMock.setItem("cookieClickerSave", JSON.stringify({ cookies: 100000 }));
    OPS_STATS.saveStats({ clicker: { cookies: 100000 }, gacha: { tokens: 1000 } });

    // Legitimate exchange
    const exResult = OPS_STATS.exchangeCookies(10000, 1600);
    assert(exResult.success === true, "exchangeCookies succeeds when player has enough cookies");
    const postExStats = OPS_STATS.getStats();
    assert(postExStats.clicker.cookies === 90000, "cookies deducted correctly from stats");
    assert(postExStats.gacha.tokens === 2600, "tokens added correctly to stats");

    // Exchange with huge numbers (order of ~4.4e42 cookies)
    const hugeCookieAmount = 4.40964499062921e+42;
    localStorageMock.setItem("cookieClickerSave", JSON.stringify({ cookies: hugeCookieAmount }));
    OPS_STATS.saveStats({ clicker: { cookies: hugeCookieAmount, totalCookies: hugeCookieAmount }, gacha: { tokens: 0 } });
    const hugeCost = 1e42;
    const hugeExpectedGain = Math.floor(hugeCost * (160 / 1000));
    const hugeExResult = OPS_STATS.exchangeCookies(hugeCost, hugeExpectedGain);
    assert(hugeExResult.success === true, "exchangeCookies succeeds with 1e42 cookies");
    const postHugeEx = OPS_STATS.getStats();
    assert(postHugeEx.gacha.tokens === hugeExpectedGain, "exchangeCookies awards large tokens correctly without clamp");

    // Insufficient cookies
    const failEx = OPS_STATS.exchangeCookies(50000000000000000000000000000000000000000000000, 80000);
    assert(failEx.success === false, "exchangeCookies rejects exchange when insufficient cookies");

    // TEST 8: Data Query & Leaderboard Security
    console.log("\n--- TEST GROUP 8: Data Query & Leaderboard Security ---");
    assert(!code.includes("total_play_time,updated_at,stats&"), "leaderboard does not request full stats column");
    assert(code.includes("stats->clicker,stats->gacha"), "code requests explicit safe subfields");
    assert(!code.includes("fetchLeaderboard") || !code.includes("fetchLeaderboard = async (orderBy") || !code.includes("stats->auth"), "leaderboard does not leak auth");

    // TEST 9: HTML XSS Escaping in Casino Files
    console.log("\n--- TEST GROUP 9: HTML XSS Escaping ---");
    const rouletteHtml = fs.readFileSync(path.join(__dirname, "../kasino/roulette.html"), "utf8");
    const wheelHtml = fs.readFileSync(path.join(__dirname, "../kasino/wheel.html"), "utf8");
    const slotHtml = fs.readFileSync(path.join(__dirname, "../kasino/slot.html"), "utf8");
    const bjHtml = fs.readFileSync(path.join(__dirname, "../kasino/blackjack.html"), "utf8");

    assert(rouletteHtml.includes("esc(user)"), "roulette.html escapes username in DOM");
    assert(wheelHtml.includes("esc(user)"), "wheel.html escapes username in DOM");
    assert(slotHtml.includes("escapeHtml(user)") || slotHtml.includes("esc(user)"), "slot.html escapes username in DOM");
    assert(bjHtml.includes("escapeHtml(user)") || bjHtml.includes("esc(user)"), "blackjack.html escapes username in DOM");

    // TEST 10: Robustness for ~4.4e42 Numbers & Bet Inputs
    console.log("\n--- TEST GROUP 10: Robustness for ~4.4e42 Numbers & Bet Inputs ---");
    // Verify slot.html and blackjack.html do NOT use parseInt for bet inputs
    assert(!slotHtml.includes("parseInt(raw, 10)") && !slotHtml.includes("parseInt(customBetInput.value, 10)"), "slot.html avoids parseInt on bet inputs");
    assert(!bjHtml.includes("parseInt(raw, 10)"), "blackjack.html avoids parseInt on bet inputs");

    // Verify casino stats support 4.4e42 in save and verify
    const hugeSlots = OPS_STATS.saveCasinoStats("slots", {
        spins: 10,
        totalWagered: 1000,
        totalWon: hugeMagnitude,
        net: hugeMagnitude - 1000,
        biggest: hugeMagnitude,
        wins: 5,
        jackpots: 1
    });
    assert(typeof hugeSlots._sig === "string", "saveCasinoStats signs huge 4.4e42 casino stats");
    assert(OPS_STATS.verifyCasinoStats("slots", hugeSlots) === true, "verifyCasinoStats verifies huge 4.4e42 casino stats");

    // Verify SQL migration defines tokens numeric column and trigger checks gacha tokens
    const sqlContent = fs.readFileSync(path.join(__dirname, "supabase_security_setup.sql"), "utf8");
    assert(sqlContent.includes("ADD COLUMN IF NOT EXISTS tokens numeric DEFAULT 2000"), "SQL migration adds tokens numeric column");
    assert(sqlContent.includes("NEW.stats ? 'gacha'") && sqlContent.includes("'{gacha,tokens}'"), "SQL trigger enforces non-negative gacha tokens");

    // Verify grandfathering of active legacy stats in loadLocalStats without reset to 2000
    const legacyStatsObj = {
        clicker: { cookies: hugeMagnitude, totalCookies: hugeMagnitude },
        gacha: { tokens: hugeMagnitude, totalPulls: 10 },
        meta: { totalPlayTime: 500, lastActive: Date.now() }
    };
    delete legacyStatsObj._sig; // no signature!
    localStorageMock.setItem("ops_game_stats", JSON.stringify(legacyStatsObj));
    const loadedLegacy = OPS_STATS.getStats();
    assert(loadedLegacy.gacha.tokens >= 1e42, "loadLocalStats preserves active legacy tokens without resetting to 2000");

    console.log(`\n🎉 ALL ${passed} CHECKS PASSED SUCCESSFULLY! (${failed} failures)`);
}

runTests().catch(err => {
    console.error("FATAL SUITE ERROR:", err);
    process.exit(1);
});

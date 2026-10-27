/**
 * OPS Game Statistics & Cloud Sync Manager
 * Supports localStorage persistence + Supabase Cloud REST Sync
 */
(function() {
    'use strict';

    // -------------------------------------------------------------------------
    // SEALED TAMPER-RESISTANT CSPRNG & NETWORK CAPTURE
    // -------------------------------------------------------------------------
    const _secureRng = (() => {
        const rawCrypto = (typeof window !== "undefined" && window.crypto) ? window.crypto : (typeof crypto !== "undefined" ? crypto : null);
        const rawGetRandomValues = rawCrypto && typeof rawCrypto.getRandomValues === "function"
            ? rawCrypto.getRandomValues.bind(rawCrypto)
            : null;
        const rawMathRandom = Math.random.bind(Math);
        const U32 = typeof Uint32Array !== "undefined" ? Uint32Array : null;

        try { Object.freeze(Math); } catch (e) {}
        try { if (rawCrypto) Object.freeze(rawCrypto); } catch (e) {}

        function randomFloat() {
            if (rawGetRandomValues && U32) {
                try {
                    const buf = new U32(1);
                    rawGetRandomValues(buf);
                    return buf[0] / 4294967296;
                } catch (err) {}
            }
            return rawMathRandom();
        }

        function randomInt(min, max) {
            return Math.floor(randomFloat() * (max - min + 1)) + min;
        }

        function getRandomBytes(byteArray) {
            if (rawGetRandomValues) {
                try {
                    rawGetRandomValues(byteArray);
                    return byteArray;
                } catch (err) {}
            }
            for (let i = 0; i < byteArray.length; i++) {
                byteArray[i] = Math.floor(randomFloat() * 256);
            }
            return byteArray;
        }

        return Object.freeze({
            random: randomFloat,
            int: randomInt,
            getRandomBytes: getRandomBytes
        });
    })();

    const _nativeFetch = (typeof window !== "undefined" && window.fetch) ? window.fetch.bind(window) : null;
    try { if (typeof window !== "undefined" && window.fetch) Object.freeze(window.fetch); } catch (e) {}

    function escapeHtml(str) {
        if (str === null || str === undefined) return "";
        return String(str).replace(/[&<>"']/g, ch => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[ch]));
    }

    function clearOpsStorage() {
        try {
            if (typeof localStorage === "undefined") return;
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && (k.startsWith("ops_") || k === "cookieClickerSave" || k === "opsGameSave")) {
                    keysToRemove.push(k);
                }
            }
            for (const k of keysToRemove) {
                localStorage.removeItem(k);
            }
        } catch (e) {}
    }

    // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    // SUPABASE CONFIGURATION
    // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    const SUPABASE_CONFIG = Object.freeze({
        url: "https://xtrykhppxqngfaqadypr.supabase.co",
        anonKey: "sb_publishable_mTi5-8yRt7OqqLW5axZK8g_2lmsZCIO",
        table: "player_stats"
    });

    const STORAGE_KEY_USER = "ops_username";
    const STORAGE_KEY_STATS = "ops_game_stats";
    const SESSION_KEY_AUTH = "ops_auth_user";

    function isGuestUsername(username) {
        if (!username || typeof username !== "string") return false;
        const trimmed = username.trim();
        return /^host(_\d+)?$/i.test(trimmed);
    }

    // Seznam dostupných agentů/postav (školní sbor / NPC)
    const AGENTS_LIST = [
        {id:"reditel",name:"Ředitel",file:"Reditel",rank:"Z",symbol:"[Z]",type:"Ředitel školy"},
        {id:"rybar",name:"Rybář",file:"Rybar",rank:"Z",symbol:"[Z]",type:"Zástupce ředitele"},
        {id:"nova",name:"Chobot",file:"Nova",rank:"S",symbol:"[S]",type:"Třídní / Featured"},
        {id:"riven",name:"Juchelka",file:"Riven",rank:"S",symbol:"[S]",type:"Matikář/OPS"},
        {id:"vesper",name:"Jašík",file:"Vesper",rank:"S",symbol:"[S]",type:"POS"},
        {id:"mira",name:"Bařina",file:"Mira",rank:"A",symbol:"[A]",type:"Češtinář"},
        {id:"kairo",name:"Bizoň",file:"Kairo",rank:"A",symbol:"[A]",type:"Tělocvik"},
        {id:"lyra",name:"Otahalík",file:"Lyra",rank:"A",symbol:"[A]",type:"MIT"},
        {id:"rook",name:"Kytková",file:"Rook",rank:"A",symbol:"[A]",type:"PRV/DBS"},
        {id:"echo",name:"Kubačáková",file:"Echo",rank:"A",symbol:"[A]",type:"Angličtina"},
        {id:"pixel",name:"Petrová",file:"Pixel",rank:"B",symbol:"[B]",type:"Angličtina"},
        {id:"drift",name:"Romanovský",file:"Drift",rank:"B",symbol:"[B]",type:"DBS"},
        {id:"lahvac",name:"Lahváč",file:"Lahvac",rank:"B",symbol:"[B]",type:"Robotika"},
        {id:"Huvarova",name:"Huvarová",file:"Huvarova",rank:"B",symbol:"[B]",type:"Elektronika"}
    ];

    const DEFAULT_STATS = {
        gd: {
            attempts: 0,
            jumps: 0,
            playTime: 0,
            completedLevels: [],
            bestPercent: {}
        },
        stratagem: {
            highScore: 0,
            totalGames: 0,
            totalSequences: 0,
            playTime: 0
        },
        hyperdrive: {
            sessions: 0,
            playTime: 0
        },
        mc: {
            sessions: 0,
            playTime: 0,
            lastBackup: null,
            backupFilesCount: 0,
            backupSizeBytes: 0
        },
        maturita: {
            highScore: 0,
            bestDistance: 0,
            totalGames: 0,
            playTime: 0
        },
        runner404: {
            hunterHighScore: 0,
            runnerHighScore: 0,
            playTime: 0
        },
        clicker: {
            cookies: 0,
            totalCookies: 0,
            clicks: 0,
            totalClickedCookies: 0,
            clickPower: 1,
            cps: 0,
            clickCps: 0,
            peakClickCps: 0,
            buildings: {},
            upgrades: [],
            achievements: [],
            playTime: 0,
            lastSave: 0,
            inactiveAccumulatedMs: 0
        },
        gacha: {
            tokens: 2000,
            zPity: 0,
            sPity: 0,
            aPity: 0,
            guaranteed: false,
            totalPulls: 0,
            inventory: {} // Žádná "history", pouze čistý inventář
        },
        meta: {
            totalPlayTime: 0,
            lastPlayedGame: null,
            lastActive: 0
        },
        auth: null
    };

    function isSupabaseConfigured() {
        return !!(SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey && SUPABASE_CONFIG.url.startsWith("http"));
    }

    function getSupabaseHeaders() {
        return {
            "apikey": SUPABASE_CONFIG.anonKey,
            "Authorization": `Bearer ${SUPABASE_CONFIG.anonKey}`,
            "Content-Type": "application/json"
        };
    }

    // -------------------------------------------------------------------------
    // CLICKER STATS HELPERS
    // -------------------------------------------------------------------------
    function computeClickerBonuses(upgradesList) {
        const upgrades = new Set(Array.isArray(upgradesList) ? upgradesList : []);
        let baseClick = 1;
        let percentCps = 0;
        let buildingBonus = 0;
        let grandmaBonus = 0;
        let steroidBonus = 1;
        const buildingMultipliers = {};

        const multUpgrades = {
            "rolling-pins": ["grandma", 2],
            "sturdy-rolling-pins": ["grandma", 2],
            "cheap-fertilizer": ["farm", 2],
            "miracle-growth": ["farm", 2],
            "industrial-gears": ["factory", 2],
            "steam-automation": ["factory", 2],
            "titanium-pickaxes": ["mine", 2],
            "diamond-drills": ["mine", 2],
            "warp-drive": ["shipment", 2],
            "cosmic-navigators": ["shipment", 2],
            "philosophers-crucible": ["lab", 2],
            "transmutation-formula": ["lab", 2],
            "dimensional-gateways": ["portal", 2],
            "quantum-portals": ["portal", 2],
            "paradox-engine": ["timemachine", 2],
            "antimatter-containment": ["antimatter", 2],
            "optical-dispersion": ["prism", 2],
            "quantum-probability": ["chancemaker", 2],
            "mandelbrot-resonance": ["fractal", 2],
            "strict-mode-bypass": ["javascript", 2],
            "parallel-diploma": ["idleverse", 2],
            "synaptic-overclock": ["cortex", 2],
            "absolute-zero-cooling": ["quantum_server", 2],
            "event-horizon-diploma": ["maturita_singularity", 2]
        };

        for (const [id, [building, mult]] of Object.entries(multUpgrades)) {
            if (upgrades.has(id)) {
                buildingMultipliers[building] = (buildingMultipliers[building] || 1) * mult;
            }
        }

        if (upgrades.has("thousand-fingers")) buildingBonus += 0.1;
        if (upgrades.has("million-fingers")) buildingBonus += 0.2;
        if (upgrades.has("billion-fingers")) buildingBonus += 0.5;
        if (upgrades.has("trillion-fingers")) buildingBonus += 1.0;
        if (upgrades.has("cosmic-transcendence")) buildingBonus += 1.0;
        if (upgrades.has("quadrillion-fingers")) buildingBonus += 2.0;

        if (upgrades.has("grandma-steroids")) grandmaBonus += 0.5;
        if (upgrades.has("advanced-steroids")) steroidBonus *= 2;

        if (upgrades.has("reinforced-index")) { baseClick *= 2; percentCps += 0.01; }
        if (upgrades.has("carpal-tunnel-prevention")) { baseClick *= 2; percentCps += 0.01; }
        if (upgrades.has("ambidextrous")) { baseClick *= 2; percentCps += 0.01; }
        if (upgrades.has("titanium-fingers")) { baseClick *= 3; percentCps += 0.02; }
        if (upgrades.has("quantum-clicks")) { baseClick *= 5; percentCps += 0.03; }
        if (upgrades.has("laser-pointer")) { baseClick *= 5; percentCps += 0.05; }
        if (upgrades.has("cyber-fingers")) { baseClick *= 5; percentCps += 0.04; }
        if (upgrades.has("singularity-clicks")) { baseClick *= 5; percentCps += 0.05; }

        return {
            baseClick,
            percentCps,
            buildingBonus,
            grandmaBonus,
            steroidBonus,
            buildingMultipliers
        };
    }

    function computeClickerCps(clickerData) {
        if (!clickerData) return 0;
        if (typeof clickerData.cps === "number" && clickerData.cps > 0 && (!clickerData.buildings || Object.keys(clickerData.buildings).length === 0)) {
            return clickerData.cps;
        }
        const baseCpsMap = {
            cursor: 0.1,
            grandma: 1,
            farm: 8,
            steroids: 20,
            factory: 47,
            mine: 260,
            shipment: 1400,
            lab: 10000,
            portal: 65000,
            timemachine: 450000,
            antimatter: 3200000,
            prism: 24000000,
            chancemaker: 180000000,
            fractal: 1400000000,
            javascript: 11000000000,
            idleverse: 90000000000,
            cortex: 750000000000,
            quantum_server: 6500000000000,
            maturita_singularity: 55000000000000
        };
        const buildings = clickerData.buildings || {};
        const bonuses = computeClickerBonuses(clickerData.upgrades);
        const multipliers = clickerData.buildingMultipliers && Object.keys(clickerData.buildingMultipliers).length > 0
            ? clickerData.buildingMultipliers
            : bonuses.buildingMultipliers;
        const bBonus = typeof clickerData.buildingBonus === "number" && clickerData.buildingBonus > 0
            ? clickerData.buildingBonus
            : bonuses.buildingBonus;
        const gBonus = typeof clickerData.grandmaBonus === "number" && clickerData.grandmaBonus > 0
            ? clickerData.grandmaBonus
            : bonuses.grandmaBonus;
        const sBonus = typeof clickerData.steroidBonus === "number" && clickerData.steroidBonus > 1
            ? clickerData.steroidBonus
            : bonuses.steroidBonus;

        let totalCps = 0;
        for (const [id, baseCps] of Object.entries(baseCpsMap)) {
            const count = Number(buildings[id]) || 0;
            if (count <= 0) continue;
            const mult = Number(multipliers[id]) || 1;
            let cps = count * baseCps * (1 + bBonus) * mult;
            if (id === "grandma" && (Number(buildings.steroids) || 0) > 0) {
                cps *= (1 + gBonus);
            }
            if (id === "steroids") {
                cps *= sBonus;
            }
            totalCps += cps;
        }
        return totalCps;
    }

    function computeClickerClickPower(clickerData) {
        if (!clickerData) return 1;
        const bonuses = computeClickerBonuses(clickerData.upgrades);
        const cps = computeClickerCps(clickerData);
        const bonus = Math.round(cps * bonuses.percentCps);
        const computed = Math.max(1, bonuses.baseClick + bonus);
        const saved = typeof clickerData.clickPower === "number" ? clickerData.clickPower : 1;
        return Math.max(saved, computed);
    }

    function extractClickerStateFromSave(saveData, existingPlayTime = 0) {
        if (!saveData || typeof saveData !== "object") {
            return { ...DEFAULT_STATS.clicker, playTime: existingPlayTime };
        }
        const totalCookies = typeof saveData.totalCookies === "number" ? Math.max(0, saveData.totalCookies) : 0;
        const clicks = typeof saveData.clicks === "number" ? Math.max(0, saveData.clicks) : 0;
        const bonuses = computeClickerBonuses(saveData.upgrades);
        const totalClickedCookies = typeof saveData.totalClickedCookies === "number"
            ? Math.min(totalCookies, Math.max(0, saveData.totalClickedCookies))
            : Math.min(totalCookies, clicks * bonuses.baseClick);

        return {
            cookies: typeof saveData.cookies === "number" ? Math.max(0, saveData.cookies) : 0,
            totalCookies: totalCookies,
            clicks: clicks,
            totalClickedCookies: totalClickedCookies,
            clickPower: computeClickerClickPower(saveData),
            cps: computeClickerCps(saveData),
            clickCps: typeof saveData.clickCps === "number" ? Math.min(20, Math.max(0, saveData.clickCps)) : 0,
            peakClickCps: typeof saveData.peakClickCps === "number" ? Math.min(20, Math.max(0, saveData.peakClickCps)) : 0,
            buildings: saveData.buildings && typeof saveData.buildings === "object" ? { ...saveData.buildings } : {},
            upgrades: Array.isArray(saveData.upgrades) ? [...saveData.upgrades] : [],
            achievements: Array.isArray(saveData.achievements) ? [...saveData.achievements] : [],
            playTime: existingPlayTime || 0,
            lastSave: typeof saveData.lastSave === "number" ? saveData.lastSave : Date.now(),
            inactiveAccumulatedMs: typeof saveData.inactiveAccumulatedMs === "number" ? saveData.inactiveAccumulatedMs : 0
        };
    }

    function populateClickerFromStorage(clickerState) {
        if (typeof localStorage === "undefined") return;
        try {
            const rawSave = localStorage.getItem("cookieClickerSave");
            if (rawSave) {
                const s = JSON.parse(rawSave);
                if (s && typeof s === "object") {
                    const totalFromSave = Math.max(0, Number(s.totalCookies) || 0);
                    if (totalFromSave >= (clickerState.totalCookies || 0)) {
                        clickerState.cookies = typeof s.cookies === "number" ? Math.max(0, s.cookies) : clickerState.cookies;
                        clickerState.totalCookies = totalFromSave;
                        clickerState.clicks = Math.max(clickerState.clicks || 0, Number(s.clicks) || 0);
                        if (typeof s.totalClickedCookies === "number") {
                            clickerState.totalClickedCookies = Math.min(clickerState.totalCookies || 0, Math.max(0, s.totalClickedCookies));
                        } else if (typeof clickerState.totalClickedCookies !== "number") {
                            clickerState.totalClickedCookies = Math.min(clickerState.totalCookies || 0, (clickerState.clicks || 0) * (computeClickerBonuses(clickerState.upgrades).baseClick));
                        }
                        clickerState.clickPower = Math.max(clickerState.clickPower || 1, computeClickerClickPower(s));
                        clickerState.buildings = s.buildings && typeof s.buildings === "object" ? { ...s.buildings } : clickerState.buildings;
                        if (Array.isArray(s.upgrades)) {
                            clickerState.upgrades = Array.from(new Set([...clickerState.upgrades, ...s.upgrades]));
                        }
                        if (Array.isArray(s.achievements)) {
                            clickerState.achievements = Array.from(new Set([...clickerState.achievements, ...s.achievements]));
                        }
                        clickerState.cps = computeClickerCps(s);
                        clickerState.clickCps = typeof s.clickCps === "number" ? Math.min(20, Math.max(0, s.clickCps)) : (clickerState.clickCps || 0);
                        clickerState.peakClickCps = Math.min(20, Math.max(clickerState.peakClickCps || 0, Number(s.peakClickCps) || 0));
                        clickerState.lastSave = Math.max(clickerState.lastSave || 0, Number(s.lastSave) || 0);
                        clickerState.inactiveAccumulatedMs = typeof s.inactiveAccumulatedMs === "number" ? s.inactiveAccumulatedMs : (clickerState.inactiveAccumulatedMs || 0);
                    }
                }
            }
        } catch (e) {}
    }

    // -------------------------------------------------------------------------
    // ANTI-TAMPER INTEGRITY VERIFICATION (Sealed closure key & device salt)
    // -------------------------------------------------------------------------
    const INTEGRITY_PEPPER = "OPS_SEC_PEPPER_2026_KASINO_STATS_SIG";
    const AUTH_PEPPER = "OPS_SEC_AUTH_PEPPER_V2_KASINO_9021";
    const DEVICE_SALT_KEY = "ops_client_dev_id";
    let lastVerifiedTokens = null;
    let lastVerifiedTimestamp = Date.now();

    function getDeviceSalt() {
        let devId = null;
        try {
            if (typeof localStorage !== "undefined") {
                devId = localStorage.getItem(DEVICE_SALT_KEY);
                if (!devId) {
                    const bytes = new Uint8Array(16);
                    _secureRng.getRandomBytes(bytes);
                    devId = Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
                    localStorage.setItem(DEVICE_SALT_KEY, devId);
                }
            }
        } catch (e) {
            devId = "fallback_device_salt";
        }
        return devId || "fallback_device_salt";
    }

    function computeStateSignature(username, tokens, totalPulls, totalCookies, cookies, lastActive) {
        const salt = getDeviceSalt();
        const msg = [
            username || "",
            tokens,
            totalPulls,
            totalCookies,
            cookies,
            lastActive,
            salt,
            INTEGRITY_PEPPER
        ].join("::");

        let h1 = 0xdeadbeef ^ 0x12345678;
        let h2 = 0x41c64e6d ^ 0x87654321;
        let h3 = 0x9e3779b9 ^ 0xabcdef01;
        let h4 = 0x85ebca6b ^ 0x13579bdf;

        for (let i = 0; i < msg.length; i++) {
            const c = msg.charCodeAt(i);
            h1 = Math.imul(h1 ^ c, 0x85ebca6b);
            h1 = (h1 << 13) | (h1 >>> 19);
            h2 = Math.imul(h2 ^ (c * 31), 0xc2b2ae35);
            h2 = (h2 << 17) | (h2 >>> 15);
            h3 = Math.imul(h3 ^ (c * 17), 0x27d4eb2f);
            h3 = (h3 << 11) | (h3 >>> 21);
            h4 = Math.imul(h4 ^ (c * 53), 0x165667b1);
            h4 = (h4 << 19) | (h4 >>> 13);
        }

        h1 ^= h2 >>> 16; h1 = Math.imul(h1, 0x85ebca6b); h1 ^= h1 >>> 13;
        h2 ^= h3 >>> 16; h2 = Math.imul(h2, 0xc2b2ae35); h2 ^= h2 >>> 15;
        h3 ^= h4 >>> 16; h3 = Math.imul(h3, 0x27d4eb2f); h3 ^= h3 >>> 11;
        h4 ^= h1 >>> 16; h4 = Math.imul(h4, 0x165667b1); h4 ^= h4 >>> 17;

        return [(h1 >>> 0).toString(16).padStart(8, '0'),
                (h2 >>> 0).toString(16).padStart(8, '0'),
                (h3 >>> 0).toString(16).padStart(8, '0'),
                (h4 >>> 0).toString(16).padStart(8, '0')].join("");
    }

    function computeAuthBlind(saltHex, hashHex, updatedAt) {
        const msg = [saltHex, hashHex, updatedAt || 0, AUTH_PEPPER].join("::");
        let h1 = 0x6a09e667, h2 = 0xbb67ae85, h3 = 0x3c6ef372, h4 = 0xa54ff53a;
        for (let i = 0; i < msg.length; i++) {
            const c = msg.charCodeAt(i);
            h1 = Math.imul(h1 ^ c, 0x85ebca6b);
            h1 = (h1 << 13) | (h1 >>> 19);
            h2 = Math.imul(h2 ^ (c * 31), 0xc2b2ae35);
            h2 = (h2 << 17) | (h2 >>> 15);
            h3 = Math.imul(h3 ^ (c * 17), 0x27d4eb2f);
            h3 = (h3 << 11) | (h3 >>> 21);
            h4 = Math.imul(h4 ^ (c * 53), 0x165667b1);
            h4 = (h4 << 19) | (h4 >>> 13);
        }
        return [(h1 >>> 0).toString(16).padStart(8, '0'),
                (h2 >>> 0).toString(16).padStart(8, '0'),
                (h3 >>> 0).toString(16).padStart(8, '0'),
                (h4 >>> 0).toString(16).padStart(8, '0')].join("");
    }

    function secureAuthForCloud(auth) {
        if (!auth || typeof auth !== "object") return null;
        if (auth.blinded && auth.verifier) return auth;
        const salt = String(auth.salt || "");
        const hash = String(auth.hash || "");
        const updatedAt = auth.updatedAt || Date.now();
        const verifier = computeAuthBlind(salt, hash, updatedAt);
        return {
            blinded: true,
            salt: salt,
            verifier: verifier,
            updatedAt: updatedAt
        };
    }

    // -------------------------------------------------------------------------
    // LOCAL STORAGE HELPERS
    // -------------------------------------------------------------------------
    function loadLocalStats() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_STATS);
            if (!raw) {
                const def = JSON.parse(JSON.stringify(DEFAULT_STATS));
                populateClickerFromStorage(def.clicker);
                lastVerifiedTokens = def.gacha.tokens;
                return def;
            }
            const parsed = JSON.parse(raw);
            const clickerParsed = parsed.clicker || {};
            const clickerState = {
                ...DEFAULT_STATS.clicker,
                ...clickerParsed,
                clickCps: typeof clickerParsed.clickCps === "number" ? Math.min(20, Math.max(0, clickerParsed.clickCps)) : 0,
                peakClickCps: typeof clickerParsed.peakClickCps === "number" ? Math.min(20, Math.max(0, clickerParsed.peakClickCps)) : 0,
                buildings: { ...(clickerParsed.buildings || {}) },
                upgrades: Array.isArray(clickerParsed.upgrades) ? [...clickerParsed.upgrades] : [],
                achievements: Array.isArray(clickerParsed.achievements) ? [...clickerParsed.achievements] : []
            };

            clickerState.cookies = Math.max(0, Number(clickerState.cookies) || 0);
            clickerState.totalCookies = Math.max(0, Number(clickerState.totalCookies) || 0);
            clickerState.totalClickedCookies = Math.max(0, Number(clickerState.totalClickedCookies) || 0);

            const gachaParsed = parsed.gacha || {};
            const cleanInventory = { ...(gachaParsed.inventory || {}) };

            const u = localStorage.getItem(STORAGE_KEY_USER) || "";
            let tokensCandidate = Number(gachaParsed.tokens);
            if (!Number.isFinite(tokensCandidate) || tokensCandidate < 0) {
                tokensCandidate = DEFAULT_STATS.gacha.tokens;
            }
            tokensCandidate = Math.max(0, Math.floor(tokensCandidate));

            // Verify state integrity signature
            const expectedSig = computeStateSignature(
                u,
                tokensCandidate,
                gachaParsed.totalPulls || 0,
                clickerState.totalCookies || 0,
                clickerState.cookies || 0,
                parsed.meta?.lastActive || 0
            );
            if (parsed._sig) {
                if (parsed._sig !== expectedSig) {
                    console.warn("[OPS Security] Neplatny podpis stavu v localStorage! Resetuji tokeny na vychozi hodnotu.");
                    tokensCandidate = DEFAULT_STATS.gacha.tokens;
                }
            } else if (raw && tokensCandidate !== DEFAULT_STATS.gacha.tokens) {
                console.warn("[OPS Security] Chybejici podpis stavu v localStorage! Resetuji tokeny na vychozi hodnotu.");
                tokensCandidate = DEFAULT_STATS.gacha.tokens;
            }

            lastVerifiedTokens = tokensCandidate;
            lastVerifiedTimestamp = Date.now();

            return {
                gd: { ...DEFAULT_STATS.gd, ...(parsed.gd || {}) },
                stratagem: { ...DEFAULT_STATS.stratagem, ...(parsed.stratagem || {}) },
                hyperdrive: { ...DEFAULT_STATS.hyperdrive, ...(parsed.hyperdrive || {}) },
                mc: { ...DEFAULT_STATS.mc, ...(parsed.mc || {}) },
                maturita: { ...DEFAULT_STATS.maturita, ...(parsed.maturita || {}) },
                runner404: { ...DEFAULT_STATS.runner404, ...(parsed.runner404 || {}) },
                clicker: clickerState,
                gacha: {
                    tokens: tokensCandidate,
                    zPity: gachaParsed.zPity ?? 0,
                    sPity: gachaParsed.sPity ?? 0,
                    aPity: gachaParsed.aPity ?? 0,
                    guaranteed: gachaParsed.guaranteed ?? false,
                    totalPulls: gachaParsed.totalPulls || 0,
                    inventory: cleanInventory
                },
                meta: { ...DEFAULT_STATS.meta, ...(parsed.meta || {}) },
                auth: parsed.auth || null
            };
        } catch (e) {
            console.warn("[OPS Stats] Chyba pri cteni localStorage:", e);
            const def = JSON.parse(JSON.stringify(DEFAULT_STATS));
            populateClickerFromStorage(def.clicker);
            lastVerifiedTokens = def.gacha.tokens;
            return def;
        }
    }

    function saveLocalStats(stats, allowLargeJump = false) {
        try {
            if (stats.gacha && stats.gacha.history) {
                delete stats.gacha.history;
            }
            if (stats.auth && stats.auth.hash) {
                stats.auth = secureAuthForCloud(stats.auth);
            }
            if (stats.clicker) {
                stats.clicker.cookies = Math.max(0, Number(stats.clicker.cookies) || 0);
                stats.clicker.totalCookies = Math.max(0, Number(stats.clicker.totalCookies) || 0);
                stats.clicker.totalClickedCookies = Math.max(0, Number(stats.clicker.totalClickedCookies) || 0);
            }

            const prev = (lastVerifiedTokens !== null) ? lastVerifiedTokens : DEFAULT_STATS.gacha.tokens;
            let cand = Number(stats.gacha?.tokens);
            if (!Number.isFinite(cand) || cand < 0) cand = prev;
            cand = Math.max(0, Math.floor(cand));

            stats.gacha = stats.gacha || {};
            stats.gacha.tokens = cand;
            lastVerifiedTokens = cand;
            lastVerifiedTimestamp = Date.now();

            stats.meta = stats.meta || {};
            stats.meta.lastActive = lastVerifiedTimestamp;

            const u = localStorage.getItem(STORAGE_KEY_USER) || "";
            stats._sig = computeStateSignature(
                u,
                cand,
                stats.gacha.totalPulls || 0,
                stats.clicker?.totalCookies || 0,
                stats.clicker?.cookies || 0,
                stats.meta.lastActive
            );

            localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
        } catch (e) {
            console.warn("[OPS Stats] Chyba pri zapisu do localStorage:", e);
        }
    }

    // -------------------------------------------------------------------------
    // PASSWORD HASHING & AUTHENTICATION (Web Crypto API: SHA-256 with Salt)
    // -------------------------------------------------------------------------
    const cachedAuthData = {};

    async function hashPassword(password, saltHex) {
        if (!saltHex) {
            const saltBytes = new Uint8Array(16);
            _secureRng.getRandomBytes(saltBytes);
            saltHex = Array.from(saltBytes).map(b => b.toString(16).padStart(2, '0')).join('');
        }

        const subtle = (typeof window !== "undefined" && window.crypto && window.crypto.subtle)
            ? window.crypto.subtle
            : (typeof crypto !== "undefined" && crypto.subtle ? crypto.subtle : null);

        if (!subtle) {
            throw new Error("Web Crypto API neni podporovano v tomto prostredi.");
        }

        const encoder = new TextEncoder();
        const data = encoder.encode(saltHex + ":" + password);
        const hashBuffer = await subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        return {
            salt: saltHex,
            hash: hashHex,
            updatedAt: Date.now()
        };
    }

    async function verifyPassword(password, saltHex, expectedAuth) {
        if (typeof password !== "string" || password.length === 0) return false;
        if (typeof saltHex !== "string" || !expectedAuth) return false;
        try {
            const result = await hashPassword(password, saltHex);
            if (typeof expectedAuth === "string") {
                return result.hash === expectedAuth;
            }
            if (typeof expectedAuth === "object") {
                if (expectedAuth.verifier) {
                    const expectedBlind = computeAuthBlind(saltHex, result.hash, expectedAuth.updatedAt || 0);
                    return expectedBlind === expectedAuth.verifier;
                }
                if (expectedAuth.hash) {
                    return result.hash === expectedAuth.hash;
                }
            }
            return false;
        } catch (e) {
            console.warn("[OPS Auth] Chyba pri overovani hesla:", e);
            return false;
        }
    }

    function isAuthenticated(user) {
        const u = user || (typeof OPS_STATS !== "undefined" && OPS_STATS.getUsername ? OPS_STATS.getUsername() : (typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY_USER) : ""));
        if (!u) return false;
        if (isGuestUsername(u)) return true;
        try {
            if (typeof sessionStorage === "undefined") return false;
            return sessionStorage.getItem(SESSION_KEY_AUTH) === u;
        } catch (e) {
            return false;
        }
    }

    function setSessionAuthenticated(username) {
        try {
            if (typeof sessionStorage !== "undefined") {
                sessionStorage.setItem(SESSION_KEY_AUTH, username);
            }
        } catch (e) {}
    }

    function clearSessionAuthenticated() {
        try {
            if (typeof sessionStorage !== "undefined") {
                sessionStorage.removeItem(SESSION_KEY_AUTH);
            }
        } catch (e) {}
    }

    async function fetchUserAuthFromCloud(username) {
        if (!username || !isSupabaseConfigured() || isGuestUsername(username)) {
            return { exists: false, hasPassword: false, auth: null, stats: null, error: false };
        }
        try {
            const endpoint = `${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.table}?username=eq.${encodeURIComponent(username)}&select=username,stats`;
            const fetchFn = _nativeFetch || fetch;
            const res = await fetchFn(endpoint, {
                method: "GET",
                headers: getSupabaseHeaders()
            });
            if (!res.ok) {
                console.warn("[OPS Auth] Nepodarilo se ziskat ucet ze serveru:", res.status);
                return { exists: null, hasPassword: false, auth: null, stats: null, error: true };
            }
            const rows = await res.json();
            if (!rows || rows.length === 0) {
                return { exists: false, hasPassword: false, auth: null, stats: null, error: false };
            }
            const row = rows[0];
            const stats = (typeof row.stats === "string") ? JSON.parse(row.stats || "{}") : (row.stats || {});
            const auth = stats.auth || null;
            const hasPassword = !!(auth && typeof auth.salt === "string" && (typeof auth.hash === "string" || typeof auth.verifier === "string"));
            return { exists: true, hasPassword, auth, stats, error: false };
        } catch (err) {
            console.warn("[OPS Auth] Sitova chyba pri ziskavani uzivatele:", err);
            return { exists: null, hasPassword: false, auth: null, stats: null, error: true };
        }
    }

    // -------------------------------------------------------------------------
    // CLOUD SYNC (SUPABASE)
    // -------------------------------------------------------------------------
    let isSyncingFromCloud = false;
    let isReloadingForCloud = false;
    let isExchangingCookies = false;
    let syncCloudDebounceTimer = null;

    function updateCloudSyncBadge(state, customText) {
        const badge = document.getElementById("opsCloudSyncBadge");
        if (!badge) return;

        let dotColor = "#94a3b8";
        let defaultText = "Cloud: Neaktivni";
        let titleText = "";

        if (state === "syncing") {
            dotColor = "#38bdf8";
            defaultText = "Cloud: Ukladam...";
            titleText = "Prebiha ukladani dat na Supabase server";
        } else if (state === "synced") {
            dotColor = "#34d399";
            defaultText = "Cloud: Ulozeno";
            titleText = "Data jsou uspesne synchronizovana se Supabase";
        } else if (state === "offline") {
            dotColor = "#fbbf24";
            defaultText = "Cloud: Pouze lokalne";
            titleText = "Hrajete bez prihlaseni nebo offline, data se ukladaji do prohlizece";
        } else if (state === "error") {
            dotColor = "#f87171";
            defaultText = "Cloud: Chyba spojeni";
            titleText = "Nepodarilo se spojit se Supabase serverem";
        }

        const text = customText || defaultText;
        badge.innerHTML = `<span class="ops-cloud-sync-dot" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${dotColor};"></span> <span class="ops-cloud-sync-text">${text}</span>`;
        if (titleText) badge.title = titleText;
    }

    let isSyncingToCloud = false;
    async function syncToCloud() {
        if (isSyncingToCloud) return;
        const username = OPS_STATS.getUsername();
        if (!username || !isSupabaseConfigured() || isGuestUsername(username)) {
            updateCloudSyncBadge("offline");
            return;
        }
        if (!isAuthenticated(username)) {
            updateCloudSyncBadge("offline", "Cloud: Neoveren");
            return;
        }

        isSyncingToCloud = true;
        updateCloudSyncBadge("syncing", "Cloud: Ukladam...");
        const stats = loadLocalStats();
        if (stats.gacha && stats.gacha.history) delete stats.gacha.history;
        if (!stats.auth && cachedAuthData[username]) {
            stats.auth = cachedAuthData[username];
        }

        const statsToUpload = JSON.parse(JSON.stringify(stats));
        if (statsToUpload.auth) {
            statsToUpload.auth = secureAuthForCloud(statsToUpload.auth);
        }
        delete statsToUpload._sig;

        const payload = {
            username: username,
            updated_at: new Date().toISOString(),
            gd_completed_levels: stats.gd?.completedLevels?.length || 0,
            gd_total_jumps: stats.gd?.jumps || 0,
            stratagem_highscore: stats.stratagem?.highScore || 0,
            total_play_time: Math.floor(stats.meta?.totalPlayTime || 0),
            stats: statsToUpload
        };

        try {
            const endpoint = `${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.table}`;
            const fetchFn = _nativeFetch || fetch;
            const res = await fetchFn(endpoint, {
                method: "POST",
                headers: {
                    ...getSupabaseHeaders(),
                    "Prefer": "resolution=merge-duplicates"
                },
                body: JSON.stringify(payload),
                keepalive: true
            });
            if (!res.ok) {
                const errText = await res.text();
                console.warn("[OPS Stats Cloud] Upsert selhal:", res.status, errText);
                updateCloudSyncBadge("error");
            } else {
                updateCloudSyncBadge("synced");
            }
        } catch (err) {
            console.warn("[OPS Stats Cloud] Sitova chyba pri syncToCloud:", err);
            updateCloudSyncBadge("error");
        } finally {
            isSyncingToCloud = false;
        }
    }

    async function syncFromCloud(username) {
        if (!username || !isSupabaseConfigured() || isGuestUsername(username)) {
            updateCloudSyncBadge("offline");
            return null;
        }
        if (!isAuthenticated(username)) {
            updateCloudSyncBadge("offline", "Cloud: Neoveren");
            return null;
        }

        updateCloudSyncBadge("syncing", "Cloud: Nacitam...");
        try {
            const endpoint = `${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.table}?username=eq.${encodeURIComponent(username)}&select=*`;
            const fetchFn = _nativeFetch || fetch;
            const res = await fetchFn(endpoint, {
                method: "GET",
                headers: getSupabaseHeaders()
            });
            if (!res.ok) {
                updateCloudSyncBadge("error");
                return null;
            }
            const rows = await res.json();
            if (rows && rows.length > 0 && rows[0].stats) {
                const cloudStats = (typeof rows[0].stats === "string") ? JSON.parse(rows[0].stats || "{}") : rows[0].stats;
                if (cloudStats.gacha && cloudStats.gacha.history) delete cloudStats.gacha.history;

                const local = loadLocalStats();

                let mergedClicker = { ...local.clicker };
                if (cloudStats.clicker) {
                    isSyncingFromCloud = true;
                    try {
                        const cloudClicker = cloudStats.clicker;
                        const localClicker = local.clicker || DEFAULT_STATS.clicker;

                        let localRawSave = null;
                        try {
                            const raw = localStorage.getItem("cookieClickerSave");
                            if (raw) localRawSave = JSON.parse(raw);
                        } catch (e) {}

                        const localEffective = localRawSave ? extractClickerStateFromSave(localRawSave, localClicker.playTime) : localClicker;

                        const cloudTotal = Number(cloudClicker.totalCookies) || 0;
                        const localTotal = Number(localEffective.totalCookies) || 0;
                        const cloudLastSave = Number(cloudClicker.lastSave) || 0;
                        const localLastSave = Number(localEffective.lastSave) || 0;

                        const preferCloud = (cloudTotal > localTotal) || (cloudTotal === localTotal && cloudLastSave >= localLastSave);
                        const baseSource = preferCloud ? cloudClicker : (localRawSave || localEffective);

                        const allBuildingKeys = new Set([
                            ...Object.keys(localEffective.buildings || {}),
                            ...Object.keys(cloudClicker.buildings || {})
                        ]);
                        const mergedBuildings = {};
                        for (const key of allBuildingKeys) {
                            mergedBuildings[key] = Math.max(
                                Number(localEffective.buildings?.[key]) || 0,
                                Number(cloudClicker.buildings?.[key]) || 0
                            );
                        }

                        const mergedUpgrades = Array.from(new Set([
                            ...(localEffective.upgrades || []),
                            ...(cloudClicker.upgrades || [])
                        ]));
                        const mergedAchievements = Array.from(new Set([
                            ...(localEffective.achievements || []),
                            ...(cloudClicker.achievements || [])
                        ]));

                        const higherTotalCookies = Math.max(localTotal, cloudTotal);
                        const newerLastSave = Math.max(localLastSave, cloudLastSave, Date.now());
                        const higherClicks = Math.max(Number(localEffective.clicks) || 0, Number(cloudClicker.clicks) || 0);
                        const higherPlayTime = Math.max(Number(localEffective.playTime) || 0, Number(cloudClicker.playTime) || 0);
                        const higherTotalClicked = Math.min(
                            higherTotalCookies,
                            Math.max(
                                Number(localEffective.totalClickedCookies) || 0,
                                Number(cloudClicker.totalClickedCookies) || 0,
                                Number(localRawSave?.totalClickedCookies) || 0
                            )
                        );
                        const mergedBonuses = computeClickerBonuses(mergedUpgrades);
                        const higherClickPower = Math.max(
                            Number(localEffective.clickPower) || 1,
                            Number(cloudClicker.clickPower) || 1,
                            computeClickerClickPower(localEffective),
                            computeClickerClickPower(cloudClicker),
                            computeClickerClickPower({ buildings: mergedBuildings, upgrades: mergedUpgrades })
                        );
                        const higherPeakClickCps = Math.min(20, Math.max(Number(localEffective.peakClickCps) || 0, Number(cloudClicker.peakClickCps) || 0));
                        const spendableCookies = preferCloud
                            ? (typeof cloudClicker.cookies === "number" ? cloudClicker.cookies : localEffective.cookies)
                            : (typeof localEffective.cookies === "number" ? localEffective.cookies : cloudClicker.cookies);

                        const mergedSaveObj = {
                            cookies: Math.max(0, Number(spendableCookies) || 0),
                            totalCookies: higherTotalCookies,
                            clicks: higherClicks,
                            totalClickedCookies: higherTotalClicked,
                            buildings: mergedBuildings,
                            upgrades: mergedUpgrades,
                            achievements: mergedAchievements,
                            clickPower: higherClickPower,
                            cps: computeClickerCps({ buildings: mergedBuildings, upgrades: mergedUpgrades, buildingMultipliers: mergedBonuses.buildingMultipliers }),
                            buildingBonus: mergedBonuses.buildingBonus,
                            grandmaBonus: mergedBonuses.grandmaBonus,
                            steroidBonus: mergedBonuses.steroidBonus,
                            buildingMultipliers: mergedBonuses.buildingMultipliers,
                            startTime: baseSource.startTime || Date.now(),
                            lastCursorClick: baseSource.lastCursorClick || Date.now(),
                            inactiveAccumulatedMs: typeof baseSource.inactiveAccumulatedMs === "number" ? baseSource.inactiveAccumulatedMs : 0,
                            peakClickCps: higherPeakClickCps,
                            lastSave: newerLastSave
                        };

                        try {
                            localStorage.setItem("cookieClickerSave", JSON.stringify(mergedSaveObj));
                        } catch (e) {
                            console.warn("[OPS Stats] Nelze zapsat cookieClickerSave:", e);
                        }

                        mergedClicker = {
                            cookies: mergedSaveObj.cookies,
                            totalCookies: mergedSaveObj.totalCookies,
                            clicks: mergedSaveObj.clicks,
                            totalClickedCookies: mergedSaveObj.totalClickedCookies,
                            clickPower: mergedSaveObj.clickPower,
                            cps: computeClickerCps(mergedSaveObj),
                            clickCps: Math.min(20, localEffective.clickCps || 0),
                            peakClickCps: higherPeakClickCps,
                            buildings: mergedSaveObj.buildings,
                            upgrades: mergedSaveObj.upgrades,
                            achievements: mergedSaveObj.achievements,
                            playTime: higherPlayTime,
                            inactiveAccumulatedMs: mergedSaveObj.inactiveAccumulatedMs,
                            lastSave: mergedSaveObj.lastSave
                        };

                        if (window.location.pathname.includes("/clicker/") && preferCloud && cloudTotal > localTotal) {
                            isReloadingForCloud = true;
                            setTimeout(() => {
                                window.location.reload();
                            }, 50);
                        }
                    } finally {
                        isSyncingFromCloud = false;
                    }
                }

                // Gacha inventář merge
                const keys = new Set([...Object.keys(local.gacha?.inventory || {}), ...Object.keys(cloudStats.gacha?.inventory || {})]);
                const mergedGachaInventory = {};
                for (const k of keys) {
                    mergedGachaInventory[k] = Math.max(local.gacha?.inventory?.[k] || 0, cloudStats.gacha?.inventory?.[k] || 0);
                }
                const mergedTotalPulls = Math.max(local.gacha?.totalPulls || 0, cloudStats.gacha?.totalPulls || 0);

                const merged = {
                    gd: {
                        attempts: Math.max(local.gd.attempts, cloudStats.gd?.attempts || 0),
                        jumps: Math.max(local.gd.jumps, cloudStats.gd?.jumps || 0),
                        playTime: Math.max(local.gd.playTime, cloudStats.gd?.playTime || 0),
                        completedLevels: Array.from(new Set([...(local.gd.completedLevels || []), ...(cloudStats.gd?.completedLevels || [])])),
                        bestPercent: { ...(cloudStats.gd?.bestPercent || {}), ...(local.gd.bestPercent || {}) }
                    },
                    stratagem: {
                        highScore: Math.max(local.stratagem.highScore, cloudStats.stratagem?.highScore || 0),
                        totalGames: Math.max(local.stratagem.totalGames, cloudStats.stratagem?.totalGames || 0),
                        totalSequences: Math.max(local.stratagem.totalSequences, cloudStats.stratagem?.totalSequences || 0),
                        playTime: Math.max(local.stratagem.playTime, cloudStats.stratagem?.playTime || 0)
                    },
                    hyperdrive: {
                        sessions: Math.max(local.hyperdrive.sessions, cloudStats.hyperdrive?.sessions || 0),
                        playTime: Math.max(local.hyperdrive.playTime, cloudStats.hyperdrive?.playTime || 0)
                    },
                    mc: {
                        sessions: Math.max(local.mc.sessions, cloudStats.mc?.sessions || 0),
                        playTime: Math.max(local.mc.playTime, cloudStats.mc?.playTime || 0),
                        lastBackup: Math.max(local.mc?.lastBackup || 0, cloudStats.mc?.lastBackup || 0),
                        backupFilesCount: Math.max(local.mc?.backupFilesCount || 0, cloudStats.mc?.backupFilesCount || 0),
                        backupSizeBytes: Math.max(local.mc?.backupSizeBytes || 0, cloudStats.mc?.backupSizeBytes || 0)
                    },
                    maturita: {
                        highScore: Math.max(local.maturita?.highScore || 0, cloudStats.maturita?.highScore || 0),
                        bestDistance: Math.max(local.maturita?.bestDistance || 0, cloudStats.maturita?.bestDistance || 0),
                        totalGames: Math.max(local.maturita?.totalGames || 0, cloudStats.maturita?.totalGames || 0),
                        playTime: Math.max(local.maturita?.playTime || 0, cloudStats.maturita?.playTime || 0)
                    },
                    runner404: {
                        hunterHighScore: Math.max(local.runner404.hunterHighScore, cloudStats.runner404?.hunterHighScore || 0),
                        runnerHighScore: Math.max(local.runner404.runnerHighScore, cloudStats.runner404?.runnerHighScore || 0),
                        playTime: Math.max(local.runner404.playTime, cloudStats.runner404?.playTime || 0)
                    },
                    clicker: mergedClicker,
                    gacha: (() => {
                        const localTok = Number.isFinite(local.gacha?.tokens) ? local.gacha.tokens : 2000;
                        const cloudTok = Number.isFinite(cloudStats.gacha?.tokens) ? cloudStats.gacha.tokens : 2000;
                        const localTime = Number(local.meta?.lastActive) || 0;
                        const cloudTime = Number(cloudStats.meta?.lastActive) || (rows[0].updated_at ? new Date(rows[0].updated_at).getTime() : 0);
                        const localHasActivity = localTime > 0 && ((local.meta?.totalPlayTime || 0) > 0 || (local.gacha?.totalPulls || 0) > 0 || (local.clicker?.clicks || 0) > 0);
                        const resolvedTok = (!localHasActivity || cloudTime > localTime) ? cloudTok : localTok;
                        const safeTok = Math.max(0, Math.floor(resolvedTok));
                        return {
                            tokens: safeTok,
                            zPity: Math.max(local.gacha?.zPity ?? 0, cloudStats.gacha?.zPity ?? 0),
                            sPity: Math.max(local.gacha?.sPity ?? 0, cloudStats.gacha?.sPity ?? 0),
                            aPity: Math.max(local.gacha?.aPity ?? 0, cloudStats.gacha?.aPity ?? 0),
                            guaranteed: local.gacha?.guaranteed ?? cloudStats.gacha?.guaranteed ?? false,
                            totalPulls: mergedTotalPulls,
                            inventory: mergedGachaInventory
                        };
                    })(),
                    meta: {
                        totalPlayTime: Math.max(local.meta.totalPlayTime, cloudStats.meta?.totalPlayTime || 0),
                        lastPlayedGame: cloudStats.meta?.lastPlayedGame || local.meta.lastPlayedGame,
                        lastActive: Date.now()
                    },
                    auth: (() => {
                        const localAuth = local.auth;
                        const cloudAuth = cloudStats.auth || null;
                        if (localAuth && (localAuth.hash || (localAuth.blinded && localAuth.verifier))) {
                            if (!cloudAuth) return localAuth;
                            if ((localAuth.updatedAt || 0) >= (cloudAuth.updatedAt || 0)) return localAuth;
                            return cloudAuth;
                        }
                        return cloudAuth || cachedAuthData[username] || null;
                    })()
                };

                saveLocalStats(merged, true);
                updateCloudSyncBadge("synced");
                try {
                    if (typeof window !== "undefined" && window.dispatchEvent) {
                        window.dispatchEvent(new CustomEvent("ops:stats-updated", { detail: merged }));
                        window.dispatchEvent(new CustomEvent("ops:tokens-changed", { detail: { tokens: merged.gacha?.tokens } }));
                    }
                } catch (e) {}
                return merged;
            } else {
                updateCloudSyncBadge("synced");
            }
        } catch (e) {
            console.warn("[OPS Stats Cloud] Chyba pri syncFromCloud:", e);
            updateCloudSyncBadge("error");
        }
        return null;
    }

    // -------------------------------------------------------------------------
    // MINECRAFT STORAGE & BACKUP HELPERS
    // -------------------------------------------------------------------------
    function getSafeUsername(username) {
        const raw = (username || "").trim();
        if (!raw) return "Guest";
        return raw.replace(/[^a-zA-Z0-9_\-\.]/g, "_");
    }

    function getMinecraftStorageNames(username) {
        const safe = getSafeUsername(username);
        return {
            user: safe,
            db1_12: "worlds_1_12_" + safe,
            db1_8: "worlds_1_8_" + safe,
            lsPrefix1_12: "_eaglercraft_1.12_" + safe
        };
    }

    function binaryToBase64(data) {
        if (!data) return "";
        let u8;
        if (data instanceof Uint8Array) {
            u8 = data;
        } else if (data instanceof ArrayBuffer) {
            u8 = new Uint8Array(data);
        } else if (ArrayBuffer.isView(data)) {
            u8 = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        } else if (typeof data === "string") {
            try {
                return btoa(data);
            } catch (e) {
                return "";
            }
        } else {
            return "";
        }
        let binary = "";
        const len = u8.byteLength;
        const chunkSize = 32768;
        for (let i = 0; i < len; i += chunkSize) {
            const sub = u8.subarray(i, Math.min(i + chunkSize, len));
            binary += String.fromCharCode.apply(null, sub);
        }
        return btoa(binary);
    }

    function base64ToBinary(b64) {
        if (!b64 || typeof b64 !== "string") return new Uint8Array(0);
        try {
            const binary = atob(b64);
            const len = binary.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            return bytes;
        } catch (e) {
            console.warn("[OPS Minecraft] Chyba při dekódování Base64:", e);
            return new Uint8Array(0);
        }
    }

    function readDatabaseRecords(dbName) {
        return new Promise((resolve) => {
            if (typeof indexedDB === "undefined") return resolve([]);
            let req;
            try {
                req = indexedDB.open(dbName);
            } catch (e) {
                return resolve([]);
            }
            req.onupgradeneeded = function(e) {
                const db = e.target.result;
                if (!db.objectStoreNames.contains("filesystem")) {
                    db.createObjectStore("filesystem", { keyPath: "path" });
                }
            };
            req.onsuccess = function(e) {
                const db = e.target.result;
                if (!db.objectStoreNames.contains("filesystem")) {
                    db.close();
                    return resolve([]);
                }
                try {
                    const tx = db.transaction("filesystem", "readonly");
                    const store = tx.objectStore("filesystem");
                    const getReq = store.getAll();
                    getReq.onsuccess = function() {
                        const result = getReq.result || [];
                        db.close();
                        resolve(result);
                    };
                    getReq.onerror = function() {
                        db.close();
                        resolve([]);
                    };
                } catch (err) {
                    db.close();
                    resolve([]);
                }
            };
            req.onerror = function() {
                resolve([]);
            };
        });
    }

    function writeDatabaseRecords(dbName, records) {
        return new Promise((resolve) => {
            if (typeof indexedDB === "undefined" || !Array.isArray(records)) return resolve(false);
            let req;
            try {
                req = indexedDB.open(dbName);
            } catch (e) {
                return resolve(false);
            }
            req.onupgradeneeded = function(e) {
                const db = e.target.result;
                if (!db.objectStoreNames.contains("filesystem")) {
                    db.createObjectStore("filesystem", { keyPath: "path" });
                }
            };
            req.onsuccess = function(e) {
                const db = e.target.result;
                if (!db.objectStoreNames.contains("filesystem")) {
                    db.close();
                    return resolve(false);
                }
                try {
                    const tx = db.transaction("filesystem", "readwrite");
                    const store = tx.objectStore("filesystem");
                    store.clear();
                    for (let i = 0; i < records.length; i++) {
                        const rec = records[i];
                        if (rec && rec.path) {
                            store.put({ path: rec.path, data: rec.data });
                        }
                    }
                    tx.oncomplete = function() {
                        db.close();
                        resolve(true);
                    };
                    tx.onerror = function() {
                        db.close();
                        resolve(false);
                    };
                } catch (err) {
                    db.close();
                    resolve(false);
                }
            };
            req.onerror = function() {
                resolve(false);
            };
        });
    }

    function openBackupsDatabase() {
        return new Promise((resolve, reject) => {
            if (typeof indexedDB === "undefined") return reject(new Error("IndexedDB není podporováno"));
            const req = indexedDB.open("ops_minecraft_backups", 1);
            req.onupgradeneeded = function(e) {
                const db = e.target.result;
                if (!db.objectStoreNames.contains("backups")) {
                    db.createObjectStore("backups", { keyPath: "id" });
                }
            };
            req.onsuccess = function(e) { resolve(e.target.result); };
            req.onerror = function(e) { reject(e.target.error || new Error("Nelze otevřít ops_minecraft_backups")); };
        });
    }

    async function saveBackupToStore(backupObj) {
        try {
            const db = await openBackupsDatabase();
            return await new Promise((resolve, reject) => {
                const tx = db.transaction("backups", "readwrite");
                const store = tx.objectStore("backups");
                store.put(backupObj);
                tx.oncomplete = function() {
                    db.close();
                    resolve(true);
                };
                tx.onerror = function(e) {
                    db.close();
                    reject(e.target.error);
                };
            });
        } catch (err) {
            console.warn("[OPS Minecraft] Uložení zálohy do IndexedDB selhalo:", err);
            return false;
        }
    }

    async function getBackupFromStore(id) {
        try {
            const db = await openBackupsDatabase();
            return await new Promise((resolve, reject) => {
                const tx = db.transaction("backups", "readonly");
                const store = tx.objectStore("backups");
                const req = store.get(id);
                req.onsuccess = function() {
                    const res = req.result;
                    db.close();
                    resolve(res || null);
                };
                req.onerror = function(e) {
                    db.close();
                    reject(e.target.error);
                };
            });
        } catch (err) {
            return null;
        }
    }

    async function prepareMinecraftStorage(targetDB, username) {
        const safeUser = getSafeUsername(username);
        const existing = await readDatabaseRecords(targetDB);
        if (existing && existing.length > 0) {
            return { migrated: false, count: existing.length };
        }

        if (targetDB !== "worlds") {
            const legacyRecords = await readDatabaseRecords("worlds");
            if (legacyRecords && legacyRecords.length > 0) {
                console.log("[OPS Minecraft] Nalezena existující data ve 'worlds'. Migruji do " + targetDB + "...");
                await writeDatabaseRecords(targetDB, legacyRecords);

                const userLsPrefix = "_eaglercraft_1.12_" + safeUser;
                for (let i = 0; i < localStorage.length; i++) {
                    const k = localStorage.key(i);
                    if (k && k.startsWith("_eaglercraft_1.12.") && !k.startsWith(userLsPrefix)) {
                        const suffix = k.slice("_eaglercraft_1.12".length);
                        const newKey = userLsPrefix + suffix;
                        if (!localStorage.getItem(newKey)) {
                            localStorage.setItem(newKey, localStorage.getItem(k));
                        }
                    }
                }
                return { migrated: true, source: "legacy_worlds", count: legacyRecords.length };
            }
        }

        const backup = await getBackupFromStore(safeUser + "_latest");
        if (backup) {
            const records = targetDB.includes("1_8") ? backup.worlds_1_8 : backup.worlds_1_12;
            if (records && records.length > 0) {
                console.log("[OPS Minecraft] Obnovuji z interní zálohy do " + targetDB + "...");
                const cleanRecords = records.map(r => ({
                    path: r.path,
                    data: (typeof r.data === "string") ? base64ToBinary(r.data) : r.data
                }));
                await writeDatabaseRecords(targetDB, cleanRecords);
                return { migrated: true, source: "backup", count: cleanRecords.length };
            }
        }

        return { migrated: false, count: 0 };
    }

    async function backupMinecraft(username, type = "auto") {
        const targetUser = username || OPS_STATS.getUsername();
        const safeUser = getSafeUsername(targetUser);
        const db1_12 = "worlds_1_12_" + safeUser;
        const db1_8 = "worlds_1_8_" + safeUser;

        let recs1_12 = await readDatabaseRecords(db1_12);
        let recs1_8 = await readDatabaseRecords(db1_8);

        if (recs1_12.length === 0) {
            const legacy = await readDatabaseRecords("worlds");
            if (legacy.length > 0) recs1_12 = legacy;
        }

        const lsData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (!k) continue;
            if (k.startsWith("_eaglercraft") || k.includes(safeUser)) {
                lsData[k] = localStorage.getItem(k);
            }
        }

        let totalBytes = 0;
        const calcBytes = (items) => {
            for (let i = 0; i < items.length; i++) {
                const d = items[i].data;
                if (!d) continue;
                if (d.byteLength) totalBytes += d.byteLength;
                else if (typeof d === "string") totalBytes += d.length;
            }
        };
        calcBytes(recs1_12);
        calcBytes(recs1_8);
        for (const k in lsData) {
            totalBytes += (k.length + (lsData[k] ? lsData[k].length : 0)) * 2;
        }

        const totalFiles = recs1_12.length + recs1_8.length;

        const backupObj = {
            id: safeUser + "_latest",
            username: targetUser,
            safeUser: safeUser,
            type: type,
            timestamp: Date.now(),
            isoDate: new Date().toISOString(),
            filesCount: totalFiles,
            totalBytes: totalBytes,
            mc1_12_count: recs1_12.length,
            mc1_8_count: recs1_8.length,
            worlds_1_12: recs1_12,
            worlds_1_8: recs1_8,
            localStorageData: lsData
        };

        await saveBackupToStore(backupObj);

        const stats = loadLocalStats();
        if (!stats.mc) stats.mc = { sessions: 0, playTime: 0 };
        stats.mc.lastBackup = Date.now();
        stats.mc.backupFilesCount = totalFiles;
        stats.mc.backupSizeBytes = totalBytes;
        saveLocalStats(stats);
        syncToCloud();

        return {
            success: true,
            filesCount: totalFiles,
            totalBytes: totalBytes,
            timestamp: backupObj.timestamp,
            mc1_12_count: recs1_12.length,
            mc1_8_count: recs1_8.length
        };
    }

    async function restoreMinecraft(username) {
        const targetUser = username || OPS_STATS.getUsername();
        const safeUser = getSafeUsername(targetUser);
        const backup = await getBackupFromStore(safeUser + "_latest");
        if (!backup) {
            return { success: false, error: "Žádná záloha nebyla v prohlížeči nalezena." };
        }

        const db1_12 = "worlds_1_12_" + safeUser;
        const db1_8 = "worlds_1_8_" + safeUser;

        if (backup.worlds_1_12 && backup.worlds_1_12.length > 0) {
            const clean1_12 = backup.worlds_1_12.map(r => ({
                path: r.path,
                data: (typeof r.data === "string") ? base64ToBinary(r.data) : r.data
            }));
            await writeDatabaseRecords(db1_12, clean1_12);
        }

        if (backup.worlds_1_8 && backup.worlds_1_8.length > 0) {
            const clean1_8 = backup.worlds_1_8.map(r => ({
                path: r.path,
                data: (typeof r.data === "string") ? base64ToBinary(r.data) : r.data
            }));
            await writeDatabaseRecords(db1_8, clean1_8);
        }

        if (backup.localStorageData && typeof backup.localStorageData === "object") {
            for (const k in backup.localStorageData) {
                try {
                    localStorage.setItem(k, backup.localStorageData[k]);
                } catch (e) {}
            }
        }

        return {
            success: true,
            filesCount: backup.filesCount,
            totalBytes: backup.totalBytes,
            timestamp: backup.timestamp
        };
    }

    async function exportMinecraftBackup(username) {
        const targetUser = username || OPS_STATS.getUsername();
        const safeUser = getSafeUsername(targetUser);

        await backupMinecraft(targetUser, "export");
        const backup = await getBackupFromStore(safeUser + "_latest");
        if (!backup || backup.filesCount === 0) {
            alert("Nebyly nalezeny žádné uložené světy Minecraftu pro uživatele " + targetUser);
            return false;
        }

        const serializeRecords = (records) => {
            if (!Array.isArray(records)) return [];
            return records.map(r => ({
                path: r.path,
                dataBase64: binaryToBase64(r.data)
            }));
        };

        const exportObj = {
            format: "ops_minecraft_backup_v1",
            exportedAt: new Date().toISOString(),
            username: targetUser,
            safeUser: safeUser,
            filesCount: backup.filesCount,
            totalBytes: backup.totalBytes,
            worlds_1_12: serializeRecords(backup.worlds_1_12),
            worlds_1_8: serializeRecords(backup.worlds_1_8),
            localStorageData: backup.localStorageData || {}
        };

        const jsonStr = JSON.stringify(exportObj, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const d = new Date();
        const dateStr = d.getFullYear() + "" +
                        String(d.getMonth() + 1).padStart(2, "0") + "" + /* taste-skill-ignore */
                        String(d.getDate()).padStart(2, "0") + "_" + /* taste-skill-ignore */
                        String(d.getHours()).padStart(2, "0") + "" + /* taste-skill-ignore */
                        String(d.getMinutes()).padStart(2, "0"); /* taste-skill-ignore */
        a.href = url;
        a.download = "juchelkacraft_zaloha_" + safeUser + "_" + dateStr + ".json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return true;
    }

    async function importMinecraftBackup(fileOrJson, username) {
        let jsonStr = "";
        if (typeof fileOrJson === "string") {
            jsonStr = fileOrJson;
        } else if (fileOrJson instanceof Blob || (typeof File !== "undefined" && fileOrJson instanceof File)) {
            jsonStr = await fileOrJson.text();
        } else if (typeof fileOrJson === "object") {
            jsonStr = JSON.stringify(fileOrJson);
        }

        let parsed;
        try {
            parsed = JSON.parse(jsonStr);
        } catch (e) {
            throw new Error("Neplatný JSON formát souboru zálohy.");
        }

        if (!parsed || (!parsed.worlds_1_12 && !parsed.worlds_1_8 && !parsed.format)) {
            throw new Error("Soubor neobsahuje platná data zálohy Minecraftu.");
        }

        const targetUser = username || parsed.username || OPS_STATS.getUsername();
        const safeUser = getSafeUsername(targetUser);
        const db1_12 = "worlds_1_12_" + safeUser;
        const db1_8 = "worlds_1_8_" + safeUser;

        const deserializeRecords = (list) => {
            if (!Array.isArray(list)) return [];
            return list.map(item => {
                let buf;
                if (item.dataBase64) {
                    buf = base64ToBinary(item.dataBase64);
                } else if (item.data) {
                    buf = (typeof item.data === "string") ? base64ToBinary(item.data) : item.data;
                } else {
                    buf = new Uint8Array(0);
                }
                return {
                    path: item.path,
                    data: buf
                };
            });
        };

        const recs1_12 = deserializeRecords(parsed.worlds_1_12);
        const recs1_8 = deserializeRecords(parsed.worlds_1_8);

        if (recs1_12.length > 0) {
            await writeDatabaseRecords(db1_12, recs1_12);
        }
        if (recs1_8.length > 0) {
            await writeDatabaseRecords(db1_8, recs1_8);
        }

        if (parsed.localStorageData && typeof parsed.localStorageData === "object") {
            for (const k in parsed.localStorageData) {
                try {
                    localStorage.setItem(k, parsed.localStorageData[k]);
                } catch (e) {}
            }
        }

        const totalCount = recs1_12.length + recs1_8.length;
        let totalBytes = 0;
        for (let i = 0; i < recs1_12.length; i++) totalBytes += recs1_12[i].data?.byteLength || 0;
        for (let i = 0; i < recs1_8.length; i++) totalBytes += recs1_8[i].data?.byteLength || 0;

        const backupObj = {
            id: safeUser + "_latest",
            username: targetUser,
            safeUser: safeUser,
            type: "import",
            timestamp: Date.now(),
            isoDate: new Date().toISOString(),
            filesCount: totalCount,
            totalBytes: totalBytes,
            mc1_12_count: recs1_12.length,
            mc1_8_count: recs1_8.length,
            worlds_1_12: recs1_12,
            worlds_1_8: recs1_8,
            localStorageData: parsed.localStorageData || {}
        };

        await saveBackupToStore(backupObj);

        const stats = loadLocalStats();
        if (!stats.mc) stats.mc = { sessions: 0, playTime: 0 };
        stats.mc.lastBackup = Date.now();
        stats.mc.backupFilesCount = totalCount;
        stats.mc.backupSizeBytes = totalBytes;
        saveLocalStats(stats);
        syncToCloud();

        return {
            success: true,
            filesCount: totalCount,
            totalBytes: totalBytes,
            timestamp: backupObj.timestamp
        };
    }

    async function getMinecraftBackupMeta(username) {
        const targetUser = username || OPS_STATS.getUsername();
        const safeUser = getSafeUsername(targetUser);
        try {
            const backup = await getBackupFromStore(safeUser + "_latest");
            if (backup) {
                return {
                    exists: true,
                    timestamp: backup.timestamp,
                    isoDate: backup.isoDate,
                    filesCount: backup.filesCount || 0,
                    totalBytes: backup.totalBytes || 0,
                    mc1_12_count: backup.mc1_12_count || 0,
                    mc1_8_count: backup.mc1_8_count || 0,
                    username: backup.username || targetUser
                };
            }
        } catch (e) {}

        const stats = loadLocalStats();
        if (stats.mc && stats.mc.lastBackup) {
            return {
                exists: true,
                timestamp: stats.mc.lastBackup,
                filesCount: stats.mc.backupFilesCount || 0,
                totalBytes: stats.mc.backupSizeBytes || 0,
                mc1_12_count: 0,
                mc1_8_count: 0,
                username: targetUser
            };
        }
        return { exists: false, filesCount: 0, totalBytes: 0, timestamp: null };
    }

    // -------------------------------------------------------------------------
    // CLICKER LOCALSTORAGE HOOK & AUTOSAVE
    // -------------------------------------------------------------------------
    let lastClickerSaveTime = 0;
    function handleSaveClickerState(data) {
        if (!data || typeof data !== "object") return;
        if (isReloadingForCloud || isExchangingCookies) return;

        const now = Date.now();
        if (now - lastClickerSaveTime < 400) {
            return;
        }
        lastClickerSaveTime = now;

        const stats = loadLocalStats();
        const currentTotal = Number(stats.clicker?.totalCookies) || 0;
        const newTotal = Number(data.totalCookies) || 0;
        if (newTotal === 0 && currentTotal > 0) {
            console.warn("[OPS Stats] Ignoruji pokus o prepsani ulozeneho postupu prazdnym stavem.");
            return;
        }
        stats.meta.lastPlayedGame = "clicker";
        stats.meta.lastActive = Date.now();

        const curPlayTime = stats.clicker?.playTime || 0;
        const cps = computeClickerCps(data);
        const curClickCps = typeof data.clickCps === "number" ? Math.min(20, Math.max(0, data.clickCps)) : 0;
        const curPeakClickCps = Math.min(20, Math.max(Number(stats.clicker?.peakClickCps) || 0, Number(data.peakClickCps) || 0));

        stats.clicker = {
            cookies: typeof data.cookies === "number" ? data.cookies : 0,
            totalCookies: typeof data.totalCookies === "number" ? data.totalCookies : 0,
            clicks: typeof data.clicks === "number" ? data.clicks : 0,
            totalClickedCookies: typeof data.totalClickedCookies === "number"
                ? Math.min(newTotal, Math.max(0, data.totalClickedCookies))
                : Math.min(newTotal, (Number(data.clicks) || 0) * (computeClickerBonuses(data.upgrades).baseClick)),
            clickPower: computeClickerClickPower(data),
            cps: cps,
            clickCps: curClickCps,
            peakClickCps: curPeakClickCps,
            buildings: data.buildings && typeof data.buildings === "object" ? { ...data.buildings } : {},
            upgrades: Array.isArray(data.upgrades) ? [...data.upgrades] : [],
            achievements: Array.isArray(data.achievements) ? [...data.achievements] : [],
            playTime: curPlayTime,
            lastSave: typeof data.lastSave === "number" ? data.lastSave : Date.now(),
            inactiveAccumulatedMs: typeof data.inactiveAccumulatedMs === "number" ? data.inactiveAccumulatedMs : 0
        };

        saveLocalStats(stats);

        if (!isSyncingFromCloud) {
            updateCloudSyncBadge("syncing", "Cloud: Ukladam...");
            if (syncCloudDebounceTimer) clearTimeout(syncCloudDebounceTimer);
            syncCloudDebounceTimer = setTimeout(() => {
                syncToCloud();
            }, 2000);
        }
    }

    function handleResetClickerState() {
        const stats = loadLocalStats();
        stats.clicker = {
            ...DEFAULT_STATS.clicker,
            playTime: stats.clicker?.playTime || 0,
            lastSave: Date.now()
        };
        saveLocalStats(stats);
        if (syncCloudDebounceTimer) clearTimeout(syncCloudDebounceTimer);
        syncToCloud();
    }

    function hookCookieClickerStorage() {
        if (typeof window === "undefined" || !window.localStorage) return;

        const originalSetItem = window.localStorage.setItem.bind(window.localStorage);
        const originalRemoveItem = window.localStorage.removeItem ? window.localStorage.removeItem.bind(window.localStorage) : null;

        window.localStorage.setItem = function(key, value) {
            originalSetItem(key, value);
            if (key === "cookieClickerSave" && !isSyncingFromCloud) {
                try {
                    const data = typeof value === "string" ? JSON.parse(value) : value;
                    handleSaveClickerState(data);
                } catch (e) {
                    console.warn("[OPS Stats] Chyba pri zpracovani cookieClickerSave:", e);
                }
            }
        };

        if (originalRemoveItem) {
            window.localStorage.removeItem = function(key) {
                originalRemoveItem(key);
                if (key === "cookieClickerSave" && !isSyncingFromCloud) {
                    try {
                        handleResetClickerState();
                    } catch (e) {
                        console.warn("[OPS Stats] Chyba pri resetu cookieClickerSave:", e);
                    }
                }
            };
        }

        window.addEventListener("beforeunload", function() {
            if (syncCloudDebounceTimer) {
                clearTimeout(syncCloudDebounceTimer);
                syncToCloud();
            }
        });

        document.addEventListener("visibilitychange", function() {
            if (syncCloudDebounceTimer) {
                clearTimeout(syncCloudDebounceTimer);
                syncToCloud();
            }
        });

        window.addEventListener("blur", function() {
            if (syncCloudDebounceTimer) {
                clearTimeout(syncCloudDebounceTimer);
                syncToCloud();
            }
        });

        window.addEventListener("focus", function() {
            if (syncCloudDebounceTimer) {
                clearTimeout(syncCloudDebounceTimer);
                syncToCloud();
            }
        });
    }

    hookCookieClickerStorage();

    // -------------------------------------------------------------------------
    // PUBLIC API
    // -------------------------------------------------------------------------
    const OPS_STATS = {
        config: SUPABASE_CONFIG,
        agents: AGENTS_LIST,

        getUsername: function() {
            return localStorage.getItem(STORAGE_KEY_USER) || "";
        },

        setUsername: async function(name, options = {}) {
            const clean = (name || "").trim();
            if (!clean) return false;

            if (isGuestUsername(clean)) {
                let current = OPS_STATS.getUsername();
                let isChanged = current !== clean;
                if (isChanged && current && !isGuestUsername(current)) {
                    try {
                        await backupMinecraft(current, "auto");
                    } catch (e) {}
                    if (syncCloudDebounceTimer) {
                        clearTimeout(syncCloudDebounceTimer);
                        syncCloudDebounceTimer = null;
                    }
                    clearOpsStorage();
                }
                localStorage.setItem(STORAGE_KEY_USER, clean);
                setSessionAuthenticated(clean);
                updatePlayerBadgeUI();
                updateCloudSyncBadge("offline", "Cloud: Pouze host");
                if (isChanged) window.location.reload();
                return true;
            }

            if (typeof options === "string") {
                options = { password: options };
            }

            if (options && options.password) {
                const res = await handleRegisterDirect(clean, options.password);
                return res.success;
            }

            promptUsernameModal();
            return true;
        },

        isAuthenticated: function(user) {
            return isAuthenticated(user);
        },

        login: async function(username, password) {
            return await handleLoginDirect(username, password);
        },

        register: async function(username, password) {
            return await handleRegisterDirect(username, password);
        },

        setPassword: async function(password) {
            const user = OPS_STATS.getUsername();
            if (!user || isGuestUsername(user)) return { success: false, error: "Nelze nastavit heslo pro hosta." };
            return await handleSetPasswordDirect(user, password);
        },

        logout: async function() {
            await handleLogout();
        },

        hashPassword: hashPassword,
        verifyPassword: verifyPassword,

        getStats: function() {
            return loadLocalStats();
        },

        saveStats: function(stats, allowLargeJump = false) {
            if (stats.gacha && stats.gacha.history) delete stats.gacha.history;
            saveLocalStats(stats, allowLargeJump);
            if (!syncCloudDebounceTimer) {
                syncCloudDebounceTimer = setTimeout(() => {
                    syncCloudDebounceTimer = null;
                    syncToCloud();
                }, 4000);
            }
        },

        addTokens: function(delta, allowLargeJump = false) {
            delta = Math.floor(Number(delta) || 0);
            const stats = loadLocalStats();
            stats.gacha = stats.gacha || { ...DEFAULT_STATS.gacha };
            const curTokens = Number.isFinite(Number(stats.gacha.tokens)) ? Number(stats.gacha.tokens) : DEFAULT_STATS.gacha.tokens;
            const newTokens = Math.max(0, Math.floor(curTokens + delta));
            stats.gacha.tokens = newTokens;
            saveLocalStats(stats, allowLargeJump);
            if (!syncCloudDebounceTimer) {
                syncCloudDebounceTimer = setTimeout(() => {
                    syncCloudDebounceTimer = null;
                    syncToCloud();
                }, 3000);
            }
            try {
                if (typeof window !== "undefined" && window.dispatchEvent) {
                    window.dispatchEvent(new CustomEvent("ops:stats-updated", { detail: stats }));
                    window.dispatchEvent(new CustomEvent("ops:tokens-changed", { detail: { tokens: newTokens } }));
                }
            } catch (e) {}
            return newTokens;
        },

        exchangeCookies: function(cost, gain) {
            cost = Math.max(0, Math.floor(Number(cost) || 0));
            const allowedGain = Math.floor(cost * (160 / 1000));
            if (cost <= 0 || allowedGain <= 0) {
                return { success: false, error: "Cost too low" };
            }
            gain = Math.min(Math.max(0, Math.floor(Number(gain) || 0)), allowedGain);
            if (gain <= 0) gain = allowedGain;

            let save = null;
            try {
                const rawSave = localStorage.getItem("cookieClickerSave");
                if (rawSave) save = JSON.parse(rawSave);
            } catch (e) {}

            const stats = loadLocalStats();
            const saveCookies = (save && Number.isFinite(Number(save.cookies))) ? Math.max(0, Number(save.cookies)) : 0;
            const statCookies = (stats.clicker && Number.isFinite(Number(stats.clicker.cookies))) ? Math.max(0, Number(stats.clicker.cookies)) : 0;
            const available = Math.max(saveCookies, statCookies);

            if (cost > 0 && available < cost) {
                return { success: false, available, needed: cost };
            }

            const remainingCookies = Math.max(0, available - cost);

            stats.clicker = stats.clicker || { ...DEFAULT_STATS.clicker };
            stats.clicker.cookies = remainingCookies;
            if (Number(stats.clicker.totalCookies || 0) < remainingCookies) {
                stats.clicker.totalCookies = remainingCookies;
            }
            if (save && Number(save.totalCookies || 0) > Number(stats.clicker.totalCookies || 0)) {
                stats.clicker.totalCookies = save.totalCookies;
            }

            stats.gacha = stats.gacha || { ...DEFAULT_STATS.gacha };
            const curTokens = Number.isFinite(Number(stats.gacha.tokens)) ? Number(stats.gacha.tokens) : DEFAULT_STATS.gacha.tokens;
            const newTokens = Math.max(0, Math.floor(curTokens + gain));
            stats.gacha.tokens = newTokens;

            saveLocalStats(stats, true);

            isExchangingCookies = true;
            if (save) {
                save.cookies = remainingCookies;
                if (Number(save.totalCookies || 0) < remainingCookies) {
                    save.totalCookies = remainingCookies;
                }
            } else {
                save = {
                    cookies: remainingCookies,
                    totalCookies: Math.max(remainingCookies, Number(stats.clicker?.totalCookies) || 0),
                    clicks: 0,
                    buildings: {},
                    upgrades: [],
                    achievements: [],
                    lastSave: Date.now()
                };
            }
            try {
                localStorage.setItem("cookieClickerSave", JSON.stringify(save));
            } catch (e) {}
            isExchangingCookies = false;

            if (syncCloudDebounceTimer) {
                clearTimeout(syncCloudDebounceTimer);
                syncCloudDebounceTimer = null;
            }
            syncToCloud();

            try {
                if (typeof window !== "undefined" && window.dispatchEvent) {
                    window.dispatchEvent(new CustomEvent("ops:stats-updated", { detail: stats }));
                    window.dispatchEvent(new CustomEvent("ops:tokens-changed", { detail: { tokens: newTokens, cookies: remainingCookies } }));
                }
            } catch (e) {}

            return { success: true, tokens: newTokens, cookies: remainingCookies };
        },

        exchangeTokens: function(cost, gain) {
            cost = Math.max(0, Math.floor(Number(cost) || 0));
            if (cost <= 0) {
                return { success: false, error: "Cost too low" };
            }
            const allowedGain = Math.floor(cost * (800 / 160));
            gain = Math.min(Math.max(0, Math.floor(Number(gain) || 0)), allowedGain);
            if (gain <= 0) gain = allowedGain;

            const stats = loadLocalStats();
            stats.gacha = stats.gacha || { ...DEFAULT_STATS.gacha };
            const curTokens = Number.isFinite(Number(stats.gacha.tokens)) ? Number(stats.gacha.tokens) : DEFAULT_STATS.gacha.tokens;

            if (cost > 0 && curTokens < cost) {
                return { success: false, tokens: curTokens, needed: cost };
            }

            const newTokens = Math.max(0, curTokens - cost);
            stats.gacha.tokens = newTokens;

            let save = null;
            try {
                const rawSave = localStorage.getItem("cookieClickerSave");
                if (rawSave) save = JSON.parse(rawSave);
            } catch (e) {}

            const saveCookies = (save && Number.isFinite(Number(save.cookies))) ? Math.max(0, Number(save.cookies)) : 0;
            const statCookies = (stats.clicker && Number.isFinite(Number(stats.clicker.cookies))) ? Math.max(0, Number(stats.clicker.cookies)) : 0;
            const available = Math.max(saveCookies, statCookies);
            const newCookies = Math.max(0, Math.floor(available + gain));

            stats.clicker = stats.clicker || { ...DEFAULT_STATS.clicker };
            stats.clicker.cookies = newCookies;
            if (Number(stats.clicker.totalCookies || 0) < newCookies) {
                stats.clicker.totalCookies = newCookies;
            }
            if (save && Number(save.totalCookies || 0) > Number(stats.clicker.totalCookies || 0)) {
                stats.clicker.totalCookies = save.totalCookies;
            }

            saveLocalStats(stats, true);

            isExchangingCookies = true;
            if (!save) {
                save = {
                    cookies: newCookies,
                    totalCookies: newCookies,
                    clicks: 0,
                    buildings: {},
                    upgrades: [],
                    achievements: [],
                    lastSave: Date.now()
                };
            } else {
                save.cookies = newCookies;
                if (Number(save.totalCookies || 0) < newCookies) {
                    save.totalCookies = newCookies;
                }
            }
            try {
                localStorage.setItem("cookieClickerSave", JSON.stringify(save));
            } catch (e) {}
            isExchangingCookies = false;

            if (syncCloudDebounceTimer) {
                clearTimeout(syncCloudDebounceTimer);
                syncCloudDebounceTimer = null;
            }
            syncToCloud();

            try {
                if (typeof window !== "undefined" && window.dispatchEvent) {
                    window.dispatchEvent(new CustomEvent("ops:stats-updated", { detail: stats }));
                    window.dispatchEvent(new CustomEvent("ops:tokens-changed", { detail: { tokens: newTokens, cookies: newCookies } }));
                }
            } catch (e) {}

            return { success: true, tokens: newTokens, cookies: newCookies };
        },

        recordScore: function(gameId, score, extraData = {}) {
            const stats = loadLocalStats();
            if (stats.gacha && stats.gacha.history) delete stats.gacha.history;
            stats.meta.lastPlayedGame = gameId;

            if (gameId === 'stratagem') {
                stats.stratagem.totalGames = (stats.stratagem.totalGames || 0) + 1;
                stats.stratagem.totalSequences = (stats.stratagem.totalSequences || 0) + (score || 0);
                if (score > (stats.stratagem.highScore || 0)) {
                    stats.stratagem.highScore = score;
                }
            } else if (gameId === 'gd') {
                if (extraData.attempts) stats.gd.attempts = (stats.gd.attempts || 0) + extraData.attempts;
                if (extraData.jumps) stats.gd.jumps = (stats.gd.jumps || 0) + extraData.jumps;
                if (extraData.levelId) {
                    const lvl = String(extraData.levelId);
                    const currentBest = stats.gd.bestPercent[lvl] || 0;
                    if (score > currentBest) {
                        stats.gd.bestPercent[lvl] = Math.min(100, Math.max(0, score));
                    }
                    if (score >= 100 && !stats.gd.completedLevels.includes(lvl)) {
                        stats.gd.completedLevels.push(lvl);
                    }
                }
            } else if (gameId === 'maturita') {
                stats.maturita.totalGames = (stats.maturita.totalGames || 0) + 1;
                if (score > (stats.maturita.highScore || 0)) {
                    stats.maturita.highScore = score;
                }
                if (extraData.distance && extraData.distance > (stats.maturita.bestDistance || 0)) {
                    stats.maturita.bestDistance = extraData.distance;
                }
            } else if (gameId === 'hunter') {
                if (score > (stats.runner404.hunterHighScore || 0)) {
                    stats.runner404.hunterHighScore = score;
                }
            } else if (gameId === 'runner') {
                if (score > (stats.runner404.runnerHighScore || 0)) {
                    stats.runner404.runnerHighScore = score;
                }
            }

            saveLocalStats(stats);
            if (!syncCloudDebounceTimer) {
                syncCloudDebounceTimer = setTimeout(() => {
                    syncCloudDebounceTimer = null;
                    syncToCloud();
                }, 4000);
            }
        },

        recordPlayTime: function(gameId, seconds) {
            if (!seconds || seconds <= 0) return;
            const stats = loadLocalStats();
            if (stats.gacha && stats.gacha.history) delete stats.gacha.history;
            stats.meta.totalPlayTime = (stats.meta.totalPlayTime || 0) + seconds;
            stats.meta.lastPlayedGame = gameId;

            if (stats[gameId]) {
                stats[gameId].playTime = (stats[gameId].playTime || 0) + seconds;
            }
            saveLocalStats(stats);
            if (!syncCloudDebounceTimer) {
                syncCloudDebounceTimer = setTimeout(() => {
                    syncCloudDebounceTimer = null;
                    syncToCloud();
                }, 4000);
            }
        },

        recordSession: function(gameId) {
            const stats = loadLocalStats();
            if (stats.gacha && stats.gacha.history) delete stats.gacha.history;
            stats.meta.lastPlayedGame = gameId;
            if (gameId === 'hyperdrive') {
                stats.hyperdrive.sessions = (stats.hyperdrive.sessions || 0) + 1;
            } else if (gameId === 'mc') {
                stats.mc.sessions = (stats.mc.sessions || 0) + 1;
            }
            saveLocalStats(stats);
            if (!syncCloudDebounceTimer) {
                syncCloudDebounceTimer = setTimeout(() => {
                    syncCloudDebounceTimer = null;
                    syncToCloud();
                }, 4000);
            }
        },

        // Gacha metoda - inkrementuje celkový počet pullů a počty pro jednotlivé postavy v inventáři (bez ukládání historie)
        recordGachaPull: function(pulledCharacters = []) {
            const stats = loadLocalStats();
            if (!stats.gacha) {
                stats.gacha = { tokens: 2000, zPity: 0, sPity: 0, aPity: 0, guaranteed: false, totalPulls: 0, inventory: {} };
            }
            if (stats.gacha.history) delete stats.gacha.history; // pro jistotu smažeme, kdyby tam zbyla
            if (!stats.gacha.inventory) {
                stats.gacha.inventory = {};
            }

            for (const charName of pulledCharacters) {
                stats.gacha.totalPulls = (stats.gacha.totalPulls || 0) + 1;
                stats.gacha.inventory[charName] = (stats.gacha.inventory[charName] || 0) + 1;
            }

            saveLocalStats(stats);
            if (!syncCloudDebounceTimer) {
                syncCloudDebounceTimer = setTimeout(() => {
                    syncCloudDebounceTimer = null;
                    syncToCloud();
                }, 4000);
            }
        },

        fetchLeaderboard: async function(orderBy = "total_play_time", limit = 50) {
            if (!isSupabaseConfigured()) return [];
            try {
                let orderParam = encodeURIComponent(orderBy) + ".desc";
                if (orderBy === "clicker_total_cookies") {
                    orderParam = "stats->clicker->totalCookies.desc.nullslast";
                }
                const endpoint = `${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.table}?select=username,stratagem_highscore,gd_completed_levels,gd_total_jumps,total_play_time,updated_at,stats&order=${orderParam}&limit=${limit}`;
                const fetchFn = _nativeFetch || fetch;
                const res = await fetchFn(endpoint, {
                    method: "GET",
                    headers: getSupabaseHeaders()
                });
                if (!res.ok) return [];
                const rows = await res.json();
                if (Array.isArray(rows)) {
                    for (const r of rows) {
                        if (r) {
                            if (typeof r.stats === "string") {
                                try { r.stats = JSON.parse(r.stats); } catch (e) { r.stats = {}; }
                            }
                            if (r.stats && r.stats.auth) {
                                delete r.stats.auth;
                            }
                        }
                    }
                }
                return rows;
            } catch (e) {
                console.warn("[OPS Stats] Nelze nacist zebricek:", e);
                return [];
            }
        },

        fetchPlayerStats: async function(username) {
            if (!username) return null;
            const cleanUser = String(username).trim();
            if (!cleanUser) return null;

            if (!isSupabaseConfigured()) {
                const localUser = OPS_STATS.getUsername();
                if (localUser && localUser.toLowerCase() === cleanUser.toLowerCase()) {
                    const localStats = loadLocalStats();
                    if (localStats.auth) delete localStats.auth;
                    return {
                        username: localUser,
                        total_play_time: localStats.meta?.totalPlayTime || 0,
                        stratagem_highscore: localStats.stratagem?.highScore || 0,
                        gd_completed_levels: localStats.gd?.completedLevels?.length || 0,
                        gd_total_jumps: localStats.gd?.jumps || 0,
                        updated_at: new Date().toISOString(),
                        stats: localStats
                    };
                }
                return null;
            }

            try {
                const fetchFn = _nativeFetch || fetch;
                let endpoint = `${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.table}?username=eq.${encodeURIComponent(cleanUser)}&select=username,stratagem_highscore,gd_completed_levels,gd_total_jumps,total_play_time,updated_at,stats`;
                let res = await fetchFn(endpoint, {
                    method: "GET",
                    headers: getSupabaseHeaders()
                });
                let rows = res.ok ? await res.json() : [];

                if ((!rows || rows.length === 0) && cleanUser.length > 0) {
                    const safePattern = cleanUser.replace(/([%_\\])/g, "\\$1");
                    endpoint = `${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.table}?username=ilike.${encodeURIComponent(safePattern)}&select=username,stratagem_highscore,gd_completed_levels,gd_total_jumps,total_play_time,updated_at,stats&limit=1`;
                    res = await fetchFn(endpoint, {
                        method: "GET",
                        headers: getSupabaseHeaders()
                    });
                    if (res.ok) {
                        rows = await res.json();
                    }
                }

                if (!rows || rows.length === 0) return null;
                const row = rows[0];
                if (row) {
                    if (typeof row.stats === "string") {
                        try { row.stats = JSON.parse(row.stats); } catch (e) { row.stats = {}; }
                    }
                    if (row.stats && row.stats.auth) {
                        delete row.stats.auth;
                    }
                }
                return row;
            } catch (e) {
                console.warn("[OPS Stats] Nelze nacist profil hrace:", e);
                return null;
            }
        },

        getAgentsList: function() {
            return JSON.parse(JSON.stringify(AGENTS_LIST));
        },

        exportStatsJSON: function() {
            const stats = loadLocalStats();
            if (stats.gacha && stats.gacha.history) delete stats.gacha.history;
            if (stats.auth) delete stats.auth;
            const data = {
                username: OPS_STATS.getUsername(),
                stats: stats,
                exportedAt: new Date().toISOString()
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `ops_stats_${data.username || "player"}.json`;
            a.click();
            URL.revokeObjectURL(url);
        },

        resetLocalStats: function() {
            if (confirm("Opravdu si přejete smazat všechny lokální herní statistiky?")) {
                localStorage.removeItem(STORAGE_KEY_STATS);
                localStorage.removeItem("cookieClickerSave");
                window.location.reload();
            }
        },

        promptUsernameModal: function() {
            showUsernameModal();
        },

        saveClickerState: function(data) {
            handleSaveClickerState(data);
        },

        syncFromCloud: function(username) {
            return syncFromCloud(username || OPS_STATS.getUsername());
        },

        syncToCloud: function() {
            return syncToCloud();
        },

        updateCloudSyncBadge: function(state, text) {
            updateCloudSyncBadge(state, text);
        },

        getSafeUsername: function(username) {
            return getSafeUsername(username || OPS_STATS.getUsername());
        },

        getMinecraftStorageNames: function(username) {
            return getMinecraftStorageNames(username || OPS_STATS.getUsername());
        },

        prepareMinecraftStorage: function(targetDB, username) {
            return prepareMinecraftStorage(targetDB, username);
        },

        backupMinecraft: function(username, type) {
            return backupMinecraft(username, type);
        },

        restoreMinecraft: function(username) {
            return restoreMinecraft(username);
        },

        exportMinecraftBackup: function(username) {
            return exportMinecraftBackup(username);
        },

        importMinecraftBackup: function(fileOrJson, username) {
            return importMinecraftBackup(fileOrJson, username);
        },

        getMinecraftBackupMeta: function(username) {
            return getMinecraftBackupMeta(username);
        },

        openMinecraftBackupModal: function() {
            showMinecraftBackupModal();
        },

        isGuestUsername: function(username) {
            return isGuestUsername(username);
        },

        escapeHtml: function(str) {
            return escapeHtml(str);
        }
    };

    // -------------------------------------------------------------------------
    // UI MODAL & BADGE INJECTION
    // -------------------------------------------------------------------------
    let currentModalMode = "register";
    let currentTargetUsername = "";
    let currentAllowCancel = true;

    function injectUIStyles() {
        if (document.getElementById("ops-stats-styles")) return;
        const style = document.createElement("style");
        style.id = "ops-stats-styles";
        style.textContent = `
            .ops-user-badge {
                position: fixed;
                top: 14px;
                right: 14px;
                z-index: 99999;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 6px 12px;
                border-radius: 9999px;
                background: #0f172a;
                border: 1px solid #1e293b;
                font-family: inherit;
                font-size: 12px;
                color: #e2e8f0;
                cursor: pointer;
                transition: border-color 0.15s ease, background-color 0.15s ease;
            }
            .ops-user-badge:hover {
                border-color: #38bdf8;
                background: #1e293b;
            }
            .ops-user-badge-name {
                color: #38bdf8;
                font-weight: 700;
            }
            .ops-cloud-sync-badge {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 6px 12px;
                border-radius: 9999px;
                background: #0f172a;
                border: 1px solid #1e293b;
                font-family: inherit;
                font-size: 12px;
                color: #cbd5e1;
                user-select: none;
            }
            .ops-cloud-sync-dot {
                display: inline-block;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #94a3b8;
                transition: background-color 0.2s ease;
            }
            .ops-cloud-sync-text {
                font-weight: 600;
            }
            .ops-modal-backdrop {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.85);
                z-index: 1000000;
                display: none;
                align-items: center;
                justify-content: center;
                padding: 16px;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s ease;
            }
            .ops-modal-backdrop.open {
                display: flex;
                opacity: 1;
                pointer-events: auto;
            }
            .ops-modal-card {
                background: #0f172a;
                border: 1px solid #334155;
                border-radius: 12px;
                max-width: 440px;
                width: 100%;
                padding: 24px;
                color: #f8fafc;
                font-family: inherit;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4); /* taste-skill-ignore */
                transform: scale(0.96);
                transition: transform 0.2s ease;
                box-sizing: border-box;
            }
            .ops-modal-backdrop.open .ops-modal-card {
                transform: scale(1);
            }
            .ops-modal-title {
                font-size: 1.25rem;
                font-weight: 800;
                color: #fff;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .ops-modal-desc {
                font-size: 0.875rem;
                color: #94a3b8;
                line-height: 1.45;
                margin-bottom: 16px;
            }
            .ops-modal-field-group {
                margin-bottom: 14px;
                text-align: left;
            }
            .ops-modal-label {
                display: block;
                font-size: 13px;
                font-weight: 600;
                color: #94a3b8;
                margin-bottom: 6px;
                text-transform: none;
                letter-spacing: normal;
            }
            .ops-modal-input {
                width: 100%;
                background: #1e293b;
                border: 1px solid #334155;
                border-radius: 8px;
                padding: 11px 14px;
                color: #fff;
                font-family: inherit;
                font-size: 0.95rem;
                outline: none;
                box-sizing: border-box;
                transition: border-color 0.15s ease;
            }
            .ops-modal-input:focus {
                border-color: #38bdf8;
            }
            .ops-modal-error {
                background: rgba(248, 113, 113, 0.15);
                border: 1px solid #f87171;
                color: #fca5a5;
                padding: 10px 14px;
                border-radius: 8px;
                font-size: 0.85rem;
                margin-bottom: 14px;
                line-height: 1.4;
            }
            .ops-modal-info {
                background: rgba(52, 211, 153, 0.15);
                border: 1px solid #34d399;
                color: #86efac;
                padding: 10px 14px;
                border-radius: 8px;
                font-size: 0.85rem;
                margin-bottom: 14px;
                line-height: 1.4;
            }
            .ops-modal-btn-row {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
                flex-wrap: wrap;
                margin-top: 16px;
            }
            .ops-modal-btn {
                padding: 10px 16px;
                border-radius: 8px;
                font-weight: 700;
                font-size: 0.88rem;
                cursor: pointer;
                transition: background-color 0.15s ease, border-color 0.15s ease;
                border: none;
            }
            .ops-modal-btn-primary {
                background: #38bdf8;
                color: #0b1120;
            }
            .ops-modal-btn-primary:hover {
                background: #7dd3fc;
            }
            .ops-modal-btn-ghost {
                background: rgba(255, 255, 255, 0.08);
                color: #cbd5e1;
            }
            .ops-modal-btn-ghost:hover {
                background: rgba(255, 255, 255, 0.16);
            }
            .ops-modal-btn-danger {
                background: rgba(248, 113, 113, 0.2);
                color: #fca5a5;
                border: 1px solid rgba(248, 113, 113, 0.4);
            }
            .ops-modal-btn-danger:hover {
                background: rgba(248, 113, 113, 0.35);
                color: #fff;
            }
        `;
        document.head.appendChild(style);
    }

    function createModalDOM() {
        if (document.getElementById("opsStatsModalBackdrop")) return;
        injectUIStyles();

        const backdrop = document.createElement("div");
        backdrop.id = "opsStatsModalBackdrop";
        backdrop.className = "ops-modal-backdrop";
        backdrop.innerHTML = `
            <div class="ops-modal-card">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
                    <div id="opsModalTitle" class="ops-modal-title">Hracsky profil OPS</div>
                    <button type="button" id="opsModalCloseX" style="background:none;border:none;color:#94a3b8;font-size:24px;cursor:pointer;line-height:1;padding:0 4px;">&times;</button>
                </div>
                <div id="opsModalDesc" class="ops-modal-desc">
                    Zadej svou prezdivku pro ukladani do online zebricku a prenos mezi pocitaci, nebo pokracuj jako anonymni host.
                </div>

                <div id="opsModalError" class="ops-modal-error" style="display:none;"></div>
                <div id="opsModalInfo" class="ops-modal-info" style="display:none;"></div>

                <div id="opsModalProfileBox" style="display:none;background:rgba(15,23,42,0.6);border:1px solid rgba(56,189,248,0.25);border-radius:10px;padding:12px 14px;margin-bottom:14px;font-size:13px;line-height:1.6;">
                    <div>Aktivni profil: <strong id="opsModalProfileUser" style="color:#38bdf8;">--</strong></div>
                    <div>Stav uctu: <span id="opsModalProfileStatus" style="color:#34d399;">Prihlasen a overen</span></div>
                </div>

                <div id="opsUsernameGroup" class="ops-modal-field-group">
                    <label id="opsUsernameLabel" for="opsUsernameInput" class="ops-modal-label">Prezdivka:</label>
                    <input type="text" id="opsUsernameInput" class="ops-modal-input" placeholder="Tvoje prezdivka..." maxlength="24" autocomplete="username" />
                </div>

                <div id="opsPasswordGroup" class="ops-modal-field-group">
                    <label id="opsPasswordLabel" for="opsPasswordInput" class="ops-modal-label">Heslo:</label>
                    <input type="password" id="opsPasswordInput" class="ops-modal-input" placeholder="Heslo..." autocomplete="current-password" />
                </div>

                <div id="opsPasswordConfirmGroup" class="ops-modal-field-group" style="display:none;">
                    <label id="opsPasswordConfirmLabel" for="opsPasswordConfirmInput" class="ops-modal-label">Potvrzeni hesla:</label>
                    <input type="password" id="opsPasswordConfirmInput" class="ops-modal-input" placeholder="Zadej heslo znovu..." autocomplete="new-password" />
                </div>

                <div class="ops-modal-btn-row">
                    <button type="button" id="opsModalGuestBtn" class="ops-modal-btn ops-modal-btn-ghost">Hrat jako host</button>
                    <button type="button" id="opsModalSwitchBtn" class="ops-modal-btn ops-modal-btn-ghost" style="display:none;">Prepnout ucet</button>
                    <button type="button" id="opsModalChangePassBtn" class="ops-modal-btn ops-modal-btn-ghost" style="display:none;">Zmenit heslo</button>
                    <button type="button" id="opsModalLogoutBtn" class="ops-modal-btn ops-modal-btn-danger" style="display:none;">Odhlasit se</button>
                    <button type="button" id="opsModalSaveBtn" class="ops-modal-btn ops-modal-btn-primary">Pokracovat</button>
                </div>
            </div>
        `;
        document.body.appendChild(backdrop);

        const inputUser = document.getElementById("opsUsernameInput");
        const inputPass = document.getElementById("opsPasswordInput");
        const inputConfirm = document.getElementById("opsPasswordConfirmInput");
        const saveBtn = document.getElementById("opsModalSaveBtn");
        const guestBtn = document.getElementById("opsModalGuestBtn");
        const switchBtn = document.getElementById("opsModalSwitchBtn");
        const changePassBtn = document.getElementById("opsModalChangePassBtn");
        const logoutBtn = document.getElementById("opsModalLogoutBtn");
        const closeX = document.getElementById("opsModalCloseX");

        saveBtn.addEventListener("click", handleModalSubmit);
        guestBtn.addEventListener("click", playAsGuest);
        switchBtn.addEventListener("click", () => {
            const isAuth = isAuthenticated(OPS_STATS.getUsername());
            showAuthModal({ mode: "register", username: "", allowCancel: isAuth });
        });
        if (changePassBtn) {
            changePassBtn.addEventListener("click", () => {
                showAuthModal({ mode: "set-password", username: OPS_STATS.getUsername(), allowCancel: true });
            });
        }
        logoutBtn.addEventListener("click", handleLogout);
        closeX.addEventListener("click", closeModal);

        inputUser.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                if (inputPass && inputPass.offsetParent !== null) {
                    inputPass.focus();
                } else {
                    handleModalSubmit();
                }
            }
        });

        inputPass.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                if (inputConfirm && inputConfirm.offsetParent !== null) {
                    inputConfirm.focus();
                } else {
                    handleModalSubmit();
                }
            }
        });

        inputConfirm.addEventListener("keydown", (e) => {
            if (e.key === "Enter") handleModalSubmit();
        });

        backdrop.addEventListener("click", (e) => {
            if (e.target === backdrop && currentAllowCancel) closeModal();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && currentAllowCancel && backdrop.classList.contains("open")) {
                closeModal();
            }
        });
    }

    function closeModal() {
        const backdrop = document.getElementById("opsStatsModalBackdrop");
        if (backdrop) backdrop.classList.remove("open");
    }

    function showModalError(msg) {
        const errEl = document.getElementById("opsModalError");
        const infoEl = document.getElementById("opsModalInfo");
        if (infoEl) infoEl.style.display = "none";
        if (errEl) {
            errEl.textContent = msg;
            errEl.style.display = "block";
        }
    }

    function showModalInfo(msg) {
        const errEl = document.getElementById("opsModalError");
        const infoEl = document.getElementById("opsModalInfo");
        if (errEl) errEl.style.display = "none";
        if (infoEl) {
            infoEl.textContent = msg;
            infoEl.style.display = "block";
        }
    }

    function clearModalAlerts() {
        const errEl = document.getElementById("opsModalError");
        const infoEl = document.getElementById("opsModalInfo");
        if (errEl) errEl.style.display = "none";
        if (infoEl) infoEl.style.display = "none";
    }

    function showAuthModal(options = {}) {
        createModalDOM();
        clearModalAlerts();

        const backdrop = document.getElementById("opsStatsModalBackdrop");
        const titleEl = document.getElementById("opsModalTitle");
        const descEl = document.getElementById("opsModalDesc");
        const closeX = document.getElementById("opsModalCloseX");
        const userGroup = document.getElementById("opsUsernameGroup");
        const userInput = document.getElementById("opsUsernameInput");
        const passGroup = document.getElementById("opsPasswordGroup");
        const passLabel = document.getElementById("opsPasswordLabel");
        const passInput = document.getElementById("opsPasswordInput");
        const confirmGroup = document.getElementById("opsPasswordConfirmGroup");
        const confirmInput = document.getElementById("opsPasswordConfirmInput");
        const profileBox = document.getElementById("opsModalProfileBox");
        const profileUser = document.getElementById("opsModalProfileUser");
        const profileStatus = document.getElementById("opsModalProfileStatus");
        const guestBtn = document.getElementById("opsModalGuestBtn");
        const switchBtn = document.getElementById("opsModalSwitchBtn");
        const logoutBtn = document.getElementById("opsModalLogoutBtn");
        const changePassBtn = document.getElementById("opsModalChangePassBtn");
        const saveBtn = document.getElementById("opsModalSaveBtn");

        currentModalMode = options.mode || "register";
        currentTargetUsername = options.username || "";
        currentAllowCancel = typeof options.allowCancel === "boolean" ? options.allowCancel : true;

        closeX.style.display = currentAllowCancel ? "block" : "none";

        if (currentModalMode === "login") {
            titleEl.textContent = "Prihlaseni k uctu";
            descEl.innerHTML = `Vitej zpet! Zadej heslo pro prihlaseni k uctu <strong style="color:#38bdf8;">${escapeHtml(currentTargetUsername)}</strong>:`;
            userGroup.style.display = "none";
            passGroup.style.display = "block";
            passLabel.textContent = "Heslo:";
            passInput.value = "";
            passInput.placeholder = "Zadej heslo...";
            confirmGroup.style.display = "none";
            profileBox.style.display = "none";
            guestBtn.style.display = "inline-block";
            switchBtn.style.display = "inline-block";
            switchBtn.textContent = "Prepnout ucet";
            if (changePassBtn) changePassBtn.style.display = "none";
            logoutBtn.style.display = "none";
            saveBtn.style.display = "inline-block";
            saveBtn.textContent = "Prihlasit se";
            setTimeout(() => passInput.focus(), 120);
        } else if (currentModalMode === "set-password") {
            titleEl.textContent = "Nastaveni hesla";
            descEl.innerHTML = `Tvuj ucet <strong style="color:#38bdf8;">${escapeHtml(currentTargetUsername)}</strong> zatim nema heslo. Zvol si prosim heslo pro zabezpeceni profilu a ukladani statistik:`;
            userGroup.style.display = "none";
            passGroup.style.display = "block";
            passLabel.textContent = "Nove heslo:";
            passInput.value = "";
            passInput.placeholder = "Nove heslo...";
            confirmGroup.style.display = "block";
            confirmInput.value = "";
            confirmInput.placeholder = "Potvrzeni hesla...";
            profileBox.style.display = "none";
            guestBtn.style.display = "inline-block";
            switchBtn.style.display = "inline-block";
            switchBtn.textContent = "Prepnout ucet";
            if (changePassBtn) changePassBtn.style.display = "none";
            logoutBtn.style.display = "none";
            saveBtn.style.display = "inline-block";
            saveBtn.textContent = "Nastavit heslo a hrat";
            setTimeout(() => passInput.focus(), 120);
        } else if (currentModalMode === "profile") {
            titleEl.textContent = "Hracsky profil";
            descEl.textContent = "Prehled tveho aktivniho prihlaseni v tomto prohlizeci:";
            userGroup.style.display = "none";
            passGroup.style.display = "none";
            confirmGroup.style.display = "none";
            profileBox.style.display = "block";
            profileUser.textContent = currentTargetUsername || OPS_STATS.getUsername();
            profileStatus.textContent = isAuthenticated(currentTargetUsername) ? "Prihlasen a overen" : "Neoveren";
            profileStatus.style.color = isAuthenticated(currentTargetUsername) ? "#34d399" : "#f87171";
            guestBtn.style.display = "none";
            switchBtn.style.display = "inline-block";
            switchBtn.textContent = "Zmenit ucet";
            if (changePassBtn) changePassBtn.style.display = "inline-block";
            logoutBtn.style.display = "inline-block";
            logoutBtn.textContent = "Odhlasit se";
            saveBtn.style.display = "inline-block";
            saveBtn.textContent = "Zavrit";
        } else {
            currentModalMode = "register";
            titleEl.textContent = "Hracsky profil OPS";
            descEl.textContent = "Zadej svou prezdivku a zvol si heslo pro ukladani do online zebricku a prenos mezi zarizenimi, nebo pokracuj jako anonymni host:";
            userGroup.style.display = "block";
            userInput.value = currentTargetUsername || "";
            userInput.placeholder = "Tvoje prezdivka...";
            passGroup.style.display = "block";
            passLabel.textContent = "Heslo:";
            passInput.value = "";
            passInput.placeholder = "Zvol si heslo...";
            confirmGroup.style.display = "none";
            profileBox.style.display = "none";
            guestBtn.style.display = "inline-block";
            switchBtn.style.display = "none";
            if (changePassBtn) changePassBtn.style.display = "none";
            logoutBtn.style.display = "none";
            saveBtn.style.display = "inline-block";
            saveBtn.textContent = "Pokracovat";
            setTimeout(() => {
                if (!userInput.value) userInput.focus();
                else passInput.focus();
            }, 120);
        }

        backdrop.classList.add("open");
    }

    async function handleModalSubmit() {
        clearModalAlerts();
        const saveBtn = document.getElementById("opsModalSaveBtn");
        const originalText = saveBtn.textContent;

        if (currentModalMode === "profile") {
            closeModal();
            return;
        }

        if (currentModalMode === "login") {
            const username = currentTargetUsername;
            const pass = document.getElementById("opsPasswordInput").value;
            if (typeof pass !== "string" || pass.length === 0) {
                showModalError("Zadejte prosim heslo.");
                return;
            }
            saveBtn.disabled = true;
            saveBtn.textContent = "Overuji...";

            try {
                let auth = cachedAuthData[username] || null;
                if (!auth) {
                    const cloud = await fetchUserAuthFromCloud(username);
                    if (cloud.hasPassword) {
                        auth = cloud.auth;
                        cachedAuthData[username] = auth;
                    }
                }
                if (!auth) {
                    const local = loadLocalStats();
                    if (local.auth && (local.auth.hash || local.auth.verifier)) auth = local.auth;
                }
                if (!auth || (!auth.hash && !auth.verifier)) {
                    showModalError("Ucet nema nastavene heslo.");
                    saveBtn.disabled = false;
                    saveBtn.textContent = originalText;
                    return;
                }

                const match = await verifyPassword(pass, auth.salt, auth);
                if (!match) {
                    showModalError("Nespravne heslo. Zkuste to znovu.");
                    const pInput = document.getElementById("opsPasswordInput");
                    pInput.value = "";
                    pInput.focus();
                    saveBtn.disabled = false;
                    saveBtn.textContent = originalText;
                    return;
                }

                await executeUserSwitch(username, auth, false);
                saveBtn.disabled = false;
                saveBtn.textContent = originalText;
                closeModal();
                return;
            } catch (e) {
                console.warn("[OPS Auth] Chyba pri prihlasovani:", e);
                showModalError("Doslo k chybe pri overeni hesla.");
                saveBtn.disabled = false;
                saveBtn.textContent = originalText;
                return;
            }
        }

        if (currentModalMode === "set-password") {
            const username = currentTargetUsername;
            const pass = document.getElementById("opsPasswordInput").value;
            const confirm = document.getElementById("opsPasswordConfirmInput").value;

            if (typeof pass !== "string" || pass.length === 0) {
                showModalError("Zadejte prosim heslo.");
                return;
            }
            if (pass !== confirm) {
                showModalError("Zadana hesla se neshoduji.");
                return;
            }

            saveBtn.disabled = true;
            saveBtn.textContent = "Ukladam heslo...";

            try {
                const authData = await hashPassword(pass);
                await executeUserSwitch(username, authData, true);
                saveBtn.disabled = false;
                saveBtn.textContent = originalText;
                closeModal();
                return;
            } catch (e) {
                console.warn("[OPS Auth] Chyba pri ukladani hesla:", e);
                showModalError("Nepodarilo se ulozit heslo.");
                saveBtn.disabled = false;
                saveBtn.textContent = originalText;
                return;
            }
        }

        if (currentModalMode === "register") {
            const username = document.getElementById("opsUsernameInput").value.trim();
            const pass = document.getElementById("opsPasswordInput").value;

            if (!username) {
                showModalError("Zadejte prosim prezdivku.");
                return;
            }
            if (username.length < 2) {
                showModalError("Prezdivka musi mit alespon 2 znaky.");
                return;
            }
            if (isGuestUsername(username)) {
                showModalError("Prezdivka nemuze zacinat slovem Host.");
                return;
            }
            if (typeof pass !== "string" || pass.length === 0) {
                showModalError("Zadejte prosim heslo.");
                return;
            }

            saveBtn.disabled = true;
            saveBtn.textContent = "Zpracovavam...";

            try {
                const cloud = await fetchUserAuthFromCloud(username);

                if (cloud.exists && cloud.hasPassword) {
                    const match = await verifyPassword(pass, cloud.auth.salt, cloud.auth);
                    if (!match) {
                        showModalError(`Ucet '${username}' jiz existuje. Zadane heslo neni spravne.`);
                        saveBtn.disabled = false;
                        saveBtn.textContent = originalText;
                        return;
                    }
                    await executeUserSwitch(username, cloud.auth, false);
                    saveBtn.disabled = false;
                    saveBtn.textContent = originalText;
                    closeModal();
                    return;
                }

                if (cloud.exists && !cloud.hasPassword) {
                    const authData = await hashPassword(pass);
                    await executeUserSwitch(username, authData, true);
                    saveBtn.disabled = false;
                    saveBtn.textContent = originalText;
                    closeModal();
                    return;
                }

                const authData = await hashPassword(pass);
                await executeUserSwitch(username, authData, true);
                saveBtn.disabled = false;
                saveBtn.textContent = originalText;
                closeModal();
                return;
            } catch (e) {
                console.warn("[OPS Auth] Chyba pri registraci:", e);
                showModalError("Chyba spojeni se serverem.");
                saveBtn.disabled = false;
                saveBtn.textContent = originalText;
                return;
            }
        }
    }

    async function executeUserSwitch(username, authData, isNewOrSetPassword) {
        const oldUser = OPS_STATS.getUsername();
        const isChanged = oldUser !== username;

        if (isChanged && oldUser && !isGuestUsername(oldUser)) {
            try {
                await backupMinecraft(oldUser, "auto");
            } catch (e) {}
            if (syncCloudDebounceTimer) {
                clearTimeout(syncCloudDebounceTimer);
                syncCloudDebounceTimer = null;
            }
            clearOpsStorage();
        }

        localStorage.setItem(STORAGE_KEY_USER, username);
        setSessionAuthenticated(username);
        if (authData) cachedAuthData[username] = authData;

        let stats = loadLocalStats();
        if (authData) {
            stats.auth = authData;
            saveLocalStats(stats, true);
        }

        updatePlayerBadgeUI();

        if (isSupabaseConfigured() && !isGuestUsername(username)) {
            try {
                await syncFromCloud(username);
                if (authData) {
                    stats = loadLocalStats();
                    stats.auth = authData;
                    saveLocalStats(stats, true);
                }
                await syncToCloud();
            } catch (e) {
                console.warn("[OPS Auth] Chyba pri synchronizaci po prihlaseni:", e);
            }
        }

        if (isChanged) {
            window.location.reload();
        }
    }

    async function playAsGuest() {
        clearModalAlerts();
        let current = OPS_STATS.getUsername();
        let guestName = (current && isGuestUsername(current)) ? current : `Host_${_secureRng.int(1000, 9999)}`;
        const oldUser = OPS_STATS.getUsername();
        const isChanged = oldUser !== guestName;

        if (isChanged && oldUser && !isGuestUsername(oldUser)) {
            try {
                await backupMinecraft(oldUser, "auto");
            } catch (e) {}
            if (syncCloudDebounceTimer) {
                clearTimeout(syncCloudDebounceTimer);
                syncCloudDebounceTimer = null;
            }
            clearOpsStorage();
        }

        localStorage.setItem(STORAGE_KEY_USER, guestName);
        setSessionAuthenticated(guestName);
        updatePlayerBadgeUI();
        updateCloudSyncBadge("offline", "Cloud: Pouze host");
        closeModal();

        if (isChanged) {
            window.location.reload();
        }
    }

    async function handleLogout() {
        clearModalAlerts();
        const oldUser = OPS_STATS.getUsername();
        if (oldUser && !isGuestUsername(oldUser)) {
            try {
                await backupMinecraft(oldUser, "auto");
            } catch (e) {}
        }
        clearSessionAuthenticated();
        if (syncCloudDebounceTimer) {
            clearTimeout(syncCloudDebounceTimer);
            syncCloudDebounceTimer = null;
        }
        clearOpsStorage();
        updateCloudSyncBadge("offline");
        closeModal();
        updatePlayerBadgeUI();
        window.location.reload();
    }

    function promptUsernameModal() {
        const currentUser = OPS_STATS.getUsername();
        if (!currentUser || isGuestUsername(currentUser)) {
            showAuthModal({ mode: "register", username: "", allowCancel: true });
        } else if (isAuthenticated(currentUser)) {
            showAuthModal({ mode: "profile", username: currentUser, allowCancel: true });
        } else {
            checkUserAuthRequirement(currentUser, true);
        }
    }

    function showUsernameModal(allowCancel = true) {
        promptUsernameModal();
    }

    function updatePlayerBadgeUI() {
        const badge = document.getElementById("opsUserBadge");
        const topUserEl = document.getElementById("topUsernameDisplay");
        const username = OPS_STATS.getUsername();

        if (topUserEl) {
            topUserEl.textContent = username || "Neznamy hrac";
        }

        if (badge) {
            if (!username) {
                badge.innerHTML = `<span id="topUsernameDisplay" style="color:#fbbf24;">Prihlasit se / Zadat prezdivku</span>`;
                badge.title = "Kliknete pro prihlaseni nebo registraci";
            } else if (isGuestUsername(username)) {
                badge.innerHTML = `<span id="topUsernameDisplay" class="ops-user-badge-name">${escapeHtml(username)}</span> <span style="opacity:0.6;font-size:10px;">(Host)</span> <span style="color:#38bdf8;font-size:10px;">[prihlasit]</span>`;
                badge.title = "Hrajete jako host. Kliknete pro prihlaseni nebo registraci.";
            } else if (!isAuthenticated(username)) {
                badge.innerHTML = `<span id="topUsernameDisplay" class="ops-user-badge-name">${escapeHtml(username)}</span> <span style="color:#f87171;font-size:10px;">[neprihlasen]</span>`;
                badge.title = "Ucet neni v teto relaci overen. Kliknete pro zadani hesla.";
            } else {
                badge.innerHTML = `<span id="topUsernameDisplay" class="ops-user-badge-name">${escapeHtml(username)}</span> <span style="opacity:0.6;font-size:10px;">[ucet]</span>`;
                badge.title = "Prihlasen a overen. Kliknete pro spravu profilu.";
            }
        }
    }

    async function checkUserAuthRequirement(username, shouldPrompt) {
        if (!username || isGuestUsername(username)) return;
        updateCloudSyncBadge("syncing", "Cloud: Kontrola uctu...");
        const cloudAuth = await fetchUserAuthFromCloud(username);

        if (cloudAuth.error) {
            const localStats = loadLocalStats();
            if (localStats.auth && (localStats.auth.hash || localStats.auth.verifier)) {
                cachedAuthData[username] = localStats.auth;
                if (shouldPrompt) {
                    showAuthModal({ mode: "login", username: username, allowCancel: false });
                }
            } else {
                if (shouldPrompt) {
                    showAuthModal({ mode: "set-password", username: username, allowCancel: false });
                }
            }
            updateCloudSyncBadge("error", "Cloud: Offline");
            return;
        }

        if (!cloudAuth.exists) {
            const localStats = loadLocalStats();
            if (localStats.auth && (localStats.auth.hash || localStats.auth.verifier)) {
                cachedAuthData[username] = localStats.auth;
                if (shouldPrompt) {
                    showAuthModal({ mode: "login", username: username, allowCancel: false });
                }
            } else {
                if (shouldPrompt) {
                    showAuthModal({ mode: "set-password", username: username, allowCancel: false });
                }
            }
            updateCloudSyncBadge("offline", "Cloud: Ceka na heslo");
            return;
        }

        if (cloudAuth.hasPassword) {
            cachedAuthData[username] = cloudAuth.auth;
            updateCloudSyncBadge("offline", "Cloud: Ceka na prihlaseni");
            if (shouldPrompt) {
                showAuthModal({ mode: "login", username: username, allowCancel: false });
            }
        } else {
            updateCloudSyncBadge("offline", "Cloud: Nastavte heslo");
            if (shouldPrompt) {
                showAuthModal({ mode: "set-password", username: username, allowCancel: false });
            }
        }
    }

    async function handleLoginDirect(username, password) {
        const clean = (username || "").trim();
        if (!clean || typeof password !== "string" || password.length === 0) {
            return { success: false, error: "Zadejte jmeno a heslo." };
        }
        try {
            let auth = cachedAuthData[clean] || null;
            if (!auth) {
                const cloud = await fetchUserAuthFromCloud(clean);
                if (cloud.hasPassword) {
                    auth = cloud.auth;
                    cachedAuthData[clean] = auth;
                }
            }
            if (!auth) {
                const local = loadLocalStats();
                if (local.auth && (local.auth.hash || local.auth.verifier)) auth = local.auth;
            }
            if (!auth || (!auth.hash && !auth.verifier)) {
                return { success: false, error: "Ucet nema nastavene heslo." };
            }
            const match = await verifyPassword(password, auth.salt, auth);
            if (!match) {
                return { success: false, error: "Nespravne heslo." };
            }
            await executeUserSwitch(clean, auth, false);
            return { success: true };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    async function handleRegisterDirect(username, password) {
        const clean = (username || "").trim();
        if (!clean || clean.length < 2) return { success: false, error: "Prezdivka musi mit alespon 2 znaky." };
        if (isGuestUsername(clean)) return { success: false, error: "Prezdivka nemuze zacinat slovem Host." };
        if (typeof password !== "string" || password.length === 0) return { success: false, error: "Zadejte heslo." };

        try {
            const cloud = await fetchUserAuthFromCloud(clean);
            if (cloud.exists && cloud.hasPassword) {
                const match = await verifyPassword(password, cloud.auth.salt, cloud.auth);
                if (!match) return { success: false, error: "Ucet jiz existuje a heslo nesouhlasi." };
                await executeUserSwitch(clean, cloud.auth, false);
                return { success: true, mode: "login" };
            }
            const authData = await hashPassword(password);
            await executeUserSwitch(clean, authData, true);
            return { success: true, mode: "register" };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    async function handleSetPasswordDirect(username, password) {
        const clean = (username || "").trim();
        if (!clean || isGuestUsername(clean)) return { success: false, error: "Neplatny uzivatel." };
        if (typeof password !== "string" || password.length === 0) return { success: false, error: "Zadejte heslo." };
        try {
            const authData = await hashPassword(password);
            await executeUserSwitch(clean, authData, true);
            return { success: true };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    // -------------------------------------------------------------------------
    // MINECRAFT BACKUP MODAL
    // -------------------------------------------------------------------------
    function createMinecraftBackupModalDOM() {
        if (document.getElementById("opsMcBackupModalBackdrop")) return;
        injectUIStyles();

        const backdrop = document.createElement("div");
        backdrop.id = "opsMcBackupModalBackdrop";
        backdrop.className = "ops-modal-backdrop";
        backdrop.innerHTML = `
            <div class="ops-modal-card" style="max-width: 520px;">
                <div class="ops-modal-title" style="justify-content: space-between;">
                    <span>Záloha světů JuchelkaCraft</span>
                    <button type="button" id="opsMcModalCloseTop" style="background:none;border:none;color:#94a3b8;font-size:22px;cursor:pointer;line-height:1;">&times;</button>
                </div>
                <div class="ops-modal-desc">
                    Tvoje světy a nastavení jsou vázané na herní přezdívku. Můžeš vytvořit zálohu v prohlížeči nebo stáhnout přenosný JSON soubor pro jiný počítač.
                </div>
                
                <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 10px; padding: 14px 16px; margin-bottom: 16px; font-size: 13px; line-height: 1.6;">
                    <div>Aktivní profil: <strong id="opsMcModalUser" style="color: #38bdf8;">--</strong></div>
                    <div style="display: flex; justify-content: space-between; margin-top: 4px;">
                        <span>Minecraft 1.12.2: <span id="opsMcModal1_12" style="color: #e2e8f0; font-variant-numeric: tabular-nums;">--</span></span>
                        <span>Minecraft 1.8.8: <span id="opsMcModal1_8" style="color: #e2e8f0; font-variant-numeric: tabular-nums;">--</span></span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 4px;">
                        <span>Poslední záloha: <span id="opsMcModalTime" style="color: #34d399; font-variant-numeric: tabular-nums;">--</span></span>
                        <span>Velikost: <span id="opsMcModalSize" style="color: #fbbf24; font-variant-numeric: tabular-nums;">--</span></span>
                    </div>
                </div>

                <div id="opsMcModalStatus" style="display:none; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px;"></div>

                <input type="file" id="opsMcFileInput" accept=".json" style="display:none;" />

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;">
                    <button type="button" id="opsMcActionBackup" class="ops-modal-btn ops-modal-btn-primary" style="font-size: 12px; padding: 11px 12px;">
                        [Vytvořit zálohu]
                    </button>
                    <button type="button" id="opsMcActionExport" class="ops-modal-btn" style="background: #0284c7; color: #fff; font-size: 12px; padding: 11px 12px;">
                        [Stáhnout .json]
                    </button>
                    <button type="button" id="opsMcActionImport" class="ops-modal-btn ops-modal-btn-ghost" style="border: 1px solid rgba(255,255,255,0.25); font-size: 12px; padding: 11px 12px;">
                        [Nahrát .json]
                    </button>
                    <button type="button" id="opsMcActionRestore" class="ops-modal-btn ops-modal-btn-ghost" style="border: 1px solid rgba(255,255,255,0.25); font-size: 12px; padding: 11px 12px;">
                        [Obnovit ze zálohy]
                    </button>
                </div>

                <div class="ops-modal-btn-row">
                    <button type="button" id="opsMcModalCloseBottom" class="ops-modal-btn ops-modal-btn-ghost">Zavřít</button>
                </div>
            </div>
        `;
        document.body.appendChild(backdrop);

        const closeTop = document.getElementById("opsMcModalCloseTop");
        const closeBottom = document.getElementById("opsMcModalCloseBottom");
        const closeModal = () => backdrop.classList.remove("open");

        closeTop.addEventListener("click", closeModal);
        closeBottom.addEventListener("click", closeModal);
        backdrop.addEventListener("click", (e) => {
            if (e.target === backdrop) closeModal();
        });

        const statusEl = document.getElementById("opsMcModalStatus");
        const showStatus = (text, isSuccess = true) => {
            statusEl.style.display = "block";
            statusEl.style.background = isSuccess ? "rgba(34, 197, 94, 0.18)" : "rgba(239, 68, 68, 0.18)";
            statusEl.style.border = isSuccess ? "1px solid rgba(34, 197, 94, 0.5)" : "1px solid rgba(239, 68, 68, 0.5)";
            statusEl.style.color = isSuccess ? "#86efac" : "#fca5a5";
            statusEl.textContent = text;
        };

        const backupBtn = document.getElementById("opsMcActionBackup");
        const exportBtn = document.getElementById("opsMcActionExport");
        const importBtn = document.getElementById("opsMcActionImport");
        const restoreBtn = document.getElementById("opsMcActionRestore");
        const fileInput = document.getElementById("opsMcFileInput");

        backupBtn.addEventListener("click", async () => {
            backupBtn.disabled = true;
            showStatus("Vytvářím zálohu světů...", true);
            try {
                const res = await backupMinecraft(OPS_STATS.getUsername(), "manual");
                const kb = res.totalBytes > 1048576 ? (res.totalBytes / (1024*1024)).toFixed(2) + " MB" : (res.totalBytes / 1024).toFixed(1) + " KB";
                showStatus(`Záloha úspěšně vytvořena (${res.filesCount} souborů, ${kb}).`, true);
                refreshMinecraftModalData();
            } catch (err) {
                showStatus("Vytvoření zálohy selhalo: " + err.message, false);
            }
            backupBtn.disabled = false;
        });

        exportBtn.addEventListener("click", async () => {
            exportBtn.disabled = true;
            showStatus("Připravuji export zálohy...", true);
            try {
                await exportMinecraftBackup(OPS_STATS.getUsername());
                showStatus("Soubor se zálohou byl stažen.", true);
                refreshMinecraftModalData();
            } catch (err) {
                showStatus("Export selhal: " + err.message, false);
            }
            exportBtn.disabled = false;
        });

        importBtn.addEventListener("click", () => {
            fileInput.value = "";
            fileInput.click();
        });

        fileInput.addEventListener("change", async () => {
            if (!fileInput.files || fileInput.files.length === 0) return;
            const file = fileInput.files[0];
            showStatus("Nahrávám zálohu ze souboru...", true);
            try {
                const res = await importMinecraftBackup(file, OPS_STATS.getUsername());
                showStatus(`Záloha byla úspěšně importována (${res.filesCount} souborů).`, true);
                refreshMinecraftModalData();
                if (window.location.pathname.includes("/mc/")) {
                    setTimeout(() => {
                        if (confirm("Data byla obnovena. Restartovat hru nyní pro načtení světů?")) {
                            window.location.reload();
                        }
                    }, 400);
                }
            } catch (err) {
                showStatus("Chyba při importu: " + err.message, false);
            }
        });

        restoreBtn.addEventListener("click", async () => {
            if (!confirm("Opravdu si přejete obnovit data z poslední lokální zálohy? Neuložené změny mohou být přepsány.")) {
                return;
            }
            restoreBtn.disabled = true;
            showStatus("Obnovuji data ze zálohy...", true);
            try {
                const res = await restoreMinecraft(OPS_STATS.getUsername());
                if (res.success) {
                    showStatus(`Data byla úspěšně obnovena (${res.filesCount} souborů).`, true);
                    refreshMinecraftModalData();
                    if (window.location.pathname.includes("/mc/")) {
                        setTimeout(() => {
                            if (confirm("Data byla obnovena. Restartovat hru nyní pro načtení světů?")) {
                                window.location.reload();
                            }
                        }, 400);
                    }
                } else {
                    showStatus(res.error || "Záloha nebyla nalezena.", false);
                }
            } catch (err) {
                showStatus("Obnova selhala: " + err.message, false);
            }
            restoreBtn.disabled = false;
        });
    }

    async function refreshMinecraftModalData() {
        const user = OPS_STATS.getUsername() || "Guest";
        const safeUser = getSafeUsername(user);
        const userEl = document.getElementById("opsMcModalUser");
        if (userEl) userEl.textContent = user;

        const el1_12 = document.getElementById("opsMcModal1_12");
        const el1_8 = document.getElementById("opsMcModal1_8");
        const elTime = document.getElementById("opsMcModalTime");
        const elSize = document.getElementById("opsMcModalSize");

        if (el1_12) {
            readDatabaseRecords("worlds_1_12_" + safeUser).then(r => {
                if (r.length === 0) {
                    readDatabaseRecords("worlds").then(leg => {
                        el1_12.textContent = leg.length > 0 ? leg.length + " souborů (legacy)" : "0 souborů";
                    });
                } else {
                    el1_12.textContent = r.length + " souborů";
                }
            });
        }

        if (el1_8) {
            readDatabaseRecords("worlds_1_8_" + safeUser).then(r => {
                el1_8.textContent = r.length + " souborů";
            });
        }

        const meta = await getMinecraftBackupMeta(user);
        if (meta && meta.timestamp) {
            if (elTime) elTime.textContent = new Date(meta.timestamp).toLocaleString("cs-CZ");
            if (elSize) {
                const b = meta.totalBytes || 0;
                elSize.textContent = b > 1048576 ? (b / (1024*1024)).toFixed(2) + " MB" : (b / 1024).toFixed(1) + " KB";
            }
        } else {
            if (elTime) elTime.textContent = "Zatím žádná";
            if (elSize) elSize.textContent = "0 KB";
        }
    }

    function showMinecraftBackupModal() {
        createMinecraftBackupModalDOM();
        const backdrop = document.getElementById("opsMcBackupModalBackdrop");
        const statusEl = document.getElementById("opsMcModalStatus");
        if (statusEl) statusEl.style.display = "none";
        refreshMinecraftModalData();
        backdrop.classList.add("open");
    }

    // -------------------------------------------------------------------------
    // AUTO-INIT ON LOAD
    // -------------------------------------------------------------------------
    window.addEventListener("DOMContentLoaded", function() {
        injectUIStyles();
        updatePlayerBadgeUI();

        const currentUser = OPS_STATS.getUsername();

        const isGameOrHub = window.location.pathname.endsWith("games.html") || 
                            window.location.pathname.includes("games.html") || 
                            !!document.querySelector(".landing-page") || 
                            window.location.pathname.includes("/gd/") || 
                            window.location.pathname.includes("/stratagem/") || 
                            window.location.pathname.includes("/hyperdrive/") || 
                            window.location.pathname.includes("/mc/") ||
                            window.location.pathname.includes("/maturita/") ||
                            window.location.pathname.includes("/clicker/") ||
                            window.location.pathname.includes("/kasino/");

        if (!currentUser) {
            updateCloudSyncBadge("offline");
            if (isGameOrHub) {
                setTimeout(() => showAuthModal({ mode: "register", username: "", allowCancel: true }), 400);
            }
        } else if (isGuestUsername(currentUser)) {
            updateCloudSyncBadge("offline", "Cloud: Pouze host");
        } else {
            if (isAuthenticated(currentUser)) {
                updateCloudSyncBadge("synced");
                syncFromCloud(currentUser).then(() => {
                    updatePlayerBadgeUI();
                });
            } else {
                updateCloudSyncBadge("offline", "Cloud: Prihlaseni...");
                checkUserAuthRequirement(currentUser, isGameOrHub);
            }
        }

        let sessionSeconds = 0;
        let activeGame = null;
        if (window.location.pathname.includes("/hyperdrive/")) activeGame = "hyperdrive";
        else if (window.location.pathname.includes("/mc/")) activeGame = "mc";
        else if (window.location.pathname.includes("/clicker/")) activeGame = "clicker";

        if (activeGame) {
            OPS_STATS.recordSession(activeGame);
            setInterval(() => {
                if (!document.hidden) {
                    sessionSeconds += 10;
                    OPS_STATS.recordPlayTime(activeGame, 10);
                }
            }, 10000);
        }
    });

    window.OPS_STATS = OPS_STATS;
})();

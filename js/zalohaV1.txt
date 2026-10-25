/**
 * OPS Game Statistics & Cloud Sync Manager
 * Supports localStorage persistence + Supabase Cloud REST Sync
 */
(function() {
    'use strict';

    // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    // SUPABASE CONFIGURATION
    // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    const SUPABASE_CONFIG = {
        url: "https://xtrykhppxqngfaqadypr.supabase.co",
        anonKey: "sb_publishable_mTi5-8yRt7OqqLW5axZK8g_2lmsZCIO",
        table: "player_stats"
    };

    const STORAGE_KEY_USER = "ops_username";
    const STORAGE_KEY_STATS = "ops_game_stats";

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
            inventory: {},
            history: []
        },
        meta: {
            totalPlayTime: 0,
            lastPlayedGame: null,
            lastActive: Date.now()
        }
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
        const totalCookies = typeof saveData.totalCookies === "number" ? saveData.totalCookies : 0;
        const clicks = typeof saveData.clicks === "number" ? saveData.clicks : 0;
        const bonuses = computeClickerBonuses(saveData.upgrades);
        const totalClickedCookies = typeof saveData.totalClickedCookies === "number"
            ? Math.min(totalCookies, Math.max(0, saveData.totalClickedCookies))
            : Math.min(totalCookies, clicks * bonuses.baseClick);

        return {
            cookies: typeof saveData.cookies === "number" ? saveData.cookies : 0,
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
                    const totalFromSave = Number(s.totalCookies) || 0;
                    if (totalFromSave >= (clickerState.totalCookies || 0)) {
                        clickerState.cookies = typeof s.cookies === "number" ? s.cookies : clickerState.cookies;
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
    // LOCAL STORAGE HELPERS
    // -------------------------------------------------------------------------
    function loadLocalStats() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_STATS);
            if (!raw) {
                const def = JSON.parse(JSON.stringify(DEFAULT_STATS));
                populateClickerFromStorage(def.clicker);
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

            populateClickerFromStorage(clickerState);

            return {
                gd: { ...DEFAULT_STATS.gd, ...(parsed.gd || {}) },
                stratagem: { ...DEFAULT_STATS.stratagem, ...(parsed.stratagem || {}) },
                hyperdrive: { ...DEFAULT_STATS.hyperdrive, ...(parsed.hyperdrive || {}) },
                mc: { ...DEFAULT_STATS.mc, ...(parsed.mc || {}) },
                maturita: { ...DEFAULT_STATS.maturita, ...(parsed.maturita || {}) },
                runner404: { ...DEFAULT_STATS.runner404, ...(parsed.runner404 || {}) },
                clicker: clickerState,
                gacha: { ...DEFAULT_STATS.gacha, ...(parsed.gacha || {}) },
                meta: { ...DEFAULT_STATS.meta, ...(parsed.meta || {}) }
            };
        } catch (e) {
            console.warn("[OPS Stats] Chyba při čtení localStorage:", e);
            const def = JSON.parse(JSON.stringify(DEFAULT_STATS));
            populateClickerFromStorage(def.clicker);
            return def;
        }
    }

    function saveLocalStats(stats) {
        try {
            stats.meta.lastActive = Date.now();
            localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
        } catch (e) {
            console.warn("[OPS Stats] Chyba při zápisu do localStorage:", e);
        }
    }

    // -------------------------------------------------------------------------
    // CLOUD SYNC (SUPABASE)
    // -------------------------------------------------------------------------
    let isSyncingFromCloud = false;
    let isReloadingForCloud = false;
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
            dotColor = "#22c55e";
            defaultText = "Cloud: Ulozeno";
            titleText = "Data jsou uspesne synchronizovana se Supabase";
        } else if (state === "offline") {
            dotColor = "#fbbf24";
            defaultText = "Cloud: Pouze lokalne";
            titleText = "Hrajete bez prihlaseni nebo offline, data se ukladaji do prohlizece";
        } else if (state === "error") {
            dotColor = "#ef4444";
            defaultText = "Cloud: Chyba spojeni";
            titleText = "Nepodarilo se spojit se Supabase serverem";
        }

        const text = customText || defaultText;
        badge.innerHTML = `<span class="ops-cloud-sync-dot" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${dotColor};box-shadow:0 0 6px ${dotColor};"></span> <span class="ops-cloud-sync-text">${text}</span>`;
        if (titleText) badge.title = titleText;
    }

    async function syncToCloud() {
        const username = OPS_STATS.getUsername();
        if (!username || !isSupabaseConfigured() || username.startsWith("Host")) {
            updateCloudSyncBadge("offline");
            return;
        }

        updateCloudSyncBadge("syncing", "Cloud: Ukladam...");
        const stats = loadLocalStats();
        const payload = {
            username: username,
            updated_at: new Date().toISOString(),
            gd_completed_levels: stats.gd?.completedLevels?.length || 0,
            gd_total_jumps: stats.gd?.jumps || 0,
            stratagem_highscore: stats.stratagem?.highScore || 0,
            total_play_time: Math.floor(stats.meta?.totalPlayTime || 0),
            stats: stats
        };

        try {
            const endpoint = `${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.table}`;
            const res = await fetch(endpoint, {
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
        }
    }

    async function syncFromCloud(username) {
        if (!username || !isSupabaseConfigured() || username.startsWith("Host")) {
            updateCloudSyncBadge("offline");
            return null;
        }

        updateCloudSyncBadge("syncing", "Cloud: Nacitam...");
        try {
            const endpoint = `${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.table}?username=eq.${encodeURIComponent(username)}&select=*`;
            const res = await fetch(endpoint, {
                method: "GET",
                headers: getSupabaseHeaders()
            });
            if (!res.ok) {
                updateCloudSyncBadge("error");
                return null;
            }
            const rows = await res.json();
            if (rows && rows.length > 0 && rows[0].stats) {
                const cloudStats = rows[0].stats;
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
                    gacha: {
                        tokens: Math.max(local.gacha?.tokens || 2000, cloudStats.gacha?.tokens || 2000),
                        zPity: Math.max(local.gacha?.zPity || 0, cloudStats.gacha?.zPity || 0),
                        sPity: Math.max(local.gacha?.sPity || 0, cloudStats.gacha?.sPity || 0),
                        aPity: Math.max(local.gacha?.aPity || 0, cloudStats.gacha?.aPity || 0),
                        guaranteed: local.gacha?.guaranteed ?? cloudStats.gacha?.guaranteed ?? false,
                        totalPulls: Math.max(local.gacha?.totalPulls || 0, cloudStats.gacha?.totalPulls || 0),
                        inventory: { ...(cloudStats.gacha?.inventory || {}), ...(local.gacha?.inventory || {}) },
                        history: local.gacha?.history?.length >= (cloudStats.gacha?.history?.length || 0) ? local.gacha.history : (cloudStats.gacha?.history || [])
                    },
                    meta: {
                        totalPlayTime: Math.max(local.meta.totalPlayTime, cloudStats.meta?.totalPlayTime || 0),
                        lastPlayedGame: cloudStats.meta?.lastPlayedGame || local.meta.lastPlayedGame,
                        lastActive: Date.now()
                    }
                };

                saveLocalStats(merged);
                updateCloudSyncBadge("synced");
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
                        String(d.getMonth() + 1).padStart(2, "0") + "" +
                        String(d.getDate()).padStart(2, "0") + "_" +
                        String(d.getHours()).padStart(2, "0") + "" +
                        String(d.getMinutes()).padStart(2, "0");
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
    function handleSaveClickerState(data) {
        if (!data || typeof data !== "object") return;
        if (isReloadingForCloud) return;

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

        getUsername: function() {
            return localStorage.getItem(STORAGE_KEY_USER) || "";
        },

        setUsername: async function(name) {
            const clean = (name || "").trim();
            if (!clean) return false;

            const oldUser = OPS_STATS.getUsername();
            if (oldUser && oldUser !== clean) {
                try {
                    await backupMinecraft(oldUser, "auto");
                } catch (e) {
                    console.warn("[OPS Stats] Auto-backup při přepnutí uživatele selhal:", e);
                }
            }

            localStorage.setItem(STORAGE_KEY_USER, clean);
            updatePlayerBadgeUI();

            if (isSupabaseConfigured()) {
                await syncFromCloud(clean);
                await syncToCloud();
            }

            if (window.location.pathname.includes("/mc/") || window.location.pathname.includes("/clicker/")) {
                window.location.reload();
            }

            return true;
        },

        getStats: function() {
            return loadLocalStats();
        },

        saveStats: function(stats) {
            saveLocalStats(stats);
            syncToCloud();
        },

        recordScore: function(gameId, score, extraData = {}) {
            const stats = loadLocalStats();
            stats.meta.lastPlayedGame = gameId;

            if (gameId === 'stratagem') {
                stats.stratagem.totalGames = (stats.stratagem.totalGames || 0) + 1;
                stats.stratagem.totalSequences = (stats.stratagem.totalSequences || 0) + (score || 0);
                if (score > (stats.stratagem.highScore || 0)) {
                    stats.stratagem.highScore = score;
                }
            } else if (gameId === 'gd') {
                if (extraData.attempts) stats.gd.attempts = (stats.gd.attempts || 0) + extraData.attempts;
                if (extraData.jumps) stats.gd.jumps = (stats.gd.juniform || stats.gd.jumps || 0) + extraData.jumps;
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
            syncToCloud();
        },

        recordPlayTime: function(gameId, seconds) {
            if (!seconds || seconds <= 0) return;
            const stats = loadLocalStats();
            stats.meta.totalPlayTime = (stats.meta.totalPlayTime || 0) + seconds;
            stats.meta.lastPlayedGame = gameId;

            if (stats[gameId]) {
                stats[gameId].playTime = (stats[gameId].playTime || 0) + seconds;
            }
            saveLocalStats(stats);
            syncToCloud();
        },

        recordSession: function(gameId) {
            const stats = loadLocalStats();
            stats.meta.lastPlayedGame = gameId;
            if (gameId === 'hyperdrive') {
                stats.hyperdrive.sessions = (stats.hyperdrive.sessions || 0) + 1;
            } else if (gameId === 'mc') {
                stats.mc.sessions = (stats.mc.sessions || 0) + 1;
            }
            saveLocalStats(stats);
            syncToCloud();
        },

        fetchLeaderboard: async function(orderBy = "total_play_time", limit = 10) {
            if (!isSupabaseConfigured()) return [];
            try {
                let orderParam = encodeURIComponent(orderBy) + ".desc";
                if (orderBy === "clicker_total_cookies") {
                    orderParam = "stats->clicker->totalCookies.desc.nullslast";
                }
                const endpoint = `${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.table}?select=username,stratagem_highscore,gd_completed_levels,gd_total_jumps,total_play_time,updated_at,stats&order=${orderParam}&limit=${limit}`;
                const res = await fetch(endpoint, {
                    method: "GET",
                    headers: getSupabaseHeaders()
                });
                if (!res.ok) return [];
                return await res.json();
            } catch (e) {
                console.warn("[OPS Stats] Nelze načíst žebříček:", e);
                return [];
            }
        },

        exportStatsJSON: function() {
            const data = {
                username: OPS_STATS.getUsername(),
                stats: loadLocalStats(),
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
        }
    };

    // -------------------------------------------------------------------------
    // UI MODAL & BADGE INJECTION
    // -------------------------------------------------------------------------
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
                background: rgba(15, 23, 42, 0.88);
                border: 1px solid rgba(56, 189, 248, 0.35);
                backdrop-filter: blur(8px);
                font-family: Consolas, monospace;
                font-size: 12px;
                color: #e2e8f0;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .ops-user-badge:hover {
                border-color: #38bdf8;
                background: rgba(30, 41, 59, 0.95);
                transform: translateY(-1px);
            }
            .ops-user-badge-name {
                color: #38bdf8;
                font-weight: bold;
            }
            .ops-cloud-sync-badge {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 6px 12px;
                border-radius: 9999px;
                background: rgba(15, 23, 42, 0.88);
                border: 1px solid rgba(56, 189, 248, 0.25);
                backdrop-filter: blur(8px);
                font-family: Consolas, monospace;
                font-size: 12px;
                color: #cbd5e1;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
                user-select: none;
            }
            .ops-cloud-sync-dot {
                display: inline-block;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #94a3b8;
                box-shadow: 0 0 6px rgba(148, 163, 184, 0.6);
                transition: background-color 0.3s ease, box-shadow 0.3s ease;
            }
            .ops-cloud-sync-text {
                font-weight: 600;
            }
            .ops-modal-backdrop {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.82);
                backdrop-filter: blur(6px);
                z-index: 1000000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 16px;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.25s ease;
            }
            .ops-modal-backdrop.open {
                opacity: 1;
                pointer-events: auto;
            }
            .ops-modal-card {
                background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
                border: 1px solid rgba(99, 102, 241, 0.4);
                border-radius: 16px;
                max-width: 440px;
                width: 100%;
                padding: 24px;
                color: #f8fafc;
                font-family: 'Segoe UI', system-ui, sans-serif;
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(99, 102, 241, 0.25);
                transform: scale(0.95);
                transition: transform 0.25s ease;
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
                margin-bottom: 8px;
            }
            .ops-modal-desc {
                font-size: 0.875rem;
                color: #94a3b8;
                line-height: 1.45;
                margin-bottom: 18px;
            }
            .ops-modal-input {
                width: 100%;
                background: rgba(15, 23, 42, 0.8);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 10px;
                padding: 12px 14px;
                color: #fff;
                font-family: Consolas, monospace;
                font-size: 1rem;
                margin-bottom: 16px;
                outline: none;
                box-sizing: border-box;
                transition: border-color 0.2s ease;
            }
            .ops-modal-input:focus {
                border-color: #38bdf8;
                box-shadow: 0 0 10px rgba(56, 189, 248, 0.35);
            }
            .ops-modal-btn-row {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
            }
            .ops-modal-btn {
                padding: 10px 18px;
                border-radius: 8px;
                font-weight: 700;
                font-size: 0.9rem;
                cursor: pointer;
                transition: all 0.2s ease;
                border: none;
            }
            .ops-modal-btn-primary {
                background: linear-gradient(135deg, #38bdf8, #2563eb);
                color: #fff;
                box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
            }
            .ops-modal-btn-primary:hover {
                filter: brightness(1.15);
                transform: translateY(-1px);
            }
            .ops-modal-btn-ghost {
                background: rgba(255, 255, 255, 0.08);
                color: #cbd5e1;
            }
            .ops-modal-btn-ghost:hover {
                background: rgba(255, 255, 255, 0.16);
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
                <div class="ops-modal-title">
                    Hráčský profil OPS
                </div>
                <div class="ops-modal-desc">
                    Zadej svou přezdívku pro ukládání do online žebříčku a přenos mezi počítači, nebo pokračuj jako anonymní host.
                </div>
                <input type="text" id="opsUsernameInput" class="ops-modal-input" placeholder="Tvoje přezdívka..." maxlength="24" autocomplete="off" />
                <div class="ops-modal-btn-row">
                    <button type="button" id="opsModalGuestBtn" class="ops-modal-btn ops-modal-btn-ghost">Hrát jako host</button>
                    <button type="button" id="opsModalSaveBtn" class="ops-modal-btn ops-modal-btn-primary">Pokračovat</button>
                </div>
            </div>
        `;
        document.body.appendChild(backdrop);

        const input = document.getElementById("opsUsernameInput");
        const saveBtn = document.getElementById("opsModalSaveBtn");
        const guestBtn = document.getElementById("opsModalGuestBtn");

        const submit = async () => {
            const val = input.value.trim();
            if (!val) {
                let current = OPS_STATS.getUsername();
                let guestName = (current && current.startsWith("Host")) ? current : `Host_${Math.floor(1000 + Math.random() * 9000)}`;
                saveBtn.disabled = true;
                await OPS_STATS.setUsername(guestName);
                saveBtn.disabled = false;
                backdrop.classList.remove("open");
                return;
            }
            saveBtn.disabled = true;
            saveBtn.textContent = "Ukládám...";
            await OPS_STATS.setUsername(val);
            saveBtn.disabled = false;
            backdrop.classList.remove("open");
        };

        const playAsGuest = async () => {
            let current = OPS_STATS.getUsername();
            let guestName = (current && current.startsWith("Host")) ? current : `Host_${Math.floor(1000 + Math.random() * 9000)}`;
            guestBtn.disabled = true;
            await OPS_STATS.setUsername(guestName);
            guestBtn.disabled = false;
            backdrop.classList.remove("open");
        };

        saveBtn.addEventListener("click", submit);
        guestBtn.addEventListener("click", playAsGuest);
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") submit();
        });
        backdrop.addEventListener("click", (e) => {
            if (e.target === backdrop) backdrop.classList.remove("open");
        });
    }

    function showUsernameModal(allowCancel = true) {
        createModalDOM();
        const backdrop = document.getElementById("opsStatsModalBackdrop");
        const input = document.getElementById("opsUsernameInput");
        const saveBtn = document.getElementById("opsModalSaveBtn");

        const current = OPS_STATS.getUsername();
        if (current && !current.startsWith("Host")) {
            input.value = current;
            saveBtn.textContent = `Hrát jako ${current}`;
        } else {
            input.value = "";
            saveBtn.textContent = "Pokračovat";
        }

        input.oninput = () => {
            const val = input.value.trim();
            saveBtn.textContent = val ? `Hrát jako ${val}` : "Pokračovat";
        };

        backdrop.classList.add("open");
        setTimeout(() => input.focus(), 100);
    }

    function updatePlayerBadgeUI() {
        const badge = document.getElementById("opsUserBadge");
        const username = OPS_STATS.getUsername();
        if (badge) {
            if (username) {
                badge.innerHTML = `<span class="ops-user-badge-name">${username}</span> <span style="opacity:0.6;font-size:10px;">[změnit]</span>`;
                badge.title = "Klikněte pro změnu přezdívky nebo přihlášení na jiném PC";
            } else {
                badge.innerHTML = `<span style="color:#fbbf24;">Zadat přezdívku</span>`;
            }
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
                        <span>Minecraft 1.12.2: <span id="opsMcModal1_12" style="color: #e2e8f0; font-family: monospace;">--</span></span>
                        <span>Minecraft 1.8.8: <span id="opsMcModal1_8" style="color: #e2e8f0; font-family: monospace;">--</span></span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 4px;">
                        <span>Poslední záloha: <span id="opsMcModalTime" style="color: #22c55e; font-family: monospace;">--</span></span>
                        <span>Velikost: <span id="opsMcModalSize" style="color: #fbbf24; font-family: monospace;">--</span></span>
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
        if (!currentUser || currentUser.startsWith("Host") || !isSupabaseConfigured()) {
            updateCloudSyncBadge("offline");
        } else {
            updateCloudSyncBadge("synced");
            syncFromCloud(currentUser).then(() => {
                updatePlayerBadgeUI();
            });
        }

        const isGamesHub = window.location.pathname.endsWith("games.html") || 
                          window.location.pathname.includes("games.html") || 
                          !!document.querySelector(".landing-page");

        if (isGamesHub) {
            setTimeout(() => showUsernameModal(true), 350);
        } else {
            const isGameOrHub = window.location.pathname.includes("statistika.html") || 
                                window.location.pathname.includes("/gd/") || 
                                window.location.pathname.includes("/stratagem/") || 
                                window.location.pathname.includes("/hyperdrive/") || 
                                window.location.pathname.includes("/mc/") ||
                                window.location.pathname.includes("/maturita/") ||
                                window.location.pathname.includes("/clicker/");

            if (isGameOrHub) {
                const user = OPS_STATS.getUsername();
                if (!user) {
                    setTimeout(() => showUsernameModal(true), 500);
                }
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

/**
 * OPS Game Statistics & Cloud Sync Manager
 * Supports localStorage persistence + Supabase Cloud REST Sync
 */
(function() {
    'use strict';

    // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    // SUPABASE CONFIGURATION (Doplňte své údaje ze Supabase projektu)
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
            playTime: 0
        },
        runner404: {
            hunterHighScore: 0,
            runnerHighScore: 0,
            playTime: 0
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
    // LOCAL STORAGE HELPERS
    // -------------------------------------------------------------------------
    function loadLocalStats() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_STATS);
            if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATS));
            const parsed = JSON.parse(raw);
            return {
                gd: { ...DEFAULT_STATS.gd, ...(parsed.gd || {}) },
                stratagem: { ...DEFAULT_STATS.stratagem, ...(parsed.stratagem || {}) },
                hyperdrive: { ...DEFAULT_STATS.hyperdrive, ...(parsed.hyperdrive || {}) },
                mc: { ...DEFAULT_STATS.mc, ...(parsed.mc || {}) },
                runner404: { ...DEFAULT_STATS.runner404, ...(parsed.runner404 || {}) },
                meta: { ...DEFAULT_STATS.meta, ...(parsed.meta || {}) }
            };
        } catch (e) {
            console.warn("[OPS Stats] Chyba při čtení localStorage:", e);
            return JSON.parse(JSON.stringify(DEFAULT_STATS));
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
    async function syncToCloud() {
        const username = OPS_STATS.getUsername();
        if (!username || !isSupabaseConfigured()) return;

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
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const errText = await res.text();
                console.warn("[OPS Stats Cloud] Upsert selhal:", res.status, errText);
            }
        } catch (err) {
            console.warn("[OPS Stats Cloud] Síťová chyba při syncToCloud:", err);
        }
    }

    async function syncFromCloud(username) {
        if (!username || !isSupabaseConfigured()) return null;

        try {
            const endpoint = `${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.table}?username=eq.${encodeURIComponent(username)}&select=*`;
            const res = await fetch(endpoint, {
                method: "GET",
                headers: getSupabaseHeaders()
            });
            if (!res.ok) return null;
            const rows = await res.json();
            if (rows && rows.length > 0 && rows[0].stats) {
                const cloudStats = rows[0].stats;
                const local = loadLocalStats();

                // Merge stats — zachováme vyšší skóre a maxima
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
                        playTime: Math.max(local.mc.playTime, cloudStats.mc?.playTime || 0)
                    },
                    runner404: {
                        hunterHighScore: Math.max(local.runner404.hunterHighScore, cloudStats.runner404?.hunterHighScore || 0),
                        runnerHighScore: Math.max(local.runner404.runnerHighScore, cloudStats.runner404?.runnerHighScore || 0),
                        playTime: Math.max(local.runner404.playTime, cloudStats.runner404?.playTime || 0)
                    },
                    meta: {
                        totalPlayTime: Math.max(local.meta.totalPlayTime, cloudStats.meta?.totalPlayTime || 0),
                        lastPlayedGame: cloudStats.meta?.lastPlayedGame || local.meta.lastPlayedGame,
                        lastActive: Date.now()
                    }
                };

                saveLocalStats(merged);
                return merged;
            }
        } catch (e) {
            console.warn("[OPS Stats Cloud] Chyba při syncFromCloud:", e);
        }
        return null;
    }

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
            localStorage.setItem(STORAGE_KEY_USER, clean);
            updatePlayerBadgeUI();

            // Zkus stáhnout existující profil ze Supabase (pro hraní na jiném PC)
            if (isSupabaseConfigured()) {
                await syncFromCloud(clean);
                await syncToCloud();
            }
            return true;
        },

        getStats: function() {
            return loadLocalStats();
        },

        // Zaznamenání skóre z různých her
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

        // Přičtení odehraného času (v sekundách)
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

        // Přírůstek počtu sezení / spuštění hry
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

        // Načtení globálního žebříčku ze Supabase
        fetchLeaderboard: async function(orderBy = "stratagem_highscore", limit = 10) {
            if (!isSupabaseConfigured()) return [];
            try {
                const endpoint = `${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.table}?select=username,stratagem_highscore,gd_completed_levels,gd_total_jumps,total_play_time,updated_at&order=${encodeURIComponent(orderBy)}.desc&limit=${limit}`;
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

        // Export do JSON souboru
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

        // Reset lokálních dat
        resetLocalStats: function() {
            if (confirm("Opravdu si přejete smazat všechny lokální herní statistiky?")) {
                localStorage.removeItem(STORAGE_KEY_STATS);
                window.location.reload();
            }
        },

        // Otevření modalu pro přezdívku
        promptUsernameModal: function() {
            showUsernameModal();
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
                    <span>🎮</span> Hráčský profil OPS
                </div>
                <div class="ops-modal-desc">
                    Zadej svou herní přezdívku (username). Skóre a statistiky se budou ukládat do žebříčku a při zadání stejného jména na jiném počítači se tvůj postup automaticky načte!
                </div>
                <input type="text" id="opsUsernameInput" class="ops-modal-input" placeholder="Tvoje přezdívka..." maxlength="24" autocomplete="off" />
                <div class="ops-modal-btn-row">
                    <button type="button" id="opsModalCancelBtn" class="ops-modal-btn ops-modal-btn-ghost" style="display:none;">Zrušit</button>
                    <button type="button" id="opsModalSaveBtn" class="ops-modal-btn ops-modal-btn-primary">Uložit profil</button>
                </div>
            </div>
        `;
        document.body.appendChild(backdrop);

        const input = document.getElementById("opsUsernameInput");
        const saveBtn = document.getElementById("opsModalSaveBtn");
        const cancelBtn = document.getElementById("opsModalCancelBtn");

        const submit = async () => {
            const val = input.value.trim();
            if (!val) {
                input.focus();
                return;
            }
            saveBtn.disabled = true;
            saveBtn.textContent = "Ukládám...";
            await OPS_STATS.setUsername(val);
            saveBtn.disabled = false;
            saveBtn.textContent = "Uložit profil";
            backdrop.classList.remove("open");
        };

        saveBtn.addEventListener("click", submit);
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") submit();
        });
        cancelBtn.addEventListener("click", () => {
            backdrop.classList.remove("open");
        });
    }

    function showUsernameModal(allowCancel = false) {
        createModalDOM();
        const backdrop = document.getElementById("opsStatsModalBackdrop");
        const input = document.getElementById("opsUsernameInput");
        const cancelBtn = document.getElementById("opsModalCancelBtn");

        input.value = OPS_STATS.getUsername();
        cancelBtn.style.display = allowCancel ? "inline-block" : "none";
        backdrop.classList.add("open");
        setTimeout(() => input.focus(), 100);
    }

    function updatePlayerBadgeUI() {
        const badge = document.getElementById("opsUserBadge");
        const username = OPS_STATS.getUsername();
        if (badge) {
            if (username) {
                badge.innerHTML = `👤 <span class="ops-user-badge-name">${username}</span> <span style="opacity:0.6;font-size:10px;">✎</span>`;
                badge.title = "Klikněte pro změnu přezdívky nebo přihlášení na jiném PC";
            } else {
                badge.innerHTML = `👤 <span style="color:#fbbf24;">Zadat přezdívku</span>`;
            }
        }
    }

    // -------------------------------------------------------------------------
    // AUTO-INIT ON LOAD
    // -------------------------------------------------------------------------
    window.addEventListener("DOMContentLoaded", function() {
        injectUIStyles();

        // Pokud jsme na herních stránkách a přezdívka chybí, zobrazíme dialog
        const isGameOrHub = window.location.pathname.includes("games.html") || 
                            window.location.pathname.includes("statistika.html") || 
                            window.location.pathname.includes("/gd/") || 
                            window.location.pathname.includes("/stratagem/") || 
                            window.location.pathname.includes("/hyperdrive/") || 
                            window.location.pathname.includes("/mc/");

        if (isGameOrHub) {
            const user = OPS_STATS.getUsername();
            if (!user) {
                // Počkáme chvilku a ukážeme modal
                setTimeout(() => showUsernameModal(false), 500);
            }
        }

        // Automatické stopky odehraného času na pozadí pro celou relaci
        let sessionSeconds = 0;
        let activeGame = null;
        if (window.location.pathname.includes("/hyperdrive/")) activeGame = "hyperdrive";
        else if (window.location.pathname.includes("/mc/")) activeGame = "mc";

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

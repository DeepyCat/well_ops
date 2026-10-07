(function() {
    'use strict';
    function noop() {}
    function resolveTrue() { return Promise.resolve(true); }
    function resolveObj() { return Promise.resolve({}); }

    window.PokiSDK = {
        init: function() { return Promise.resolve(window.PokiSDK); },
        initWithVideoHB: function() { return Promise.resolve(window.PokiSDK); },
        setDebug: noop,
        commercialBreak: resolveTrue,
        rewardedBreak: resolveTrue,
        displayAd: noop,
        destroyAd: noop,
        getLeaderboard: resolveObj,
        gameLoadingStart: noop,
        gameLoadingProgress: noop,
        gameLoadingFinished: noop,
        gameInteractive: noop,
        gameplayStart: noop,
        gameplayStop: noop,
        roundStart: noop,
        roundEnd: noop,
        happyTime: noop,
        muteAd: noop,
        setPlayerAge: noop,
        togglePlayerAdvertisingConsent: noop,
        toggleNonPersonalized: noop,
        setConsentString: noop,
        logError: noop,
        sendHighscore: noop,
        setDebugTouchOverlayController: noop,
        disableProgrammatic: noop,
        customEvent: noop,
        measure: noop
    };

    window.pokiReady = true;
    window.pokiAdBlock = true;

    window.initPokiBridge = function(n) {
        window.pokiBridge = n;
        if (window.unityGame) {
            try { window.unityGame.SendMessage(n, "ready"); } catch(e) {}
        }
        window.commercialBreak = function() {
            if (window.unityGame) {
                try { window.unityGame.SendMessage(n, "commercialBreakCompleted"); } catch(e) {}
            }
        };
        window.rewardedBreak = function() {
            if (window.unityGame) {
                try { window.unityGame.SendMessage(n, "rewardedBreakCompleted", "true"); } catch(e) {}
            }
        };
    };
})();
-- =============================================================================
-- OPS KASINO & GAME STATS — SUPABASE DATABASE SECURITY LOCKDOWN
-- Řeší všechny nálezy z 'OPS — Security Findings.md' (Nálezy 1-11 + Housekeeping)
-- Spusťte v Supabase Dashboard -> SQL Editor (role postgres)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- KROK 1: Vyčištění závadných a vulgárních účtů (Housekeeping)
-- -----------------------------------------------------------------------------
DELETE FROM player_stats 
WHERE username ~* '(^n[i1l]g+[e3a4r]+|^negr|^adolf|^epstein.*finger|kokot123|ihateniggers)';

-- Ošetření případných záporných nebo neplatných hodnot ve stávajících statistikách
UPDATE player_stats
SET 
    total_play_time = GREATEST(0, total_play_time),
    stratagem_highscore = GREATEST(0, stratagem_highscore),
    gd_completed_levels = GREATEST(0, LEAST(22, gd_completed_levels)),
    gd_total_jumps = GREATEST(0, gd_total_jumps);

-- -----------------------------------------------------------------------------
-- KROK 2: Oddělení autentizace do privátní tabulky player_auth (Nález 1)
-- (Hesla, soli a verifiery se NIKDY nesmí dostat do veřejných dotazů ani tabulky)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS player_auth (
    username text PRIMARY KEY,
    auth jsonb NOT NULL,
    auth_token text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Zapnutí RLS na player_auth – ŽÁDNÁ přímá práva pro anon / authenticated!
ALTER TABLE player_auth ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "no_direct_access_player_auth" ON player_auth;

-- Migrace existujících hesel z player_stats.stats->'auth' do privátní tabulky
INSERT INTO player_auth (username, auth, updated_at)
SELECT username, stats->'auth', COALESCE(updated_at, now())
FROM player_stats
WHERE stats ? 'auth' AND (stats->'auth') IS NOT NULL
ON CONFLICT (username) DO UPDATE
SET auth = EXCLUDED.auth, updated_at = EXCLUDED.updated_at;

-- Trvalé odstranění auth objektu z player_stats.stats
UPDATE player_stats
SET stats = stats - 'auth'
WHERE stats ? 'auth';

-- Přidání sloupce auth_token do player_stats pro ověřování vlastnictví a tokens sloupce
ALTER TABLE player_stats ADD COLUMN IF NOT EXISTS auth_token text;
ALTER TABLE player_stats ADD COLUMN IF NOT EXISTS tokens numeric DEFAULT 2000;

-- -----------------------------------------------------------------------------
-- KROK 3: Bezpečný veřejný pohled na žebříčky (Public Leaderboard View)
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS public_leaderboard CASCADE;

CREATE OR REPLACE VIEW public_leaderboard AS
SELECT 
    username,
    stratagem_highscore,
    gd_completed_levels,
    gd_total_jumps,
    total_play_time,
    updated_at,
    created_at,
    -- Herní statistiky očištěné od citlivých údajů
    jsonb_strip_nulls(
        jsonb_build_object(
            'clicker', stats->'clicker',
            'gacha', stats->'gacha',
            'meta', stats->'meta',
            'gd', stats->'gd',
            'stratagem', stats->'stratagem',
            'maturita', stats->'maturita',
            'runner404', stats->'runner404',
            'hyperdrive', stats->'hyperdrive',
            'mc', stats->'mc'
        )
    ) AS stats,
    blackjack,
    slots,
    roulette,
    wheel
FROM player_stats;

GRANT SELECT ON public_leaderboard TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- KROK 4: Zabezpečení player_stats triggerem proti neoprávněnému přepisu (Nález 2, 8, 10)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_player_ownership_and_invariants()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 1. Ověření vlastnictví řádku (Nález 2: Zabránění Account Takeover)
    -- Pokud má řádek nastavený auth_token (účet je chráněn heslem), 
    -- pak každá aktualizace musí poslat shodný auth_token.
    IF OLD.auth_token IS NOT NULL THEN
        IF NEW.auth_token IS NULL OR NEW.auth_token <> OLD.auth_token THEN
            RAISE EXCEPTION 'Neautorizovany pristup: ucet je chranen heslem.';
        END IF;
    END IF;

    -- Aktualizace času
    NEW.updated_at := now();

    -- 2. Omezení na nezáporné hodnoty (podpora libovolně velkých čísel z her)
    IF NEW.tokens IS NOT NULL THEN
        IF NEW.tokens < 0 THEN
            NEW.tokens := 0;
        END IF;
    END IF;

    IF NEW.stats IS NOT NULL AND NEW.stats ? 'gacha' AND (NEW.stats->'gacha'->>'tokens') IS NOT NULL THEN
        IF (NEW.stats->'gacha'->>'tokens')::numeric < 0 THEN
            NEW.stats := jsonb_set(NEW.stats, '{gacha,tokens}', '0'::jsonb);
        END IF;
    END IF;

    -- 3. Ověření invariantů kasino statistik (Nález 10)
    -- Slots
    IF NEW.slots IS NOT NULL THEN
        IF (NEW.slots->>'spins')::numeric < 0 OR
           (NEW.slots->>'totalWagered')::numeric < 0 OR
           (NEW.slots->>'totalWon')::numeric < 0 OR
           (NEW.slots->>'wins')::numeric > (NEW.slots->>'spins')::numeric OR
           (NEW.slots->>'biggest')::numeric > (NEW.slots->>'totalWon')::numeric THEN
            NEW.slots := OLD.slots;
        END IF;
    END IF;

    -- Roulette
    IF NEW.roulette IS NOT NULL THEN
        IF (NEW.roulette->>'spins')::numeric < 0 OR
           (NEW.roulette->>'totalWagered')::numeric < 0 OR
           (NEW.roulette->>'totalWon')::numeric < 0 OR
           (NEW.roulette->>'wins')::numeric > (NEW.roulette->>'spins')::numeric OR
           (NEW.roulette->>'biggest')::numeric > (NEW.roulette->>'totalWon')::numeric THEN
            NEW.roulette := OLD.roulette;
        END IF;
    END IF;

    -- Wheel
    IF NEW.wheel IS NOT NULL THEN
        IF (NEW.wheel->>'spins')::numeric < 0 OR
           (NEW.wheel->>'totalWagered')::numeric < 0 OR
           (NEW.wheel->>'totalWon')::numeric < 0 OR
           (NEW.wheel->>'wins')::numeric > (NEW.wheel->>'spins')::numeric OR
           (NEW.wheel->>'biggest')::numeric > (NEW.wheel->>'totalWon')::numeric THEN
            NEW.wheel := OLD.wheel;
        END IF;
    END IF;

    -- Blackjack
    IF NEW.blackjack IS NOT NULL THEN
        IF (NEW.blackjack->>'hands')::numeric < 0 OR
           (NEW.blackjack->>'wins')::numeric > (NEW.blackjack->>'hands')::numeric OR
           (NEW.blackjack->>'losses')::numeric > (NEW.blackjack->>'hands')::numeric OR
           (NEW.blackjack->>'pushes')::numeric > (NEW.blackjack->>'hands')::numeric OR
           (NEW.blackjack->>'blackjacks')::numeric > (NEW.blackjack->>'wins')::numeric THEN
            NEW.blackjack := OLD.blackjack;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_player_ownership ON player_stats;
CREATE TRIGGER trg_check_player_ownership
BEFORE UPDATE ON player_stats
FOR EACH ROW
EXECUTE FUNCTION check_player_ownership_and_invariants();

-- -----------------------------------------------------------------------------
-- KROK 5: Zabezpečené RPC funkce pro Autentizaci a Serverovou Herní Logiku
-- -----------------------------------------------------------------------------

-- 5.1 Bezpečné načtení parametrů pro ověření hesla (Nález 1)
-- Klient dostane POUZE salt, verifier, algo a iterations. Nikdy ne hash ani plaintext!
CREATE OR REPLACE FUNCTION get_user_auth(p_username text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    r jsonb;
BEGIN
    SELECT jsonb_build_object(
        'exists', true,
        'hasPassword', (auth->>'verifier') IS NOT NULL OR (auth->>'hash') IS NOT NULL,
        'salt', auth->>'salt',
        'verifier', auth->>'verifier',
        'algo', auth->>'algo',
        'iterations', (auth->>'iterations')::int
    ) INTO r
    FROM player_auth
    WHERE username = p_username;

    IF r IS NULL THEN
        RETURN jsonb_build_object('exists', false, 'hasPassword', false);
    END IF;

    RETURN r;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_auth TO anon, authenticated;

-- 5.2 Uložení nového hesla nebo registrace (Nález 2)
CREATE OR REPLACE FUNCTION save_user_auth(p_username text, p_auth jsonb, p_auth_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    existing_token text;
BEGIN
    IF p_username IS NULL OR LENGTH(TRIM(p_username)) = 0 THEN
        RAISE EXCEPTION 'Neplatné uživatelské jméno';
    END IF;

    SELECT auth_token INTO existing_token FROM player_auth WHERE username = p_username;
    
    -- Pokud účet již má nastavený auth_token, změna hesla vyžaduje předložení původního auth_tokenu
    IF existing_token IS NOT NULL AND (p_auth_token IS NULL OR existing_token <> p_auth_token) THEN
        RAISE EXCEPTION 'Neautorizovaný pokus o změnu hesla';
    END IF;

    INSERT INTO player_auth (username, auth, auth_token, updated_at)
    VALUES (p_username, p_auth, p_auth_token, now())
    ON CONFLICT (username) DO UPDATE
    SET auth = EXCLUDED.auth, auth_token = EXCLUDED.auth_token, updated_at = EXCLUDED.updated_at;

    UPDATE player_stats
    SET auth_token = p_auth_token
    WHERE username = p_username;

    RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION save_user_auth TO anon, authenticated;

-- 5.3 Bezpečná autoritativní směna sušenek na tokeny (Nález 7, 11)
CREATE OR REPLACE FUNCTION exchange_cookies(player_username text, cost numeric, gain numeric, player_auth_token text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    allowed_gain numeric;
    current_tokens numeric;
    current_cookies numeric;
    new_tokens numeric;
    new_cookies numeric;
    p_stats jsonb;
    stored_token text;
BEGIN
    IF cost <= 0 OR gain <= 0 THEN
        RAISE EXCEPTION 'Neplatná částka';
    END IF;

    -- Pevný kurz: max 160 tokenů na 1000 sušenek
    allowed_gain := FLOOR(cost * (160.0 / 1000.0));
    IF gain > allowed_gain THEN
        gain := allowed_gain;
    END IF;

    SELECT stats, auth_token INTO p_stats, stored_token 
    FROM player_stats 
    WHERE username = player_username 
    FOR UPDATE;

    IF p_stats IS NULL THEN
        RAISE EXCEPTION 'Hráč nenalezen';
    END IF;

    IF stored_token IS NOT NULL AND (player_auth_token IS NULL OR player_auth_token <> stored_token) THEN
        RAISE EXCEPTION 'Neautorizovaný přístup k účtu';
    END IF;

    current_cookies := COALESCE((p_stats->'clicker'->>'cookies')::numeric, 0);
    IF current_cookies < cost THEN
        RAISE EXCEPTION 'Nedostatek sušenek na účtu';
    END IF;

    new_cookies := GREATEST(0, current_cookies - cost);
    current_tokens := COALESCE((p_stats->'gacha'->>'tokens')::numeric, 2000);
    new_tokens := current_tokens + gain;

    p_stats := jsonb_set(p_stats, '{clicker,cookies}', to_jsonb(new_cookies));
    p_stats := jsonb_set(p_stats, '{gacha,tokens}', to_jsonb(new_tokens));

    UPDATE player_stats 
    SET stats = p_stats, updated_at = NOW() 
    WHERE username = player_username;

    RETURN jsonb_build_object('success', true, 'tokens', new_tokens, 'cookies', new_cookies);
END;
$$;

GRANT EXECUTE ON FUNCTION exchange_cookies TO anon, authenticated;

-- 5.4 Serverové autoritativní roztočení rulety (Nález 3, 9)
CREATE OR REPLACE FUNCTION spin_roulette(player_username text, bet numeric, kind text, choice text, player_auth_token text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    n int;
    mult numeric := 0;
    won boolean := false;
    returned numeric := 0;
    p_stats jsonb;
    cur_tokens numeric;
    new_tokens numeric;
    stored_token text;
    is_red boolean;
    red_set int[] := ARRAY[1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
BEGIN
    IF bet <= 0 THEN
        RAISE EXCEPTION 'Neplatná výše sázky';
    END IF;

    SELECT stats, auth_token INTO p_stats, stored_token 
    FROM player_stats 
    WHERE username = player_username 
    FOR UPDATE;

    IF p_stats IS NULL THEN
        RAISE EXCEPTION 'Hráč nenalezen';
    END IF;

    IF stored_token IS NOT NULL AND (player_auth_token IS NULL OR player_auth_token <> stored_token) THEN
        RAISE EXCEPTION 'Neautorizovaný přístup k účtu';
    END IF;

    cur_tokens := COALESCE((p_stats->'gacha'->>'tokens')::numeric, 2000);
    IF cur_tokens < bet THEN
        RAISE EXCEPTION 'Nedostatek tokenů na účtu';
    END IF;

    -- Skutečně bezpečná náhoda generovaná serverem
    n := FLOOR(random() * 37)::int;
    is_red := (n = ANY(red_set));

    IF kind = 'number' THEN
        mult := 36;
        won := (n = choice::int);
    ELSIF kind = 'color' THEN
        mult := 2;
        won := (n <> 0 AND ((choice = 'red' AND is_red) OR (choice = 'black' AND NOT is_red)));
    ELSIF kind = 'parity' THEN
        mult := 2;
        won := (n <> 0 AND ((choice = 'even' AND n % 2 = 0) OR (choice = 'odd' AND n % 2 = 1)));
    ELSIF kind = 'half' THEN
        mult := 2;
        won := (n <> 0 AND ((choice = 'low' AND n BETWEEN 1 AND 18) OR (choice = 'high' AND n BETWEEN 19 AND 36)));
    ELSIF kind = 'dozen' THEN
        mult := 3;
        won := (n <> 0 AND (
            (choice = '1' AND n BETWEEN 1 AND 12) OR
            (choice = '2' AND n BETWEEN 13 AND 24) OR
            (choice = '3' AND n BETWEEN 25 AND 36)
        ));
    END IF;

    IF won THEN
        returned := bet * mult;
        new_tokens := cur_tokens - bet + returned;
    ELSE
        returned := 0;
        new_tokens := GREATEST(0, cur_tokens - bet);
    END IF;

    p_stats := jsonb_set(p_stats, '{gacha,tokens}', to_jsonb(new_tokens));

    UPDATE player_stats 
    SET stats = p_stats, updated_at = NOW() 
    WHERE username = player_username;

    RETURN jsonb_build_object(
        'result', n,
        'won', won,
        'returned', returned,
        'net', returned - bet,
        'balance', new_tokens
    );
END;
$$;

GRANT EXECUTE ON FUNCTION spin_roulette TO anon, authenticated;

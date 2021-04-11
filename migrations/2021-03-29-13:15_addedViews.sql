CREATE VIEW athletes_scoring AS
SELECT athlete_name,
    event_name,
    competition_name,
    main,
    tie_break,
    secondary,
    tie_break_secondary
FROM scores
    JOIN competes_in ON competes_in.competes_in_id = scores.competes_in_id
    JOIN athletes ON athletes.athlete_id = competes_in.athlete_id;
CREATE VIEW events_scoring AS
SELECT event_name,
    main_score,
    main_tie_break,
    competition_name,
    secondary_score,
    secondary_tie_break
FROM events
    JOIN scoring_methods ON events.scoring_method_id = scoring_methods.scoring_method_id;
CREATE TABLE competitions(
    competition_name VARCHAR(200) PRIMARY KEY,
    competition_adress VARCHAR(200),
    start_date DATE,
    end_date DATE,
    max_athletes INT,
    number_event INT,
    competition_contact_phone VARCHAR(200),
    competition_contact_email VARCHAR(200)
);
CREATE TABLE athletes(
    athlete_id SERIAL PRIMARY KEY,
    athlete_name VARCHAR(200),
    gender VARCHAR(200),
    date_of_birth DATE,
    nationality VARCHAR(200),
    weight VARCHAR(200),
    height VARCHAR(200)
);
CREATE TABLE partners(
    company_name VARCHAR(200) PRIMARY KEY,
    company_contact_phone VARCHAR(200),
    company_contact_email VARCHAR(200),
    company_adress VARCHAR(200),
    token VARCHAR(200)
);
CREATE TABLE scoring_methods(
    scoring_method_id SERIAL PRIMARY KEY,
    main_score VARCHAR(200),
    main_tie_break VARCHAR(200),
    secondary_score VARCHAR(200),
    secondary_tie_break VARCHAR(200)
);
CREATE TABLE organizes(
    organizes_id SERIAL PRIMARY KEY,
    competition_year INT,
    competition_name VARCHAR(200),
    company_name VARCHAR(200),
    CONSTRAINT fk_partners FOREIGN KEY(company_name) REFERENCES partners(company_name),
    CONSTRAINT fk_competitions FOREIGN KEY(competition_name) REFERENCES competitions(competition_name)
);
CREATE TABLE events(
    event_name VARCHAR(200) PRIMARY KEY,
    competition_name VARCHAR(200),
    scoring_method_id INT,
    CONSTRAINT fk_scoring_methods FOREIGN KEY(scoring_method_id) REFERENCES scoring_methods(scoring_method_id),
    CONSTRAINT fk_competitions FOREIGN KEY(competition_name) REFERENCES competitions(competition_name)
);
CREATE TABLE competes_in(
    competes_in_id SERIAL PRIMARY KEY,
    athlete_id INT,
    event_name VARCHAR(200),
    competition_name VARCHAR(200),
    CONSTRAINT fk_athletes FOREIGN KEY(athlete_id) REFERENCES athletes(athlete_id),
    CONSTRAINT fk_competitions FOREIGN KEY(competition_name) REFERENCES competitions(competition_name),
    CONSTRAINT fk_events FOREIGN KEY(event_name) REFERENCES events(event_name)
);
CREATE TABLE scores(
    score_id SERIAL PRIMARY KEY,
    competes_in_id INT,
    main VARCHAR(200),
    tie_break VARCHAR(200),
    secondary VARCHAR(200),
    tie_break_secondary VARCHAR(200),
    CONSTRAINT fk_competes_in FOREIGN KEY(competes_in_id) REFERENCES competes_in(competes_in_id)
);
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

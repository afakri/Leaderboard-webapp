CREATE TABLE competitions(
    competition_id SERIAL PRIMARY KEY,
    name VARCHAR(200),
    start_date_time TIMESTAMP,
    duration INT
);
CREATE TABLE athletes(
    athlete_id SERIAL PRIMARY KEY,
    competition_id SERIAL,
    name VARCHAR(200),
    gender VARCHAR(200),
    date_of_birth VARCHAR(200),
    FOREIGN KEY (competition_id) REFERENCES competitions(competition_id)
);

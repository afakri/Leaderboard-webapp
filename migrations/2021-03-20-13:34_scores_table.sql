CREATE TABLE scores(
    score_id SERIAL PRIMARY KEY,
    competes_in_id INT,
    main VARCHAR(200),
    tie_break VARCHAR(200),
    secondary VARCHAR(200),
    tie_break_secondary VARCHAR(200),
    CONSTRAINT fk_competes_in FOREIGN KEY(competes_in_id) REFERENCES competes_in(competes_in_id)
);
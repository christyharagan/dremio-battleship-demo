WITH ships AS (SELECT centre_x, centre_y, id, orientation, "value", length, premium, 2 as j
FROM "@christy".locations l INNER JOIN "@christy".premiums p ON l.id = p.ship_id GROUP BY centre_x, centre_y, id, orientation, "value", premium, length),

shots AS (SELECT FLATTEN(shots) FROM "@christy".shots),

extracted AS (SELECT s.EXPR$0.x as shot_x, s.EXPR$0.y as shot_y, 2 as j from shots s),

joined AS (SELECT shot_x, shot_y, (shot_x - centre_x) as off_x, (shot_y - centre_y) as off_y, orientation, (length - 1) / 2 as l, ("value" / length) as cost FROM ships FULL OUTER JOIN extracted ON ships.j = extracted.j),

calculated AS (SELECT shot_x, shot_y, off_x, off_y, cost, CASE WHEN orientation = 'x' THEN (CASE WHEN off_y = 0 AND off_x <= l THEN 'hit' ELSE 'miss' END) ELSE (CASE WHEN off_x = 0 AND off_y <= l THEN 'hit' ELSE 'miss' END) END as hitOrMiss from joined)

SELECT shot_x, shot_y, CASE WHEN hitOrMiss = 'hit' THEN 0 ELSE ((1 / (8 * PI)) * EXP(-0.125 * (off_x * off_x + off_y * off_y))) END as risk, CASE WHEN hitOrMISS = 'hit' THEN cost ELSE 0 END as cost FROM calculated

SELECT id, centre, centre[1] AS centre_y, centre[0] AS centre_x, length, orientation
FROM "aws-s3"."dremio-battleship"."locations.json"
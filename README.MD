Dremio Battleship Demo
==

A take on the "battleships" game, show-casing [Dremio](www.dremio.com) creating queries across AWS and Azure.

Set-up
==

Dremio
--

Ensure Dremio is installed. The ODBC driver for Dremio must also be installed on the host that will run the server ([see below](#server)).

The demo requires four tables in Dremio:

### Locations

Sample data for this table can be found in [data/locations.json](data/locations.json). This file is expected to be found on an Amazon S3 bucket called "dremio-battleship".

Once the data is uploaded to S3, from Dremio, import the data source, then run SQL found at [sql/locations.sql](sql/locations.sql) to create the data-set. Ensure this data-set is saved under the user space. Note that would will need to change the "@christy" reference.

This data will not change during the demo, so reflections can be set-up for this data-set.

### Premiums

Sample data for this table can be found in [data/premiums.json](data/premiums.json). This data is expected to be found on a MySQL database. SQL for creating the appropriate table can be found at [sql/createPremiumsTable.sql](sql/createPremiumsTable.sql). For easy insertion of the data, run [sql/insertPremiumsData.sql](sql/insertPremiumsData.sql).

Once the data is inserted into MySQL, from Dremio, import the data source, then run SQL found at [sql/premiums.sql](sql/premiums.sql) to create the data-set. Ensure this data-set is saved under the user space. Note that would will need to change the "@christy" reference.

### Shots

Sample data for this table can be found in [data/shots.json](data/shots.json). This file is expected to be found on an Amazon S3 bucket called "dremio-battleship".

This data will get reset everytime the server is run (or the 'reset' url is accessed). This sample data is here just to help initial set-up.

Once the data is uploaded to S3, from Dremio, import the data source, then run SQL found at [sql/shots.sql](sql/shots.sql) to create the data-set. Ensure this data-set is saved under the user space. Note that would will need to change the "@christy" reference.

### Risk

This table is entirely derived from the three tables above.

Run SQL found at [sql/risk.sql](sql/risk.sql) to create the data-set. Ensure this data-set is saved under the user space. Note that would will need to change the "@christy" reference.

Server
--

The demo server is run on Node JS. The server code can be found under the app directory. From this directory, run:

```
npm install
bower install
```

Open up index.js and change the first few lines to suit your environment.

Running the demo
==

To launch the server, from the app directory, run:

```
node index.js
```

Then (depending on the server port specified in index.js), navigate to the main page. For example, if the host name of the server is "localhost" and the port is "8080", go to: http://localhost:8080.

Click on the squares to "fire a shot" in that region, and notice how the risk and capital graphs change accordingly.

To reset the data, either restart the server, or navigate to http://localhost:8080/reset.
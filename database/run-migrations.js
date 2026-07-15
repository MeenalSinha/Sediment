/* eslint-disable no-console */
require("dotenv/config");
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const schemaPath = path.join(__dirname, "schema.sql");
  const seedPath = path.join(__dirname, "seed.sql");

  console.log("Applying schema.sql...");
  await client.query(fs.readFileSync(schemaPath, "utf8"));

  if (process.argv.includes("--seed")) {
    console.log("Applying seed.sql...");
    await client.query(fs.readFileSync(seedPath, "utf8"));
  }

  console.log("Done.");
  await client.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

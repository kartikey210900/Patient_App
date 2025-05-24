import { PGlite } from "@electric-sql/pglite";
import { openDB } from "idb";

export async function initDB() {
  const idb = await openDB("patient-db", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("patients")) {
        db.createObjectStore("patients", { keyPath: "id", autoIncrement: true });
      }
    },
  });

  const db = new PGlite();

  await db.query(`
    CREATE TABLE IF NOT EXISTS patients (
      id SERIAL PRIMARY KEY,
      name TEXT,
      age INTEGER,
      gender TEXT,
      address TEXT,
      medical_conditions TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("Patients table ensured");


  const tx = idb.transaction("patients", "readonly");
  const store = tx.objectStore("patients");
  const allPatients = await store.getAll();

  for (const p of allPatients) {
    if (p.id == null) {
      console.warn("Skipping patient with null/undefined id during sync:", p);
      continue;
    }
    await db.query(
      `INSERT INTO patients (id, name, age, gender, address, medical_conditions, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(id) DO NOTHING`,
      [p.id, p.name, p.age, p.gender, p.address, p.medical_conditions, p.created_at]
    );
  }

  return { db, idb };
}

export async function persistDB(db, idb) {
  const result = await db.query("SELECT * FROM patients");
  const patients = result.rows;

  const tx = idb.transaction("patients", "readwrite");
  const store = tx.objectStore("patients");
  await store.clear();

  for (const patient of patients) {
    await store.put(patient);
  }

  await tx.done;
}
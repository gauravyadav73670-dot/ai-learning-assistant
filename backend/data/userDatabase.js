import { randomBytes, randomUUID, scrypt as scryptCallback } from "crypto";
import { readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";

const scrypt = promisify(scryptCallback);
const currentDir = dirname(fileURLToPath(import.meta.url));
const databasePath = join(currentDir, "users.json");

const readDatabase = async () => {
  const data = await readFile(databasePath, "utf8");
  return JSON.parse(data);
};

const writeDatabase = async (database) => {
  await writeFile(databasePath, `${JSON.stringify(database, null, 2)}\n`);
};

const normalizeEmail = (email) => email.trim().toLowerCase();

const hashPassword = async (password, salt = randomBytes(16).toString("hex")) => {
  const hash = await scrypt(password, salt, 64);

  return {
    salt,
    passwordHash: hash.toString("hex"),
  };
};

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

export const createUser = async ({ name, email, password }) => {
  const database = await readDatabase();
  const normalizedEmail = normalizeEmail(email);
  const existingUser = database.users.find((user) => user.email === normalizedEmail);

  if (existingUser) {
    return {
      error: "An account with this email already exists",
    };
  }

  const passwordData = await hashPassword(password);
  const user = {
    id: randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    ...passwordData,
    createdAt: new Date().toISOString(),
  };

  database.users.push(user);
  await writeDatabase(database);

  return {
    user: publicUser(user),
  };
};

export const verifyUser = async ({ email, password }) => {
  const database = await readDatabase();
  const normalizedEmail = normalizeEmail(email);
  const user = database.users.find((item) => item.email === normalizedEmail);

  if (!user) {
    return {
      error: "Invalid email or password",
    };
  }

  const { passwordHash } = await hashPassword(password, user.salt);

  if (passwordHash !== user.passwordHash) {
    return {
      error: "Invalid email or password",
    };
  }

  return {
    user: publicUser(user),
  };
};

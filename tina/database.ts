import { createDatabase, createLocalDatabase } from "@tinacms/datalayer";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.TINA_PUBLIC_IS_LOCAL) {
  console.warn("TINA_PUBLIC_IS_LOCAL is not defined")
}

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === "true";

if (!isLocal && !process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI must be defined")
}

const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

async function createProductionDatabase() {
  const [{ MongodbLevel }, { GitHubProvider }] = await Promise.all([
    import("mongodb-level"),
    import("tinacms-gitprovider-github"),
  ]);
  
  return createDatabase({
    gitProvider: new GitHubProvider({
      branch,
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      token: process.env.GITHUB_PERSONAL_ACCESS_TOKEN!,
    }),
    databaseAdapter: new MongodbLevel<string, Record<string, unknown>>({
      collectionName: 'tinacms',
      dbName: "tinacms-self-host",
      mongoUri: process.env.MONGODB_URI!,
    }),
    namespace: branch,
  });
}

export default isLocal
  ? createLocalDatabase()
  : createProductionDatabase();

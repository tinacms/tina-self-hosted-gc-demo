import DiscordProvider from 'next-auth/providers/discord'
import NextAuth from 'next-auth'
import express, { RequestHandler } from "express";
import {
  TinaNodeBackend,
  LocalBackendAuthProvider,
} from "@tinacms/datalayer";
import { AuthJsBackendAuthProvider, TinaAuthJSOptions } from "tinacms-authjs";
import cookieParser from "cookie-parser";

import cors from "cors";
import dotenv from "dotenv";

import { databaseClient } from "./tina/__generated__/databaseClient";

dotenv.config();

const port = process.env.PORT || 3000;

const app = express();
app.use(express.static("_site"));

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
app.use(cookieParser());

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === "true";

const authOptions = TinaAuthJSOptions({
    databaseClient,
    secret: process.env.NEXTAUTH_SECRET!,
    uidProp: 'name', // name is the unique identifier for Discord
    providers: [
      DiscordProvider({
        clientId: process.env.DISCORD_CLIENT_ID!,
        clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      })
    ]
  })

const handler = TinaNodeBackend({
  authProvider: isLocal
    ? LocalBackendAuthProvider()
    : AuthJsBackendAuthProvider({ authOptions }),
  databaseClient,
});

const handleTina: RequestHandler = async (req, res) => {
  req.query = {
    ...(req.query || {}),
    routes: req.params[0].split("/"),
  };

  await handler(req, res);
};

app.all("/api/tina/*", async (req, res, next) => {
  // Modify request if needed
  handleTina(req, res, next);
});

app.all("/api/auth/*", async (req, res, next) => {
  // setup nextauth query
  req.query.nextauth = req.path.split('/').slice(3)
  NextAuth(authOptions)(req, res)
});

app.listen(port, () => {
  console.log(`express backend listing on port ${port}`);
});

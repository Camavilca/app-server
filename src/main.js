import express from "express";
import loader from "./loaders";

// Trick to get root directory project
// https://www.abeautifulsite.net/determining-your-apps-base-directory-in-nodejs
global.__basedir = __dirname;

async function startServer() {
  const app = express();
  await loader({ app });
}

startServer().catch(console.log);

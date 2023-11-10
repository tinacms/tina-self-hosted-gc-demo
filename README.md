# TinaCMS Self-Hosted Google Cloud Demo

This is a demo of how one can self-host TinaCMS with a static site hosted on Google Cloud's Cloud Run.

This site is set up to use 11ty for the static site generator, but you can use any static site generator you want.

## Overview

This demo uses the [MongoDB database adapter](https://tina.io/docs/reference/self-hosted/database-adapter/mongodb/), [AuthJS authentication](https://tina.io/docs/reference/self-hosted/authentication-provider/next-auth/), and the [GitHub git provider](https://tina.io/docs/reference/self-hosted/git-provider/github/). These can be replaced with other adapters/providers as needed.

## Setup Instructions

### Setting Up MongoDB

You can use a local or remote MongoDB database. You'll need to provide the connection string in the `.env` file.

Check out [this guide](https://www.mongodb.com/basics/create-database) on how to create a free MongoDB database.

### Configuring Environment Variables

Copy the `.env.sample` and provide the appropriate values:

```bash
cp .env.sample .env
```

`GITHUB_OWNER`: The owner of the GitHub repo you want to use
`GITHUB_REPO`: The name of the GitHub repo you want to use
`GITHUB_BRANCH`: The branch of the GitHub repo you want to use
`GITHUB_PERSONAL_ACCESS_TOKEN`: A [GitHub personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token) with repo access to both read and write
`MONGO_URI`: The connection string for your MongoDB database
`NEXTAUTH_SECRET`: A random string used to encrypt the session
`DISCORD_CLIENT_ID`: The client ID for your Discord app
`DISCORD_CLIENT_SECRET`: The client secret for your Discord app

## Install dependencies

```
yarn install
```

## Local Development

To run the app locally:

```
yarn run dev
```

This will start the app locally.

### Testing auth

Set `TINA_PUBLIC_IS_LOCAL` to "false" to test your auth integration locally or use `yarn run dev:prod`.

## Deploying to Google Cloud

### Setting up Google Cloud

You'll need to set up a Google Cloud account and project. You can follow [this guide](https://cloud.google.com/run/docs/quickstarts/build-and-deploy/nodejs) to get started.

The steps below assume you have the [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed and configured.

First create the project. After the project is created, select it and enable the Secret Manager API and the Identity and Access Management (IAM) API.

#### Setting up Secrets 

You'll need to set up the following secrets in Google Cloud:

- GITHUB_PERSONAL_ACCESS_TOKEN (the GitHub personal access token)
- NEXTAUTH_SECRET (a random string used to encrypt the session)
- MONGO_URI (the connection string for your MongoDB database)
- DISCORD_CLIENT_ID (the client ID for your Discord app)
- DISCORD_CLIENT_SECRET (the client secret for your Discord app)

The following principals must be granted the `Secret Manager Secret Accessor` role on the secret: 

- [PROJECT_NUMBER]-compute@developer.gserviceaccount.com
- [PROJECT_NUMBER]@cloudbuild.gserviceaccount.com

Where `[PROJECT_NUMBER]` is the number of your Google Cloud project. Note that the (IAM) API must be enabled to add these principals.

#### Cloud Run

Create a new Service. Select 'Continuously deploy new revisions from a source repository'. 

Select the Source Repository (Connecting if necessary). Click Next. Set the branch regex (ie `^main$`). Set the Build Type to Dockerfile. Click Save.

Under Authentication, select 'Allow unauthenticated invocations'. Under Container(s), Volumes, Networking, Security, set the container port to 3000. Click done. Click Create.

Push a change to the configured branch to deploy.

Note: For Discord (and other providers), the _DOMAIN substitution variable must be set to the domain of the deployed app. This can be done in the Cloud Run UI. This variable is used to set the NEXTAUTH_URL environment variable.

## Support

If you have any questions, please reach out to us on [Discord](https://discord.com/invite/zumN63Ybpf). We are happy to help!

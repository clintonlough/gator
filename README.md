# gator

## Description
Gator is a CLI blog aggregator that fetches posts from any registed feeds and provides the user with the most recent posts from these feeds.

## Commands
Gator works using a series of CLI commands and arguments. Below is a list of commands. All commands must start with "npm run start":

- login: Sets the current user as current user for purpose of fetching posts and creating follows.
- register: Used to create a new user
- reset: Wipes the database of all users, feeds, posts, and feed_follows
- users: Provides a list of all currently registered users
- agg: starts the fetch cycle for all feeds for the registed user. Requries a time parameter which is used to set frequency of fetches. E.g. 1h or 5s or 10m.
- addfeed: Add a new feed to the database. Requires a name and url arguments as strings.
- feeds: Provides a list of all feeds registered in the database.
- follow: Follows a registered feed for the current user. Requires a url argument.
- following: Provides a list of all feeds a user is following.
- unfollow: Stop following a registered feed as current user. Requires a url arugment.
- browse: Provides the most recent posts for a user. Optional limit argument for how many posts to display. E.g. 4

## Required Dependencies
The following dev packages are required in order to run Gator:
- node: 25.0.3
- drizzle-kit: 0.31.8
- tsx: 4.21.0
- typescript: 5.9.3

These packages are also required:
- drizzle-orm: 0.45.1
- fast-xml-parser: 5.3.3
- postgres: 3.4.7

## Setting up Gator
You will need to setup a .gatorconfig.json file in your root directory with the following string inside in order to properly access the postgres db.

{"db_url":"postgres://postgres:PASSWORD@localhost:PORT/gator?sslmode=disable","current_user_name":"USERNAME"}

Replace PASSWORD and USERNAME with your db user credentials.
Replace PORT with your db access port. 5432 is normally default.

If you need to create an initial migration for postgres, use the commands:
- npm run generate
- npm run migrate
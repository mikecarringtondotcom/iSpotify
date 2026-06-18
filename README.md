
Readme · MD
# iSpotify by mikeincode
 
I built this because I wanted a slick Picture-in-Picture Spotify controller for my PC — the default one just doesn't have cool points. Spotify's API made it pretty straightforward.
 
> **If u found this from Instagram or TikTok** I can't add everyone as an authorized user on my Spotify Developer account, BUT you can run your own copy for free all you gotta do is follow the steps below. Make sure you have a Spotify Premium account or this won't work.
 
---
 
## Prerequisites
 
Before you start, make sure you have the following installed on your computer:
 
- **Git** — used to download the project. [Download Git here](https://git-scm.com/downloads)
- **Node.js** — used to run the app. [Download Node.js here](https://nodejs.org/) *(choose the "LTS" version)*
To check if you already have them, open your terminal *(Mac: search "Terminal" · Windows: search "Command Prompt" or "PowerShell")* and run:
 
```
git --version
node --version
```
 
If both print a version number, you're good to go.
 
---
 
## Setup
 
### 1. Clone the repository
 
In your terminal, run:
 
```
git clone <URL>
```
 
Replace `<URL>` with the link to this repo. Then navigate into the folder it creates:
 
```
cd iSpotify
```
 
### 2. Install dependencies
 
```
npm install
```
 
This downloads all the package dependencies.
 
### 3. Set up your Spotify Developer account
 
The app needs permission to talk to Spotify on your behalf. Here's how to get that:
 
1. Go to [developer.spotify.com](https://developer.spotify.com) and log in with your Spotify account
2. Click **"Create App"** and fill in a name and description *(anything works)*
3. When asked what APIs you'll use, select:
     Web Playback SDK
     Web API
4. Under **Redirect URIs**, add exactly: http://127.0.0.1:5173/
5. Save your app, then find and copy your **Client ID** from the dashboard
### 4. Configure your environment file
 
In the project folder, find the file called `.env.example`. Rename it to `.env`, then open it and fill in your values:
 
```
VITE_SPOTIFY_CLIENT_ID=paste_your_client_id_here
VITE_REDIRECT_URI=http://127.0.0.1:5173/
```
 
> **Note:** The `.env` file may be hidden by default in some file browsers. In VS Code, it will appear in the left sidebar — just click it to open and edit it like any text file.
 
---
 
## Running the App
 
Once everything is set up, start the app with:
 
```
npm run dev
```
 
Then open your browser and go to `http://127.0.0.1:5173/`. Log in with Spotify and you're in! Have fun and look around the menu and see what you can find :D
 
---
 
## Things to Know
 
- You need **Spotify Premium** for playback to work this is just a limitation of Spotify's API
- You must have Spotify **open and playing on another device or tab** before the player will activate
- If you ever change your Redirect URI or Client ID, restart the app with `npm run dev`

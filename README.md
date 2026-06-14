# iSpotify by mikeincode
I made this because I wanted a little PiP app that could connect to my Spotify account because I like using Spotify on my PC but the PiP lacks cool points IMO. Luckily Spotify happens to have a pretty good API structure so this was fairly simple and I was able to add a bunch of settings lol. 

If you've come here from an Instagram/TikTok post, please look at the instructions for usage below cause I can't add everybody on my Spotify Developer account as an authorized user but you can implement this urself as long as you have a Spotify premium account. 

If you don't know how to clone a git repo copy the URL and run git clone<URl>. Make sure you actually have git installed btw.

 # **Usage**

After cloning this repo find the file .env.example
  Here is where you need to add ur CLIENT ID and ur REDIRECT_URI.
  
  You get these two by going to https://developer.spotify.com
  Here you must:
    Make an account
    Follow through with setup
     
     When selecting API usage select:
       Web Playback SDK
        Web API
Now when you are in the Spotify Developer Dashboard, find your client ID and replace in that example .env file VITE_SPOTIFY_CLIENT_ID=
For your REDIRECT_URI

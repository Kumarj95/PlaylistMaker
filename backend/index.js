import express, { json } from "express";
import fetchAllSongs from "./middleware.js";
import dotenv from "dotenv";
import connectDB from "./connectDB.js";
import Song from "./models/songModel.js";
import axios from "axios";
import nodeFetch from "node-fetch";
import querystring from "querystring";
const app = express();
dotenv.config();

connectDB();
const port = process.env.PORT || 5000;

app.get("/hello", async (req, res) => {
  const a = await fetchAllSongs();
  res.send(a);
});

app.get("/login", async (req, res) => {
  var scopes =
    "user-read-private user-read-email playlist-modify-public playlist-modify-private";
  console.log(process.env.REDIRECT_URI);
  res.redirect(
    "https://accounts.spotify.com/authorize" +
      "?response_type=code" +
      "&client_id=" +
      process.env.MY_CLIENT_ID +
      (scopes ? "&scope=" + encodeURIComponent(scopes) : "") +
      "&redirect_uri=" +
      encodeURIComponent(process.env.REDIRECT_URI) +
      "&show_dialog=true"
  );
});

app.get("/redirect", async (req, res) => {
  const code = req.query.code;
  const request = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: querystring.stringify({
      client_id: process.env.MY_CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: "authorization_code",
      code: code,
      redirect_uri: process.env.REDIRECT_URI,
    }),
    encoding: null,
  };
  const result = await nodeFetch(
    "https://accounts.spotify.com/api/token",
    request
  );
  const a = await result.json();
  const access_token = a.access_token;

  const result2 = await nodeFetch("https://api.spotify.com/v1/me", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  });

  const res2 = await result2.json();
  const user_id = res2.id;

  let request2 = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
    body: {
      name: "All My Songs",
      public: true,
      description: "All my songs with data from last.fm + spotify's api",
      collaborative: false,
    },
    json: true,
  };
  const result3 = await nodeFetch("https://api.spotify.com/v1/me/playlists", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  });

  const playlists = await result3.json();
  var isCreated = false;
  playlists.items.forEach((playlist) => {
    if (playlist.name === request2.body.name) {
      isCreated = true;
    }
  });
  if (!isCreated) {
    request2 = { ...request2, body: JSON.stringify(request2.body) };
    const result4 = await nodeFetch(
      `https://api.spotify.com/v1/users/${user_id}/playlists`,
      request2
    );
    const c = await result4.json();

    const playlistId = c.id;
    var uris = [];
    var i = 0;

    for await (const song of Song.find()) {
      if(i<100){
        var name = song.name;
        const artist = song.artist;
        if (name.includes("Feat.")) {
          if (name[name.indexOf("Feat.") - 1] === "(") {
            name = name.substring(0, name.indexOf("Feat.") - 2);
            console.log(name);
          } else {
            name = name.substring(0, name.indexOf("Feat.") - 1);
            console.log(name);
          }
        } else if (name.includes("Ft.")) {
          name = name.substring(0, name.indexOf("FT.") - 2);
          console.log(name);
        }
        // console.log(artist)

        // console.log(name)
        // console.log(`https://api.spotify.com/v1/search?q=artist%3A${artist}%20track%3A${name}&type=track&limit=1`)

        var url = `https://api.spotify.com/v1/search?q=artist:${artist} track:${name}&type=track&limit=1`;
        url = url.replace("'", "");
        var encoded = encodeURI(url);

        const result7 = await nodeFetch(encoded, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
        });
        const reqData = await result7.json();
        try {
          const a = await nodeFetch(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks?uris=${reqData.tracks.items[0].uri}`,{
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                'User-Agent': 'ANYTHING_WILL_WORK_HERE',
                Authorization: `Bearer ${access_token}`,
              },
              // body: {
              //   uris:  uris,
              // }
            }
          )
      
        } catch (e) {
          console.log("IDC");
        }
        console.log(i)
      i++;
      }
  }

    console.log(uris);
    console.log(playlistId);




  } else {
    res.send("PLAYLIST ALREADY EXISTS");
  }

  process.exit(0);
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

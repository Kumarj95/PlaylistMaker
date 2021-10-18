import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./connectDB.js";
import Song from "./models/songModel.js";
import fetchAllSongs from "./middleware.js";
dotenv.config({ path: "../.env" });

connectDB();

const importData = async (user, spotifyId) => {
  const songs = await fetchAllSongs(user, spotifyId);

  // songs.forEach(async (song)=>{
  //     var a = await Song.find({"_id":song._id})
  //     if(a){
  //         console.log("YOOOOOOOO")
  //     }else{
  //         console.log("___________________________\n")
  //         console.log(a)
  //         console.log("___________________________\n")
  //     }
  //     await Song.updateOne(song,song,{upsert:true}).catch((err)=>{
  //     });
  // })

  for (const song of songs) {
    var a = await Song.find({ _id: song._id });
    if (a.length === 0) {
    //   console.log(song);
      await Song.updateOne(song, song, { upsert: true }).catch((err) => {});
    } else {
      //   console.log("yoo");
      await Song.updateOne(
        a[0],
        { $push: { users: song.users[0] } }
      ).catch((err) => {
        console.log(err);
      });
    }
  }
  console.log("finished");
  process.exit();
};

importData("kjha95", "kjha95");
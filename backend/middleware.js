import axios from "axios";

const inArr = (song, arr) => {
  arr.forEach((s) => {
    if (s._id === song._id) {
      console.log(song.name);
      return true;
    }
  });
  return false;
};
const fetchAllSongs = async (user, spotifyId) => {
  console.log(
    `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${user}&api_key=f7041e95c15c78dc0320e7af86666e4c&format=json&limit=200`
  );
  const allSongs = await axios.get(
    `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${user}&api_key=f7041e95c15c78dc0320e7af86666e4c&format=json&limit=200`
  );

  const numPages = allSongs.data.recenttracks["@attr"].totalPages;
  var allSongsData = [];
  var addedIds = [];
  for (var i = 1; i <= numPages; i++) {
      console.log(i)
    const pageObj = await axios.get(
      `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${user}&api_key=f7041e95c15c78dc0320e7af86666e4c&format=json&limit=200&page=${i}`
    );
    const pageData = pageObj.data.recenttracks.track;

    pageData.forEach((songData) => {
      var song = null;
      try {
        song = {
          artist: songData.artist["#text"],
          album: songData.album["#text"],
          date: songData.date["#text"],
          name: songData.name,
          _id:
            songData.artist["#text"] +
            " " +
            songData.album["#text"] +
            " " +
            songData.name,
        };
      } catch (e) {
        var today = new Date();
        var date =
          today.getDate() +
          " " +
          today.toLocaleString("default", { month: "short" }) +
          " " +
          today.getFullYear() +
          ", " +
          today.getHours() +
          ":" +
          today.getMinutes();
        song = {
          artist: songData.artist["#text"],
          album: songData.album["#text"],
          date: date,
          name: songData.name,
          _id:
            songData.artist["#text"] +
            " " +
            songData.album["#text"] +
            " " +
            songData.name,
        };
      }

      if (addedIds.find((id) => id === song._id) === undefined) {
        song.users = [spotifyId];
        allSongsData.push(song);
        // console.log(song);
        addedIds.push(song._id);
      } 
    });

    // console.log(pageData)
  }
//   console.log(numPages);
//   console.log(allSongsData.sort((a,b)=>{
//     return new Date(b.date)- new Date(a.date)

//   }))
  return allSongsData;
};

// const addAllSongs=async()=>{
//     const res= await axios("https://api.spotify.com/v1/me");

//     console.log(res)
// }

// addAllSongs()

// fetchAllSongs(process.argv[2], process.argv[3]);
export default fetchAllSongs;

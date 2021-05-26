const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();

app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/public/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

//home page
router.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/home.html'));
});

//if you go to the /login route, redirect you towards spotify login
router.get('/login', function(req, res) {
  var scopes = 'user-read-playback-position user-read-currently-playing user-modify-playback-state user-read-playback-state streaming app-remote-control user-library-modify user-library-read playlist-modify-public playlist-modify-private playlist-read-private playlist-read-collaborative';
  var my_client_id = '199c96b7d70f4dd28f188f9c6bc86045';
  var redirect_uri = 'http://localhost:3000/callback';
  
  res.redirect('https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    '&client_id=' + my_client_id +
    (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
    '&redirect_uri=' + encodeURIComponent(redirect_uri)
  );
});

//if route begins with /callback
router.get(/^\/callback(.*)/, async function (req, res) {
  var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;


  //get access_token from url
  let spotifyAuthCode = '';
  if(fullUrl.includes('?code=')){
    console.log(`\n fullUrl=[${fullUrl}] \n`)
    spotifyAuthCode = fullUrl.substr(fullUrl.lastIndexOf('?code=')+7);
    console.log(`\n spotifyAuthCode=[${spotifyAuthCode}] \n`)

    //login to spotify api
    useSpotifyApi(spotifyAuthCode.trim())
  }

    res.render('spotify.html', {
      spotifyAuthCode:'aaa'
    });
  
})

function useSpotifyApi(access_token){
  var SpotifyWebApi = require('spotify-web-api-node');

  // credentials are optional
  var spotifyApi = new SpotifyWebApi({
  //  clientId: 'zzz',
  //  clientSecret: 'zzz',
    redirectUri: 'http://localhost:3000/callback'
  });

  spotifyApi.setAccessToken(access_token);

  // Get Elvis' albums
  spotifyApi.getArtistAlbums('43ZHCT0cAZBISjO8DG9PnE').then(
    function(data) {
      console.log('Artist albums', data.body);
    },
    function(err) {
      console.error("err=",err);
    }
  );

}

//add the router
app.use('/', router);
app.listen(process.env.port || 3000);

console.log('Running at Port 3000');
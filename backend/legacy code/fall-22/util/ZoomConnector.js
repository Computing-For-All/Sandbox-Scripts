import request from 'request'
import env from 'dotenv'
env.config()

var options = {
  method: 'GET',
  // A non-existing sample userId is used in the example below.
  url: 'https://api.zoom.us/v2//report/meetings/83037269591/participants?page_size=5',
  headers: {
    authorization: 'Bearer '+process.env.ZOOM_JWT_TOKEN, // Do not publish or share your token publicly.
    },
};

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});
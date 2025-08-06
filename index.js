const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const app = express();
const pingUrl = "http://127.0.0.1:3215/game/launch";
const launchUrl = "http://127.0.0.1:3215/game/launch?offerIds=DR%3A224766400&cmdParams=singleplayer";
const PORT = 3600;

app.use(cors());
app.use(express.static('public'));

app.get('/', (req, res) => {
  // Serve index.html from disk only
  const indexPath = path.join(__dirname, 'public', 'index.html');
  fs.readFile(indexPath, 'utf8', (err, data) => {
    if (!err) {
      res.setHeader('Content-Type', 'text/html');
      return res.send(data);
    }
    // If index.html is missing, return 404
    res.status(404).send('index.html not found');
  });
});

app.post('/ping', async (req, res) => {
  try {
    const launchRes = await axios.head(pingUrl);
    const status = launchRes.status;
    return res.send({ status: status });
  } catch (err) {
    const status = err.status;
    if (status === 501) {
      return res.send({ status: 200, message: 'Battlefield 3 is now running with Battlelog.' });
    }
    return res.status(500).send({ status: 500, message: 'Proxy error (Ping): ' + err.message });
  }
});

app.post('/start', async (req, res) => {
  try {
    const launchRes = await axios.post(launchUrl, null, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Origin': 'https://battlelog.battlefield.com',
        'DNT': '1',
        'Sec-GPC': '1',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'Priority': 'u=4'
      },
      validateStatus: () => true // allow all status codes
    });
    const status = launchRes.status;
    let data = launchRes.data;
    const message202 = 'Battlefield 3 singleplayer mode is now running. Sit tight and Enjoy!';
    const message409 = 'The game is already running. Please restart with your Steam client.';
    let message = typeof data === 'string' ? data : JSON.stringify(data);
    if (status === 202) {
      message = message202;
    } else if (status === 409) {
      message = message409;
    }
    res.status(status).send({ status, message, data });
  } catch (err) {
    res.status(500).send({ status: 500, message: 'Proxy error (Launch): ' + err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

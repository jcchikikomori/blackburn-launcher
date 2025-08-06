// server.js (add proxy support with cors)
const express = require('express');
const cors = require('cors');
// const fetch = require('node-fetch');
const app = express();
const pingUrl = "http://127.0.0.1:3215/game/launch";
const launchUrl = "http://127.0.0.1:3215/game/launch?offerIds=DR%3A224766400&cmdParams=singleplayer";
const PORT = 3000;

app.use(cors());
app.use(express.static('public'));

app.post('/ping', async (req, res) => {
  try {
    const launchRes = await fetch(pingUrl, {
      method: 'HEAD',
      mode: 'cors'
    });
    const status = await launchRes.status;
    const text = await launchRes.text();
    console.log(`Ping response: ${status} - ${text}`);
    res.status(launchRes.status).send(text);
  } catch (err) {
    res.status(500).send('Proxy Error: ' + err.message);
  }
});

app.post('/start', async (req, res) => {
  try {
    const launchRes = await fetch(launchUrl, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
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
      }
    });
    const response = await launchRes;
    const status = await launchRes.status;
    const text = await launchRes.text();
    console.debug(response);
    console.log(`Ping response: ${status} - ${text}`);
    res.status(launchRes.status).send(text);
  } catch (err) {
    res.status(500).send('Proxy Error: ' + err.message);
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

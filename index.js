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
  // Try to serve index.html from disk (works in dev and some binary packagers)
  const indexPath = path.join(__dirname, 'public', 'index.html');
  fs.readFile(indexPath, 'utf8', (err, data) => {
    if (!err) {
      res.setHeader('Content-Type', 'text/html');
      return res.send(data);
    }
    // Fallback: serve embedded HTML (for binary builds)
    const embeddedHtml = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PROJECT BLACKBURN BF3</title>
  <link href="https://fonts.cdnfonts.com/css/gobold" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@1.0/css/bulma.min.css"
    integrity="sha256-Z/om3xyp6V2PKtx8BPobFfo9JCV0cOvBDMaLmquRS+4=" crossorigin="anonymous">
</head>
<style>
  html,
  body {
    height: 100%;
    margin: 0;
    font-family: 'Arial', sans-serif;
  }
  .title {
    font-family: 'Gobold', 'Arial', sans-serif;
  }
  section {
    max-width: 480px;
    margin: 0 auto;
  }
</style>
<body class="has-text-centered p-6">
  <section class="section">
    <h1 class="title">PROJECT BLACKBURN BF3</h1>
    <div id="notification" class="notification is-dark is-hidden"></div>
    <button id="launchBtn" class="button is-primary is-large" disabled>Launch Game</button>
  </section>
  <script>
    const statusNote = document.getElementById('notification');
    const launchBtn = document.getElementById('launchBtn');
    var gameStatus = false;
    async function checkServerStatus() {
      try {
        const res = await fetch("/ping", { method: 'POST', mode: 'cors' });
        console.log('Server status:', res.status);
        console.log(res);
        if (res.status === 404) {
          console.log('Server not found, assuming offline');
          return false;
        }
        return res.ok;
      } catch (err) {
        console.error('Error checking server status:', err);
        return false;
      }
    }
    async function updateStatusUI() {
      const isOnline = await checkServerStatus();
      if (!gameStatus) {
        if (isOnline) {
          statusNote.className = 'notification is-success';
          statusNote.textContent = '🟢 The Game is online. Ready to launch.';
          launchBtn.disabled = false;
        } else {
          statusNote.className = 'notification is-danger';
          statusNote.textContent = '🔴 The Game is offline. Please wait...';
          launchBtn.disabled = true;
        }
      }
      statusNote.classList.remove('is-hidden');
    }
    setInterval(updateStatusUI, 5000); // auto-refresh every 5s
    updateStatusUI(); // initial run
    launchBtn.addEventListener('click', async () => {
      statusNote.className = 'notification is-info';
      statusNote.textContent = '⏳ Sending request...';
      try {
        const response = await fetch("/start", {
          method: 'POST',
          mode: 'cors',
          credentials: 'omit'
        });
        if (response.ok) {
          statusNote.className = 'notification is-success';
          statusNote.textContent = '✅ Game launched successfully!';
          gameStatus = true;
        } else if (response.status === 409) {
          statusNote.className = 'notification is-warning';
          statusNote.textContent = '⚠️ The game is already running. Please restart with your Steam client.';
          gameStatus = true;
        } else {
          statusNote.className = 'notification is-warning';
          statusNote.textContent = '⚠️ Launch failed. Try again.';
          gameStatus = false;
        }
      } catch (err) {
        statusNote.className = 'notification is-danger';
        statusNote.textContent = '❌ Error: ' + err.message;
        gameStatus = false;
      }
    });
  </script>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    res.send(embeddedHtml);
  });
});

app.post('/ping', async (req, res) => {
  try {
    const launchRes = await axios.head(pingUrl);
    const status = launchRes.status;
    // No body for HEAD requests
    console.log(`Ping response: ${status}`);
    if (status === 501) {
      return res.send({ status: 200, message: 'Battlefield 3 is now running with Battlelog.' });
    }
    return res.send({ status });
  } catch (err) {
    res.status(500).send({ status: 500, message: 'Proxy error (Ping): ' + err.message });
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
    let message = typeof data === 'string' ? data : JSON.stringify(data);
    console.log(`Proxy response: ${status} - ${message}`);
    res.status(status).send({ status, message, data });
  } catch (err) {
    res.status(500).send({ status: 500, message: 'Proxy error (Launch): ' + err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

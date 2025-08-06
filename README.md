# Blackburn launcher

Let Sargeant Blackburn play Battlefield 3 singleplayer without Battlelog.

## Goals

- [x] To run Battlefield 3 on Linux (on Single Player)
- [x] Open-source alternative of launching Battlefield 3 (on Single Player, duh?)
- [x] Part of "Stop Killing Games" initiative
- [ ] Host on your Steam Deck under Decky Loader
- [ ] Notification icon on status bar, primarily on Qt & KDE, then on Windows

## Disclaimer

**I have no right to circumvent** any implementation from Battlelog or any service provided by DICE, Electronic Arts, Uprise, etc.

I have no goal or intention to replace launchers for Multiplayer. This is just a simple web-based portal to replace old & crusty **Singleplayer** portal in Battlelog.

## Requirements

- Steam copy of Battlefield 3
- Windows whatever (not Vista) or Linux
- NodeJS
- [Bun](bun.sh)

## How to use

NOTE: This server will use the port 3600.

1. Launch Battlefield 3 from your Steam client
2. Wait for EA App to launch, then wait for Battlelog to be opened
3. Start the Blackburn launcher, and go to `http://localhost:3600`
4. Then click the "Launch Game" button

## Building

Run in your terminal with this command: `npm run build`

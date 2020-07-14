# TurtleTips Front-End Plugin
TurtleTips is a chrome-based TurtleCoin web wallet plugin that lets you send and receive TRTL, and allows you to tip verified website owners with your TRTL. Unlike other web wallet services, when using TurtleTips, *you* control your spend key, and the backend is cryptographically unable to spend your hard-earned TRTL.

## Methodology
With TurtleTips, the more computationally-expensive side of syncing your wallet is done for you on the backend, leaving less for the front-end wallet plugin to do, and in turn, letting you sync your wallet faster than ever before. Blocks and transactions are constantly scanned by the backend service for any inputs or outputs belonging to your wallet's public spend key, and that data is stored server-side. Once these inputs and outputs are sent to your installed plugin, they are then converted into spendable funds, which you can then transact as you please, knowing all the while that your private spend key never left the safety of your personal device.

## Setup
1. Clone git locally
2. Open terminal in local folder
3. Run `npm run watch` to begin debugging
4. In chrome, select `Menu > More tools > Extensions`, then click on `Load Unpacked` and select the created `dist` folder

const { app, BrowserWindow } = require('electron');
const WebSocket = require('ws');
const iconv = require('iconv-lite');

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadURL('http://localhost:8080');

  win.setAlwaysOnTop(true);
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  const ws = new WebSocket('wss://ws.ptt.cc/bbs', {
    origin: 'https://term.ptt.cc',
  });
  // ws.on('open', () => {
  //   setTimeout(() => {
  //     const chars = 'harry830622\rh23814540\r';
  //     let idx = 0;
  //     const intervalId = setInterval(() => {
  //       if (idx >= chars.length) {
  //         clearInterval(intervalId);
  //         return;
  //       }
  //       const c = chars[idx];
  //       console.log(c);
  //       const b = iconv.encode(c, 'big5');
  //       ws.send(b);
  //       idx += 1;
  //     }, 100);
  //   }, 3000);
  // });
  ws.on('message', (msg) => {
    const str = iconv.decode(msg, 'big5');
    console.log(str);
    if (str.includes('請輸入代號')) {
      const chars = 'harry830622\rh23814540\r';
      let idx = 0;
      const intervalId = setInterval(() => {
        if (idx >= chars.length) {
          clearInterval(intervalId);
          return;
        }
        ws.send(iconv.encode(chars[idx], 'big5'));
        idx += 1;
      }, 100);
    } else if (str.includes('您想刪除其他重複登入的連線嗎？')) {
      const chars = 'Y\r';
      let idx = 0;
      const intervalId = setInterval(() => {
        if (idx >= chars.length) {
          clearInterval(intervalId);
          return;
        }
        ws.send(iconv.encode(chars[idx], 'big5'));
        idx += 1;
      }, 100);
    } else if (str.includes('請按任意鍵繼續')) {
      const chars = '\r';
      let idx = 0;
      const intervalId = setInterval(() => {
        if (idx >= chars.length) {
          clearInterval(intervalId);
          return;
        }
        ws.send(iconv.encode(chars[idx], 'big5'));
        idx += 1;
      }, 100);
    } else if (str.includes('主功能表')) {
      const chars = 'sNBA\r';
      let idx = 0;
      const intervalId = setInterval(() => {
        if (idx >= chars.length) {
          clearInterval(intervalId);
          return;
        }
        ws.send(iconv.encode(chars[idx], 'big5'));
        idx += 1;
      }, 100);
    } else if (str.includes('看板《NBA》')) {
      const chars = '/Live\r';
      let idx = 0;
      const intervalId = setInterval(() => {
        if (idx >= chars.length) {
          clearInterval(intervalId);
          return;
        }
        ws.send(iconv.encode(chars[idx], 'big5'));
        idx += 1;
      }, 100);
    }
  });
});

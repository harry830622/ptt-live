const path = require('path');
const { app, BrowserWindow } = require('electron');

const { NODE_ENV } = process.env;

const pttBaseUrl = 'https://www.ptt.cc';

const delay = async (ms) => {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

(async () => {
  await app.whenReady();

  const win = new BrowserWindow({
    width: 500,
    height: 250,
    transparent: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  if (NODE_ENV === 'development') {
    win.loadURL('http://localhost:8080');
  } else {
    win.loadFile(path.resolve(__dirname, './dist/index.html'));
  }

  win.setAutoHideMenuBar(true);
  win.setAlwaysOnTop(true);
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  const pttWin = new BrowserWindow({
    width: 400,
    height: 600,
    show: false,
  });

  win.on('close', () => {
    pttWin.close();
  });

  const loadNbaLivePostComments = async () => {
    pttWin.loadURL(`${pttBaseUrl}/bbs/NBA/search?q=Live`);
    const urls = await pttWin.webContents.executeJavaScript(`
(() => {
  const urlAs = document.querySelectorAll('#main-container .r-ent > .title > a');
  const urls = [];
  urlAs.forEach((a) => {
    urls.push(\`${pttBaseUrl}\$\{a.attributes.href.value\}\`);
  });
  return urls;
})()
  `);

    // TODO: Determine URL intelligently
    pttWin.loadURL(urls[0]);

    await pttWin.webContents.executeJavaScript(`
(() => {
  document.querySelector('#article-polling').click();
})()
  `);

    while (true) {
      if (!pttWin) {
        return;
      }
      await delay(1000);
      const comments = await pttWin.webContents.executeJavaScript(`
(() => {
  const commentDivs = document.querySelectorAll('#main-content .push');
  const comments = [];
  commentDivs.forEach((div) => {
    const typeSpan = div.querySelector('.push-tag');
    const userIdSpan = div.querySelector('.push-userid');
    const contentSpan = div.querySelector('.push-content');
    const timeSpan = div.querySelector('.push-ipdatetime');
    if (!contentSpan) {
      return;
    }
    comments.push({
      id: comments.length,
      type: typeSpan.innerText.includes('推') ? 'UP' : typeSpan.innerText.includes('噓') ? 'DOWN' : 'CONT',
      userId: userIdSpan.innerText.trim(),
      content: contentSpan.innerText.slice(1).trim(),
      time: timeSpan.innerText.trim(),
    });
  });
  return comments;
})()
  `);
      win.webContents.send('async-msg', {
        type: 'SET_LIVE_POST_COMMENTS',
        payload: {
          livePostComments: comments,
        },
      });
    }
  };

  loadNbaLivePostComments();
})();

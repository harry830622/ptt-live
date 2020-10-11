import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import crypto from 'crypto';
import { app, BrowserWindow, ipcMain } from 'electron';
import Store from 'electron-store';
import puppeteer from 'puppeteer';

(async () => {
  try {
    const store = new Store();

    // TODO: Add "remember me" checkbox on login page
    store.delete('credential.id');
    store.delete('credential.passwd');

    const browser = await puppeteer.launch(
      process.env.NODE_ENV === 'development'
        ? { headless: false, slowMo: 50 }
        : {
            executablePath: puppeteer
              .executablePath()
              .replace('app.asar', 'app.asar.unpacked'),
          },
    );

    await app.whenReady();

    const win = new BrowserWindow({
      width: 500,
      height: 500,
      transparent: true,
      frame: false,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
      },
    });

    win.loadURL(
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:8080'
        : `file://${path.resolve(__dirname, '../renderer/index.html')}`,
    );

    win.setAutoHideMenuBar(true);
    win.setAlwaysOnTop(true);
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

    win.on('close', async () => {
      await browser.close();
    });

    const fetchCredential = async () => {
      const credential = await new Promise((resolve) => {
        ipcMain.once('credential', (_, payload) => {
          const { id, passwd } = payload;
          resolve({
            id,
            passwd,
          });
        });
      });
      return credential;
    };

    const page = await browser.newPage();

    const login = async (id, passwd) => {
      await page.keyboard.type(id);
      await page.keyboard.press('Enter');
      await page.keyboard.type(passwd);
      await page.keyboard.press('Enter');
    };

    const gotoBoard = async (name) => {
      await page.keyboard.type('s');
      await page.keyboard.type(name);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      await page.keyboard.press('Enter');
    };

    const gotoPost = async (aid) => {
      await page.keyboard.type('#');
      await page.keyboard.type(aid);
      await page.keyboard.press('Enter');
      await page.keyboard.press('ArrowRight');
    };

    const searchTitle = async (title) => {
      await page.keyboard.type('/');
      await page.keyboard.type(title);
      await page.keyboard.press('Enter');
    };

    let lineSpanHandles;
    let targetLineText;
    let match;

    let credential = {
      id: store.get('credential.id'),
      passwd: store.get('credential.passwd'),
    };
    let hasCredential = false;

    let isLoggedIn = false;
    while (!isLoggedIn) {
      win.webContents.send('async-msg', {
        type: 'SET_IS_LOGGING_IN',
        payload: {
          isLoggingIn: false,
        },
      });
      if (credential.id && credential.passwd) {
        hasCredential = true;
      }
      if (!hasCredential) {
        credential = await fetchCredential();
      }
      win.webContents.send('async-msg', {
        type: 'SET_IS_LOGGING_IN',
        payload: {
          isLoggingIn: true,
        },
      });
      await page.goto('https://term.ptt.cc/', { waitUntil: 'networkidle0' });
      await page.waitForTimeout(1000);
      lineSpanHandles = await page.$$('span[data-type="bbsline"]');
      await login(credential.id, credential.passwd);
      await page.waitForTimeout(1000);
      targetLineText = await lineSpanHandles[21].evaluate(
        (node) => node.innerText,
      );
      if (targetLineText.match(/密碼不對或無此帳號|請重新輸入/)) {
        credential = { id: null, passwd: null };
        win.webContents.send('async-msg', {
          type: 'SET_MESSAGE',
          payload: {
            message: {
              type: 'ERROR',
              text: 'Wrong ID or password',
            },
          },
        });
        continue;
      }
      targetLineText = await lineSpanHandles[22].evaluate(
        (node) => node.innerText,
      );
      if (targetLineText.match(/您想刪除其他重複登入的連線嗎？/)) {
        await page.keyboard.press('Enter');
        await page.waitForTimeout(5000);
      }
      targetLineText = await lineSpanHandles[23].evaluate(
        (node) => node.innerText,
      );
      if (targetLineText.match(/請按任意鍵繼續/)) {
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);
        isLoggedIn = true;
        break;
      }
      win.webContents.send('async-msg', {
        type: 'SET_MESSAGE',
        payload: {
          message: {
            type: 'ERROR',
            text: 'Failed to log in',
          },
        },
      });
    }

    store.set('credential.id', credential.id);
    store.set('credential.passwd', credential.passwd);

    win.webContents.send('async-msg', {
      type: 'SET_IS_LOGGING_IN',
      payload: {
        isLoggingIn: false,
      },
    });

    // Since the mouseenter and mouseleave event will cause remounting of the
    // entire app component in the renderer process, the main process must tell
    // the renderer process the current state constantly.
    setInterval(() => {
      win.webContents.send('async-msg', {
        type: 'SET_IS_LOGGED_IN',
        payload: {
          isLoggedIn: true,
        },
      });
    }, 1000);

    win.webContents.send('async-msg', {
      type: 'SET_IS_LOADING',
      payload: {
        isLoading: true,
      },
    });

    targetLineText = await lineSpanHandles[23].evaluate(
      (node) => node.innerText,
    );
    if (targetLineText.match(/您要刪除以上錯誤嘗試的記錄嗎/)) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
    }

    await gotoBoard('NBA');
    await page.waitForTimeout(1000);

    await searchTitle('[Live]');
    await page.waitForTimeout(1000);

    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(1000);

    await page.keyboard.press('End');
    await page.waitForTimeout(1000);

    const crawlLines = async () => {
      const lineTexts = await Promise.all(
        lineSpanHandles.map((handle) =>
          handle.evaluate((node) => node.innerText),
        ),
      );
      return lineTexts;
    };
    const parseComments = async (lineTexts) => {
      const comments = lineTexts.reduce((prev, lineText) => {
        match = lineText.match(
          /([推|噓|→]) (\w+)\s*: (.+)(\d{2})\/(\d{2}) (\d{2}):(\d{2})/,
        );
        if (!match) {
          return prev;
        }
        const time = new Date();
        time.setMonth(parseInt(match[4], 10));
        time.setDate(parseInt(match[5], 10));
        time.setHours(parseInt(match[6], 10));
        time.setMinutes(parseInt(match[7], 10));
        time.setSeconds(0);
        time.setMilliseconds(0);
        const comment = {
          userId: match[2],
          text: match[3].trim(),
          timestamp: time.getTime(),
        };
        comment.id = crypto
          .createHash('md5')
          .update(`${comment.userId}:${comment.text}@${comment.timestamp}`)
          .digest('hex');
        return [...prev, comment];
      }, []);
      return comments;
    };

    let comments = [];
    let isTopReached = false;
    let count = 0;
    while (!isTopReached) {
      const lineTexts = await crawlLines();
      const currComments = await parseComments(lineTexts);
      comments = [...currComments.slice(1), ...comments];
      if (count === 0) {
        win.webContents.send('async-msg', {
          type: 'SET_COMMENTS',
          payload: {
            comments,
          },
        });
      }
      targetLineText = lineTexts[23];
      isTopReached = !!targetLineText.match(/目前顯示: 第 01~\d{2} 行/);
      await page.keyboard.press('PageUp');
      await page.waitForTimeout(30);
      count += 1;
      // For now, just fetch the last page
      break;
    }
    win.webContents.send('async-msg', {
      type: 'SET_COMMENTS',
      payload: {
        comments,
      },
    });

    win.webContents.send('async-msg', {
      type: 'SET_IS_LOADING',
      payload: {
        isLoading: false,
      },
    });

    let commentTextToSend = '';
    ipcMain.on('comment', (_, payload) => {
      const { commentText } = payload;
      console.log(commentText);
      commentTextToSend = commentText;
    });

    let lastCommentsInDescOrder = [...comments].reverse();
    while (true) {
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(500);
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(500);
      await page.keyboard.press('End');
      await page.waitForTimeout(500);
      const lineTexts = await crawlLines();
      const currComments = await parseComments(lineTexts);
      const currCommentsInDescOrder = [...currComments].reverse();
      let commentsDiff = [];
      currCommentsInDescOrder.some((comment) => {
        const isCommentFetched =
          comment.text === lastCommentsInDescOrder[0].text;
        if (!isCommentFetched) {
          commentsDiff = [comment, ...commentsDiff];
        }
        return isCommentFetched;
      });
      console.log(commentsDiff);
      comments = [...comments, ...commentsDiff];
      lastCommentsInDescOrder = [...comments].reverse();
      win.webContents.send('async-msg', {
        type: 'SET_COMMENTS',
        payload: {
          comments,
        },
      });
      if (commentTextToSend) {
        for (let i = 0; i < commentTextToSend.length; i += 24) {
          await page.keyboard.type('%');
          targetLineText = await lineSpanHandles[23].evaluate(
            (node) => node.innerText,
          );
          match = targetLineText.match(/禁止快速連續推文, 請再等 (\d+) 秒/);
          if (match) {
            await page.keyboard.press('Enter');
            await page.waitForTimeout(parseInt(match[1], 10) * 1000);
            i -= 24;
            continue;
          }
          targetLineText = await lineSpanHandles[22].evaluate(
            (node) => node.innerText,
          );
          if (!targetLineText.match(/時間太近/)) {
            await page.keyboard.press('Enter');
          }
          await page.keyboard.type(commentTextToSend.slice(i, i + 24));
          await page.keyboard.press('Enter');
          await page.keyboard.type('y');
          await page.keyboard.press('Enter');
          await page.waitForTimeout(500);
          await page.keyboard.press('ArrowRight');
          await page.waitForTimeout(500);
        }
        commentTextToSend = '';
      }
    }

    await Promise.all(lineSpanHandles.map((handle) => handle.dispose()));
  } catch (err) {
    console.error(err);
  }
})();

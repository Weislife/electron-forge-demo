const electron = require('electron');
const {app, BrowserWindow, Tray, autoUpdater, dialog, ipcMain} = electron;
const path = require('path');
const fs = require('fs');
const package_info = require('../package.json');
const config = require('./config');
const utils = require('./lib/utils');

function startupEventHandle() {
    if (require('electron-squirrel-startup')) {
        return false;
    }

    // 安装和更新时添加快捷方式，删除和卸载时删除快捷方式
    const handleStartupEvent = function () {
        if (process.platform !== 'win32') {
            return false;
        }

        const squirrelCommand = process.argv[1];
        switch (squirrelCommand) {
            case '--squirrel-firstrun':
                if (utils.fsExistsSync(path.resolve(path.dirname(process.execPath), '..', '..', package_info.productName + 'Data'))) {// 存在
                    const arr = fs.readdirSync(path.resolve(path.dirname(process.execPath), '..', '..', package_info.productName + 'Data'));
                    for (let i = 0, el; el = arr[i++];) {
                        const url = path.resolve(path.dirname(process.execPath), '..', '..', package_info.productName + 'Data') + "/" + el;
                        const stat = fs.statSync(url);
                        if (stat.isDirectory()) {
                        } else if (stat.isFile()) {
                            fs.unlinkSync(url);// 直接删除文件
                        }
                    }
                }

                return true;
            case '--squirrel-install':
            case '--squirrel-updated':
                install();
            case '--squirrel-uninstall':
                uninstall();
            case '--squirrel-obsolete':
                app.quit();
                return true;
        }

        // 安装
        function install() {
            const cp = require('child_process');
            const updateDotExe = path.resolve(path.dirname(process.execPath), '..', 'update.exe');
            const target = path.basename(process.execPath);
            const child = cp.spawn(updateDotExe, ['--createShortcut', target], {detached: true});
            child.on('close', function (code) {
                app.quit();
                return true;
            });
        }

        // 卸载
        function uninstall() {
            const cp = require('child_process');
            const updateDotExe = path.resolve(path.dirname(process.execPath), '..', 'update.exe');
            const target = path.basename(process.execPath);
            const child = cp.spawn(updateDotExe, ['--removeShortcut', target], {detached: true});
            child.on('close', function (code) {
                app.quit();
                return true;
            });
        }
    };

    if (handleStartupEvent()) {
        return false;
    }
}

let mainWindow = null;

//托盘对象
let appTray = null;

// 版本更新对话框
let versionUpdateDialog = null;

const createWindow = () => {
    startupEventHandle();

    // 创建存放数据的目录
    utils.createPersistentDir();

    mainWindow = new BrowserWindow({
        frame: false,
        icon: __dirname + '/static/img/wallet.png',
        resizable: false,//能否改变窗体大小
        width: 1000,
        height: 600
    });

    mainWindow.setMenu(null);

    // and load the index.html of the app.
    mainWindow.loadURL(`file://${__dirname}/static/html/login.html`);

    // Open the DevTools.
    //  mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    appTray = new Tray(__dirname + '/static/img/wallet.png');

    //设置此托盘图标的悬停提示内容
    appTray.setToolTip(package_info.description);

    appTray.on('click', function () { // 左键单击时显示窗口
        mainWindow.show();
    });

};

function updateHandle() {
    if (process.platform !== 'win32') {
        return false;
    }

    const message = {
        error: '检查更新出错',
        checking: '正在检查更新……',
        updateAva: '下载更新成功',
        updateNotAva: '现在使用的就是最新版本，不用更新',
        downloaded: '最新版本已下载，将在重启程序后更新',
    };

    // 放最新版本文件的文件夹的服务器地址
    autoUpdater.setFeedURL(config.update_server_url);
    autoUpdater
        .on('error', function (error) {
        })
        .on('checking-for-update', function (e) {
        })
        .on('update-available', function (e) {
        })
        .on('update-not-available', function (e) {
        })
        .on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
            versionUpdateDialog = new BrowserWindow({
                frame: false,
                icon: __dirname + '/static/img/wallet.png',
                resizable: false,//能否改变窗体大小
                width: 400,
                height: 200
            });
            versionUpdateDialog.setMenu(null);
            versionUpdateDialog.loadURL(`file://${__dirname}/static/html/version_update_dialog.html?msg=` + `最新版本(${releaseName})已下载，将在重启程序后更新`);
            versionUpdateDialog.on('closed', () => {
                versionUpdateDialog = null;
            });

            ipcMain.on('updateNow', (e, arg) => {
                autoUpdater.quitAndInstall();
            });

        });

    autoUpdater.checkForUpdates();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    createWindow();

    setTimeout(function () {
        if (fs.existsSync(path.resolve(path.dirname(process.execPath), '..', 'update.exe'))) {
            updateHandle();
        }
    }, 5000);

});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});


const isSecondInstance = app.makeSingleInstance((commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
        if (mainWindow.isMinimized()) {
            mainWindow.restore();
        }

        mainWindow.focus();
    }
});

if (isSecondInstance) {
    app.exit(0);
}

app.on('web-contents-created', (event, contents) => {
    if (contents.getType() == 'webview') {
        contents.on('will-navigate', (event, url) => {
            if (url.indexOf('/src/static/img/') > 0) {
                event.preventDefault();
            }
        });
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

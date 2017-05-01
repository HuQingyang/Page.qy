const fs = require('node-fs-extra');
const path = require('path');
const config = require('./config');
const github = require('./github');
const db = require('./db');
const dataToHTML = require('./dataToHTML');


module.exports.backupOnGitHub = backupOnGitHub;
module.exports.backupOnLocal = backupOnLocal;
module.exports.restore = restore;
module.exports.login = login;
module.exports.logout = logout;



async function login(username, password) {
    config.set({
        username: username,
        password: password
    });
    await github.getUserInfo(username, password);
}


function logout() {
    const repoPath = path.join(__dirname,
        `../../user/${config.get().username}.github.io/`);
    const dbPath = path.join(__dirname,
        `../../db`);
    const tempPath = path.join(__dirname,
        `../../user/temp`);
    fs.existsSync(repoPath) && fs.removeSync(repoPath);
    fs.existsSync(dbPath) && fs.removeSync(dbPath);
    fs.existsSync(tempPath) && fs.removeSync(tempPath);
    config.initConfig();
    fs.mkdirsSync(tempPath);
}


function backupOnGitHub() {
    db.backup(path.join(__dirname,
        `../../user/${config.get().username}.github.io/backup/db`));
    config.backup(path.join(__dirname,
        `../../user/${config.get().username}.github.io/backup/`));
    return new Promise((resolve, reject) => {
        github.pushRepo(function (message) {
            message === 'error' && reject();
            message === 'done' && resolve()
        });
    })
}


function backupOnLocal(folderPath) {
    db.backup(path.join(__dirname,
        `../../user/${config.get().username}.github.io/backup/db`));
    config.backup(path.join(__dirname,
        `../../user/${config.get().username}.github.io/backup/`));
    const from = path.join(__dirname, `../../user/${config.get().username}.github.io/backup/`);
    const to = path.join(folderPath,
        `./backup_on_${(new Date()).toISOString().replace(/\:/g, '')}`);
    fs.copySync(from, to);
    fs.removeSync(from);
    return to;
}


async function restore(folderPath) {
    try {
        if (folderPath) {
            db.restore(path.join(folderPath, './db'));
            config.restore(path.join(folderPath, './config.json'));
        } else {
            await github.updateRepo();
            db.restore(path.join(__dirname,
                `../../user/${config.get().username}.github.io/backup/db`));
            config.restore(path.join(__dirname,
                `../../user/${config.get().username}.github.io/backup/config.json`));
        }
    } catch (error) {
        console.error(error);
        return false;
    }
    dataToHTML.reGenerateAll();
    return true;
}

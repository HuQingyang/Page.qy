const fs = require('fs');
const path = require('path');
const exec = require('child_process').execSync;
const GitHub = require('github-api');


const config = JSON.parse(fs.readFileSync(
    path.join(__dirname, '../../user/config.json')
));
const userPath = path.join(__dirname, '../../user/');



function isRepoExist() {
    const gh = new GitHub({
        username: config.user.name,
        password: config.user.password
    });
    const user = gh.getUser();
    return new Promise((resolve, reject) => {
        user.listRepos((error, gists) => {
            error && reject(error);
            let exist = false;
            for (let each in gists)
                if (gists[each].name.toLowerCase() ===
                    `${config.user.name}.github.io`.toLowerCase())
                    exist = true;
            resolve(exist);
        })
    });
}


async function getGitPath() {
    let dir = fs.readdirSync(userPath);
    if (!`${config.user.name}.github.io` in dir) {
        if (await isRepoExist()) {

        }
    }
}


getGitPath();
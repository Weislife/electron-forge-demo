const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const utils = require('./utils');

exports.save_login = function (country, phone, password, savePassword, autoLogin) {
    const randomKey = crypto.randomBytes(8).toString('hex');
    const user = {
        randomKey: randomKey,
        country: country,
        phone: phone,
        password: utils.encrypt(phone, randomKey, password),
        savePassword: savePassword,
        autoLogin: autoLogin,
    };

    fs.writeFileSync(path.join(utils.getPersistentDirPath(), 'user.json'), JSON.stringify(user, null, 4));
    return {code: 1};
};

exports.get_login = function () {
    try {
        let login = null;
        if (fs.existsSync(path.join(utils.getPersistentDirPath(), 'user.json'))) {
            login = JSON.parse(fs.readFileSync(path.join(utils.getPersistentDirPath(), 'user.json'), "utf8"));
        }

        if (!login) {
            return {code: 0};
        }

        const randomKey = login.randomKey;
        const phone = login.phone;
        let password = login.password;
        password = utils.decrypt(phone, randomKey, password);
        return {
            code: 1,
            user: {
                country: login.country,
                phone: phone,
                password: password,
                savePassword: login.savePassword,
                autoLogin: login.autoLogin,
            }
        };
    } catch (e) {
        console.error(e);
        return {code: 0, message: '获取用户登录信息出错'};
    }
};

exports.update_login_assist_info = function (country, phone, savePassword, autoLogin) {
    let login = null;
    if (fs.existsSync(path.join(utils.getPersistentDirPath(), 'user.json'))) {
        login = JSON.parse(fs.readFileSync(path.join(utils.getPersistentDirPath(), 'user.json'), "utf8"));
    }

    if (login && login.country === country && login.phone === phone) {
        if (savePassword !== 'null') {
            login.savePassword = savePassword;
        }

        if (autoLogin !== 'null') {
            login.autoLogin = autoLogin;
        }

        fs.writeFileSync(path.join(utils.getPersistentDirPath(), 'user.json'), JSON.stringify(login, null, 4));
    }
};

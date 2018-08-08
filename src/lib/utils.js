const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const package_info = require('../../package.json');

module.exports = {

    //检测文件或者文件夹存在
    fsExistsSync: function (path) {
        try {
            fs.accessSync(path, fs.F_OK);
        } catch (e) {
            return false;
        }
        return true;
    },

    rmdirSync: (function () {
        function iterator(url, dirs) {
            const stat = fs.statSync(url);
            if (stat.isDirectory()) {
                dirs.unshift(url);//收集目录
                inner(url, dirs);
            } else if (stat.isFile()) {
                fs.unlinkSync(url);//直接删除文件
            }
        }

        function inner(path, dirs) {
            const arr = fs.readdirSync(path);
            for (let i = 0, el; el = arr[i++];) {
                iterator(path + "/" + el, dirs);
            }
        }

        return function (dir, cb) {
            cb = cb || function () {
            };
            let dirs = [];

            try {
                iterator(dir, dirs);
                for (let i = 0, el; el = dirs[i++];) {
                    fs.rmdirSync(el);//一次性删除所有收集到的目录
                }
                cb()
            } catch (e) {//如果文件或目录本来就不存在，fs.statSync会报错，不过我们还是当成没有异常发生
                e.code === "ENOENT" ? cb() : cb(e);
            }
        }
    })(),

    // 创建持久化数据的目录
    createPersistentDir: function () {
        if (!this.fsExistsSync(path.resolve(path.dirname(process.execPath), '..', '..', package_info.productName + 'Data'))) {// 不存在
            fs.mkdirSync(path.resolve(path.dirname(process.execPath), '..', '..', package_info.productName + 'Data'));
        }
    },

    //获取持久化数据目录的路径
    getPersistentDirPath: function () {
        return path.resolve(path.dirname(process.execPath), '..', '..', package_info.productName + 'Data');
    },

    // 删除用户的持久化数据
    deletePersistentDir: function (cb) {
        if (this.fsExistsSync(path.resolve(path.dirname(process.execPath), '..', '..', package_info.productName + 'Data'))) {// 存在
            this.rmdirSync(path.resolve(path.dirname(process.execPath), '..', '..', package_info.productName + 'Data'), cb);
        }
    },

    /**
     * 加密方法
     */
    encrypt: function (key, iv, data) {
        if (key.length < 16) {
            key = key.concat(new Array(17 - key.length).join('0'));
        } else if (key.length > 16) {
            key = key.substr(0, 16);
        }

        const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
        let crypted = cipher.update(data, 'utf8', 'binary');
        crypted += cipher.final('binary');
        crypted = new Buffer(crypted, 'binary').toString('base64');
        return crypted;
    },

    /**
     * 解密方法
     */
    decrypt: function (key, iv, data) {
        if (key.length < 16) {
            key = key.concat(new Array(17 - key.length).join('0'));
        } else if (key.length > 16) {
            key = key.substr(0, 16);
        }

        data = new Buffer(data, 'base64').toString('binary');
        const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
        let decoded = decipher.update(data, 'binary', 'utf8');
        decoded += decipher.final('utf8');
        return decoded;
    }

};

# electron-forge-demo
electron 的示例项目，包含自动更新，页面部分用了 Layui 框架

### 本地开发
```bash
$ npm i
$ npm run start
```
打开调试, src/main.js 中 mainWindow.webContents.openDevTools() 取消注释即可打开调试

### 打包
```bash
$ npm run make
```
- windows 下的安装程序(不带自动更新)  
out/electron-forge-demo-win32-x64/electron-forge-demo.exe 点击即可运行，配合 Inno setup 即可生成安装程序
  
- windows 下的免安装程序(带自动更新)  
out/make/squirrel.windows/x64 目录下生成的三个文件, 以.exe 结尾的即为我们需要的免安装程序，点击即可运行，不需要安装
,当做自动更新时(在npm run make 之前需要更新package.json 中的version )需要把 out/make/squirrel.windows/x64 目录下生成的三个文件放到可以访问的静态服务器上，自动更新静态服务器连接配置在src/config.js 文件中
# 使用手册 · RepoGalaxy · 代码星图

接手一个 TypeScript / JavaScript 仓库时，先看看文件如何相连。RepoGalaxy 从源码读取导入关系，让你从一个文件走到它依赖的下一个文件。

![Observatory 样例的完整导入网络，9 个模块、10 条真实导入连线](../docs/images/network.png)

图谱是主视图。仓库地址和文件搜索浮在上方，点击节点才打开详情。它适合刚接触项目、想找入口，或想确认某个模块依赖了哪些文件的时候；不用配置模型，也不需要 API Key。

## 启动

需要 Node.js **22.12+ 的 22 系列、24 系列或 26+**，以及 npm。范围与 Vitest 5 一致：`^22.12.0 || ^24.0.0 || >=26.0.0`，不支持 23 / 25。

在本项目目录执行：

```sh
npm run setup
npm run doctor
npm run dev
```

打开 **http://127.0.0.1:4202**。网页和 API 分别使用本机端口 `4202`、`5202`，仅绑定 `127.0.0.1`。

`setup` 按锁文件安装依赖，缓存写入 `.npm-cache`，测试浏览器写入 `.browser-cache`。如果只想使用网页，可以运行 `npm run setup -- --skip-browser`，或直接 `npm ci --cache .npm-cache`。首次安装需要联网，安装后自带样例可离线使用。

## 试一次导入跳转

打开页面会自动读取项目自带的 Observatory 源码，显示 **本地源码样例（FIXTURE）**。这 9 个模块和 10 条连线由后端实时解析样例文件得到，不是预制图。

1. 在“查找文件”输入 `App.ts`，点击 `src/App.ts`。
2. 右侧显示完整路径和三个导入。点击 `./components/StarMap`。
3. 详情切换到 `src/components/StarMap.ts`，图上突出它与其他文件的联系。

![选中 StarMap.ts 后，右侧显示实际路径和三个导入，可继续跳转到依赖文件](../docs/images/imports.png)

点空白处或关闭按钮可收起详情。拖动画布平移，滚轮缩放；键盘可用 Tab 聚焦文件、Enter 或空格打开。手机上详情从下方展开，列表可滚动。

要查看自己的公开仓库，把地址换成 `https://github.com/owner/repository`，点击“生成星图”。成功后来源显示 **GitHub 实时源码（LIVE）**。请求失败会保留错误，只有你选择“改用本地样例”才会切换来源。

## 它能读到什么

- TS/JS 中的静态相对 `import` 和 `export ... from`。每条边都有对应声明；动态导入、CommonJS `require`、路径别名和包解析尚不支持。
- 最多 60 个文件，单文件 100 KB，源码合计 1 MB。大仓库可能只显示子集，页面“关于这张图”会提示。
- GitHub 默认分支的公开源码。最多 4 个并发读取，请求超时 12 秒，缓存 5 分钟；无认证的 GitHub API 可能限流。

这不是完整架构分析，也不执行仓库代码。请求只访问 HTTPS 的 `api.github.com`，拒绝重定向；不读取本机任意路径或用户凭据。没有账号、生产部署或模型生成的解释。

## 安装与排错

`setup` / `doctor` 是 Node 脚本，macOS、Windows、Linux 使用相同命令。已实际验证的是 macOS；Windows/Linux 尚未实机运行。缺依赖时运行 `npm run setup`；端口占用时先在原服务终端按 Ctrl+C，再重试。`doctor` 退出码 `1` 表示仍有待处理项，不会自动结束其他进程。

浏览器下载失败不影响手动使用网页，但自动测试和录屏需要 Chromium 与 FFmpeg。重试 `npm run setup`，或手动安装到项目缓存：

```sh
# macOS / Linux
export PLAYWRIGHT_BROWSERS_PATH="$PWD/.browser-cache"
npx playwright install chromium
```

```powershell
# Windows PowerShell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.browser-cache'
npx playwright install chromium
```

```bat
:: Windows cmd
set "PLAYWRIGHT_BROWSERS_PATH=%CD%\.browser-cache"
npx playwright install chromium
```

复用已有浏览器时，可设置 `PLAYWRIGHT_BROWSERS_PATH`，必要时再设置 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`；同一缓存需有 FFmpeg。`.env.example` 仅作变量说明，应用不会自动读取 `.env`。Linux 缺少共享库时需自行处理，安装脚本不提权、不安装系统库。本轮复用了已有浏览器，**全新浏览器下载和全新机器安装未验证**。

## 开发与验证

React / React Flow 绘图，Dagre 排布节点；Express 提供 API，TypeScript 编译器解析源码。依赖由 `package-lock.json` 锁定。

停止开发服务后按顺序运行：

```sh
npm run doctor
npm run build
npm run test
npm run e2e
npm run demo
```

测试覆盖实际导入与跳转、地址拒绝、搜索、详情关闭后的键盘焦点、加载/空/错误状态，以及 1440×900 和 390 宽布局。演示脚本从实际页面生成上面的两张截图和本地视频。`status.json` 记录本轮结果；日志、视频位于不提交的 `artifacts/`。截图提交在 `docs/images/`，克隆后即可查看。

本轮浏览器交互使用真实本地样例；GitHub 边界测试使用模拟响应。之前曾在线读取 `sindresorhus/is`，本轮没有把那次结果当作新的在线验证。

[MIT 许可证](../LICENSE)

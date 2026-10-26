# RepoGalaxy · 代码星图

**把 GitHub 仓库，变成代码星图。** 从真实 TypeScript / JavaScript 源码解析导入关系，通过二维交互图查看模块、完整文件路径和实际依赖。

默认界面为中文。点击“加载样例”即可离线演示，**无需 API Key，不调用 AI 模型**。这是静态源码分析工具，不提供模型生成的架构解释。

## 环境与首次运行

需要 Node.js **22.12 及以上的 22 系列、24 系列，或 26 及以上版本**，以及随 Node 安装的 npm。版本范围与 Vitest 5 一致：`^22.12.0 || ^24.0.0 || >=26.0.0`，不支持 Node 23 / 25。建议使用受支持的 Node LTS。首次安装依赖需要联网；安装完成后，本地源码样例不需要外网。仅支持本地运行，无账号与云服务配置。

在项目目录打开终端，执行：

```sh
npm run setup
npm run doctor
npm run dev
```

- `setup` 通过 `npm ci` 按锁文件安装依赖，缓存写入本项目 `.npm-cache`；安装测试需要的 Chromium 和录屏组件到本项目 `.browser-cache`。如果已找到可用浏览器与录屏组件，会跳过重复下载。脚本不修改系统设置，不安装系统库。
- `doctor` 用中文检查 Node 版本、项目依赖、测试浏览器、录屏组件，以及本机端口。成功退出码为 `0`，存在待处理项为 `1`。它不检查无关的模型 Key。
- `dev` 同时启动网页与 API。终端会显示中文入口说明；等待 Vite 就绪后打开 **[http://127.0.0.1:4202](http://127.0.0.1:4202)**。API 健康检查为 [http://127.0.0.1:5202/api/health](http://127.0.0.1:5202/api/health)。

两个服务仅绑定 `127.0.0.1`，端口固定为 `4202` 和 `5202`。请使用上方准确地址；`localhost` 在部分系统可能解析到 IPv6，建议直接使用 `127.0.0.1`。

只想使用网页、不运行自动化验收时，可跳过测试浏览器：

```sh
npm run setup -- --skip-browser
npm run dev
```

也可以直接按锁文件安装依赖：

```sh
npm ci --cache .npm-cache
npm run dev
```

此时 `doctor` 会提示缺少测试浏览器，但网页和本地样例仍然可用。

## 三步演示

1. 点击 **加载样例**。API 读取并解析项目自带的 Observatory 源码；界面显示 **本地源码样例（FIXTURE）**、9 个模块、10 条导入连线。
2. 悬停并点击 **App.ts**，查看 `src/App.ts` 的完整路径与三个真实导入。
3. 点击详情中的 **./components/StarMap**，跳转到 `src/components/StarMap.ts`，继续查看导入关系。

键盘用户可用 Tab 聚焦按钮或模块，按 Enter / 空格打开模块详情；焦点有可见边框。小屏下详情移到图谱下方，可向下滚动查看。

若要读取真实 GitHub 仓库，输入 `https://github.com/sindresorhus/is` 并点击 **生成星图**。界面会显示 **GitHub 实时源码（LIVE）**、默认分支、实际计数、缓存状态与源码子集提示。仓库内容会随时间变化，计数并非固定演示数据。

## 安装浏览器与系统差异

`npm run setup` 与 `npm run doctor` 使用 Node 脚本，macOS、Linux、Windows 的调用命令相同。手动安装浏览器时，环境变量写法不同：

macOS / Linux（bash、zsh）：

```sh
export PLAYWRIGHT_BROWSERS_PATH="$PWD/.browser-cache"
npx playwright install chromium
```

Windows PowerShell：

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.browser-cache'
npx playwright install chromium
```

Windows 命令提示符（cmd）：

```bat
set "PLAYWRIGHT_BROWSERS_PATH=%CD%\.browser-cache"
npx playwright install chromium
```

验收默认使用 `.browser-cache`。若已安装兼容的 Playwright 浏览器，可通过 shell 环境变量 `PLAYWRIGHT_BROWSERS_PATH` 指向现有缓存，并按需设置 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` 为 Chromium 可执行文件；录屏还需要同一缓存中的 FFmpeg。不要把个人绝对路径写入仓库。恢复默认时清除这两个覆盖变量，再运行 `npm run setup`。

`.env.example` 只解释可选变量；本项目**不会自动读取 `.env`**。Linux 若提示缺少系统共享库，需要按当前系统的 Playwright 安装说明自行处理；本项目不会自动提权或安装系统依赖。Windows/Linux 的实际运行尚未验证。

## 主要依赖及用途

依赖版本由 `package-lock.json` 锁定，克隆后使用 `npm ci`，避免无意更新版本。

| 依赖 | 用途 |
| --- | --- |
| React、React DOM | 中文交互界面与状态展示 |
| TypeScript 5.9.3 | 类型检查，以及后端的源码语法解析；固定版本以保持编译器 API 兼容 |
| Vite、React 插件 | 本地开发服务、API 代理与网页构建 |
| Express | 本地样例读取、GitHub 请求和输入校验接口 |
| `@xyflow/react` | 二维图谱、连线、平移缩放与可访问控件 |
| Dagre、`@types/dagre` | 模块分层布局与类型定义 |
| Lucide React | 界面图标 |
| tsx、concurrently | 启动 TypeScript API，同时运行网页/API，退出时清理子进程 |
| Vitest | 源码解析、网络边界、诊断脚本的单元测试 |
| Playwright 1.58.2、Chromium、FFmpeg | 真实浏览器自动化、截图与录屏 |
| `@types/node`、`@types/react`、`@types/react-dom`、`@types/express` | 对应运行时和库的开发类型定义 |

无需数据库、模型 SDK、外部字体服务或其他项目文件。应用采用 MIT 许可证，第三方依赖保留各自许可证。

## 出错后如何恢复

- **Node 版本不兼容**：先运行 `node --version`，使用上述支持版本后重新运行 `npm run setup`。
- **找不到依赖或命令**：确认终端位于本项目根目录，运行 `npm ci --cache .npm-cache`；再运行 `npm run doctor`。
- **浏览器下载失败**：检查网络、代理和磁盘空间后重试 `npm run setup`；可以先用 `--skip-browser` 启动网页演示。复用已有浏览器时需确认覆盖变量正确。
- **端口被占用**：运行 `npm run doctor`。如果自己的 RepoGalaxy 已启动，在原终端按 Ctrl+C 停止，再启动或验收。不要直接结束不明进程，也不要同时运行多个测试命令。诊断脚本不会自动停止服务。
- **GitHub 限流、404 或请求超时**：检查仓库公开状态及地址，稍后点击“重试仓库”；也可主动选择“改用本地样例”。系统不会把失败的实时读取悄悄替换为样例。
- **本地 API 连接失败**：确认 `npm run dev` 的两个进程均正常运行，检查终端中文提示。界面保留错误与恢复按钮。
- **没有 TS/JS 文件**：图谱显示明确空态；选择含 TS/JS 的公开仓库或使用本地样例。

## 自动验收与真实证据

先停止已运行的开发服务，再按顺序执行：

```sh
npm run build
npm run test
npm run e2e
npm run demo
```

测试会自行启动并停止本地服务。浏览器测试包含：9 个模块 / 10 条真实连线、完整路径和导入跳转、非法 URL 的后端 400、请求体大小限制、中文首次引导、小屏无横向溢出、键盘操作，以及网络错误后恢复到明确标注的样例。

中文化完成后的实际结果以 `status.json` 为准。本地 `artifacts/` 保存以下证据（不提交到 Git）：

- `build-zh.log`、`test-zh.log`、`e2e-zh.log`、`demo-zh.log`：四项命令的真实输出。
- `setup-zh.log`、`doctor-zh.log`、`doctor-missing-zh.log`：按锁文件重装、正常诊断与缺依赖路径诊断。缺依赖场景退出码 `1` 是预期结果。
- `repo-galaxy-overview.png`、`repo-galaxy-detail.png`、`repo-galaxy-mobile-zh.png`：中文截图。
- `artifacts/playwright/demo/`：真实中文交互录屏；`artifacts/playwright/e2e/`：端到端测试截图和视频。
- `github-live.json`：前一轮真实公开仓库验证，`sindresorhus/is` 的 `main` 分支当时返回 5 个模块 / 6 条导入边；本轮中文化不把该旧结果冒充新的在线测试。

此前失败日志也保留：最初的 TypeScript 7 编译器 API 不兼容、模拟源码字节数错误、图谱首次交互时序问题，均已修复并重跑。此前浏览器下载停滞后中断；本轮复用现有 Chromium 与录屏组件，**全新浏览器下载及全新机器安装未验证**。按锁文件重装依赖使用现有本地缓存验证。

## 实际能力与边界

- 本地样例每次由 API 读取 `fixtures/observatory` 内的真实文件并解析，图谱不是预制数据。
- 实时模式读取 GitHub 默认分支的 Git 树及内容寻址的源码 blob；每条连线都对应观察到的静态 `import` / `export ... from` 声明。
- 仅解析 TS/JS 静态相对导入。动态导入、CommonJS `require`、路径别名、包解析和其他语言不在本 MVP 范围内；未读取文件和外部包会保留为未解析导入。
- 最多 60 个文件、单文件 100,000 字节、源码合计 1,000,000 字节；最多 4 个并发源码请求，每个请求超时 12 秒，结果缓存 5 分钟。同时只执行一个实时映射任务。元数据响应上限 8 MB，blob 响应上限 150 KB。
- 超大仓库和截断的 Git 树只能展示子集，不代表完整架构。公开 GitHub API 无认证，可能限流。
- 严格接受 `https://github.com/owner/repository`；实际请求仅发向 HTTPS 的 `api.github.com`，禁止重定向。不会读取任意本地路径或用户凭据；源码只解析、不执行。
- 这是二维星图，不是 WebGL/三维场景；不调用 AI 模型，不虚构模型回复或 Agent 事件。无生产部署、账号和认证功能。

法律许可见 [LICENSE](LICENSE)。

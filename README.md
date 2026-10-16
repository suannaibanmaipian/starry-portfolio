# CY · 星间档案

专业实习个人网站：深色星空前台，包含个人介绍、技能、项目和博客，以及可编辑内容的演示管理后台。

## 本地运行

先安装当前受 Vite 支持的 Node.js LTS 和 npm，在项目根目录执行：

```powershell
npm install
npm run dev
```

打开终端显示的本地地址。正式构建：

```powershell
npm run build
npm run preview
```

`npm run build` 包含 TypeScript 类型检查和 Vite 构建，结果在 `dist/`。开发与预览服务器默认绑定 `127.0.0.1`。

## 演示后台

访问站点的 `/admin/login`：

- 用户名：`admin`
- 演示密码：`Starry2026!`

可编辑个人资料、技能、项目、博客与站点标题。保存后返回前台查看效果。默认个人信息为可编辑占位内容，请只填写愿意公开的信息。

内容保存在当前站点的浏览器 `localStorage`。同一浏览器刷新后保留；换浏览器、设备或域名不共享，清除网站数据会重置。线上访客不会自动看到你在另一台设备后台保存的内容。

登录使用客户端 SHA-256 摘要比较，`sessionStorage` 会话有效期为 8 小时。它仅用于课程演示，不是真实服务端认证；请勿保存敏感信息。若需要所有访客看到相同修改，应接入服务端存储与认证。

## 页面与文档

- 前台：`/`、`/projects/:id`、`/blog/:id`。
- 后台：`/admin`，以及 `profile`、`skills`、`projects`、`posts`、`settings` 管理页。
- `PRD.md`：产品目标、功能、边界与验收标准。
- `TECH_DESIGN.md`：架构、数据、认证边界和部署设计。
- `AGENTS.md`：开发与检查约定。
- `src/`：应用源码；`src/api/`：统一数据访问层。
- `public/`：静态资源；`deliverables/`：作业提交材料。

作业截图中的 `TECH_DESIN` 对应课件的 `TECH_DESIGN.md`，提交时使用同一技术设计文档的内容截图。

## Vercel 部署

1. 将项目推送到 GitHub 仓库；在 Vercel 中导入该仓库。
2. 如果仓库中还包含课程其他文件，将 Root Directory 设置为本项目目录。
3. Framework Preset 选 Vite；Build Command 为 `npm run build`；Output Directory 为 `dist`。
4. 项目已提供 `vercel.json` 路由回退；确认配置生效，开始部署。
5. 实际访问平台生成的网址，检查首页、项目详情、博客详情和 `/admin/login`；直接打开及刷新深层路径也应成功。

## Cloudflare Pages 部署（可选）

在 Pages 中连接 GitHub 仓库，选择项目根目录，构建命令填写 `npm run build`，输出目录填写 `dist`。项目已提供 `public/_redirects`，确保单页应用路径回退到 `index.html`。无需购买自定义域名，平台生成的站点地址可用于作业填写。

## 作业截图

1. 截取 `PRD.md`、`TECH_DESIGN.md`、`AGENTS.md` 的实际内容，标题和正文必须清晰；长文档可分多张。
2. 部署成功后截取线上首页与项目展示，尽量保留可识别的网址。
3. 登录线上后台，截取个人资料编辑页；保存一项演示修改，返回前台核验并截图。
4. 在 `deliverables/交付清单.md` 中记录真实网址及对应截图文件。

截图必须来自实际运行或实际文档，不用模拟图代替。部署地址尚未验证前不标记成功。


三份文档内容截图已放在 `deliverables/documents/`。如文档修改，可在当前配置了工具的电脑运行 `node scripts/capture-documents.cjs` 重新生成；该辅助脚本使用本机 Chrome 和 Codex bundled Playwright 路径，不参与网站构建，其他电脑需按自身安装位置调整。

# CY · 星间档案｜技术设计（TECH_DESIGN）

## 1. 技术选型

| 层次 | 方案 | 目的 |
| --- | --- | --- |
| 页面 | React + TypeScript | 组件组织与数据类型约束 |
| 构建 | Vite | 本地开发和静态产物构建 |
| 样式 | Tailwind CSS + 全局样式 | 响应式深色星空视觉 |
| 路由 | React Router | 前台详情与后台页面切换 |
| 校验 | Zod | 统一校验后台表单输入 |
| 正文 | Markdown 渲染组件 | 展示文章与项目说明，禁止直接执行 HTML |
| 持久化 | 统一 API 层 + localStorage | 按课程要求模拟内容服务 |
| 部署 | Vercel 或 Cloudflare Pages | 托管 Vite 构建的 `dist` |

## 2. 架构与目录职责

页面和组件通过 `src/api` 读取、保存数据，不在界面各处直接操作存储。默认示例数据在首次访问时加载；后续使用当前浏览器保存的数据。存储键为 `cy-portfolio-v1`，通过版本键隔离数据，不自动迁移旧版本。损坏 JSON 或不符合模型的数据会回退默认值并在后台提示；保存时可覆盖损坏数据。存储写入失败时显示错误且不更新内存。通过 storage 事件同步同源标签页。

- `src/`：应用入口、路由、前台、后台、公共组件与样式。
- `src/api/`：数据读取、更新、持久化和异常处理。
- `public/`：静态资源和托管平台所需配置。
- `dist/`：执行构建后生成的部署产物。
- `deliverables/`：课程提交清单和已验证的截图材料。

## 3. 数据契约

根数据 `PortfolioData` 包含：

| 字段 | 内容 |
| --- | --- |
| `profile` | `name`、`role`、`bio`、`about`、`email`、`github`、`location` |
| `skills[]` | `id`、`name`、`category`、`level` |
| `projects[]` | `id`、`title`、`summary`、`category`、`tags`、`description`、`url`、`featured` |
| `posts[]` | `id`、`title`、`excerpt`、`content`、`date`、`published` |
| `settings` | `siteTitle`、`siteDescription` |

`tags` 为逗号分隔的字符串；`level` 为技能数值；`featured` 控制项目精选标记。ID 用于详情路由和编辑定位。更新单项时保留其他记录；删除后及时更新当前展示。输入应保留可恢复的表单状态，并在保存前完成校验。

## 4. 路由

前台：`/`、`/projects/:id`、`/blog/:id`。

后台：`/admin/login`、`/admin`、`/admin/profile`、`/admin/skills`、`/admin/projects`、`/admin/posts`、`/admin/settings`。

受保护后台页面使用统一路由守卫；无会话、无效或过期会话跳转到登录页。资源不存在时展示返回入口。部署平台需要配置 SPA 回退，确保直接打开详情页或刷新后台路径时仍返回应用入口。

## 5. 登录与数据安全边界

演示账号为 `admin`，密码为 `Starry2026!`。登录时对输入密码计算 SHA-256 摘要后比较，不将明文密码写入浏览器存储。会话位于 `sessionStorage`，有效期 8 小时；退出清除会话。

这是客户端演示认证，摘要、逻辑和内容均可能被访问者检查或修改，因此不能作为生产环境身份认证。内容存在访问者自己的 `localStorage`，不上传服务器，也不会自动传播到其他设备。公开部署的站点默认展示随代码发布的示例数据。

文章 Markdown 不启用原始 HTML 执行，外部链接避免不安全协议。对邮箱、链接等输入进行格式校验；展示文本通过 React 转义，不直接拼接 HTML。

## 6. 样式与可访问性

采用深蓝背景、低干扰星点和青绿重点色。装饰层不拦截交互。布局先适配窄屏，再扩展为桌面网格；内容长词和链接允许换行。导航、按钮和表单保留键盘焦点，错误信息关联输入框；减少动画偏好下关闭或简化动态效果。

## 7. 构建与部署

本地安装依赖后执行 `npm run dev`；提交前执行 `npm run build`，该命令依次运行 `tsc --noEmit` 类型检查与 `vite build`。`npm run preview` 可预览生产构建。构建输出 `dist`。

Vercel：导入 GitHub 仓库，框架选 Vite，构建命令 `npm run build`，输出目录 `dist`，通过项目 `vercel.json` 配置单页应用路由回退。

本次使用 Cloudflare Pages Direct Upload：完成授权后运行 `npx wrangler@4.45.0 pages deploy dist --project-name cy-starry-portfolio --branch main`，上传生产构建。正式站点为 https://cy-starry-portfolio.pages.dev/，后台为该域名的 `/admin/login`；本次部署预览为 https://df3f257e.cy-starry-portfolio.pages.dev/。

通过 `public/_redirects` 配置单页应用回退。源码保存在独立 GitHub 私有仓库，Direct Upload 与 Git 推送分别进行，不会自动持续部署。更新时先重新构建再上传，不将托管平台凭据写入项目。另一种选择是 Cloudflare Pages Git 集成，使用相同的构建命令和输出目录。部署后检查首页、详情路由、后台登录、刷新及移动端布局，实际检查结果另存验收报告。

## 8. 检查与后续扩展

验证登录守卫与过期、表单错误、删除取消、持久化、文章发布状态和 375px 布局；检查生产构建及线上深层路由。真实跨设备内容管理需要替换 API 层，接入数据库、服务端登录、会话验证与授权后再开放写入。




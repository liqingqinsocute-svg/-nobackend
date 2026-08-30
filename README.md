# 创海 · 全球企业出海合规热力图（Vercel纯前端版）

本项目是标准 Vite + React 单页应用，不包含后端、API服务或数据库。全部数据已经内置在前端，可以直接部署到Vercel。

## 本地运行

```bash
npm install
npm run dev
```

## 本地构建

```bash
npm run build
npm run preview
```

构建结果位于 `dist/`。

## 部署到Vercel

推荐将解压后的项目上传到GitHub，再在Vercel选择 **Add New → Project → Import Git Repository**。

Vercel会读取项目根目录的 `vercel.json`：

- Framework Preset：Vite
- Build Command：`npm run build`
- Output Directory：`dist`
- Install Command：`npm install`

`vercel.json` 已配置单页应用回退规则，因此刷新首页或直接访问任意前端路径都不会返回404。

也可以使用Vercel CLI：

```bash
npm install -g vercel
vercel
vercel --prod
```

## 主要代码

- `src/components/compliance-dashboard.tsx`：大屏主界面和地图交互
- `src/lib/compliance-data.ts`：行业、风险与企业任务
- `src/lib/validated-source-data.ts`：内置监管指数和事件数据
- `src/styles.css`：视觉样式与动画
- `vercel.json`：Vercel构建和防404配置

## 自有域名

部署成功后，可在Vercel项目的 **Settings → Domains** 中绑定自有域名。项目本身不包含任何特定托管平台名称。

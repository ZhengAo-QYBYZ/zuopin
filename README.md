# 郑傲 · 个人作品集

纯静态网页，无需安装框架、运行构建或配置数据库。打开 `index.html` 可本地浏览；线上部署时上传 `index.html`、`assets/`、`images/`、`docs/`，保留目录结构。

## 更新内容

2026-10-26 已更新简历下载为 `docs/郑傲简历.pdf`，保持提供的 PDF 原样。已按当前网页与作品数据的引用关系清理未使用的图片、展示副本、旧简历及遗留占位文件，保留全部 16 个展示条目。旧网页备份快照已移除，版本恢复使用 Git 提交记录。

2026-10-26 已根据最新作品集新增 6 组作品：社区球场、对马岛之魂、桃园、教堂 TOD、二战 · 战时街道、湖畔小屋，共导入 29 张原始图片。前三组同时加入首页精选，原有作品保留。二战与战时街道合并展示同一场景的不同灯光版本。

新增图片位于 `images/portfolio-2026/`，对应展示副本位于 `images/optimized/portfolio-2026/`。项目可使用 `galleryCaptions` 对象为相册图片添加说明，键为图片路径，值为说明文字。社区球场保留 AI 模型及外部素材的来源与个人贡献说明。对马岛之魂在作品集两页分别标注 14 天与 21 天，网页暂不展示该制作周期。

- **作品与精选**：修改 `assets/content.js` 中的 `projects`。数组顺序决定展示顺序；设置 `featured: true` 即加入精选，首个精选使用宽幅展示。
- **首页背景**：`assets/hero-scene.js` 控制“虚空建筑核心”三维背景的几何、灯光和运动；`assets/hero-scene.css` 只控制背景层与暂停按钮。文字、时钟、导航和作品布局仍由原有 HTML / `styles.css` 控制。`content.js` 的 `heroImage` 为旧图片背景的保留配置，目前不参与首页渲染。分享图片仍由 `index.html` 的 `og:image` 指定。
- **个人介绍、技能、联系方式**：在 `index.html` 中对应的 About / Contact 区域修改。邮箱同时用于 `content.js` 的邮件配置；发送服务的收件人由 EmailJS 后台控制。
- **统计数字**：修改 `content.js` 的 `counters`，这些是手动维护的数据，不会随日期自动推算。
- **视觉样式**：`assets/styles.css`。
- **交互逻辑**：`assets/main.js`。无需修改它来增删作品。

新增作品时可复制下面的对象到 `projects` 数组内，与前后对象用逗号分隔：

```js
{
    id: "new-project",                 // 唯一标识
    featured: false,                  // true：加入精选
    title: "作品名称",
    category: "场景",                 // 分类按钮自动生成
    thumb: "images/new-project.png",
    desc: "作品说明。\n\n第二段说明。",
    videoUrl: "",                     // 可选：完整视频网址
    documents: [],                   // 例：{ name: "制作说明", url: "docs/说明.pdf", type: "pdf" }
    meta: [
        { label: "工具", value: "Blender / UE5" },
        { label: "时间", value: "2026" }
    ],
    gallery: ["images/new-project.png"]
}
```

原有 `hasVideo`、`hasDoc` 字段保留以兼容旧内容；新逻辑根据 `videoUrl` 和 `documents` 自动显示标记，不必再手动同步这些布尔值。图片查看器会自动合并主图与相册、去除重复项。

## 图片处理

原图保存在 `images/`，不会被覆盖。`images/optimized/` 是自动生成的 WebP 展示图，含 480 / 960 / 1920 像素宽度版本（不放大原图），浏览器按屏幕宽度选择。查看器提供原图链接。

新增或替换图片后，使用安装了 Pillow 的 Python 运行：

```powershell
python scripts/optimize-images.py
```

这会更新展示图和 `assets/image-manifest.js`，未更改的图片会跳过转换。未生成展示图的新作品也可以直接使用原图，建议发布前完成转换。

## 检查和预览

```powershell
node scripts/check-site.cjs
python -m http.server 8765 --bind 127.0.0.1
```

浏览器打开 `http://127.0.0.1:8765/`。关闭预览服务器可按 Ctrl+C。

如已安装 Playwright 且电脑有 Microsoft Edge，在预览服务器运行时执行：

```powershell
node scripts/browser-check.cjs
```

检查覆盖分类、所有作品详情、灯箱、键盘焦点、滚动恢复、手机菜单、减少动态效果、禁用 JavaScript、直接打开文件，以及表单错误和模拟发送。截图和结果在 `verification/`；测试会拦截外部邮件请求，不会发送真实消息。

## 邮件与发布

在线表单继续使用原有 EmailJS 服务。SDK 只会在访客首次提交有效表单时加载，降低首屏开销。发送失败时保留输入并提示使用邮件客户端；请求未确认时不会自动重试。

已完成本地模拟测试；尚未验证 EmailJS 后台的当前额度、模板配置、域名许可及真实收件情况。正式上线后可由你发送一封测试邮件确认。公开 Key 是浏览器服务所需的客户端标识，管理密钥不能放入网页。

线上网站：[郑傲作品集](https://zhengao-qybyz.github.io/zuopin/)。网站仓库为 `ZhengAo-QYBYZ/zuopin`，更新推送到 `main` 分支后由 GitHub Pages 自动发布。`backups/` 和 `verification/` 仅用于本地工作，不会提交。当前部署用的 Git 工作副本位于 `backups/deploy-zuopin-20261026/`。

## 三维背景

背景采用本地保存的 Three.js r160（许可证在 `assets/vendor/THREE-LICENSE.txt`），不依赖在线 CDN、模型或视频。鼠标移动会轻微改变视角和核心光照；右下角可以暂停或恢复。滚出首屏及页面切到后台时停止连续渲染，系统开启减少动态效果时默认静止。WebGL 不可用时显示静态几何背景。渲染像素数设有上限，持续低帧率时会降低内部渲染分辨率。

`node scripts/background-check.cjs` 可检查背景动效及与历史基准的布局一致性；需安装 Playwright、Microsoft Edge，以及本地保留的 `verification/pre-void-index.html` 布局基准文件。

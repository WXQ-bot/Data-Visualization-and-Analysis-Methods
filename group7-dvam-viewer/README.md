# CryoMethViz — 冰冻圈湖中甲烷排放的温度依赖性可视化与分析

## 项目简介
简要说明：本仓库聚合并可视化了冰冻圈湖泊甲烷通量数据，量化不同排放路径（扩散 dCH4 / 鼓泡 eCH4 / 总通量 tCH4）的温度敏感性（表观活化能 Ea），并考察湖泊尺度（面积、深度）对温度响应的调制作用。数据来源：Cryosphere Lake Greenhouse Gases Database 2025（DOI: 10.6084/m9.figshare.29146295）。

## 项目结构（重要文件/目录）
- `index.html` — 网页展示入口（图片画廊、PDF 预览与下载、数据资产表）  
- `css/styles.css` — 页面样式  
- `js/viewer.js` — 前端交互脚本（预览、下载拦截、导航显示/隐藏等）  
- `assets/`
  - `assets/data/` — 处理后数据文件（Lakedat2_25.csv、Site_with_T_and_CH4.csv、Lake_Diff_site2504.csv、Lake_Eb_site2504.csv）
  - `assets/images/` — 可视化图像（如 `lake standardized temp vs. flux10.png`、`lake depth temp vs. log10 flux-4.png` 等）
  - `assets/pdfs/` — PDF 文档（doc.pdf 等）
  - `assets/docs/` — 研究说明文档（.docx）
  - `assets/code/` — R 脚本与分析（`main.R`）
- `Output_Test_v1/` — 脚本输出（Figures / Tables）（由 R 脚本生成）

## 研究背景（要点）
- 高纬度寒区湖泊是潜在强甲烷源，变暖可能触发显著的气候正反馈。研究核心问题：甲烷通量对温度的敏感度有多大？不同湖泊/过程是否存在系统差异？是否有关键尺度导致响应跃迁？  
- 本工作通过整合多源观测，使用 Arrhenius 回归框架量化“表观活化能” Ea，将温度对通量的影响用统一物理量比较与可视化。

## 温度敏感性（数学表述）
- 基本形式：flux = A · exp(−Ea / (kT))  
- 取对数并以 1/(kT) 为自变量：ln(flux) = ln A − Ea · 1/(kT)  
- 回归斜率对应 −Ea（脚本中以标准化温度变量 `ikt` 实现，参见 `assets/code/main.R`）。

## 方法概览
- 数据整合与预处理：`assets/code/main.R`（处理、标准化温度变量、分组与模型拟合）。  
- Ea 估计：对数化通量对标准化温度变量回归（线性/混合效应模型）；引入空间相关结构以控制自相关。  
- 尺度分析：按面积/深度分组与滑动阈值方法识别“临界尺度”。

## 主要可视化成果（摘要）
- 核心图：`assets/images/lake standardized temp vs. flux10.png`  
- 机制/尺度图：`assets/images/lake depth temp vs. log10 flux-4.png`、`assets/images/lake size temp vs. log10 flux5-1.png`  
- 补充图：`Parallel_Coordinates_Plot.png`、`Facet_Grid_Plot.png`  
- 结论概览：鼓泡通量 eCH4 的温度敏感性显著高于扩散 dCH4；Ea 在站点间高度异质；面积与深度可系统性调制温度响应，并可能存在关键尺度。

## 如何运行（强烈建议使用本地 HTTP 服务以避免 file:// 限制）
> 说明：若直接用 file:// 打开 `index.html`，浏览器对 fetch 的请求（用于强制下载 PDF 等）会被 CORS 阻止。请用本地静态服务器（推荐 http-server via npx）运行页面。

### 在 Windows 上使用 npx http-server（完整步骤）
1. 检查 Node.js（PowerShell 或 cmd）：
```powershell
node -v
npm -v
```
若未安装，请从 https://nodejs.org 下载并安装（LTS）。

2. 打开终端并切换到项目目录（路径含中文或空格请用引号）：
```powershell
cd "D:\ProgramData\研究生\Data_Visualization\Data-Visualization-and-Analysis-Methods\group7-dvam-viewer"
```

3. 启动本地静态服务器（端口 8000；若被占用可改端口）：
```powershell
npx http-server -p 8000
```
可选参数：`npx http-server -p 8000 --cors --silent`  
如 npx 下载慢，可先全局安装：`npm i -g http-server` 然后 `http-server -p 8000`

4. 在浏览器打开页面：
```powershell
start http://localhost:8000
```
或在浏览器地址栏输入 `http://localhost:8000`

5. 验证与使用  
- 通过 `http://localhost:8000` 访问项目后，`viewer.js` 中的 fetch 下载、PDF 预览（iframe）等将正常工作（不再受 file:// CORS 限制）。  
- 点击“下载”按钮应直接开始下载 PDF（确保下载链接为相对同源路径并带 `download="filename.pdf"`）。

6. 停止服务器：在启动服务器的终端按 `Ctrl+C` 停止（若提示确认，按 `Y`）。

## 如何运行 R 脚本（复现图表）
1. R >= 4.x（推荐 RStudio）  
2. 在 RStudio 打开 `assets/code/main.R` 并运行，或命令行运行：
```sh
Rscript assets/code/main.R
```
3. 输出（图表与表格）将保存到脚本中指定的 `Output_Test_v1/Figures` 与 `Output_Test_v1/Tables`。

## 引用与数据来源
- 数据集：Cryosphere Lake Greenhouse Gases Database 2025（DOI: 10.6084/m9.figshare.29146295）。  
- 代码入口：`assets/code/main.R`；网页入口：`index.html`。

如需把某节改写为会议摘要风格、或生成一键启动的 Windows 批处理脚本（启动 http-server 并自动打开浏览器），我可以直接生成并提交对应文件。

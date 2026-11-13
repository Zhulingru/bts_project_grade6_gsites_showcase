# 無界塾 Google 協作網站

收錄學生本學期發布的 Google 網站。網站是靜態頁面，之後部署到 GitHub Pages。

使用方式：打開網站 → 讀課程說明 → 選 D / B / G 班或搜尋姓名 → 點學生卡片 → 在頁面內預覽，或另開原始網址。

## 本機預覽

在專案根目錄執行：

```bash
python3 -m http.server 8080
```

瀏覽器打開：<http://localhost:8080>

檔案必須透過本機伺服器開啟。直接雙擊 `index.html` 時，瀏覽器可能擋掉 `data/students.json`。

## 更新學生名單

只需要改 [`data/students.json`](data/students.json)。每位學生一筆：

```json
{
  "D": [
    {
      "id": "d1",
      "name": "王小明",
      "siteTitle": "我的一天",
      "siteUrl": "https://sites.google.com/view/example",
      "thumbUrl": ""
    }
  ],
  "B": [],
  "G": []
}
```

注意：

- `id` 在同班內不要重複
- `name` 會顯示在卡片上，也是搜尋用的名字
- `siteTitle` 是網站標題，可留空字串 `""`
- `siteUrl` 貼學生 **已發布** 的 Google 網站網址（`https://sites.google.com/view/...`）
- 連結權限請設成 **知道連結的任何人都可以檢視**，否則會看到登入畫面
- 還沒交網站的學生，`siteUrl` 可先留空字串 `""`，卡片會顯示「尚未提供」
- `thumbUrl` 可留空。若要放封面圖，把圖片放進 `assets/thumbs/`，再填相對路徑，例如 `assets/thumbs/a1.jpg`

Google 網站常常不允許被其他網頁內嵌。預覽若是空白，用「在新分頁開啟網站」即可。

課程說明直接改 [`index.html`](index.html) 裡「課程設計理念」那一段。

## 部署到 GitHub Pages

1. 在 GitHub 建立新的 **Public** repository（例如 `gsites-showcase`）
2. 不要勾選「Add a README file」
3. 把這個資料夾裡的檔案推上去，確定 `index.html` 在 repo **根目錄**

```bash
git init
git add index.html styles.css js data assets README.md .nojekyll .gitignore
git commit -m "Add Google Sites showcase"
git branch -M main
git remote add origin https://github.com/<你的帳號>/<repo名稱>.git
git push -u origin main
```

4. 打開 repo → **Settings** → **Pages**
5. Source 選 **Deploy from a branch**
6. Branch 選 `main`，資料夾選 `/ (root)`，按 Save
7. 等 1–2 分鐘，網址會是：

```
https://<你的帳號>.github.io/<repo名稱>/
```

之後只要改 `data/students.json`（或課程說明）再 `git push`，網站就會更新。

## 檔案說明

```
gsites_showcase/
├── index.html           頁面結構與課程說明
├── styles.css           外觀
├── js/app.js            班級切換、搜尋、卡片、內嵌預覽
├── data/students.json   學生姓名與 Google 網站網址
├── assets/thumbs/       選用的封面圖
├── .nojekyll            讓 GitHub Pages 不要走 Jekyll
├── .gitignore
└── README.md            本說明
```

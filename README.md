# Portfolio site

Plain HTML, CSS and a little JavaScript. No build step.

## Deploy on GitHub Pages (free)

1. On GitHub, create a **public** repo named `lakshya110704.github.io` (this gives you the root address `https://lakshya110704.github.io`). Any other name also works, but the site then lives at `/<repo-name>/`.
2. Put `index.html`, `styles.css` and `script.js` at the top level of the repo and push:
   ```bash
   git init && git add . && git commit -m "Portfolio site"
   git branch -M main
   git remote add origin https://github.com/lakshya110704/lakshya110704.github.io.git
   git push -u origin main
   ```
3. In the repo go to **Settings > Pages**. Under **Build and deployment** choose **Deploy from a branch**, branch `main`, folder `/ (root)`, then Save.
4. Wait a minute or two. The site appears at the address shown on that page.
5. Update the `og:url` in `index.html` to that address.

Custom domain (optional): add it under Settings > Pages and follow GitHub's DNS steps.

## Fill in the TODOs

Search the files for `TODO`. Yellow highlights on the page are visible placeholders too; delete each highlight once filled.

## Test locally

```bash
python3 -m http.server 8000
```
Then open http://localhost:8000.

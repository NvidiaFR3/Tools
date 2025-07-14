import fs from "fs-extra";
import path from "path";
import unzipper from "unzipper";
import { execSync } from "child_process";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const multiparty = (await import("multiparty")).default;
  const simpleGit = (await import("simple-git")).default;

  const form = new multiparty.Form();
  form.parse(req, async (err, fields, files) => {
    try {
      const username = fields.username[0];
      const repo = fields.repo[0];
      const token = fields.token[0];
      const zipPath = files.zip[0].path;

      const tempDir = `/tmp/repo-${Date.now()}`;
      await fs.mkdirp(tempDir);

      // Extract ZIP
      await fs.createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: tempDir }))
        .promise();

      // Create repo via GitHub API
      const createRes = await fetch("https://api.github.com/user/repos", {
        method: "POST",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: repo,
          private: false,
          auto_init: false
        })
      });

      if (!createRes.ok) {
        const error = await createRes.json();
        return res.status(400).send("❌ Gagal buat repo: " + JSON.stringify(error));
      }

      // Inisialisasi Git
      const git = simpleGit(tempDir);
      await git.init();
      await git.addRemote("origin", `https://${username}:${token}@github.com/${username}/${repo}.git`);
      await git.add(".");
      await git.commit("Auto-upload via FR3 ZIP Uploader");
      await git.push("origin", "master");

      res.send(`✅ Repository berhasil dibuat dan ZIP diupload ke https://github.com/${username}/${repo}`);
    } catch (e) {
      console.error(e);
      res.status(500).send("⚠️ Terjadi kesalahan: " + e.message);
    }
  });
}
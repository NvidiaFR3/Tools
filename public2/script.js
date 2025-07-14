async function upload() {
  const username = document.getElementById("username").value;
  const repo = document.getElementById("repo").value;
  const token = document.getElementById("token").value;
  const zipFile = document.getElementById("zipFile").files[0];
  const result = document.getElementById("result");

  const formData = new FormData();
  formData.append("username", username);
  formData.append("repo", repo);
  formData.append("token", token);
  formData.append("zip", zipFile);

  result.textContent = "Uploading...";
  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData
  });

  const text = await res.text();
  result.textContent = text;
}
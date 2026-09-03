// lib/githubQueue.js — CommonJS.
// Reuses the same GITHUB_TOKEN / fetch-SHA-then-PUT pattern already proven in
// upload-resume.js. No new infra — the repo itself is the queue.
//
// Convention:
//   pending-tailoring/{jobId}.json   — written by tailor-resume.js, read by a
//                                       Claude session to generate a redlined draft
//   pending-review/{jobId}.json      — written by the Claude session once the
//                                       redlined draft + PDF exist, waiting on
//                                       George's approval
//   (on approval, the session accepts changes, writes final files under
//   public/resumes/tailored/, and deletes both queue entries)

const GITHUB_API = "https://api.github.com";

function ghHeaders() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN missing in serverless environment.");
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };
}

function repoPath() {
  const owner = process.env.GITHUB_OWNER || "Gb-Steelworks";
  const repo = process.env.GITHUB_REPO || "gb-job-hunt30";
  return { owner, repo };
}

// Fetches existing file SHA if present — required by GitHub's PUT API to
// overwrite; a PUT without SHA on an existing path fails.
async function getExistingSha(path) {
  const { owner, repo } = repoPath();
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`;
  const res = await fetch(url, { headers: ghHeaders() });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET ${path} failed: ${res.status}`);
  const data = await res.json();
  return data.sha;
}

async function putFile(path, contentBase64, message) {
  const { owner, repo } = repoPath();
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`;
  const sha = await getExistingSha(path);
  const body = { message, content: contentBase64, ...(sha ? { sha } : {}) };
  const res = await fetch(url, { method: "PUT", headers: ghHeaders(), body: JSON.stringify(body) });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`GitHub PUT ${path} failed: ${res.status} ${errText}`);
  }
  return res.json();
}

async function enqueuePendingTailoring(jobId, changePlanAndPhase2) {
  const path = `pending-tailoring/${jobId}.json`;
  const contentBase64 = Buffer.from(
    JSON.stringify(changePlanAndPhase2, null, 2),
    "utf-8"
  ).toString("base64");
  return putFile(path, contentBase64, `Queue tailoring job ${jobId}`);
}

module.exports = { enqueuePendingTailoring, putFile, getExistingSha };

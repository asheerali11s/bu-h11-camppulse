#!/usr/bin/env node

/**
 * BU (Bahria University H-11 CAMPUS) - Automated GitHub Repository Creator & Pusher
 * Creates the 2 repositories on https://github.com/asheerali11s via GitHub REST API
 * and immediately pushes all commits to main.
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = __dirname;
const VAULT_DIR = path.join(ROOT_DIR, 'database-vault');

const token = process.argv[2] || process.env.GITHUB_TOKEN;

if (!token) {
  console.log(`
❌ GitHub Personal Access Token required.
Usage:
  node setup-and-push-github.mjs <YOUR_GITHUB_PERSONAL_ACCESS_TOKEN>

To generate a token with 'repo' scope:
  https://github.com/settings/tokens/new?scopes=repo&description=BU-H11-CampPulse
`);
  process.exit(1);
}

const GITHUB_USER = 'asheerali11s';

const REPOS = [
  {
    name: 'bu-h11-camppulse',
    description: 'BU (Bahria University H-11 CAMPUS) Society & Event Hub - 24/7 Cloud App',
    isPrivate: false,
    dir: ROOT_DIR,
  },
  {
    name: 'bu-h11-database-vault',
    description: 'BU (Bahria University H-11 CAMPUS) Secure Database Vault & User Registry',
    isPrivate: true,
    dir: VAULT_DIR,
  },
];

async function createAndPush() {
  console.log('🏛️  Bahria University H-11 Campus - Automated GitHub Publisher');
  console.log('Target account:', GITHUB_USER);
  console.log('------------------------------------------------------------');

  for (const repo of REPOS) {
    console.log(`\n📦 [Step 1] Creating repository '${repo.name}' on GitHub...`);

    try {
      const response = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'User-Agent': 'BU-H11-Publisher',
        },
        body: JSON.stringify({
          name: repo.name,
          description: repo.description,
          private: repo.isPrivate,
          auto_init: false,
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        console.log(`✅ Successfully created https://github.com/${GITHUB_USER}/${repo.name}`);
      } else if (response.status === 422 && data.errors?.[0]?.message?.includes('already exists')) {
        console.log(`ℹ️  Repository https://github.com/${GITHUB_USER}/${repo.name} already exists. Continuing to push...`);
      } else {
        console.error(`⚠️  GitHub API Response (${response.status}):`, data.message || data);
      }
    } catch (err) {
      console.error('⚠️  Failed to create repo via API:', err.message);
    }

    console.log(`🚀 [Step 2] Pushing code from '${repo.dir}'...`);
    try {
      process.chdir(repo.dir);
      const pushUrl = `https://${GITHUB_USER}:${token}@github.com/${GITHUB_USER}/${repo.name}.git`;
      execSync(`git push "${pushUrl}" main -u`, { stdio: 'inherit' });
      console.log(`🎉 Pushed '${repo.name}' successfully!`);
    } catch (err) {
      console.error(`❌ Push failed for ${repo.name}:`, err.message);
    }
  }

  console.log('\n------------------------------------------------------------');
  console.log('✨ All BU H-11 repositories published to GitHub!');
  console.log(`1. Server App: https://github.com/${GITHUB_USER}/bu-h11-camppulse`);
  console.log(`2. Data Vault: https://github.com/${GITHUB_USER}/bu-h11-database-vault`);
}

createAndPush();

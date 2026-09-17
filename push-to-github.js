const fs = require('fs');
const path = require('path');
const https = require('https');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_NAME = 'careconnect';

if (!GITHUB_TOKEN) {
  console.error("No GITHUB_TOKEN provided");
  process.exit(1);
}

const reqOpts = (path, method = 'GET', auth = true) => ({
  hostname: 'api.github.com',
  port: 443,
  path: path,
  method: method,
  headers: {
    'User-Agent': 'NodeJS',
    'Accept': 'application/vnd.github.v3+json',
    ...(auth && { 'Authorization': `token ${GITHUB_TOKEN}` })
  }
});

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data ? JSON.parse(data) : null);
        } else {
          reject(new Error(`API Error ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function getUsername() {
  const user = await request(reqOpts('/user'));
  return user.login;
}

async function createRepo(name) {
  try {
    const repo = await request(reqOpts('/user/repos', 'POST'), {
      name,
      private: false,
      description: 'CareConnect AI Medical App'
    });
    console.log(`Created repo: ${repo.html_url}`);
    return repo;
  } catch (err) {
    if (err.message.includes('422')) {
      console.log('Repo already exists, proceeding...');
      return null;
    }
    throw err;
  }
}

async function uploadFile(owner, repo, filePath, content) {
  const gitPath = filePath.replace(/\\/g, '/');
  
  // Get file sha if it exists
  let sha;
  try {
    const existing = await request(reqOpts(`/repos/${owner}/${repo}/contents/${gitPath}`));
    sha = existing.sha;
  } catch (err) {
    // File doesn't exist yet, which is fine
  }

  const payload = {
    message: `Add ${gitPath}`,
    content: Buffer.from(content).toString('base64')
  };
  if (sha) payload.sha = sha;

  try {
    await request(reqOpts(`/repos/${owner}/${repo}/contents/${gitPath}`, 'PUT'), payload);
    console.log(`Uploaded ${gitPath}`);
  } catch (err) {
    console.error(`Failed to upload ${gitPath}:`, err.message);
  }
}

async function main() {
  try {
    const owner = await getUsername();
    console.log(`Authenticated as ${owner}`);
    
    await createRepo(REPO_NAME);
    
    const rootPath = process.cwd();
    
    // Simple recursive file upload, ignoring bulky folders
    const ignorePaths = ['.git', 'node_modules', '.next', 'out', 'scratch'];
    
    const walk = (dir) => {
      let results = [];
      const list = fs.readdirSync(dir);
      list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        const relPath = path.relative(rootPath, file);
        
        if (ignorePaths.some(p => relPath.includes(p))) return;
        
        if (stat && stat.isDirectory()) {
          results = results.concat(walk(file));
        } else {
          results.push(file);
        }
      });
      return results;
    };
    
    console.log('Scanning files...');
    const files = walk(rootPath);
    console.log(`Found ${files.length} files to upload. Starting sequential upload...`);
    
    for (const file of files) {
      // Avoid uploading big files or zip files
      if (file.endsWith('.exe') || file.endsWith('.zip') || file.endsWith('.jsonl')) continue;
      
      const content = fs.readFileSync(file);
      const relPath = path.relative(rootPath, file);
      await uploadFile(owner, REPO_NAME, relPath, content);
      
      // Delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 200));
    }
    
    console.log('\n✅ Push to GitHub complete! Check your repository.');
  } catch (err) {
    console.error("Error:", err);
  }
}

main();

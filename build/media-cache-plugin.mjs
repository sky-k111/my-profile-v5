import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, readdir, rename, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';

const MODULE_ID = 'virtual:project-media-sources';
const RESOLVED_ID = `\0${MODULE_ID}`;
const STARTUP_KEY_ID = 'virtual:startup-cache-key';
const RESOLVED_STARTUP_KEY_ID = `\0${STARTUP_KEY_ID}`;

export function startupCacheKey(assets) {
  const revisions = assets.map(({ url, revision }) => [url, revision]);
  return createHash('sha256').update(JSON.stringify(revisions)).digest('hex').slice(0, 24);
}

export async function createStartupManifest(directory, prefix = '') {
  const assets = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = `${prefix}/${entry.name}`;
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) assets.push(...await createStartupManifest(filename, relative));
    else if (/\.(mp4|webm|png|jpe?g|webp|avif|svg|gif|woff2?|ttf|otf|css|js)$/i.test(entry.name)) {
      const hash = createHash('sha256');
      for await (const chunk of createReadStream(filename)) hash.update(chunk);
      assets.push({ url: relative, bytes: (await stat(filename)).size, revision: hash.digest('hex').slice(0, 16) });
    }
  }
  return assets;
}

export async function createMediaManifest(mediaDirectory) {
  const manifest = {};
  for (const entry of await readdir(mediaDirectory, { withFileTypes: true })) {
    if (!entry.isFile() || !/\.(mp4|jpe?g|png|webp|avif)$/i.test(entry.name)) continue;
    const hash = createHash('sha256');
    for await (const chunk of createReadStream(path.join(mediaDirectory, entry.name))) hash.update(chunk);
    const extension = path.extname(entry.name);
    const stem = path.basename(entry.name, extension);
    manifest[`/projects/${entry.name}`] = `/projects/cached/${stem}.${hash.digest('hex').slice(0, 12)}${extension}`;
  }
  return manifest;
}

export async function publishCachedMedia(outputDirectory, manifest) {
  // Move the copied build assets; do not ship a second copy of every video.
  await mkdir(path.join(outputDirectory, 'projects/cached'), { recursive: true });
  const redirects = [];
  for (const [original, versioned] of Object.entries(manifest)) {
    await rename(path.join(outputDirectory, original.slice(1)), path.join(outputDirectory, versioned.slice(1)));
    redirects.push(`${original} ${versioned} 302`);
  }
  const redirectPath = path.join(outputDirectory, '_redirects');
  let existing = '';
  try {
    existing = await readFile(redirectPath, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  await writeFile(redirectPath, `${redirects.join('\n')}\n${existing}`);
  await writeFile(path.join(outputDirectory, 'project-media-manifest.json'), JSON.stringify(manifest, null, 2));
}

export default function mediaCachePlugin() {
  let config;
  let manifest = {};
  let cacheKey = '';
  return {
    name: 'portfolio-media-cache',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    async buildStart() {
      cacheKey = startupCacheKey(await createStartupManifest(config.publicDir));
      if (config.command === 'build') manifest = await createMediaManifest(path.join(config.publicDir, 'projects'));
    },
    resolveId(id) {
      if (id === MODULE_ID) return RESOLVED_ID;
      if (id === STARTUP_KEY_ID) return RESOLVED_STARTUP_KEY_ID;
    },
    load(id) {
      if (id === RESOLVED_ID) return `export default ${JSON.stringify(manifest)};`;
      if (id === RESOLVED_STARTUP_KEY_ID) return `export default ${JSON.stringify(cacheKey)};`;
    },
    configureServer(server) {
      server.middlewares.use('/startup-manifest.json', async (_req, res, next) => {
        try {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify(await createStartupManifest(config.publicDir)));
        } catch (error) { next(error); }
      });
    },
    async writeBundle() {
      if (config.command !== 'build') return;
      await publishCachedMedia(path.resolve(config.root, config.build.outDir), manifest);
      const output = path.resolve(config.root, config.build.outDir);
      await writeFile(path.join(output, 'startup-manifest.json'), JSON.stringify(await createStartupManifest(output)));
    },
  };
}

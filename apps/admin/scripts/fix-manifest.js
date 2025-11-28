const fs = require('fs');
const path = require('path');

// Path to the dashboard page manifest file
const manifestPath = path.join(__dirname, '../.next/server/app/(dashboard)/page_client-reference-manifest.js');
const manifestDir = path.dirname(manifestPath);

// Create directory if it doesn't exist
if (!fs.existsSync(manifestDir)) {
  fs.mkdirSync(manifestDir, { recursive: true });
}

// Create a minimal manifest file if it doesn't exist
if (!fs.existsSync(manifestPath)) {
  const minimalManifest = `globalThis.__RSC_MANIFEST=(globalThis.__RSC_MANIFEST||{});globalThis.__RSC_MANIFEST["/(dashboard)/page"]={"moduleLoading":{"prefix":"/admin/_next/"},"ssrModuleMapping":{},"edgeSSRModuleMapping":{},"clientModules":{},"entryCSSFiles":{},"rscModuleMapping":{},"edgeRscModuleMapping":{}}`;
  fs.writeFileSync(manifestPath, minimalManifest, 'utf8');
  console.log('Created missing manifest file:', manifestPath);
}

// Also create it in the standalone directory
const standaloneManifestPath = path.join(__dirname, '../.next/standalone/apps/admin/.next/server/app/(dashboard)/page_client-reference-manifest.js');
const standaloneManifestDir = path.dirname(standaloneManifestPath);

if (!fs.existsSync(standaloneManifestDir)) {
  fs.mkdirSync(standaloneManifestDir, { recursive: true });
}

if (!fs.existsSync(standaloneManifestPath)) {
  const minimalManifest = `globalThis.__RSC_MANIFEST=(globalThis.__RSC_MANIFEST||{});globalThis.__RSC_MANIFEST["/(dashboard)/page"]={"moduleLoading":{"prefix":"/admin/_next/"},"ssrModuleMapping":{},"edgeSSRModuleMapping":{},"clientModules":{},"entryCSSFiles":{},"rscModuleMapping":{},"edgeRscModuleMapping":{}}`;
  fs.writeFileSync(standaloneManifestPath, minimalManifest, 'utf8');
  console.log('Created missing manifest file in standalone:', standaloneManifestPath);
}


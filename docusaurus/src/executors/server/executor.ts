import { ExecutorContext, runExecutor } from '@nx/devkit';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

interface DocusaurusStartOptions {
  command: 'start';
  port?: number;
  host?: string;
  hotOnly?: boolean;
  // Add more options specific to the 'start' command
}

interface DocusaurusBuildOptions {
  command: 'build';
  bundleAnalyzer?: boolean;
  outDir?: string;
  // Add more options specific to the 'build' command
}

type DocusaurusExecutorOptions = DocusaurusStartOptions | DocusaurusBuildOptions;

export default async function docusaurusExecutor(
  options: DocusaurusExecutorOptions,
  context: ExecutorContext
): Promise<{ success: boolean }> {
  const projectRoot = context.root; // Get the root directory of your Nx workspace
  const isWindows = process.platform === 'win32';

  // Create the command based on the operating system
  const docusaurusCmd = isWindows
    ? `${projectRoot}\\node_modules\\.bin\\docusaurus.cmd`
    : path.join(projectRoot, 'node_modules', '.bin', 'docusaurus');

  // Construct the command with options
  let cmdArgs = '';
  if (options.command === 'start') {
    if (options.port) cmdArgs += ` --port ${options.port}`;
    if (options.host) cmdArgs += ` --host ${options.host}`;
    if (options.hotOnly) cmdArgs += ` --hot-only`;
  } else if (options.command === 'build') {
    if (options.bundleAnalyzer) cmdArgs += ` --bundle-analyzer`;
    if (options.outDir) cmdArgs += ` --out-dir ${options.outDir}`;
  }

  // Create a promise to run the Docusaurus command
  const docusaurusPromise = promisify(exec)(
    `${docusaurusCmd} ${options.command}${cmdArgs}`
  );

  // Use Promise.race to run the promise
  const result = await Promise.race([
    docusaurusPromise
  ]);

  // Check the result and return success status
  if ('success' in result) {
    return result;
  } else {
    const { stdout, stderr } = result;
    console.log(stdout);
    if (stderr) {
      console.error(stderr);
      return { success: false };
    }
    return { success: true };
  }
}

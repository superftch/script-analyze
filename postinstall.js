import os from 'os';
import { exec } from 'child_process';

if (os.platform() === 'linux') {
  exec('npm link', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error running npm link: ${error}`);
      return;
    }
    console.log('npm link completed successfully');
  });
}

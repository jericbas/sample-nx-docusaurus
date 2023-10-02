import { ServerExecutorSchema } from './schema';
import executor from './executor';

const options: ServerExecutorSchema = {};

describe('Server Executor', () => {
  it('can run', async () => {
    const output = await executor(options);
    expect(output.success).toBe(true);
  });
});

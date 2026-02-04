const SHORTAPI_BASE_URL = 'https://api.shortapi.ai/api/v1';
const SHORTAPI_API_KEY = process.env.SHORTAPI_API_KEY || '';

// 根据参数类型转换值
function convertParamType(value: unknown, type: string): unknown {
  if (value === null || value === undefined) return value;

  switch (type) {
    case 'int':
      return typeof value === 'number' ? value : parseInt(String(value));
    case 'float':
      return typeof value === 'number' ? value : parseFloat(String(value));
    case 'bool':
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') return value === 'true';
      return Boolean(value);
    case 'list<string>':
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') return value.split(',').map(s => s.trim());
      return value;
    default:
      // string 或其他类型保持原样
      return value;
  }
}

// 转换参数类型（根据模型参数定义）
export function transformParams(
  params: Record<string, unknown>,
  parameterDefs: any[]
): Record<string, unknown> {
  const transformed: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(params)) {
    // 找到对应的参数定义
    const paramDef = parameterDefs.find((p: any) => p.name === key);

    if (paramDef && paramDef.type && value !== null && value !== undefined) {
      // 根据类型转换
      transformed[key] = convertParamType(value, paramDef.type);
      console.log(`[transformParams] ${key}: ${JSON.stringify(value)} -> ${JSON.stringify(transformed[key])} (type: ${paramDef.type})`);
    } else {
      // 没有定义的参数保持原样
      transformed[key] = value;
    }
  }

  return transformed;
}

export async function createJob(
  model: string,
  args: Record<string, unknown>,
  callbackUrl?: string,
  parameterDefs?: any[]
): Promise<string> {
  console.log('[createJob] Creating job with model:', model);
  console.log('[createJob] Args:', JSON.stringify(args, null, 2));

  // 如果提供了参数定义，进行类型转换
  const transformedArgs = parameterDefs ? transformParams(args, parameterDefs) : args;

  const requestBody = {
    model,
    args: transformedArgs,
    callback_url: callbackUrl,
  };
  console.log('[createJob] Request body:', JSON.stringify(requestBody, null, 2));

  const response = await fetch(`${SHORTAPI_BASE_URL}/job/create`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SHORTAPI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  console.log('[createJob] Response status:', response.status);
  console.log('[createJob] Response headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[createJob] Error response:', errorText);
    throw new Error(`ShortAPI error: ${errorText}`);
  }

  const data = await response.json();
  console.log('[createJob] Full response data:', JSON.stringify(data, null, 2));
  console.log('[createJob] data.data:', data.data);
  console.log('[createJob] data.job_id:', data.job_id);

  // ShortAPI返回的数据结构是 { code: 0, data: { job_id: xxx } }
  const jobId = data.data?.job_id || data.job_id;

  if (!jobId) {
    console.error('[createJob] No job_id in response:', data);
    throw new Error('No job_id in ShortAPI response');
  }

  console.log('[createJob] Job ID:', jobId);
  return jobId;
}

export async function queryJob(jobId: string): Promise<{
  status: string;
  result?: unknown;
  error?: string;
}> {
  const response = await fetch(
    `${SHORTAPI_BASE_URL}/job/query?id=${jobId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SHORTAPI_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ShortAPI error: ${error}`);
  }

  const data = await response.json();

  // ShortAPI返回的数据结构可能是 { code: 0, data: { status, result } }
  if (data.code === 0 && data.data) {
    return data.data;
  }

  return data;
}

// Poll job status until completion
export async function pollJob(
  jobId: string,
  maxAttempts = 120,
  interval = 3000
): Promise<unknown> {
  console.log(`[PollJob] Starting poll for job ${jobId}, maxAttempts: ${maxAttempts}, interval: ${interval}ms`);

  for (let i = 0; i < maxAttempts; i++) {
    const result = await queryJob(jobId);
    console.log(`[PollJob] Attempt ${i + 1}/${maxAttempts}, status: ${result.status}`);

    // 打印完整响应用于调试
    if (i % 20 === 0) {
      console.log(`[PollJob] Full response:`, JSON.stringify(result, null, 2));
    }

    // ShortAPI状态码: 1=正在创作, 2=成功, 3=失败
    const status = typeof result.status === 'number' ? result.status : result.status;

    // 状态2表示成功
    if (status === 2 || status === 'completed' || result?.result || result?.finished_at) {
      console.log('[PollJob] Job completed successfully');
      console.log('[PollJob] Result:', JSON.stringify(result.result, null, 2));

      // 修复：如果result.result存在就返回，否则返回整个result对象
      // 因为ShortAPI可能直接在result中包含images
      const finalResult = result.result || result;
      return finalResult;
    }

    // 状态3表示失败
    if (status === 3 || status === 'failed') {
      console.error('[PollJob] Job failed:', result.error);
      throw new Error(result.error || 'Job failed');
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  console.error(`[PollJob] Job timeout after ${maxAttempts} attempts`);
  throw new Error('Job timeout');
}

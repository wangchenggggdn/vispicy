const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 读取 .env.local 文件
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key] = valueParts.join('=');
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sywvmqpkhvclavgoinsl.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  console.error('Please make sure .env.local contains SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: '00000000-0000-0000-0000-000000000001',
        email: 'test@vicraft.com',
        name: '测试用户',
        coins: 10000
      }, {
        onConflict: 'email'
      });

    if (error) {
      console.error('Error creating test user:', error);
      return;
    }

    console.log('✓ 测试用户创建成功！');
    console.log('Email: test@vicraft.com');
    console.log('Coins: 10000');
  } catch (err) {
    console.error('Error:', err);
  }
}

createTestUser();

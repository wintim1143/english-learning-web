const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ==================== 配置区域 ====================

// 输入：纯单词数组（只需要单词）
const WORDS = [
  'apple', 'book', 'cat', 'dog', 'elephant',
  'flower', 'girl', 'house', 'ice', 'juice',
  'kite', 'lion', 'milk', 'nose', 'orange',
  'pencil', 'queen', 'rabbit', 'sun', 'tree'
];

// 目标词库分类
const CATEGORY_KEY = 'custom';
const CATEGORY_NAME = '自定义词汇';
const CATEGORY_DESCRIPTION = '自动生成的词库';

// 是否使用在线翻译（需要配置）
const USE_TRANSLATION = false;  // 设为 true 需要配置下面的翻译 API
const BAIDU_APP_ID = '';        // 百度翻译 APP ID
const BAIDU_SECRET = '';        // 百度翻译密钥

// ==================== 主逻辑 ====================

// 从 Free Dictionary API 获取单词信息
async function fetchWordInfo(word) {
  try {
    const response = await axios.get(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
      { timeout: 5000 }
    );
    const entry = response.data[0];
    
    // 获取音标
    let phonetic = entry.phonetic || '';
    if (!phonetic && entry.phonetics) {
      const phoneticObj = entry.phonetics.find(p => p.text && p.text.startsWith('/'));
      phonetic = phoneticObj ? phoneticObj.text : '';
    }
    
    // 获取英文释义和例句
    const meanings = entry.meanings?.[0]?.definitions || [];
    const firstDef = meanings[0] || {};
    const definition = firstDef.definition || '';
    const example = firstDef.example || '';
    
    return {
      word: word,
      phonetic: phonetic || '/待添加/',
      meaning: definition || '待添加释义',
      example: example || `This is an example sentence with ${word}.`
    };
  } catch (error) {
    console.error(`❌ 获取失败 [${word}]:`, error.message);
    return {
      word: word,
      phonetic: '/待添加/',
      meaning: '待添加释义',
      example: '待添加例句'
    };
  }
}

// 批量翻译英文到中文（使用百度翻译）
async function translateToChinese(texts) {
  if (!BAIDU_APP_ID || !BAIDU_SECRET) {
    console.log('⚠️  未配置翻译 API，跳过翻译');
    return texts.map(() => '待翻译');
  }
  
  const crypto = require('crypto');
  const query = texts.join('\n');
  const salt = Date.now().toString();
  const sign = crypto
    .createHash('md5')
    .update(BAIDU_APP_ID + query + salt + BAIDU_SECRET)
    .digest('hex');
  
  try {
    const response = await axios.get('https://fanyi-api.baidu.com/api/trans/vip/translate', {
      params: {
        q: query,
        from: 'en',
        to: 'zh',
        appid: BAIDU_APP_ID,
        salt: salt,
        sign: sign
      }
    });
    
    return response.data.trans_result.map(t => t.dst);
  } catch (error) {
    console.error('❌ 翻译失败:', error.message);
    return texts.map(() => '待翻译');
  }
}

// 主函数
async function generateVocabulary() {
  console.log('🚀 开始生成词库...');
  console.log(`📝 单词数量：${WORDS.length}`);
  console.log(`📂 目标分类：${CATEGORY_KEY}`);
  console.log('');
  
  // 获取单词信息
  const results = [];
  for (let i = 0; i < WORDS.length; i++) {
    const word = WORDS[i];
    console.log(`[${i + 1}/${WORDS.length}] 处理：${word}`);
    const wordInfo = await fetchWordInfo(word);
    results.push(wordInfo);
    
    // 避免请求过快
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // 如果需要翻译
  if (USE_TRANSLATION && BAIDU_APP_ID && BAIDU_SECRET) {
    console.log('\n🌐 开始翻译中文释义...');
    const meaningsToTranslate = results.map(r => r.meaning.replace(/^\[待翻译\]\s*/, ''));
    const translations = await translateToChinese(meaningsToTranslate);
    
    results.forEach((item, index) => {
      item.meaning = translations[index] || item.meaning;
    });
  }
  
  // 读取现有数据
  const vocabPath = path.join(__dirname, '..', 'src', 'data', 'vocabularies.json');
  let vocabularies = {};
  
  try {
    const existing = fs.readFileSync(vocabPath, 'utf-8');
    vocabularies = JSON.parse(existing);
  } catch (e) {
    console.log('⚠️  未找到现有文件，创建新文件');
  }
  
  // 更新或创建分类
  vocabularies[CATEGORY_KEY] = {
    name: CATEGORY_NAME,
    description: CATEGORY_DESCRIPTION,
    words: results
  };
  
  // 保存
  fs.writeFileSync(vocabPath, JSON.stringify(vocabularies, null, 2), 'utf-8');
  
  console.log('\n✅ 生成完成！');
  console.log(`📁 文件已保存到：${vocabPath}`);
  console.log(`📊 本次添加：${results.length} 个单词`);
  console.log('\n⚠️  注意：');
  console.log('   - 音标已从 Free Dictionary API 获取（如失败则为"待添加"）');
  console.log('   - 中文释义需要手动补充或使用翻译 API');
  console.log('   - 例句已自动生成（可根据需要修改）');
}

// 执行
generateVocabulary().catch(console.error);

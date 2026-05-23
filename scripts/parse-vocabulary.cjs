const fs = require('fs');
const path = require('path');

// 外部词汇库的绝对路径
const SOURCE_DIR = '/Users/yutingguo/Documents/code/github/english-vocabulary/json_original/json-full';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'data', 'vocabularies');

// 常见极简单词过滤表（避免占用学习精力）
const EASY_WORDS = new Set([
  // 冠词
  'a', 'an', 'the',
  // 代词
  'i', 'me', 'my', 'mine', 'myself',
  'you', 'your', 'yours', 'yourself', 'yourselves',
  'he', 'him', 'his', 'himself',
  'she', 'her', 'hers', 'herself',
  'it', 'its', 'itself',
  'we', 'us', 'our', 'ours', 'ourselves',
  'they', 'them', 'their', 'theirs', 'themselves',
  'this', 'that', 'these', 'those',
  // 介词
  'of', 'to', 'in', 'for', 'on', 'by', 'at', 'with', 'from', 'as', 'about', 'into', 'through', 'over', 'after', 'before', 'under',
  // 连词
  'and', 'or', 'but', 'so', 'if', 'because', 'than',
  // 助动词、系动词、基础情态动词
  'be', 'am', 'is', 'are', 'was', 'were', 'been', 'being',
  'do', 'does', 'did', 'done', 'doing',
  'have', 'has', 'had', 'having',
  'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must',
  // 基础数字词
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
  // 基础日常词
  'hello', 'hi', 'bye', 'yes', 'no', 'ok', 'not', 'very', 'too', 'also', 'just', 'well', 'here', 'there',
  'what', 'who', 'which', 'where', 'when', 'why', 'how'
]);

// 定义词汇分类和源文件映射
const CONFIG = {
  chuzhong: {
    name: '初中词汇',
    description: '初中英语常用大纲单词',
    files: ['ChuZhong_2.json', 'ChuZhong_3.json']
  },
  gaozhong: {
    name: '高中词汇',
    description: '高考必备核心英语单词',
    files: ['GaoZhong_2.json', 'GaoZhong_3.json']
  },
  cet4: {
    name: '大学英语四级',
    description: '大学英语四级考试（CET-4）常考词汇',
    files: ['CET4_1.json', 'CET4_2.json', 'CET4_3.json']
  },
  cet6: {
    name: '大学英语六级',
    description: '大学英语六级考试（CET-6）常考词汇',
    files: ['CET6_1.json', 'CET6_2.json', 'CET6_3.json']
  },
  ielts: {
    name: '雅思词汇',
    description: '雅思考试（IELTS）高频核心词汇',
    files: ['IELTS_2.json', 'IELTS_3.json']
  },
  sat: {
    name: 'SAT词汇',
    description: '美国高考（SAT）常考及学术词汇',
    files: ['SAT_2.json', 'SAT_3.json']
  },
  gmat: {
    name: 'GMAT词汇',
    description: '商科研究生入学考试（GMAT）常考词汇',
    files: ['GMAT_2.json', 'GMAT_3.json']
  },
  gre: {
    name: 'GRE核心词汇',
    description: '研究生入学考试（GRE）高频学术词汇',
    files: ['GRE_2.json', 'GRE_3.json']
  },
  level4: {
    name: '专四词汇',
    description: '英语专业四级考试（TEM-4）大纲词汇',
    files: ['Level4_1.json', 'Level4_2.json']
  },
  level8: {
    name: '专八词汇',
    description: '英语专业八级考试（TEM-8）大纲词汇',
    files: ['Level8_1.json', 'Level8_2.json']
  }
};

// 提取并清洗单词数据
function cleanWord(item) {
  try {
    const wordData = item.content?.word;
    if (!wordData) return null;

    const word = wordData.wordHead;
    if (!word) return null;

    // 简单词过滤
    if (EASY_WORDS.has(word.toLowerCase())) {
      return null;
    }

    const innerContent = wordData.content;
    if (!innerContent) return null;

    // 1. 音标获取
    let phonetic = '';
    if (innerContent.usphone) {
      phonetic = `/${innerContent.usphone}/`;
    } else if (innerContent.ukphone) {
      phonetic = `/${innerContent.ukphone}/`;
    } else if (wordData.phone) {
      phonetic = `/${wordData.phone}/`;
    } else {
      phonetic = '/待添加/';
    }

    // 2. 中文释义整理
    let meaning = '';
    if (innerContent.trans && Array.isArray(innerContent.trans)) {
      meaning = innerContent.trans
        .map(t => {
          const pos = t.pos ? `${t.pos}. ` : '';
          return `${pos}${t.tranCn}`;
        })
        .join('; ');
    } else {
      meaning = '待添加释义';
    }

    // 3. 例句提取（随机提取一条，且中英文不强行拼接，保持解耦）
    let example = '';
    let exampleCn = '';
    const sentences = innerContent.sentence?.sentences;
    if (sentences && Array.isArray(sentences) && sentences.length > 0) {
      // 随机选取一条
      const randIdx = Math.floor(Math.random() * sentences.length);
      const selected = sentences[randIdx];
      if (selected.sContent) {
        example = selected.sContent;
        exampleCn = selected.sCn || '';
      }
    }

    // 4. 短语提取
    let phrases = [];
    if (innerContent.phrase?.phrases && Array.isArray(innerContent.phrase.phrases)) {
      phrases = innerContent.phrase.phrases
        .map(p => p.pContent + (p.pCn ? ` (${p.pCn})` : ''))
        .filter(Boolean);
    }

    // 5. 同近义词提取与合并
    let synos = [];
    if (innerContent.syno?.synos && Array.isArray(innerContent.syno.synos)) {
      synos = innerContent.syno.synos
        .map(s => {
          const posStr = s.pos ? `${s.pos}. ` : '';
          const hwdsStr = s.hwds && Array.isArray(s.hwds) ? s.hwds.map(h => h.w).join(', ') : '';
          return `${posStr}${s.tran}: ${hwdsStr}`;
        })
        .filter(Boolean);
    }

    // 6. 反义词提取
    let antos = [];
    if (innerContent.antos?.anto && Array.isArray(innerContent.antos.anto)) {
      antos = innerContent.antos.anto.map(a => a.hwd).filter(Boolean);
    }

    // 7. 同根词提取与合并
    let rels = [];
    if (innerContent.relWord?.rels && Array.isArray(innerContent.relWord.rels)) {
      rels = innerContent.relWord.rels
        .map(r => {
          const posStr = r.pos ? `${r.pos}. ` : '';
          const wordsStr = r.words && Array.isArray(r.words) ? r.words.map(w => `${w.hwd} (${w.tran})`).join(', ') : '';
          return `${posStr}${wordsStr}`;
         })
         .filter(Boolean);
    }

    // 按需添加属性（若数组为空则不写，减少文件体积）
    const cleaned = { word, phonetic, meaning };
    if (example) cleaned.example = example;
    if (exampleCn) cleaned.exampleCn = exampleCn;
    if (phrases.length > 0) cleaned.phrases = phrases;
    if (synos.length > 0) cleaned.synos = synos;
    if (antos.length > 0) cleaned.antos = antos;
    if (rels.length > 0) cleaned.rels = rels;

    return cleaned;
  } catch (e) {
    console.error(`Error parsing item:`, e.message);
    return null;
  }
}

async function main() {
  console.log('🚀 开始二次过滤、清洗并迁移英语词汇库...');

  // 确保输出目录干净并存在
  if (fs.existsSync(OUTPUT_DIR)) {
    // 递归删除，只清理我们动态生成的 JSON 词包
    const files = fs.readdirSync(OUTPUT_DIR);
    for (const file of files) {
      fs.unlinkSync(path.join(OUTPUT_DIR, file));
    }
    console.log(`已清空输出目录中的旧数据: ${OUTPUT_DIR}`);
  } else {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`创建输出目录: ${OUTPUT_DIR}`);
  }

  const indexData = [];

  // 处理配置的各阶段专业词库
  for (const [key, category] of Object.entries(CONFIG)) {
    console.log(`\n⏳ 正在处理分类 [${category.name}]...`);
    const wordMap = new Map();

    for (const filename of category.files) {
      const filePath = path.join(SOURCE_DIR, filename);
      if (!fs.existsSync(filePath)) {
        console.warn(`   ⚠️ 文件不存在，跳过: ${filename}`);
        continue;
      }

      console.log(`   读取文件: ${filename}`);
      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const items = JSON.parse(fileContent);

        if (!Array.isArray(items)) {
          console.warn(`   ⚠️ 文件格式不是数组: ${filename}`);
          continue;
        }

        let processedCount = 0;
        let filteredCount = 0;
        for (const item of items) {
          const cleaned = cleanWord(item);
          if (cleaned && cleaned.word) {
            const lowerWord = cleaned.word.toLowerCase();
            if (!wordMap.has(lowerWord)) {
              wordMap.set(lowerWord, cleaned);
              processedCount++;
            }
          } else if (item.content?.word?.wordHead) {
            filteredCount++;
          }
        }
        console.log(`   从 ${filename} 提取了 ${processedCount} 个有效单词 (过滤了 ${filteredCount} 个简单词或异常项)`);
      } catch (e) {
        console.error(`   ❌ 解析文件 ${filename} 失败:`, e.message);
      }
    }

    const finalWords = Array.from(wordMap.values());
    if (finalWords.length > 0) {
      // 按照单词字母升序排序
      finalWords.sort((a, b) => a.word.localeCompare(b.word));

      const outputPath = path.join(OUTPUT_DIR, `${key}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(finalWords, null, 2), 'utf-8');
      
      indexData.push({
        key: key,
        name: category.name,
        description: category.description,
        count: finalWords.length
      });
      console.log(`✅ 分类 [${category.name}] 生成完成，保存 ${finalWords.length} 个单词到: ${outputPath}`);
    } else {
      console.warn(`⚠️ 分类 [${category.name}] 没有提取到任何有效单词`);
    }
  }

  // 保存索引文件
  const indexPath = path.join(OUTPUT_DIR, 'categories.json');
  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2), 'utf-8');
  console.log(`\n🎉 所有词包二次清洗处理完毕！`);
  console.log(`索引文件已保存至: ${indexPath}`);
}

main().catch(console.error);

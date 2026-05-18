# 自动化生成词库脚本

## 快速开始

### 1. 安装依赖

```bash
cd english-learning-app
npm install axios
```

### 2. 编辑脚本

打开 `scripts/generate-vocabulary.js`，修改配置区域：

```javascript
// 你的单词列表（只需要单词！）
const WORDS = [
  'apple', 'book', 'cat', 'dog', 'elephant',
  // ... 添加你的单词
];

// 词库分类
const CATEGORY_KEY = 'elementary';  // 分类 key
const CATEGORY_NAME = '小学词汇';    // 显示名称
```

### 3. 运行脚本

```bash
node scripts/generate-vocabulary.js
```

### 4. 查看结果

生成的数据会保存到 `src/data/vocabularies.json`

---

## 脚本功能

✅ **自动获取**：
- 英文音标（来自 Free Dictionary API）
- 英文释义
- 英文例句

⚠️ **需要手动处理**：
- 中文释义（默认显示英文，需手动翻译或使用翻译 API）

---

## 配置翻译 API（可选）

如果需要自动翻译中文，可以配置百度翻译：

1. 申请百度翻译 API：https://fanyi-api.baidu.com/
2. 获取 APP ID 和密钥
3. 在脚本中配置：

```javascript
const USE_TRANSLATION = true;
const BAIDU_APP_ID = '你的 APP ID';
const BAIDU_SECRET = '你的密钥';
```

---

## 输出格式

脚本会生成如下格式的数据：

```json
{
  "custom": {
    "name": "自定义词汇",
    "description": "自动生成的词库",
    "words": [
      {
        "word": "apple",
        "phonetic": "/ˈæpl/",
        "meaning": "苹果",
        "example": "I ate an apple for lunch."
      }
    ]
  }
}
```

---

## 批量导入现有单词表

### 从 Excel/CSV 导入

如果你有以下格式的 Excel/CSV：

```
单词
apple
book
cat
```

**步骤**：

1. 在 Excel 中导出为 CSV
2. 用文本编辑器打开，复制单词列
3. 粘贴到脚本的 `WORDS` 数组中：

```javascript
const WORDS = [
  'apple',
  'book',
  'cat',
  // ... 从 CSV 复制的内容
];
```

4. 运行脚本

---

## 从其他来源导入

### GitHub 词库

找到合适的词库后，提取单词列表：

```javascript
// 示例：从 GitHub 词库提取
const WORDS = [
  // 从 GitHub 复制单词列表
  'abandon', 'ability', 'abnormal', ...
];
```

### 教学大纲

从教学大纲中提取单词表，同样格式粘贴到 `WORDS` 数组即可。

---

## 常见问题

### Q: 音标显示"待添加"怎么办？
A: 说明 API 请求失败，可能是网络问题或单词太生僻。可以：
- 检查网络连接
- 手动添加音标（查字典）
- 使用其他 API 源

### Q: 中文释义怎么快速补充？
A: 三种方式：
1. 手动翻译（适合少量单词）
2. 配置翻译 API 自动翻译
3. 使用翻译工具批量翻译后手动粘贴

### Q: 可以一次性处理多少个单词？
A: 建议每次处理 50-200 个单词。过多会导致：
- 请求时间过长
- 可能被 API 限流

### Q: 如何更新已有词库？
A: 直接修改 `src/data/vocabularies.json`，添加新单词到对应分类的 `words` 数组即可。

---

## 高级用法

### 自定义输出格式

修改脚本中的 `fetchWordInfo` 函数，可以自定义输出格式：

```javascript
return {
  word: word,
  phonetic: phonetic,
  meaning: translation,  // 可以自定义翻译逻辑
  example: example,
  tags: ['primary']      // 可以添加自定义字段
};
```

### 使用其他 API

可以替换 Free Dictionary API 为其他源：

- Oxford Dictionary API
- Cambridge Dictionary API
- Merriam-Webster API

---

## 完整工作流示例

### 场景：导入一份小学 100 词单词表

1. **准备单词列表**
   ```javascript
   const WORDS = [
     'apple', 'book', 'cat', 'dog', 'elephant',
     // ... 100 个单词
   ];
   ```

2. **配置分类**
   ```javascript
   const CATEGORY_KEY = 'elementary';
   const CATEGORY_NAME = '小学词汇';
   ```

3. **运行脚本**
   ```bash
   node scripts/generate-vocabulary.js
   ```

4. **补充中文释义**
   - 打开 `src/data/vocabularies.json`
   - 批量翻译并替换 `meaning` 字段

5. **测试**
   - 启动开发服务器
   - 在应用中选择对应词库查看

---

## 技术支持

- Free Dictionary API 文档：https://dictionaryapi.dev/
- 百度翻译 API 文档：https://fanyi-api.baidu.com/api/215923

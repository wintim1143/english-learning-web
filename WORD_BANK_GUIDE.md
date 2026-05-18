# 单词库管理指南

## 词库结构

单词库位于 `src/data/vocabularies.json`，采用以下结构：

```json
{
  "category_key": {
    "name": "词库名称",
    "description": "词库描述",
    "words": [
      {
        "word": "单词",
        "phonetic": "/音标/",
        "meaning": "中文释义",
        "example": "英文例句"
      }
    ]
  }
}
```

## 添加新词库

### 1. 在 vocabularies.json 中添加新分类

打开 `src/data/vocabularies.json`，添加新的词库分类：

```json
{
  "elementary": { ... },
  "junior": { ... },
  "common": { ... },
  "senior": {
    "name": "高中词汇",
    "description": "高中英语常用单词",
    "words": [
      {
        "word": "abandon",
        "phonetic": "/əˈbændən/",
        "meaning": "放弃",
        "example": "Don't abandon your dreams."
      },
      {
        "word": "ability",
        "phonetic": "/əˈbɪləti/",
        "meaning": "能力",
        "example": "She has the ability to succeed."
      }
    ]
  }
}
```

### 2. 更新 TypeScript 类型

打开 `src/types/index.ts`，在 `VocabularyKey` 类型中添加新的分类 key：

```typescript
export type VocabularyKey = 'elementary' | 'junior' | 'common' | 'senior'
```

### 3. 重启开发服务器

保存文件后，开发服务器会自动热重载，新词库立即可用。

## 单词格式说明

每个单词必须包含以下字段：

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `word` | string | 英文单词 | `"apple"` |
| `phonetic` | string | 音标（IPA） | `"/ˈæpl/"` |
| `meaning` | string | 中文释义 | `"苹果"` |
| `example` | string | 英文例句 | `"I eat an apple every day."` |

## 批量导入单词

如果你有现成的单词列表，可以使用以下脚本批量转换：

```javascript
// 示例：将简单的单词列表转换为标准格式
const rawWords = ['apple', 'book', 'cat']
const formatted = rawWords.map(word => ({
  word,
  phonetic: '待添加',
  meaning: '待添加',
  example: '待添加'
}))
```

## 词库最佳实践

1. **词库大小**：建议每个词库包含 50-200 个单词，便于学习管理
2. **单词去重**：不同词库可以包含相同单词（如基础词在各阶段都会出现）
3. **例句质量**：例句应简单易懂，适合目标学习阶段
4. **音标准确**：使用国际音标（IPA）标注发音

## 自定义词库来源

可以从以下来源获取词库：

- GitHub 开源词库（如 ESL-Video、English-Vocabulary-in-Use）
- 教育部门发布的教学大纲词汇表
- 自行整理校本课程词汇

## 示例：从 GitHub 导入词库

1. 找到合适的词库仓库
2. 下载 JSON/CSV 格式的单词数据
3. 转换为项目要求的格式
4. 添加到 `vocabularies.json` 中

## 技术细节

- 词库数据在应用启动时一次性加载
- 学习进度按词库分别保存
- 收藏和难点单词记录跨词库共享

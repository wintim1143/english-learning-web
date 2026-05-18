# 🎓 英语单词学习应用

一个专为小学生设计的英语单词学习 Web 应用，支持多词库分类、发音朗读、随机测验等功能。

**在线预览**: https://5173-0fe5bc971e3d6e70.monkeycode-ai.online

---

## ✨ 功能特性

### 📚 学习模式
- **逐个学习** - 逐词学习，支持前后翻页
- **单词列表** - 网格展示，支持搜索和筛选
- **随机测验** - 10 道题小测验，自动评分

### 🎯 核心功能
- ✅ 多词库分类管理（小学/初中/常用/自定义）
- ✅ 单词发音朗读（Web Speech API，完全免费）
- ✅ 学习进度自动保存（LocalStorage）
- ✅ 收藏和难点单词标记
- ✅ 实时搜索和筛选
- ✅ 响应式设计，支持手机和电脑

### 📱 手机端优化
- 紧凑布局，减少滚动
- 适合手指点击的按钮尺寸
- 自适应字体大小
- 禁用下拉刷新，防止误操作

---

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

---

## 📖 自动化添加单词

只需要准备单词列表，脚本会自动生成音标、释义和例句。

### 1. 安装依赖

```bash
npm install axios
```

### 2. 编辑脚本

打开 `scripts/generate-vocabulary.js`，修改配置：

```javascript
// 你的单词列表（只需要单词！）
const WORDS = [
  'apple', 'book', 'cat', 'dog', 'elephant',
  'flower', 'girl', 'house', 'ice', 'juice'
  // ... 添加更多单词
];

// 词库分类配置
const CATEGORY_KEY = 'elementary';  // 分类 key
const CATEGORY_NAME = '小学词汇';    // 显示名称
const CATEGORY_DESCRIPTION = '自动生成的词库';
```

### 3. 运行脚本

```bash
node scripts/generate-vocabulary.js
```

### 4. 查看结果

生成的数据保存到 `src/data/vocabularies.json`，包含：
- ✅ 音标（自动从 Free Dictionary API 获取）
- ✅ 英文释义和例句
- ⚠️ 中文释义需要手动补充（或配置翻译 API）

### 详细文档

查看 [`scripts/README.md`](./scripts/README.md) 了解更多用法和高级配置。

---

## 🗂️ 词库管理

### 词库结构

数据存储在 `src/data/vocabularies.json`：

```json
{
  "elementary": {
    "name": "小学词汇",
    "description": "小学英语常用单词",
    "words": [
      {
        "word": "apple",
        "phonetic": "/ˈæpl/",
        "meaning": "苹果",
        "example": "I eat an apple every day."
      }
    ]
  },
  "junior": { ... },
  "common": { ... }
}
```

### 添加新词库

**步骤 1**: 在 `vocabularies.json` 添加新分类

```json
{
  "senior": {
    "name": "高中词汇",
    "description": "高中英语常用单词",
    "words": [...]
  }
}
```

**步骤 2**: 更新 TypeScript 类型

编辑 `src/types/index.ts`：

```typescript
export type VocabularyKey = 'elementary' | 'junior' | 'common' | 'senior'
// 添加新的分类 key
```

**步骤 3**: 保存即可，开发服务器会自动热重载

### 单词格式

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `word` | string | 英文单词 | `"apple"` |
| `phonetic` | string | 音标（IPA） | `"/ˈæpl/"` |
| `meaning` | string | 中文释义 | `"苹果"` |
| `example` | string | 英文例句 | `"I eat an apple every day."` |

---

## 🛠️ 技术栈

- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite 8.0
- **状态管理**: Composition API + LocalStorage
- **发音**: Web Speech API
- **样式**: Scoped CSS

---

## 📂 项目结构

```
english-learning-app/
├── src/
│   ├── components/
│   │   ├── WordCard.vue      # 单词卡片组件
│   │   ├── WordList.vue      # 单词列表组件
│   │   └── QuizMode.vue      # 测验模式组件
│   ├── composables/
│   │   └── useTTS.ts         # TTS 发音功能
│   ├── data/
│   │   └── vocabularies.json # 词库数据
│   ├── types/
│   │   └── index.ts          # TypeScript 类型定义
│   ├── App.vue               # 主应用
│   └── main.ts               # 入口文件
├── scripts/
│   ├── generate-vocabulary.js # 自动化生成脚本
│   └── README.md             # 脚本使用文档
├── WORD_BANK_GUIDE.md        # 词库管理指南
├── OPTIMIZATION_SUMMARY.md   # 优化总结
├── package.json
└── README.md                 # 本文件
```

---

## 📋 使用场景

### 1. 小学生自主学习
- 选择对应年级的词库
- 逐个学习模式跟读发音
- 完成测验检验掌握程度

### 2. 老师布置作业
- 创建自定义词库（输入单元单词）
- 学生完成学习和测验
- 查看学习进度

### 3. 家长辅导孩子
- 筛选收藏和难点单词
- 重点复习薄弱环节
- 反复练习直到掌握

---

## 🎨 界面预览

### 逐个学习模式
- 大字体显示单词和释义
- 点击喇叭图标播放发音
- 收藏和标记难点单词
- 上一个/下一个快速切换

### 单词列表模式
- 网格布局展示所有单词
- 支持英文/中文搜索
- 筛选：全部/收藏/难点
- 视觉标记收藏和难点

### 随机测验模式
- 看英文选中文 / 看中文选英文
- 即时反馈（✅/❌）
- 进度条显示
- 最终得分和正确率

---

## 🔧 配置和扩展

### 配置翻译 API（可选）

如果需要自动翻译中文释义，配置百度翻译：

```javascript
// scripts/generate-vocabulary.js
const USE_TRANSLATION = true;
const BAIDU_APP_ID = '你的 APP ID';
const BAIDU_SECRET = '你的密钥';
```

申请地址：https://fanyi-api.baidu.com/

### 批量导入单词

从 Excel/CSV 导入：
1. 导出 CSV 格式
2. 复制单词列
3. 粘贴到 `WORDS` 数组
4. 运行脚本

### 自定义样式

修改 `src/App.vue` 和各组件的 `<style>` 部分，调整：
- 主题色（当前为紫色渐变）
- 字体大小
- 卡片样式
- 按钮样式

---

## 📊 数据来源

### 推荐词库来源
- GitHub 开源词库（搜索 "English vocabulary list"）
- 教育部门发布的教学大纲词汇表
- 校本课程词汇表
- 自行整理的单词本

### API 来源
- **音标和英文释义**: [Free Dictionary API](https://dictionaryapi.dev/) - 免费，无需 Key
- **中文翻译**: [百度翻译 API](https://fanyi-api.baidu.com/) - 有免费额度

---

## 📝 开发记录

- [词库管理指南](./WORD_BANK_GUIDE.md) - 详细的词库管理文档
- [优化总结](./OPTIMIZATION_SUMMARY.md) - 手机端适配优化详情
- [脚本使用文档](./scripts/README.md) - 自动化脚本完整说明

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 可以贡献的内容
- 更多词库分类
- 界面优化建议
- 新功能想法
- Bug 修复

---

## 📄 License

MIT License

---

## 🙏 致谢

- [Vue 3](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [Free Dictionary API](https://dictionaryapi.dev/) - 免费词典 API

---

**Happy Learning! 🎉**

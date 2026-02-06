# parse-md-with-components

一个 Markdown 解析库，支持自定义组件指令和嵌套结构解析。

## ✨ 功能特性

- 🔄 **Markdown 转 HTML** - 将 Markdown 内容解析为 HTML
- 🧩 **自定义组件指令** - 支持 `:::componentName` 格式的自定义指令
- 📐 **嵌套结构支持** - 自动处理组件的嵌套层级关系
- 🎨 **内置 Web Components** - 提供 `ye-card`、`ye-tabs`、`ye-tab` 等组件，用户可自定义导入组件
- 📝 **自动格式化** - 根据嵌套深度自动缩进 Markdown 内容
- 🎯 **属性传递** - 支持向组件传递自定义属性

## 📦 安装

```bash
pnpm install parse-md-with-components
# 或
pnpm add parse-md-with-components
```

## 🚀 快速开始

### 基本用法

```typescript
import { transferMdToHtml } from "parse-md-with-components";
import "parse-md-with-components/index.css"; // 可选：引入默认样式

const markdown = `
# Hello World

这是一段普通的 Markdown 内容。

:::card{title="提示" bg-color="#1a365d"}
这是一个自定义卡片组件的内容。
:::
`;

const html = transferMdToHtml({
  content: markdown,
  startTag: ":::",
  endTag: ":::",
  prefix: "ye", // 可选，默认为 'self'
});

console.log(html);
```

### 自动格式化 Markdown

```typescript
import { autoFormatMd } from "parse-md-with-components";

const unformattedMd = `
:::card
:::tab
内容
:::
:::
`;

const formatted = autoFormatMd(unformattedMd, ":::", ":::");
// 输出带有正确缩进的 Markdown
```

## 📖 API 参考

### `transferMdToHtml(options)`

将包含自定义指令的 Markdown 转换为 HTML。

| 参数       | 类型     | 必填 | 默认值   | 说明                     |
| ---------- | -------- | ---- | -------- | ------------------------ |
| `content`  | `string` | ✅   | -        | Markdown 原始内容        |
| `startTag` | `string` | ✅   | -        | 组件开始标签（如 `:::`） |
| `endTag`   | `string` | ✅   | -        | 组件结束标签（如 `:::`） |
| `prefix`   | `string` | ❌   | `'self'` | 生成 HTML 标签的前缀     |

**返回值**: `string` - 转换后的 HTML 字符串

### `autoFormatMd(content, startTag, endTag)`

根据嵌套深度自动格式化 Markdown 内容。

| 参数       | 类型     | 说明              |
| ---------- | -------- | ----------------- |
| `content`  | `string` | Markdown 原始内容 |
| `startTag` | `string` | 组件开始标签      |
| `endTag`   | `string` | 组件结束标签      |

**返回值**: `string` - 格式化后的 Markdown 字符串

## 🧩 内置组件

### `<ye-card>`

带标题的卡片组件，适用于提示、警告等场景。

```markdown
:::card{title="提示" bg-color="#154d24" slide-color="#4ade80"}
这里是卡片内容
:::
```

| 属性          | 类型     | 默认值      | 说明         |
| ------------- | -------- | ----------- | ------------ |
| `title`       | `string` | `'Tip'`     | 卡片标题     |
| `bg-color`    | `string` | `'#154d24'` | 背景颜色     |
| `slide-color` | `string` | `'#4ade80'` | 左侧边框颜色 |

### `<ye-tabs>` & `<ye-tab>`

选项卡组件，支持多标签页切换。

```markdown
:::tabs{active-key="tab1"}
:::tab{key="tab1" title="标签一"}
第一个标签页的内容
:::
:::tab{key="tab2" title="标签二"}
第二个标签页的内容
:::
:::
```

**tabs 属性**:
| 属性 | 类型 | 说明 |
|------|------|------|
| `active-key` | `string` | 当前激活的标签页 key |

**tab 属性**:
| 属性 | 类型 | 说明 |
|------|------|------|
| `key` | `string` | 标签页唯一标识 |
| `title` | `string` | 标签页显示标题 |

## 🎨 样式

引入内置样式以获得良好的文档展示效果：

```typescript
import "parse-md-with-components/index.css";
```

将内容包裹在 `.ye-doc-content` 类中以应用样式：

```html
<div class="ye-doc-content">
  <!-- 解析后的 HTML 内容 -->
</div>
```

内置样式包含：

- 标题样式 (h1-h6)
- 段落与文本样式
- 列表样式
- 代码块与行内代码
- 引用块
- 表格
- 分割线

## 📋 自定义指令语法

```markdown
:::componentName{attr1="value1" attr2="value2"}
内容（支持 Markdown 语法和嵌套组件）
:::
```

**示例 - 嵌套组件**:

```markdown
:::card{title="外层卡片"}

这是外层卡片的内容。

:::card{title="内层卡片" bg-color="#1a365d"}
这是嵌套的内层卡片。
:::

:::
```

## 🔧 技术栈

- [marked](https://marked.js.org/) - Markdown 解析器
- [Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) - 自定义组件实现

## 📄 License

ISC

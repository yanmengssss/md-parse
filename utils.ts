import { marked } from "marked";

enum NodeType {
  Root = "root",
  Component = "component",
  Md = "md",
}

interface BaseNode {
  type: NodeType;
  name?: string; // 仅 component 节点有
  attributes?: string; // 仅 component 节点有
  content?: string; // 仅 md 节点存储原始文本
  children: BaseNode[]; // root 和 component 拥有子节点
}

interface DepthItem {
  line: string; // 原始行内容
  type: "start" | "end" | "content"; // 行类型：开始标签、结束标签、普通内容
  depth: number; // 嵌套深度
  name?: string; // 组件名称（仅 start 类型有）
  attributes?: string; // 组件属性（仅 start 类型有）
}

function countTags(content: string, startTag: string, endTag: string): number {
  // 1. 转义标签字符串中的正则特殊字符，防止如 '/' 或 '.' 导致正则解析错误
  const escapeRegExp = (str: string) =>
    str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // 2. 构造“或”逻辑的正则表达式：(startTag|endTag)
  // 'g' 修饰符表示全局匹配
  const combinedRegex = new RegExp(
    `${escapeRegExp(startTag)}|${escapeRegExp(endTag)}`,
    "g",
  );

  // 3. 执行匹配
  const matches = content.match(combinedRegex);

  // 4. 返回匹配到的数组长度，如果没有匹配到则返回 0
  return matches ? matches.length : 0;
}

const spliteLines = ({
  content,
  startTag,
  endTag,
}: {
  content: string;
  startTag: string;
  endTag: string;
}) => {
  const lines = content.split(/\r?\n/);
  const res: string[] = [];

  const escapeRegExp = (str: string) =>
    str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = `${escapeRegExp(startTag)}|${escapeRegExp(endTag)}`;
  const combinedRegex = new RegExp(pattern, "g");

  lines.forEach((line) => {
    const count = countTags(line, startTag, endTag);

    if (count > 1) {
      let matchIndex = 0;
      const processedLine = line.replace(combinedRegex, (match) => {
        matchIndex++;
        return matchIndex === 1 ? match : `\n${match}`;
      });
      res.push(...processedLine.split("\n"));
    } else {
      res.push(line);
    }
  });

  return res;
};

const buildTree = ({
  lines,
  startTag,
  endTag,
}: {
  lines: string[];
  startTag: string;
  endTag: string;
}): BaseNode[] => {
  const result: BaseNode[] = [];
  const stack: { node: BaseNode; children: BaseNode[] }[] = [
    { node: { type: NodeType.Root, children: [] }, children: result },
  ];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith(startTag)) {
      const [name, rest] = trimmed.substring(startTag.length).split("{");
      const node: BaseNode = {
        type: NodeType.Component,
        name,
        attributes: rest ? "{" + rest : "",
        children: [],
      };
      stack[stack.length - 1].children.push(node);
      stack.push({ node, children: node.children });
    } else if (trimmed.startsWith(endTag)) {
      if (stack.length > 1) {
        stack.pop();
      }
    } else {
      stack[stack.length - 1].children.push({
        type: NodeType.Md,
        content: line,
        children: [],
      });
    }
  }

  return result;
};

const transferAttrToObj = (str: string) => {
  try {
    // 1. 处理键：将 bg-color= 转换为 "bg-color":
    // 2. 处理值：确保 ="value" 变成 :"value"
    const jsonFixed = str
      .replace(/([{, ])([\w-]+)=/g, '$1"$2":') // 匹配键名，支持连字符
      .replace(/="([^"]*)"/g, ':"$1"'); // 匹配值

    // 如果属性之间没有逗号，补上逗号（例如 {"a":"b" "c":"d"} -> {"a":"b","c":"d"}）
    const withCommas = jsonFixed.replace(/"\s+"/g, '","');

    return JSON.parse(withCommas);
  } catch (e: any) {
    console.error("解析失败:", e.message);
    return {};
  }
};

const renderHtml = (node: BaseNode, prefix: string) => {
  let html = "";
  if (node.type === NodeType.Component) {
    const attributes = node.attributes
      ? transferAttrToObj(node.attributes)
      : "";
    const attrStr = Object.keys(attributes).reduce((acc, key) => {
      return acc + `${key}="${attributes[key]}"`;
    }, "");
    html += `<${prefix}-${node.name} ${attrStr}>`;
    html += node.children.map((child) => renderHtml(child, prefix)).join("");
    html += `</${prefix}-${node.name}>`;
  } else if (node.type === NodeType.Md) {
    html += marked.parse(node.content || "");
  }
  return html;
};

function consoleTree(
  node: BaseNode[],
  prefix: string,
  htmlContent: string = "",
) {
  node.forEach((child) => {
    htmlContent += renderHtml(child, prefix);
  });
  return htmlContent;
}

const buildDepth = ({
  lines,
  startTag,
  endTag,
}: {
  lines: string[];
  startTag: string;
  endTag: string;
}): DepthItem[] => {
  const result: DepthItem[] = [];
  let depth = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith(startTag)) {
      // 开始标签，记录当前深度后深度+1
      const [name, rest] = trimmed.substring(startTag.length).split("{");
      result.push({
        line,
        type: "start",
        depth,
        name,
        attributes: rest ? "{" + rest : "",
      });
      depth++;
    } else if (trimmed.startsWith(endTag)) {
      // 结束标签，先深度-1再记录
      if (depth > 0) {
        depth--;
      }
      result.push({
        line,
        type: "end",
        depth,
      });
    } else {
      // 普通内容，使用当前深度
      result.push({
        line,
        type: "content",
        depth,
      });
    }
  }

  return result;
};

export const autoFormatMd = (
  content: string,
  startTag: string,
  endTag: string,
) => {
  const lines = spliteLines({ content, startTag, endTag });
  const tree = buildDepth({ lines, startTag, endTag });
  const context = tree
    .map((item) => {
      return " ".repeat(item.depth * 2) + item.line.trim();
    })
    .join("\n");
  return context;
};

export const transferMdToHtml = ({
  content,
  startTag,
  endTag,
  prefix = "self",
}: {
  content: string;
  startTag: string;
  endTag: string;
  prefix?: string;
}) => {
  const lines = spliteLines({ content, startTag, endTag });
  const tree = buildTree({ lines, startTag, endTag });
  const htmlContent = consoleTree(tree, prefix);
  return htmlContent;
};

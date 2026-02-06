customElements.define(
  "parametrix-tab",
  class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }

    set active(visible: boolean) {
      // 使用 style.setProperty 避免覆盖用户原本的 display 逻辑（如果用户也写了 display）
      this.style.display = visible ? "block" : "none";
    }

    connectedCallback() {
      this.render();
    }

    render() {
      this.shadowRoot!.innerHTML = `
        <style>
          /* :host 的样式会被外部 style 属性覆盖 */
          :host {
            display: none; 
            box-sizing: border-box;
          }
          .content-wrapper {
            padding: 16px;
          }
        </style>
        <div class="content-wrapper">
          <slot></slot>
        </div>
      `;
    }
  },
);
customElements.define(
  "parametrix-tabs",
  class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }

    // 监听属性变化，如果 active-key 改变，刷新显示
    static get observedAttributes() {
      return ["active-key"];
    }

    attributeChangedCallback(name: string, oldVal: string, newVal: string) {
      if (name === "active-key" && oldVal !== newVal) {
        this.syncTabs();
      }
    }

    connectedCallback() {
      this.render();
      this.syncTabs();
      // 监听插槽内容变化（比如动态增删 tab）
      this.shadowRoot!.querySelector("slot")!.addEventListener(
        "slotchange",
        () => this.syncTabs(),
      );
    }

    private syncTabs() {
      const header = this.shadowRoot!.querySelector(".tabs-nav");
      if (!header) return;

      const activeKey = this.getAttribute("active-key");
      const children = Array.from(this.querySelectorAll("doc-tab"));

      header.innerHTML = "";

      children.forEach((tab: any) => {
        const key = tab.getAttribute("key");
        const title = tab.getAttribute("title") || "Untitled";
        const isActive = key === activeKey;

        const navItem = document.createElement("div");
        // 这里的 class 是内部组件 UI 专用的
        navItem.className = `nav-item ${isActive ? "active" : ""}`;
        navItem.textContent = title;
        navItem.onclick = () => {
          this.setAttribute("active-key", key);
        };
        header.appendChild(navItem);

        // 同步子组件显隐
        tab.active = isActive;
      });
    }

    render() {
      this.shadowRoot!.innerHTML = `
        <style>
          /* 内部基础样式 */
          :host {
            display: block;
            box-sizing: border-box;
          }
          .tabs-nav {
            display: flex;
            background: #fafafa;
            border-bottom: 1px solid #e8e8e8;
            padding: 0 8px;
          }
          .nav-item {
            padding: 10px 16px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
            border-bottom: 2px solid transparent;
            color: #666;
          }
          .nav-item.active {
            color: #1890ff;
            border-bottom-color: #1890ff;
          }
        </style>
        <div class="tabs-nav"></div>
        <div class="tabs-body">
          <slot></slot>
        </div>
      `;
    }
  },
);
customElements.define(
  "parametrix-card",
  class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }

    static get observedAttributes() {
      return ["title", "bg-color", "slide-color"];
    }

    attributeChangedCallback() {
      this.render();
    }

    connectedCallback() {
      this.render();
    }

    render() {
      const title = this.getAttribute("title") || "Tip";
      // 默认颜色（参考你提供的图片）
      const defaultBg = "#154d24";
      const defaultBorder = "#4ade80";

      const bgColor = this.getAttribute("bg-color") || defaultBg;
      const borderColor = this.getAttribute("slide-color") || defaultBorder;

      this.shadowRoot!.innerHTML = `
        <style>
          /* 1. :host 承载用户写的 class 和 style */
          :host {
            display: block;
            margin: 16px 0;
            box-sizing: border-box;
            /* 将颜色存入变量，方便内部引用，也方便用户通过 style="--bg: ..." 覆盖 */
            --internal-bg: ${bgColor};
            --internal-border: ${borderColor};
          }

          .card-container {
            /* 优先级：用户内联变量 > 属性传值 > 默认值 */
            background-color: var(--doc-card-bg, var(--internal-bg));
            border-left: 4px solid var(--doc-card-border, var(--internal-border));
            
            padding: 16px 20px;
            border-radius: 0 4px 4px 0;
            color: #ffffff;
            font-family: sans-serif;
            transition: all 0.3s ease;
          }

          .card-header {
            display: flex;
            align-items: center;
            font-weight: bold;
            margin-bottom: 8px;
            font-size: 1.1em;
          }

          .card-icon {
            margin-right: 8px;
          }

          .card-content {
            line-height: 1.6;
            font-size: 0.95em;
            opacity: 0.9;
          }

          /* 允许外部样式通过插槽影响内容 */
          ::slotted(*) {
            margin: 0;
          }
        </style>

        <div class="card-container">
          <div class="card-header">
            <span class="card-icon">💡</span>
            <span class="card-title">${title}</span>
          </div>
          <div class="card-content">
            <slot></slot>
          </div>
        </div>
      `;
    }
  },
);

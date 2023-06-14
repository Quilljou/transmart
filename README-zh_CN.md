<p align="center">
  <img src="./assets/logo.png" />
</p>

<p align="center">
<b> Transmart - 利用 AI 自动化您的 i18n</b>
</p>

简体中文 | [English](./README.md)


![alt](./assets/record.gif)

![npm](https://img.shields.io/npm/v/@transmart/cli?style=flat-square)
[![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?logo=codesandbox)](https://codesandbox.io/p/sandbox/v12-12v2h6?file=%2FREADME.md)

Transmart 是一个开源的开发者工具，利用 ChatGPT 实现 i18n 翻译自动化。给定一个基础语言并指定需要输出的所有语言，运行它将生成所有 i18n 区域设置文件。

它由两部分组成：Cli 和 Core。Core 是 Transmart 的 NodeJS 核心实现，而 Cli 是封装了 Core 的命令行工具。在大多数情况下，只使用 Cli 就足够了。

该项目目前正在积极开发中，欢迎 PR，也可以在[Twitter](https://twitter.com/quillzhou)上联系我

## 特征

- [x] 支持大型文件,不必担心 4096 个标记限制
- [x] 支持使用[Intl.DisplayNames](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DisplayNames/DisplayNames)显示的所有语言，以及可以通过 ChatGPT 处理的所有语言。
- [x] 支持覆盖 AI 翻译值
- [x] 支持[i18next](https://www.i18next.com/)
- [ ] 支持[vue-i18n](https://kazupon.github.io/vue-i18n/)
- [x] 支持[Chrome.i18n](https://developer.chrome.com/docs/webstore/i18n/#choosing-locales-to-support)
- [x] 支持 Glob 名称空间匹配
- [x] 支持自定义 OpenAI 模型、API 端点
- [ ] 支持自定义区域设置文件结构
- [ ] 支持 iOS
- [ ] 支持 Android

## 设置

> Transmart 要求 Node 版本 13 或更高。

### 1. 安装

要安装 Transmart，请运行：

````sh
npm install @transmart/cli -D

# or

yarn add @transmart/cli


### 2. 项目配置
首先，在项目根目录中创建一个transmart.config.js文件，或任何其他文件格式 `cosmiconfig` 可以搜索到的

transmart.config.js

```js
module.exports = {
  baseLocale: 'en',
  locales: ['fr', 'jp', 'de'],
  localePath: 'public/locales',
  openAIApiKey: 'your-own-openai-api-key',
  overrides: {
    'zh-CN': {
      common: {
        create_app: 'Create my Application',
      },
    },
  },
}
````

所有选项可 [参考](#选项)

### 3. 翻译。

向您的 npm 脚本添加 transmart 命 令

```json
{
  "translate": "transmart"
}
```

然后执行

```sh
npm run translate

```

或者您可以在命令行中直接使用 npx 前缀执行

```sh
npx transmart
```

如果对 AI 翻译的结果不满意，请使用 [overrides](#选项) 选项部分覆盖生成的 JSON

享受 i18n 吧 🎉🎉

## 选项

| 名称             | 类型                                                  | 描述                                                                           | 是否必须 |
| ---------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------ | :------: |
| baseLocale       | string                                                | Transmart 将用作翻译参考的语言。                                               |    是    |
| locales          | string[]                                              | 所有需要翻译的语言                                                             |    是    |
| localePath       | string                                                | 存储国际化文件的位置                                                           |    是    |
| openAIApiKey     | string                                                | OpenAI API 密钥                                                                |    是    |
| context     | string                                | 提供一些上下文让翻译更准确                                                                             |   否    |
| openAIApiModel   | string                                                | OpenAI API 模型，默认为“gpt-3.5-turbo-16k-0613”                                         |    否    |
| overrides        | `Record<string, Record<string, Record<string, any>>>` | 如果你不满意 AI 翻译结果，用于部分覆盖生成的 JSON (locale-namespace-key:value) |    否    |
| namespaceGlob    | string\|string[]                                      | 命名空间匹配项                                                                 |    否    |
| openAIApiUrl     | string                                                | 可选基本 OpenAI API url 地址，在使用代理时很有用                               |    否    |
| openAIApiUrlPath | string                                                | 可选的 OpenAI API url 地址， 在使用代理时很有用                                |    否    |
|                  |

## 贡献

要贡献到 Transmart，请参阅[contributing.md](./CONTRIBUTING.md)

## 受以下启发

- https://chatgpt-i18n.vercel.app/
- https://twitter.com/forgebitz/status/1634100746617597955
- https://github.com/yetone/openai-translator

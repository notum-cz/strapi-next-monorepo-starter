import jsxAlly from "eslint-plugin-jsx-a11y"
import reactPlugin from "eslint-plugin-react"
import hooksPlugin from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import globals from "globals"

import { files } from "../utils/helpers.js"

/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    files: files.jsx,
    languageOptions: {
      globals: {
        ...globals.serviceworker,
      },
    },
    plugins: {
      react: reactPlugin,
      "jsx-a11y": jsxAlly,
      "react-refresh": reactRefresh,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...reactPlugin.configs.flat.recommended.rules,
      ...reactPlugin.configs.flat["jsx-runtime"].rules,
      "react-refresh/only-export-components": "off",
      "react/boolean-prop-naming": "off",
      "react/jsx-no-useless-fragment": ["error", { allowExpressions: true }],
      "react/default-props-match-prop-types": "off",
      "react/display-name": ["off"],
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "function-declaration",
          unnamedComponents: "arrow-function",
        },
      ],
      "react/hook-use-state": ["warn", { allowDestructuredState: true }],
      "react/no-access-state-in-setstate": "error",
      "react/no-adjacent-inline-elements": "error",
      "react/no-array-index-key": "warn",
      "react/no-arrow-function-lifecycle": "error",
      "react/no-did-update-set-state": "error",
      "react/no-find-dom-node": "error",
      "react/no-multi-comp": "off",
      "jsx-a11y/alt-text": [
        "error",
        {
          elements: ["img", "object", "area", "input[type='image']"],
          img: ["Image"],
          object: ["Object"],
          area: ["Area"],
          "input[type='image']": ["InputImage"],
        },
      ],
      "jsx-a11y/no-autofocus": "off",
      "react/no-namespace": "error",
      "react/no-redundant-should-component-update": "error",
      "react/no-invalid-html-attribute": "error",
      "react/no-this-in-sfc": "error",
      "react/no-typos": "error",
      "react/no-unsafe": "error",
      "react/no-unstable-nested-components": ["warn", { allowAsProps: true }],
      "react/no-unused-class-component-methods": "warn",
      "react/no-unused-prop-types": "off",
      "react/no-unused-state": "error",
      "react/no-will-update-set-state": "error",
      "react/prefer-es6-class": ["error", "always"],
      "react/prefer-stateless-function": "error",
      "react/prop-types": "off",
      "react/require-render-return": "error",
      "react/no-unknown-property": "warn",
      "react/self-closing-comp": "error",
      "react/state-in-constructor": ["error", "always"],
      "react/static-property-placement": [
        "error",
        "property assignment",
        {
          childContextTypes: "static getter",
          contextType: "static getter",
          contextTypes: "static getter",
          defaultProps: "static getter",
          displayName: "static getter",
          propTypes: "static getter",
        },
      ],
      "react/style-prop-object": "error",
      "react/void-dom-elements-no-children": "error",

      // jsx specifics
      "react/jsx-boolean-value": [
        "error",
        "never",
        {
          always: [],
        },
      ],
      "react/jsx-child-element-spacing": "error",
      "react/jsx-closing-bracket-location": ["error", "tag-aligned"],
      "react/jsx-closing-tag-location": "error",
      "react/jsx-curly-brace-presence": [
        "error",
        {
          children: "never",
          props: "never",
        },
      ],
      "react/jsx-curly-newline": [
        "error",
        {
          multiline: "consistent",
          singleline: "consistent",
        },
      ],
      "react/jsx-filename-extension": [
        "error",
        {
          extensions: [".jsx", ".tsx"],
        },
      ],
      "react/jsx-first-prop-new-line": ["error", "multiline-multiprop"],
      "react/jsx-fragments": ["error", "syntax"],
      "react/jsx-handler-names": [
        "warn",
        {
          eventHandlerPrefix: "handle",
          eventHandlerPropPrefix: "on",
          checkLocalVariables: false,
          checkInlineFunction: false,
        },
      ],
      "react/jsx-max-props-per-line": [
        "error",
        {
          maximum: 1,
          when: "multiline",
        },
      ],
      "react/jsx-newline": ["error", { prevent: true }],
      "react/jsx-no-constructed-context-values": "error",
      "react/jsx-no-script-url": "error",
      "react/jsx-one-expression-per-line": [
        "error",
        {
          allow: "single-child",
        },
      ],
      "react/jsx-pascal-case": [
        "error",
        {
          allowAllCaps: true,
          ignore: [],
        },
      ],
      "react/jsx-props-no-multi-spaces": "error",
      "react/jsx-wrap-multilines": [
        "error",
        {
          arrow: "parens-new-line",
          assignment: "parens-new-line",
          condition: "parens-new-line",
          declaration: "parens-new-line",
          logical: "parens-new-line",
          prop: "parens-new-line",
          return: "parens-new-line",
        },
      ],
    },
  },
  {
    // Hooks are usually defined in non-jsx extension files
    files: [...files.ts, ...files.js],
    plugins: {
      "react-hooks": hooksPlugin,
    },
    rules: {
      ...hooksPlugin.configs["recommended-latest"].rules,
    },
  },
]

export default config

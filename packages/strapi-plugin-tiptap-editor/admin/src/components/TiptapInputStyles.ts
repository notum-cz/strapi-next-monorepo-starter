import styled from 'styled-components';

export const TiptapInputStyles = styled.div`
  .editor-toolbar {
    margin-bottom: 0.25rem;
    padding-bottom: 0.25rem;
  }

  .ProseMirror {
    font-size: 1.4rem; /* Increase editor font size to match Strapi default */
    outline: none;
    max-height: 60vh;
    min-height: 15vh;
    overflow-y: auto;
    padding: 1rem;
  }

  /* Remove unnecessary margin at the top of the editor */
  .ProseMirror *:first-child {
    margin-top: 0;
  }

  /* --- Basic text styles --- */

  .ProseMirror p {
    margin: 0 0 12px;
  }

  .ProseMirror p:last-child {
    margin-bottom: 0;
  }

  .ProseMirror h1,
  .ProseMirror h2,
  .ProseMirror h3,
  .ProseMirror h4 {
    font-weight: 600;
    line-height: 1.25;
    margin: 1em 0 0.5em;
  }

  .ProseMirror h1 {
    font-size: 4rem;
  }

  .ProseMirror h2 {
    font-size: 3.2rem;
  }

  .ProseMirror h3 {
    font-size: 2.5rem;
  }

  .ProseMirror h4 {
    font-size: 2rem;
  }

  .ProseMirror ul,
  .ProseMirror ol {
    margin: 0.75em 0 1em;
    padding-left: 1.5rem;
  }

  .ProseMirror ul {
    list-style: disc;
  }

  .ProseMirror ol {
    list-style: decimal;
  }

  .ProseMirror li {
    margin: 0.25em 0;
  }

  .ProseMirror blockquote {
    border-left: 3px solid #222;
    margin: 1em 0;
    padding: 0.25em 1rem;
    font-style: italic;
    background: #fafafa;
  }

  .ProseMirror code {
    background: #f3f3f3;
    padding: 2px 4px;
    border-radius: 4px;
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
    font-size: 0.9em;
  }

  .ProseMirror a {
    color: #0c75af;
    text-decoration: underline;
  }

  .ProseMirror strong {
    font-weight: 600;
  }

  .ProseMirror em {
    font-style: italic;
  }

  .ProseMirror u {
    text-decoration: underline;
  }

  .ProseMirror s {
    text-decoration: line-through;
  }

  // Source: https://tiptap.dev/docs/editor/extensions/nodes/table

  .ProseMirror {
    table {
      border-collapse: collapse;
      margin: 0;
      overflow: hidden;
      table-layout: fixed;
      width: 100%;

      td,
      th {
        border: 1px solid #ddd;
        box-sizing: border-box;
        min-width: 1em;
        padding: 6px 8px;
        position: relative;
        vertical-align: top;

        > * {
          margin-bottom: 0;
        }
      }

      /* It is not possible to distinguish header vs body cells when rendering
      content in React. So we render all as td and the user should use bold text
      in cells. */
      th {
        background-color: inherit;
        font-weight: normal;
        text-align: left;
      }

      .selectedCell:after {
        background: rgba(0, 37, 159, 0.32);
        content: '';
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        pointer-events: none;
        position: absolute;
        z-index: 2;
      }

      .column-resize-handle {
        background-color: purple;
        bottom: -2px;
        pointer-events: none;
        position: absolute;
        right: -2px;
        top: 0;
        width: 4px;
      }
    }

    .tableWrapper {
      margin: 1.5rem 0;
      overflow-x: auto;
    }

    &.resize-cursor {
      cursor: ew-resize;
      cursor: col-resize;
    }
  }

  /* --- Only Cursive --- */
  /* How the only cursive text looks like in editor */

  .only-cursive {
    font-style: italic;
    font-weight: bold;
  }
`;

---
name: Question
about: Ask a question about the project
title: "[Q] "
labels: ["question"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for asking a question! Before you submit, please make sure you have:
        - Searched the [documentation](https://github.com/notum-cz/strapi-next-monorepo-starter#readme).
        - Searched for existing [GitHub issues](https://github.com/notum-cz/strapi-next-monorepo-starter/issues).

  - type: textarea
    id: question
    attributes:
      label: "Your Question"
      description: "Please provide your question in as much detail as possible."
    validations:
      required: true

  - type: checkboxes
    id: acknowledgements
    attributes:
      label: "Acknowledgements"
      description: "Please confirm the following."
      options:
        - label: "I have searched the documentation and existing issues for an answer."
          required: true
---

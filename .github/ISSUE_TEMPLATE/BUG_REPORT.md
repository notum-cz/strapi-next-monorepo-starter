---
name: Bug Report
about: Create a report to help us improve
title: "[BUG] "
labels: ["bug"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to fill out this bug report! Please do not report security vulnerabilities here. Instead, email them to devs@notum.cz.

  - type: textarea
    id: bug-description
    attributes:
      label: "Describe the bug"
      description: "A clear and concise description of what the bug is."
      placeholder: "I am experiencing a problem where [...]"
    validations:
      required: true

  - type: textarea
    id: reproduction
    attributes:
      label: "Steps to reproduce"
      description: "Please provide detailed steps for reproducing the issue."
      placeholder: |
        1. Go to '...'
        2. Click on '....'
        3. Scroll down to '....'
        4. See error
    validations:
      required: true

  - type: textarea
    id: expected-behavior
    attributes:
      label: "Expected behavior"
      description: "A clear and concise description of what you expected to happen."
    validations:
      required: true

  - type: textarea
    id: actual-behavior
    attributes:
      label: "Actual behavior"
      description: "A clear and concise description of what actually happened."
    validations:
      required: true

  - type: textarea
    id: environment
    attributes:
      label: "Your environment"
      description: "Please provide your OS, Node.js version, and any other relevant information."
      placeholder: |
        - OS: [e.g. macOS, Windows, Linux]
        - Node.js version: [e.g. 18.x]
        - Browser (if applicable): [e.g. Chrome, Safari]
    validations:
      required: true

  - type: textarea
    id: additional-context
    attributes:
      label: "Additional context"
      description: "Add any other context, stack traces, or screenshots about the problem here."

  - type: checkboxes
    id: acknowledgements
    attributes:
      label: "Acknowledgements"
      description: "Please confirm the following."
      options:
        - label: "I have searched the existing issues and this is not a duplicate."
          required: true
        - label: "I am not reporting a security vulnerability."
          required: true
---

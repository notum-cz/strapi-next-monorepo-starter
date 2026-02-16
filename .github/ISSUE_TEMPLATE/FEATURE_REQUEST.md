---
name: Feature Request
about: Suggest an idea for this project
title: "[FEAT] "
labels: ["enhancement"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to fill out this feature request!

  - type: textarea
    id: feature-description
    attributes:
      label: "Feature description"
      description: "A clear and concise description of what the feature is. What is the expected behavior?"
      placeholder: "As a user, I want to be able to [...] so that I can [...]."
    validations:
      required: true

  - type: textarea
    id: problem-and-use-case
    attributes:
      label: "Problem and use case"
      description: "What is the problem you are trying to solve? What is the use case for this feature?"
      placeholder: "I'm always frustrated when [...]"
    validations:
      required: true

  - type: textarea
    id: proposed-solution
    attributes:
      label: "Proposed solution"
      description: "How do you think this should be implemented? (If you have a proposal)"
    validations:
      required: false

  - type: textarea
    id: alternatives
    attributes:
      label: "Alternatives"
      description: "What other alternatives have you considered?"
    validations:
      required: false

  - type: textarea
    id: additional-context
    attributes:
      label: "Additional context"
      description: "Add any other context or screenshots about the feature request here."
    validations:
      required: false

  - type: checkboxes
    id: terms
    attributes:
      label: "Contribution"
      description: "By submitting this issue, you agree to follow our Code of Conduct and contributing guidelines."
      options:
        - label: "I have read and agree to the above terms."
          required: true
        - label: "I have searched the existing issues and this is not a duplicate."
          required: true
---

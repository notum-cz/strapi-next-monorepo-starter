# Login

Users sign in with their email and password on the sign-in page
(`/auth/signin`) to access their account. A successful sign-in returns
them to whatever page they were trying to reach before signing in; a
failed one keeps them on the sign-in page with an error message.

```gherkin
Feature: Login

  Background:
    Given the user is on the sign-in page

  @smoke @manual @priority-high @severity-blocker
  Scenario: Signing in with valid credentials
    Given an account with email "qa.user@example.com" and password "Test1234!"
    When the user fills in "Email" with "qa.user@example.com"
    And fills in "Password" with "Test1234!"
    And clicks "Sign in"
    Then the user is redirected to the page they were trying to reach before signing in

  # Automated by: qa/tests/playwright/e2e/mock/sign-in.spec.ts
  @mock @automated @priority-high @severity-major
  Scenario: Signing in with an incorrect password
    Given an account with email "qa.user@example.com" and password "Test1234!"
    When the user fills in "Email" with "qa.user@example.com"
    And fills in "Password" with "WrongPassword!"
    And clicks "Sign in"
    Then the message "You have entered incorrect login credentials." is shown
    And the user remains on the sign-in page

  # Automated by: qa/tests/playwright/e2e/mock/sign-in.spec.ts
  @mock @automated @priority-medium @severity-major
  Scenario: Seeing a generic error when the backend is unreachable
    Given the sign-in backend is unreachable
    When the user fills in "Email" with "qa.user@example.com"
    And fills in "Password" with "Test1234!"
    And clicks "Sign in"
    Then the message "Sign in failed. Please try again later." is shown
    And the user remains on the sign-in page

  @regression @manual @priority-medium @severity-minor
  Scenario Outline: Submitting the form with a required field left empty is blocked
    When the user clicks "Sign in" without filling in "<field>"
    Then a validation error is shown on the "<field>" field
    And the user remains on the sign-in page

    Examples:
      | field    |
      | Email    |
      | Password |

  @regression @manual @priority-low @severity-minor
  Scenario: Going to "Forgot password?" from the sign-in page
    When the user clicks "Forgot password?"
    Then the user is taken to the forgot password page

  @regression @manual @priority-low @severity-minor
  Scenario: Going to "Create an account" from the sign-in page
    When the user clicks "Create an account"
    Then the user is taken to the registration page

  @regression @manual @priority-medium @severity-blocker
  Scenario: Signing in with a social provider
    Given social sign-in is enabled for this environment
    When the user clicks a social sign-in provider's button
    And completes sign-in on that provider's site
    Then the user is redirected to the page they were trying to reach before signing in
```

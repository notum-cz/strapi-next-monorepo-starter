# Login

Users sign in with their email and password on the sign-in page
(`/auth/signin`) to access their account. A successful sign-in redirects
them to the homepage, unless they were bounced to sign-in from a
protected page, in which case they're returned there instead; a failed
sign-in keeps them on the sign-in page with an error message.

```gherkin
Feature: Login

  Background:
    Given the user is on the sign-in page

  # Automated by: qa/tests/playwright/e2e/smoke/sign-in.spec.ts
  @smoke @automated
  Scenario: Signing in with valid credentials
    Given an account with email "martin.vesely@notum.cz" and password "vuw-xzc5GBK@rza1xta"
    And the user got to the sign-in page by clicking "Sign in" in the navbar
    When the user fills in "Email" with "martin.vesely@notum.cz"
    And fills in "Password" with "vuw-xzc5GBK@rza1xta"
    And clicks "Sign in"
    Then the user is redirected to the homepage

  # Automated by: qa/tests/playwright/e2e/mock/sign-in.spec.ts
  @mock @automated
  Scenario: Signing in with an incorrect password
    Given an account with email "qa.user@example.com" and password "vuw-xzc5GBK@rza1xta"
    When the user fills in "Email" with "qa.user@example.com"
    And fills in "Password" with "WrongPassword!"
    And clicks "Sign in"
    Then the message "You have entered incorrect login credentials." is shown
    And the user remains on the sign-in page

  @regression @manual
  Scenario Outline: Submitting the form with a required field left empty is blocked
    When the user clicks "Sign in" without filling in "<field>"
    Then a validation error is shown on the "<field>" field
    And the user remains on the sign-in page

    Examples:
      | field    |
      | Email    |
      | Password |

  # Automated by: qa/tests/playwright/e2e/mock/sign-in.spec.ts
  @regression @mock @automated
  Scenario: Entering an email in an invalid format
    When the user fills in "Email" with "testgmail.com"
    And fills in "Password" with "test123"
    And clicks "Sign in"
    Then the message "Please enter a valid email address." is shown on the "Email" field
    And the user remains on the sign-in page
```

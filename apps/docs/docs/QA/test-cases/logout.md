# Logout

Signed-in users end their session from the account menu in the navbar
(`/auth/signout`). Signing out clears the session and always returns the
user to the home page, regardless of which page they signed out from —
there is no confirmation dialog and no visible message.

```gherkin
Feature: Logout

  Background:
    Given the user is signed in

  @smoke @manual
  Scenario: Signing out from the account menu
    When the user opens the account menu
    And clicks "Sign out"
    Then the user is redirected to the home page
    And the "Sign in" link is shown in the navbar

  @regression @manual
  Scenario: Signing out while on a protected page still returns to the home page
    Given the user is on the change password page
    When the user opens the account menu
    And clicks "Sign out"
    Then the user is redirected to the home page

  @regression @manual
  Scenario: A signed-out session can no longer reach protected pages
    When the user opens the account menu
    And clicks "Sign out"
    And the user navigates to the change password page
    Then the user is redirected to the sign-in page
```

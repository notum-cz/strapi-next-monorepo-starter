# Language Switcher

The language switcher (`LocaleSwitcher`, available on every page) lets the
user change the site's active locale on Emerald for selected regions (EU, CA, US)

```gherkin
Feature: Language switcher

  Background:
    Given the user is on the homepage

  @smoke @manual
  Scenario: Switching the language to German
    When the user opens the language switcher
    And selects "Deutsch"
    Then the language switcher shows "Deutsch"
    And the page's "lang" attribute is "de"
    And the page URL is prefixed with "/de"

  @regression @manual
  Scenario: Site UI text is displayed in German after switching
    When the user opens the language switcher
    And selects "Deutsch"
    Then the sign-in link reads "Anmelden"
    And the account menu label reads "Konto"
```

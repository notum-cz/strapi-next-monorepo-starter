# Site Search

The Strapi website (`https://strapi.io`) offers a site-wide search opened from
the magnifying-glass icon in the top navigation. It searches across marketing
pages, the Strapi documentation, and blog posts, showing results live as the
user types and grouping them by content type. All scenarios below were observed
against the live site.

```gherkin
Feature: Site Search

  Background:
    Given the user is on the Strapi website

  @smoke @manual
  Scenario: Opening the site search from the navigation
    When the user clicks the search icon in the top navigation
    Then a search dialog opens with the placeholder "Search the site…"
    And the message "Start typing to search." is shown

  @smoke @manual
  Scenario: Searching returns results grouped by content type
    Given the search dialog is open
    When the user types "headless cms" into the search field
    Then results are shown grouped under the headings "PAGES", "STRAPI DOCS", and "BLOG POSTS"
    And each result shows its title and page path

  @smoke @manual
  Scenario: Opening a result navigates to its page
    Given the search dialog is open
    When the user types "pricing" into the search field
    And clicks the first result "Pricing"
    Then the user is taken to the Strapi pricing page
    And the search dialog closes

  @regression @manual
  Scenario: A query with no matches shows an empty message
    Given the search dialog is open
    When the user types "zzzxqwv9quux" into the search field
    Then the message "No results found." is shown

  @regression @manual
  Scenario: A loading indicator is shown while results are fetched
    Given the search dialog is open
    When the user types "pricing" into the search field
    Then the message "Searching…" is shown while results are being fetched
    And the results replace the "Searching…" message once they load

  @regression @manual
  Scenario: Closing the search with Cancel
    Given the search dialog is open
    When the user clicks "Cancel"
    Then the search dialog closes
    And the user remains on the same page

  @regression @manual
  Scenario: Closing the search with the Escape key
    Given the search dialog is open
    When the user presses the "Escape" key
    Then the search dialog closes
```

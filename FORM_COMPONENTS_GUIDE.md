# Form Components Field Guide

## 1. Contact Form

**Component:** `forms.contact-form`
**Fields:**

- Name (string, required)
- Email (email, required)
- Phone (string, optional)
- Subject (string, optional)
- Message (text, required)
- Consent checkbox (boolean, required)
- Submit button text (string, optional)

## 2. Newsletter Signup Form

**Component:** `forms.newsletter-form`
**Fields:**

- Title (string, optional)
- Subtitle (string, optional)
- Email field label (string, optional)
- Success message (string, optional)
- Privacy policy text (string, optional)
- Submit button text (string, optional)

## 3. Event Registration Form

**Component:** `forms.event-registration`
**Fields:**

- Event name (string, required)
- Participant name (string, required)
- Email (email, required)
- Phone (string, required)
- Number of attendees (number, optional)
- Dietary restrictions (text, optional)
- Special requirements (text, optional)
- Agreement to terms (boolean, required)

## 4. Job Application Form

**Component:** `forms.job-application`
**Fields:**

- Position title (string, required)
- Full name (string, required)
- Email (email, required)
- Phone (string, required)
- Resume/CV (file upload, required)
- Cover letter (text, optional)
- LinkedIn profile (string, optional)
- Years of experience (number, optional)
- Availability date (date, optional)
- Salary expectations (string, optional)

## 5. Quote Request Form

**Component:** `forms.quote-request`
**Fields:**

- Service type (enumeration: ["Web Design", "Development", "Consulting", "Other"])
- Company name (string, optional)
- Contact person (string, required)
- Email (email, required)
- Phone (string, required)
- Project description (text, required)
- Budget range (enumeration: ["Under $1000", "$1000-$5000", "$5000-$10000", "Over $10000", "Not sure"])
- Timeline (string, optional)
- Additional requirements (text, optional)

## 6. Feedback/Survey Form

**Component:** `forms.feedback-survey`
**Fields:**

- Survey title (string, required)
- Overall rating (number 1-5, required)
- Service quality rating (number 1-5, optional)
- Staff friendliness rating (number 1-5, optional)
- Comments (text, optional)
- Would recommend (boolean, optional)
- Contact for follow-up (boolean, optional)
- Contact email (email, conditional)

## 7. Booking/Appointment Form

**Component:** `forms.booking-appointment`
**Fields:**

- Service type (string, required)
- Full name (string, required)
- Email (email, required)
- Phone (string, required)
- Preferred date (date, required)
- Preferred time (time, required)
- Additional notes (text, optional)
- Confirmation email (boolean, optional)

## 8. Product Inquiry Form

**Component:** `forms.product-inquiry`
**Fields:**

- Product name (string, required)
- Customer name (string, required)
- Email (email, required)
- Phone (string, optional)
- Company name (string, optional)
- Quantity needed (number, optional)
- Budget (string, optional)
- Project timeline (string, optional)
- Additional questions (text, optional)

## 9. Support Ticket Form

**Component:** `forms.support-ticket`
**Fields:**

- Issue type (enumeration: ["Technical", "Billing", "Account", "Feature Request", "Other"])
- Priority level (enumeration: ["Low", "Medium", "High", "Critical"])
- Subject (string, required)
- Description (text, required)
- Contact email (email, required)
- Contact phone (string, optional)
- Account number (string, optional)
- Screenshots (file upload, optional)

## 10. Partner/Vendor Registration Form

**Component:** `forms.partner-registration`
**Fields:**

- Company name (string, required)
- Contact person (string, required)
- Company email (email, required)
- Company phone (string, required)
- Website URL (string, optional)
- Business type (enumeration: ["Manufacturer", "Distributor", "Service Provider", "Retailer"])
- Annual revenue (enumeration: ["Under $100K", "$100K-$500K", "$500K-$1M", "Over $1M"])
- Number of employees (enumeration: ["1-10", "11-50", "51-200", "200+"])
- Description of business (text, required)
- References (text, optional)

## Common Form Elements to Include:

### Basic Fields:

- Text inputs (name, email, phone, company)
- Text areas (message, description, comments)
- Select dropdowns (categories, options)
- Radio buttons (single choice)
- Checkboxes (multiple choices, agreements)
- File uploads (documents, images)
- Date/time pickers

### Validation Fields:

- Required field indicators
- Email format validation
- Phone number format
- Character limits
- File type restrictions

### Styling Options:

- Form title and subtitle
- Submit button text and styling
- Success/error messages
- Background colors
- Layout options (single column, multi-column)

Would you like me to create any of these specific form components for you?

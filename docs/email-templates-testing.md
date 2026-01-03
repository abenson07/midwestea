# Email Templates Testing Guide

This guide covers how to test the email templates for enrollment confirmations.

## Automated Tests

Run the automated test suite:

```bash
npm run test-email-templates
```

This tests:
- ✅ Template rendering with normal data
- ✅ XSS prevention (HTML escaping)
- ✅ Special character handling
- ✅ Currency formatting
- ✅ Date formatting
- ✅ Invoice calculations (quantity * amount_due)
- ✅ Template structure validation
- ✅ Edge cases (empty data, null values)

## Manual Testing via Preview Endpoint

### 1. Start the Development Server

```bash
cd apps/webapp
npm run dev
```

### 2. Preview Course Enrollment Email

**Note:** The webapp uses `basePath: '/app'`, so URLs are prefixed with `/app`.

Open in browser:
```
http://localhost:3000/app/api/email-preview?type=course
```

Or use curl:
```bash
curl "http://localhost:3000/app/api/email-preview?type=course" > course-preview.html
```

### 3. Preview Program Enrollment Email

Open in browser:
```
http://localhost:3000/app/api/email-preview?type=program
```

Or use curl:
```bash
curl "http://localhost:3000/app/api/email-preview?type=program" > program-preview.html
```

### 4. Preview with Custom Data

```bash
curl -X POST http://localhost:3000/app/api/email-preview \
  -H "Content-Type: application/json" \
  -d '{
    "type": "course",
    "data": {
      "studentName": "Your Name",
      "courseName": "Test Course",
      "courseCode": "TEST101",
      "amount": 75000,
      "invoiceNumber": 99999,
      "paymentDate": "2024-01-15"
    }
  }'
```

### Alternative: Use Render Script (No Server Required)

You can also render templates without starting the dev server:

```bash
npm run render-email-preview
```

This creates HTML files in `email-previews/` directory that you can open directly in your browser or upload to email testing tools.

## Email Client Testing

### Using Browser Preview

1. Open the preview URL in your browser
2. Right-click → "Inspect" → Toggle device toolbar
3. Test responsive design at different screen sizes:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1200px)

### Using Email Testing Services

1. **Export HTML from preview endpoint:**
   ```bash
   curl "http://localhost:3000/app/api/email-preview?type=course" > course-email.html
   ```
   
   Or use the render script:
   ```bash
   npm run render-email-preview
   ```
   Files will be saved to `email-previews/` directory.

2. **Upload to email testing service:**
   - [Litmus](https://www.litmus.com/) - Comprehensive email testing
   - [Email on Acid](https://www.emailonacid.com/) - Email client testing
   - [Mailtrap](https://mailtrap.io/) - Email testing inbox

3. **Test across email clients:**
   - Gmail (Web, iOS, Android)
   - Outlook (Windows, Mac, Web)
   - Apple Mail (macOS, iOS)
   - Yahoo Mail
   - Other popular clients

## Visual Checklist

When testing, verify:

### Course Enrollment Email
- [ ] Student name appears correctly
- [ ] Course name and code are displayed
- [ ] "Link coming shortly" message is present
- [ ] Payment details section shows:
  - [ ] Amount paid (formatted as currency)
  - [ ] Invoice number
  - [ ] Payment date
- [ ] Support email link works
- [ ] Footer includes copyright and contact info
- [ ] Responsive on mobile devices
- [ ] No broken HTML or styling issues

### Program Enrollment Email
- [ ] Student name appears correctly
- [ ] Program name and code are displayed
- [ ] Program start date is highlighted
- [ ] Payment confirmation section shows:
  - [ ] Registration fee amount
  - [ ] Invoice number
  - [ ] Payment date
- [ ] Outstanding invoices table (if applicable):
  - [ ] Invoice numbers are correct
  - [ ] Descriptions are readable (Tuition A/B)
  - [ ] Amounts are calculated correctly (quantity * amount_due)
  - [ ] Due dates are formatted correctly
  - [ ] Total outstanding is calculated correctly
- [ ] Support email link works
- [ ] Footer includes copyright and contact info
- [ ] Responsive on mobile devices
- [ ] Table formatting works across email clients

## Security Testing

### XSS Prevention

Test with malicious input:
```bash
curl -X POST http://localhost:3000/app/api/email-preview \
  -H "Content-Type: application/json" \
  -d '{
    "type": "course",
    "data": {
      "studentName": "<script>alert(\"xss\")</script>",
      "courseName": "Test Course",
      "courseCode": "TEST",
      "amount": 10000,
      "invoiceNumber": 1,
      "paymentDate": "2024-01-15"
    }
  }'
```

Verify:
- [ ] Script tags are escaped (`&lt;script&gt;`)
- [ ] HTML entities are properly encoded
- [ ] No JavaScript executes in rendered email

## Edge Cases to Test

1. **Empty student name** - Should default to "Student"
2. **Very long course/program names** - Should wrap properly
3. **Large amounts** - Should format with commas ($10,000.00)
4. **Multiple outstanding invoices** - Table should display all
5. **No outstanding invoices** - Section should not appear
6. **Special characters** - Should be escaped properly
7. **Past/future dates** - Should format correctly

## Integration Testing

After templates are integrated with webhook handler:

1. **Trigger actual enrollment:**
   - Complete a test checkout flow
   - Verify email is sent via Resend
   - Check email in inbox (and spam folder)

2. **Verify email content:**
   - All data matches enrollment
   - Calculations are correct
   - Links work properly

3. **Check Resend dashboard:**
   - Email appears in logs
   - Delivery status is successful
   - No bounce or complaint rates

## Troubleshooting

### Template not rendering
- Check that template files exist in `apps/webapp/lib/email-templates/`
- Verify template file names match exactly
- Check for syntax errors in HTML

### Variables not substituting
- Verify variable names match template placeholders
- Check that data types match expected types
- Ensure `renderTemplate` function is working

### Styling issues
- Check inline CSS (email clients strip `<style>` tags)
- Verify table-based layout (required for email compatibility)
- Test in actual email clients, not just browser

### Calculation errors
- Verify `quantity * amount_due` calculation
- Check currency formatting (cents to dollars)
- Test with edge cases (0, negative, very large numbers)


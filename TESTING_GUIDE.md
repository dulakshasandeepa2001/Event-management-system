# Event Management System - Testing & Quick Start Guide

**Version:** 2.0  
**Last Updated:** April 25, 2026

---

## 🚀 Quick Start for Development

### Prerequisites
- Node.js 14+ installed
- npm 6+ installed
- MongoDB running locally or remote
- Environment variables configured

### Installation

```bash
# Frontend setup
cd frontend
npm install
npm run dev

# Backend setup (in another terminal)
cd server
npm install
npm start
```

Visit `http://localhost:5173` for the frontend (Vite dev server)  
Backend API runs on `http://localhost:5001`

---

## 🧪 Running Tests

### Frontend Tests
```bash
cd frontend

# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Backend Tests
```bash
cd server

# Run all tests
npm run test

# Run specific test file
npm run test -- test/models.test.js
```

---

## 📱 Testing Across Devices

### Using Chrome DevTools
1. Open Chrome DevTools (F12)
2. Click Device Toolbar icon
3. Select device or enter custom dimensions
4. Test responsive layout

### Recommended Test Configurations

**Mobile Devices:**
- iPhone 12: 390x844
- iPhone 14 Pro: 430x932
- Samsung Galaxy S21: 360x800
- Pixel 6: 412x915

**Tablets:**
- iPad: 1024x1366
- iPad Pro: 1366x1024

**Desktop:**
- 1366x768 (Common)
- 1920x1080 (Full HD)
- 2560x1440 (2K)

---

## ✨ UI/UX Testing Checklist

### Visual Elements
- [ ] Cards render with gradient backgrounds
- [ ] Shadows are visible and subtle
- [ ] Border colors are consistent
- [ ] Text contrast is sufficient
- [ ] Icons align properly
- [ ] Spacing is consistent

### Interactions
- [ ] Buttons have hover states
- [ ] Forms validate correctly
- [ ] Modals open/close smoothly
- [ ] Tables sort/filter properly
- [ ] Notifications display clearly
- [ ] Loading states appear

### Animations
- [ ] Fade-in animations play
- [ ] Slide animations smooth
- [ ] Scale animations work
- [ ] No janky transitions
- [ ] Animations performant

---

## 🔍 Manual Testing Flows

### Student User Flow
1. Login with student credentials
2. View student dashboard
3. Check KPI cards display
4. View chart data
5. Click on submission status
6. Open submission details modal
7. View notification panel
8. Mark notification as read
9. Filter submissions by status
10. Logout

### Lecturer User Flow
1. Login with lecturer credentials
2. View lecturer dashboard
3. Review overview section
4. Create a deadline (form validation)
5. View deadline list
6. Create a submission
7. View submissions table
8. Open event details modal
9. Search events
10. Test refresh button

### Batch Rep User Flow
1. Login with batch rep credentials
2. View batch dashboard
3. Check activity metrics
4. View charts and graphs
5. Create a deadline
6. View deadline list
7. Create submission
8. View submission engagement
9. Update batch information
10. Logout

### Admin User Flow
1. Login with admin credentials
2. View admin dashboard
3. Check analytics
4. View student list
5. Filter students by status
6. Search for student
7. View user management
8. Check activity logs
9. View reports
10. Test navigation

---

## 🔧 Troubleshooting

### Common Issues

**Issue: Page not loading**
- Check backend is running on correct port
- Verify API endpoint in api.js
- Check browser console for errors
- Clear browser cache (Ctrl+Shift+Delete)

**Issue: Styles not applying**
- Verify CSS files imported
- Check Tailwind CSS build completed
- Clear node_modules and rebuild
- Check browser DevTools for CSS errors

**Issue: API requests failing**
- Verify backend server running
- Check network tab in DevTools
- Verify CORS configuration
- Check API endpoint URLs

**Issue: Form validation not working**
- Check form field names match
- Verify validation logic
- Check error messages displaying
- Test with different inputs

**Issue: Mobile layout broken**
- Check viewport meta tag
- Verify responsive classes (md:, lg:, etc.)
- Test with DevTools device emulation
- Check CSS media queries

---

## 📊 Performance Testing

### Lighthouse Audit
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Select "Generate report"
4. Check metrics:
   - Performance > 80
   - Accessibility > 90
   - Best Practices > 90
   - SEO > 80

### Load Time Testing
```bash
# Using curl to test API response time
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:5001/api/events"

# Using ab (Apache Bench)
ab -n 100 -c 10 http://localhost:5173/
```

### Network Analysis
1. Open DevTools Network tab
2. Reload page
3. Check:
   - Total load time < 3s
   - HTML < 500ms
   - JavaScript < 1s
   - CSS < 500ms
   - Images < 1s

---

## 🔐 Security Testing

### OWASP Top 10 Quick Check

1. **Injection**
   - Test SQL injection in forms
   - Verify parameterized queries

2. **Authentication**
   - Test login/logout
   - Verify token refresh
   - Check session timeout

3. **Sensitive Data Exposure**
   - Verify HTTPS in production
   - Check no sensitive data in logs
   - Verify API keys not hardcoded

4. **XML External Entities**
   - No XML parsing in app
   - Check dependencies safe

5. **Access Control**
   - Test admin-only pages with student account
   - Verify role-based access

6. **Security Misconfiguration**
   - Check CORS settings
   - Verify error handling
   - Check security headers

7. **XSS Prevention**
   - Test HTML injection in forms
   - Verify input sanitization
   - Check output encoding

8. **CSRF Protection**
   - Verify CSRF tokens if applicable
   - Check SameSite cookie settings

9. **Using Components with Known Vulnerabilities**
   - Run `npm audit`
   - Check for critical vulnerabilities
   - Update dependencies if needed

10. **Insufficient Logging**
    - Check error logs capture issues
    - Verify audit trail functionality

---

## 📈 Test Coverage Targets

- **Statements:** > 80%
- **Branches:** > 75%
- **Functions:** > 80%
- **Lines:** > 80%

---

## 🎯 Key Features to Test

### Critical Path (Must Work)
- [ ] User authentication
- [ ] Dashboard loading
- [ ] Form submission
- [ ] Data filtering
- [ ] Modal operations

### Important Features
- [ ] Search functionality
- [ ] Sorting
- [ ] Pagination
- [ ] Notifications
- [ ] File uploads

### Enhancement Features
- [ ] Dark/Light theme toggle
- [ ] Advanced filters
- [ ] Export functionality
- [ ] Analytics dashboards
- [ ] Bulk operations

---

## 🚨 Bug Reporting Template

```
**Title:** [Brief description]

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Result:**
What should happen

**Actual Result:**
What actually happens

**Screenshots/Videos:**
[Attach if applicable]

**Environment:**
- Browser: Chrome 120.0
- OS: Windows 11
- Screen Size: 1920x1080

**Severity:** Critical/High/Medium/Low
```

---

## ✅ Sign-Off Template

**QA Tester:** _________________  
**Testing Date:** _________________  
**Build Version:** _________________  

**Overall Assessment:** PASS / FAIL

**Critical Issues Found:** ☐ Yes ☐ No  
**If Yes, Count:** _________________

**Comments:**
_____________________________________________________

**Approved for Production:** ☐ Yes ☐ No

---

## 📚 Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com)
- [React Documentation](https://react.dev)
- [MDN Web Docs](https://developer.mozilla.org)
- [Recharts Documentation](https://recharts.org)
- [Axios Documentation](https://axios-http.com)

---

## 🤝 Support & Feedback

For questions or issues:
- Contact: Development Team
- Slack: #tech-support
- Email: dev@example.com

---

**Happy Testing! 🎉**

<<<<<<< HEAD
=======
git config --global user.name "Your New Name"
git config --global user.email "newemail@example.com"
GIT_AUTHOR_DATE="2026-04-01T12:00:00" GIT_COMMITTER_DATE="2026-04-01T12:00:00" git commit -m "updates event ai parts"
>>>>>>> f2e1606494f3da8ee91c73fe2d38cebe0d6ef80f

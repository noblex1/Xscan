# Test URLs for NetWard AI

## ⚠️ IMPORTANT DISCLAIMER

**These are FAKE URLs created for TESTING PURPOSES ONLY.**
- They are NOT real websites
- They will NOT resolve to actual pages
- They are designed to demonstrate phishing patterns
- Use them ONLY to test your NetWard AI system

**DO NOT:**
- Try to visit these URLs in a browser
- Share these as real phishing examples
- Use them for malicious purposes

---

## 🎯 Test Phishing URLs (Fake Examples)

### 1. Fake PayPal Phishing
```
http://secure-login-verify-paypal-account-suspended.tk/verify.php?user=12345&session=abc123def456
```

**Suspicious Characteristics:**
- Very long URL (95 characters)
- Multiple hyphens (7)
- Suspicious TLD (.tk)
- No HTTPS
- "verify" in path
- Query parameters with session info
- Impersonates PayPal brand

**Expected Detection:**
- High threat score (80-95)
- Risk: CRITICAL
- ML should flag as phishing

---

### 2. Fake Microsoft Login
```
http://login-microsoft-office365-secure-authentication.com/signin?redirect=http://192.168.1.1/capture.php
```

**Suspicious Characteristics:**
- Long domain (45 characters)
- Many hyphens (5)
- No HTTPS
- Redirect to IP address
- Impersonates Microsoft
- Suspicious redirect parameter

**Expected Detection:**
- High threat score (75-90)
- Risk: HIGH/CRITICAL
- ML should flag as phishing

---

### 3. Fake Bank Alert
```
https://secure-banking-alert-verify-account-now.info/urgent/verify.asp?account=9876543210&token=xyz
```

**Suspicious Characteristics:**
- Long URL (98 characters)
- Many hyphens (6)
- Suspicious TLD (.info)
- "urgent" in path
- Account number in URL
- Generic "banking" domain

**Expected Detection:**
- High threat score (70-85)
- Risk: HIGH
- ML should flag as phishing

---

### 4. Fake Amazon Verification
```
http://amazon-account-security-verification-required.xyz/verify-identity.php?user_id=12345&verify=true
```

**Suspicious Characteristics:**
- Long domain (47 characters)
- Multiple hyphens (5)
- Suspicious TLD (.xyz)
- No HTTPS
- "verify" in filename
- Query parameters

**Expected Detection:**
- High threat score (75-90)
- Risk: HIGH/CRITICAL
- ML should flag as phishing

---

### 5. Fake Google Drive Share
```
http://drive-google-docs-share-file-download.ml/document/view?id=1a2b3c4d5e&share=public&download=true
```

**Suspicious Characteristics:**
- Long domain (40 characters)
- Multiple hyphens (5)
- Suspicious TLD (.ml)
- No HTTPS
- Impersonates Google Drive
- Multiple query parameters

**Expected Detection:**
- High threat score (70-85)
- Risk: HIGH
- ML should flag as phishing

---

## ✅ Test Legitimate URLs (For Comparison)

### 1. Real Google
```
https://www.google.com
```

**Expected Detection:**
- Low threat score (0-10)
- Risk: LOW
- ML should flag as safe

---

### 2. Real GitHub
```
https://github.com/explore
```

**Expected Detection:**
- Low threat score (0-10)
- Risk: LOW
- ML should flag as safe

---

### 3. Real Amazon
```
https://www.amazon.com/gp/cart/view.html
```

**Expected Detection:**
- Low threat score (0-15)
- Risk: LOW
- ML should flag as safe

---

### 4. Real Microsoft
```
https://login.microsoftonline.com
```

**Expected Detection:**
- Low threat score (0-10)
- Risk: LOW
- ML should flag as safe

---

### 5. Real PayPal
```
https://www.paypal.com/signin
```

**Expected Detection:**
- Low threat score (0-10)
- Risk: LOW
- ML should flag as safe

---

## 🧪 How to Test

### Option 1: Using Your Frontend

1. Open your deployed NetWard AI frontend
2. Copy one of the test URLs above
3. Paste into the URL scanner
4. Click "Scan URL"
5. Review the results

### Option 2: Using cURL (Backend API)

```bash
# Test a phishing URL
curl -X POST https://your-backend.onrender.com/api/v1/threats/analyze-url \
  -H "Content-Type: application/json" \
  -d '{"url":"http://secure-login-verify-paypal-account-suspended.tk/verify.php?user=12345&session=abc123def456"}'

# Test a legitimate URL
curl -X POST https://your-backend.onrender.com/api/v1/threats/analyze-url \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.google.com"}'
```

### Option 3: Using ML Service Directly

```bash
# Test ML service
curl -X POST https://ml-service-yiwg.onrender.com/api/ml/analyze-url \
  -H "Content-Type: application/json" \
  -d '{"url":"http://secure-login-verify-paypal-account-suspended.tk/verify.php?user=12345"}'
```

---

## 📊 Expected Results

### Phishing URLs Should Show:

✅ **High Threat Score:** 70-95/100
✅ **Risk Category:** HIGH or CRITICAL
✅ **ML Prediction:** is_threat = true
✅ **ML Confidence:** 80-95%
✅ **Risk Factors:**
- Long URL length
- Multiple hyphens
- Suspicious TLD
- No HTTPS (for some)
- Brand impersonation keywords
- High entropy

✅ **Detection Methods:**
- Machine Learning Analysis: FAIL
- Heuristic Analysis: WARNING/FAIL
- SSL/TLS Check: FAIL (for HTTP)

### Legitimate URLs Should Show:

✅ **Low Threat Score:** 0-15/100
✅ **Risk Category:** LOW
✅ **ML Prediction:** is_threat = false
✅ **ML Confidence:** 85-100%
✅ **Security Features:**
- Uses HTTPS
- Normal URL length
- Legitimate domain
- Low entropy

✅ **Detection Methods:**
- Machine Learning Analysis: PASS
- SSL/TLS Check: PASS
- Heuristic Analysis: PASS

---

## 🎓 What to Look For

### Good Detection System Should:

1. **Identify Patterns:**
   - Long URLs with many hyphens
   - Suspicious TLDs (.tk, .ml, .xyz, .info)
   - No HTTPS on login pages
   - IP addresses in URLs
   - Brand impersonation

2. **Provide Confidence:**
   - High confidence for obvious cases
   - Lower confidence for edge cases
   - Explain reasoning

3. **Multiple Methods:**
   - ML prediction
   - Heuristic analysis
   - SSL/TLS check
   - External APIs (if available)

4. **Clear Communication:**
   - Easy-to-understand risk level
   - Specific risk factors listed
   - Actionable recommendations

---

## 🔍 Feature Analysis

### What Your ML Model Extracts:

For phishing URL #1:
```
http://secure-login-verify-paypal-account-suspended.tk/verify.php?user=12345&session=abc123def456

Features:
- url_length: 95 (HIGH - suspicious)
- domain_length: 47 (HIGH - suspicious)
- has_ip_address: 0
- has_at_symbol: 0
- has_double_slash: 0
- num_subdomains: 0
- num_dots: 2
- num_hyphens: 7 (HIGH - suspicious)
- num_underscores: 0
- num_digits: 10
- num_special_chars: 20 (HIGH - suspicious)
- entropy: ~4.2 (HIGH - suspicious)
- suspicious_tld: 1 (YES - .tk)
- url_shortener: 0
- path_length: 10
- num_path_segments: 1
- has_query: 1
- num_query_params: 2
- is_https: 0 (NO - suspicious)

ML Prediction: PHISHING (high confidence)
```

---

## 📝 Testing Checklist

- [ ] Test all 5 phishing URLs
- [ ] Test all 5 legitimate URLs
- [ ] Verify high threat scores for phishing
- [ ] Verify low threat scores for legitimate
- [ ] Check ML predictions are correct
- [ ] Review confidence scores
- [ ] Examine risk factors listed
- [ ] Test PDF export functionality
- [ ] Test JSON export functionality
- [ ] Check scan history is saved

---

## 🎯 Success Criteria

Your system is working well if:

✅ Phishing URLs score 70+ threat score
✅ Legitimate URLs score 0-15 threat score
✅ ML model shows high confidence (>80%)
✅ Risk factors are clearly explained
✅ Multiple detection methods agree
✅ Results are displayed clearly
✅ Export functions work

---

## ⚠️ Important Notes

1. **These are FAKE URLs** - They don't exist and won't load
2. **For TESTING ONLY** - Don't share as real examples
3. **Pattern-based** - Designed to trigger detection
4. **Educational** - Learn what makes URLs suspicious
5. **Safe to use** - Won't harm your system

---

## 🚀 Next Steps

After testing:

1. **Document Results** - Screenshot your findings
2. **Analyze Patterns** - What features triggered detection?
3. **Test Edge Cases** - Try variations
4. **Improve System** - Based on results
5. **Train with Real Data** - For production use

---

**Happy Testing! 🛡️**

Remember: These are educational examples. Real phishing detection requires:
- Real labeled datasets
- Continuous training
- Regular updates
- User feedback
- Multiple detection layers

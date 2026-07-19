# Zampify AI
### AI-Powered Accounts Payable Automation Platform

> Transforming vendor invoice emails into intelligent, explainable payment decisions.

---

## 📚 Documentation

- [**Developer & Local Setup Guide**](docs/DEVELOPER_GUIDE.md) - Instructions to run the full stack locally.
- [**Deployment Guide (Free Tier)**](docs/DEPLOYMENT_GUIDE.md) - Step-by-step instructions to deploy Zampify AI to Render & Vercel.
- [**System Architecture**](docs/Invoice_Processing_Architecture.md) - Deep dive into the AI agents and data flow.

---

## Overview

Zampify AI is an enterprise-grade AI workflow platform that automates the complete Accounts Payable (AP) invoice lifecycle. Instead of simply extracting data from invoices, it understands incoming vendor emails, validates invoices against procurement records, applies configurable business policies, detects anomalies, and generates transparent payment decisions with a complete audit trail.

Designed as a Digital AP Analyst, Zampify AI combines AI-powered document understanding with deterministic business rules, ensuring every decision is accurate, explainable, and enterprise-ready.

---

## Problem Statement

Finance teams process hundreds of invoices every month through shared AP mailboxes. Manual invoice validation is repetitive, time-consuming, and error-prone.

Common challenges include:

- Different invoice formats across vendors
- Scanned or low-quality PDFs
- Missing or incomplete information
- Duplicate invoice submissions
- PO mismatches
- Manual three-way matching
- Slow approval cycles
- Lack of audit visibility

Zampify AI automates this workflow while keeping humans involved only when necessary.

---

# Features

## Email Intelligence

- Monitor shared AP inbox
- Detect invoice-related emails
- Validate attachments
- Handle corrupt or missing PDFs
- Categorize non-invoice emails

---

## Document Intelligence

- Automatic PDF classification
- Digital PDF parsing using Docling
- OCR pipeline for scanned invoices
- Vision-Language fallback for difficult documents
- OCR confidence scoring

---

## AI Data Extraction

Extracts:

- Invoice Number
- Invoice Date
- Vendor Information
- Tax ID
- Currency
- Purchase Order
- Line Items
- Taxes
- Shipping Charges
- Payment Terms
- Grand Total

Every extracted field includes confidence scores.

---

## Financial Intelligence Engine

Performs:

- Vendor Validation
- Purchase Order Lookup
- Three-Way Matching
- Duplicate Detection
- Fraud Detection
- Currency Validation
- Tax Validation
- Payment Terms Validation
- Dynamic Tolerance Checks

---

## Configurable Policy Engine

Business rules are configuration-driven rather than hardcoded.

Examples include:

- Approval limits
- Price tolerance thresholds
- OCR confidence thresholds
- Duplicate detection windows
- Country-specific tax policies

---

## Explainable Decision Engine

Produces:

- Approved
- Needs Human Review
- Rejected

Every decision includes:

- Confidence Score
- Triggered Rules
- Natural Language Explanation
- Validation Summary

---

## Human-in-the-Loop

Invoices with low confidence or validation failures are automatically routed to reviewers.

Reviewers receive:

- Invoice Preview
- Validation Summary
- AI Recommendation
- Failed Rules
- Suggested Next Action

---

## Workflow Trace Engine

Every invoice maintains a complete execution history.

Example:

- Email Received
- Attachment Validated
- OCR Completed
- Data Extracted
- Vendor Verified
- PO Matched
- Duplicate Check Passed
- Decision Generated
- Archived

Supports full workflow replay.

---

## Dashboard

Real-time visibility into:

- Invoice Processing Status
- Workflow Progress
- Processing History
- Decision Explanations
- Invoice Preview
- Human Review Queue
- Operational Metrics

Finance KPIs:

- Days Payable Outstanding (DPO)
- Cost Per Invoice
- Automation Rate
- Straight Through Processing
- Average Approval Cycle
- Duplicate Prevention Rate

---

# Workflow

```text
Vendor Email
      │
      ▼
Email Intake Agent
      │
      ▼
Document Intelligence
      │
      ▼
OCR Engine
      │
      ▼
Structured Extraction
      │
      ▼
Financial Intelligence
      │
      ▼
Policy Engine
      │
      ▼
Decision Engine
      │
      ▼
Workflow Trace
      │
      ▼
Action & Notification
      │
      ▼
Dashboard
```

---

# Multi-Agent Architecture

- Email Intake Agent
- Document Intelligence Agent
- Financial Validation Agent
- Risk & Fraud Agent
- Decision Agent
- Notification Agent
- Dashboard Agent

Each agent owns a single responsibility, making the workflow modular, scalable, and explainable.

---

# Strategic Edge Cases

### Split Invoice Processing

Supports partial invoicing against a single Purchase Order while maintaining remaining balances.

### Fraudulent Velocity Detection

Detects high-frequency duplicate billing attempts even when invoice numbers differ.

### Bundled Line Items

Validates invoices lacking detailed breakdowns through financial reconciliation.

### Dynamic Price Variance

Automatically approves invoices within configurable tolerance thresholds while logging variances.

---

# Tech Stack

## Frontend

- Next.js
- React
- Tailwind CSS
- shadcn/ui

## Backend

- FastAPI
- Python

## AI

- Gemini
- Docling
- Vision Language Models

## Database

- SQLite / PostgreSQL

## Deployment

- Vercel
- Render

---

# Future Enhancements

- ERP Integrations (SAP, Oracle, NetSuite)
- Multi-language Invoice Support
- Multi-currency Reconciliation
- Vendor Portal
- Payment Prediction
- AI Spend Analytics
- Intelligent Approval Routing

---

# Why Zampify AI?

Unlike traditional OCR-based invoice automation systems, Zampify AI understands the entire Accounts Payable workflow—from vendor email to payment-ready decision. By combining AI-powered document understanding with deterministic financial validation and explainable decision-making, it enables finance teams to process invoices faster, reduce operational costs, and maintain complete auditability without sacrificing human oversight.

---

## License

MIT License

---

Built for the **Zamp AI Solutions Analyst Case Study**.

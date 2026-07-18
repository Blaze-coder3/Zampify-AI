# Zamp AI Solutions Analyst Case Study

## PS-1: Invoice Processing -- PDF to Decision

# Vision

Build an **AI Digital Accounts Payable (AP) Analyst** that autonomously
monitors a shared AP inbox, identifies vendor invoice emails, extracts
and validates invoice data, applies finance policies, detects anomalies,
collaborates with human reviewers when necessary, and produces fully
explainable decisions with an audit trail.

------------------------------------------------------------------------

# Objectives

-   Automate invoice processing from email to payment decision.
-   Reduce manual AP workload.
-   Ensure explainable and auditable decisions.
-   Support messy real-world invoices.
-   Handle realistic operational edge cases.
-   Provide dashboards, workflow replay, KPIs, and human-in-the-loop
    review.

------------------------------------------------------------------------

# End-to-End Workflow

``` text
Vendor Email
    ↓
Email Intake Agent
    ↓
Document Intelligence
    ↓
OCR Engine Selection
    ↓
Structured Extraction
    ↓
Financial Intelligence Engine
    ↓
Policy Engine
    ↓
Decision Engine
    ↓
Workflow Trace Engine
    ↓
Action & Notification Engine
    ↓
Dashboard + Audit Trail
```

## 1. Email Intake Agent

Responsibilities: - Monitor AP mailbox - Intent detection - Extract PDF
attachments - Validate attachment integrity - Handle: - Missing
attachment - Corrupted PDF - Wrong attachment type - Non-invoice emails

Outputs: - Valid invoice package - Error reason if invalid

------------------------------------------------------------------------

## 2. Document Intelligence

Adaptive pipeline:

Digital PDF → Docling

Scanned / Handwritten → Vision Language Model → OCR

Store OCR confidence.

Low confidence routes to human review.

------------------------------------------------------------------------

## 3. Structured Extraction

Extract:

Header - Invoice ID - Invoice Date - Vendor - Tax ID - Currency

Financial - Subtotal - Tax - Shipping - Grand Total

Line Items - Description - Quantity - Unit Price - Total

References - Purchase Order - Payment Terms

Every extracted field stores a confidence score.

------------------------------------------------------------------------

## 4. Financial Intelligence Engine

Modules

-   Vendor Validation
-   Purchase Order Retrieval
-   Three-Way Matching
-   Duplicate Detection
-   Fraud Detection
-   Tax Validation
-   Currency Validation
-   Payment Terms Validation
-   Dynamic Tolerance Rules

------------------------------------------------------------------------

## Policy Engine

Policies remain configurable instead of hardcoded.

Example

``` yaml
company_policy:
  tolerance_percentage: 2
  duplicate_window_days: 30
  ocr_confidence_threshold: 80
approval_limits:
  manager: 5000
```

------------------------------------------------------------------------

## Decision Engine

Outputs

Approved

Needs Human Review

Rejected

Also generates:

-   Confidence Score
-   Natural Language Explanation
-   Triggered Business Rules

------------------------------------------------------------------------

## Workflow Trace Engine

Every invoice records an execution timeline.

Example

-   Email Received
-   Attachment Found
-   OCR Complete
-   Extraction Complete
-   Vendor Verified
-   PO Matched
-   Duplicate Check
-   Three-Way Match
-   Decision Generated
-   Archived

Supports workflow replay.

------------------------------------------------------------------------

## Action & Notification Engine

Approved - Queue for payment - Archive invoice - Notify AP

Needs Review - Assign reviewer - Explain failed rules - Create review
task

Rejected - Draft vendor email - Archive decision - Log audit event

------------------------------------------------------------------------

## Human-in-the-Loop

Invoices requiring review appear in a priority queue with:

-   Reason
-   Confidence
-   Suggested Action
-   Invoice Preview
-   Validation Summary

------------------------------------------------------------------------

## Dashboard

Displays

-   Today's invoices
-   Approved
-   Pending review
-   Rejected
-   Processing time
-   OCR accuracy
-   Workflow progress
-   Run history
-   Invoice preview
-   Decision explanation

Finance KPIs

-   Days Payable Outstanding
-   Cost Per Invoice
-   Automation Rate
-   Average Approval Cycle
-   Straight Through Processing
-   Duplicate Detection Rate

------------------------------------------------------------------------

# Strategic Edge Cases

## 1. Split Invoice

Single PO billed across multiple invoices.

Decision: Approved (Partial Payment)

------------------------------------------------------------------------

## 2. Fraudulent Velocity

Multiple invoices with different IDs but same vendor, PO and amount.

Decision: Flagged for Review

------------------------------------------------------------------------

## 3. Bundled Line Items

Invoice lacks detailed breakdown.

Decision: Bottom-line financial validation.

------------------------------------------------------------------------

## 4. Dynamic Price Variance

Variance within policy threshold.

Decision: Approved with GL variance logging.

Additional possible cases

-   Unknown Vendor
-   Currency mismatch
-   Multiple PO references
-   Vendor naming variations
-   Missing invoice number
-   Low OCR confidence

------------------------------------------------------------------------

# Multi-Agent Architecture

-   Email Intake Agent
-   Document Intelligence Agent
-   Financial Validation Agent
-   Risk & Fraud Agent
-   Decision Agent
-   Notification Agent
-   Dashboard Agent

Each agent owns a single responsibility.

------------------------------------------------------------------------

# Core Business Rules

-   Vendor verification
-   Purchase Order lookup
-   Three-way matching
-   Duplicate detection
-   Dynamic tolerance
-   Fraud detection
-   Tax validation
-   Payment terms validation
-   Currency validation

------------------------------------------------------------------------

# Deliverables

-   Working end-to-end workflow
-   Live dashboard
-   Workflow execution view
-   Audit trail
-   Explainable decisions
-   Human review queue
-   KPI dashboard
-   Demo-ready happy path
-   Four strategic edge cases

------------------------------------------------------------------------

# Key Differentiators

-   Starts from email instead of file upload
-   Adaptive OCR pipeline
-   Explainable AI decisions
-   Configurable policy engine
-   Workflow trace and replay
-   Human-in-the-loop review
-   Enterprise AP dashboard
-   Real-world financial edge cases
-   End-to-end operational ownership

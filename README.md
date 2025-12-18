# 📄 SQL to PDF Report Generator

A **Node.js proof of concept** that generates a structured PDF report from **SQL Server data** using an HTML template and a headless browser.

This project demonstrates an end-to-end document generation pipeline commonly used in enterprise reporting, audit, and compliance systems.

---

## 🧠 Overview

The script follows a clear, multi-step process:

1. Connects to a **SQL Server** database
2. Fetches related data for a single entity (visit, observations, attendees)
3. Injects the data into a predefined **HTML template**
4. Uses **Puppeteer** to render the HTML
5. Exports the rendered content as an **A4 PDF document**

The project was created as an exploration of automated report generation rather than a production-ready service.

---

## 🎯 Purpose

This repository exists to explore:

* Server-side PDF generation
* Transforming relational data into structured documents
* Using HTML/CSS as a layout engine for PDFs
* Headless browser automation with Puppeteer
* Practical enterprise-style reporting patterns

---

## 🛠️ Built With

* **Node.js**
* **SQL Server** (`mssql`)
* **Puppeteer** (headless Chromium)
* **HTML / CSS** (for document layout)

---

## 📂 How It Works

### 1️⃣ Database Queries

The script queries multiple related tables to build up a complete data model for a single report:

* Visit metadata
* Observations linked to the visit
* Visitors and representatives

The example implementation uses a hardcoded `VisitID` as this was developed as a proof of concept.

---

### 2️⃣ HTML Templating

An HTML file (`template.html`) contains placeholder tokens (e.g. `{{siteName}}`, `{{observations}}`).

These placeholders are replaced at runtime with live data from the database, producing a complete HTML document ready for rendering.

---

### 3️⃣ PDF Generation

Puppeteer launches a headless Chromium instance to:

* Load the generated HTML
* Apply styles and page breaks
* Export the document as a PDF

This approach allows full control over layout using standard web technologies.

---

## 🚀 Running the Project

### Prerequisites

* Node.js (LTS recommended)
* Access to a SQL Server database

### Installation

```bash
git clone https://github.com/your-username/sql-to-pdf-report-generator.git
cd sql-to-pdf-report-generator
npm install
```

### Configuration

Update the SQL connection details in the script:

```js
const config = {
  user: '...',
  password: '...',
  server: '...',
  database: '...'
};
```

⚠️ **Do not commit database credentials to source control.**

---

### Run

```bash
node generatePDF.js
```

A PDF file will be generated in the project directory.

---

## 📌 Notes

* This is a **proof of concept**, not a production-ready service
* Error handling and validation are intentionally minimal
* Credentials and identifiers are hardcoded for demonstration purposes
* The commented source code is intended for learning and future reference

---

## 🛣️ Possible Enhancements

* Parameterise the Visit ID
* Replace string replacement with a templating engine
* Add PDF headers, footers, and page numbers
* Convert into an API or background job

---

⭐ A practical exploration of automated PDF generation using familiar web technologies.

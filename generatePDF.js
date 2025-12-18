/**
 * This script:
 * 1. Connects to a SQL Server database
 * 2. Fetches visit-related data (visit details, observations, people)
 * 3. Injects that data into an HTML template
 * 4. Uses Puppeteer to render the HTML and export it as a PDF
 *
 * Intended use:
 * - Server-side Node.js script
 * - Report generation / document automation
 */

const fs = require('fs');           // Used to read the HTML template from disk
const puppeteer = require('puppeteer'); // Used to render HTML and generate a PDF
const sql = require('mssql');       // SQL Server client for Node.js

/**
 * SQL Server connection configuration.
 * NOTE:
 * - Credentials are intentionally blank here
 * - Encrypt is enabled for Azure SQL
 */
const config = {
    user: '...',
    password: '...',
    server: '...',
    database: '...',
    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

/**
 * Self-invoking async function.
 * This allows use of async/await without exporting anything.
 */
(async () => {
    try {
        /**
         * -----------------------------
         * DATABASE CONNECTION
         * -----------------------------
         */
        await sql.connect(config);
        console.log("Connected to database!");

        /**
         * -----------------------------
         * FETCH VISIT METADATA
         * -----------------------------
         * Fetches high-level information about a single visit.
         * NOTE: VisitID is hardcoded (77) — this was likely a POC.
         */
        const visitResult = await sql.query(`
            SELECT ProjectTitle, ProjectOU, CreatedByName, CreatedOn
            FROM [EssvNew].[Visit]
            WHERE VisitID = 77
        `);

        // We expect exactly one visit record
        const visit = visitResult.recordset[0];

        /**
         * -----------------------------
         * FETCH OBSERVATIONS
         * -----------------------------
         * Each observation becomes its own section/page in the PDF.
         */
        const obsResult = await sql.query(`
            SELECT Type, Category, Title, Description, CreatedByName
            FROM [EssvNew].[Observation]
            WHERE VisitID = 77
        `);

        const observations = obsResult.recordset;

        /**
         * -----------------------------
         * FETCH VISITORS
         * -----------------------------
         * These are people who attended the visit.
         */
        const visitorResult = await sql.query(`
            SELECT VisitorName, VisitorTitle
            FROM [EssvNew].[Visitor]
            WHERE VisitID = 77
        `);

        const visitors = visitorResult.recordset;

        /**
         * -----------------------------
         * FETCH REPRESENTATIVES
         * -----------------------------
         * Likely site or client representatives.
         * NOTE: Data is fetched but not currently injected into the template.
         */
        const repResult = await sql.query(`
            SELECT RepName, RepTitle
            FROM [EssvNew].[Representative]
            WHERE VisitID = 77
        `);

        const representatives = repResult.recordset;

        /**
         * -----------------------------
         * LOAD HTML TEMPLATE
         * -----------------------------
         * This HTML file contains placeholder tokens like {{siteName}}.
         * These placeholders are replaced with live data below.
         */
        let htmlContent = fs.readFileSync('template.html', 'utf8');

        /**
         * -----------------------------
         * INSERT STATIC VISIT DATA
         * -----------------------------
         * Simple string replacement for single-value placeholders.
         */
        htmlContent = htmlContent
            .replaceAll('{{siteName}}', visit.ProjectTitle)
            .replace('{{date}}', new Date(visit.CreatedOn).toLocaleDateString())
            .replace('{{conductedBy}}', visit.CreatedByName)
            .replace('{{observationCount}}', observations.length);

        /**
         * -----------------------------
         * INSERT VISITOR LIST
         * -----------------------------
         * Builds HTML snippets for each visitor and injects them
         * into the template at {{visitors}}.
         */
        const visitorLines = visitors.map(visitor => `
            <h4>${visitor.VisitorName}</h4>
            <p>${visitor.VisitorTitle}</p>
        `).join('');

        htmlContent = htmlContent.replace('{{visitors}}', visitorLines);

        /**
         * -----------------------------
         * INSERT OBSERVATION PAGES
         * -----------------------------
         * Each observation:
         * - Starts on a new PDF page using a CSS page-break
         * - Displays structured observation details
         */
        const observationPages = observations.map((obs, index) => `
            <div class="page-break"></div>
            <div class="container">
                <h2>Observation ${index + 1}</h2>
                <p><strong>Category:</strong> ${obs.Type}</p>
                <p><strong>Details:</strong> ${obs.Category}</p>
                <p><strong>Title:</strong> ${obs.Title}</p>
                <p><strong>Description:</strong> ${obs.Description}</p>
                <p><strong>Created By:</strong> ${obs.CreatedByName}</p>
            </div>
        `).join('');

        htmlContent = htmlContent.replace('{{observations}}', observationPages);

        /**
         * -----------------------------
         * PDF GENERATION
         * -----------------------------
         * Puppeteer spins up a headless Chromium instance,
         * loads the generated HTML, and exports it as a PDF.
         */
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Load the HTML and wait until all resources are resolved
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        // Generate PDF in A4 format
        await page.pdf({
            path: 'report1.pdf',
            format: 'A4'
        });

        await browser.close();
        console.log("PDF Generated: report1.pdf");

    } catch (err) {
        /**
         * -----------------------------
         * ERROR HANDLING
         * -----------------------------
         * Catches database, template, or Puppeteer errors.
         */
        console.error("Error:", err);
    } finally {
        /**
         * -----------------------------
         * CLEANUP
         * -----------------------------
         * Always close SQL connection to avoid leaks.
         */
        sql.close();
    }
})();

// This file now only contains static reference data (Case Studies).
// Actual Question data has been moved to questions.json to act as a database.

export const CASE_STUDIES = {
  Contoso: `
# Case Study: Contoso, Ltd.

## Overview
Contoso, Ltd. is a US-based health supplements company. Contoso has two divisions named **Sales** and **Research**. The Sales division contains two departments named **Online Sales** and **Retail Sales**. The Research division assigns internally developed product lines to individual teams of researchers and analysts.

## Identity Environment
Contoso has a Microsoft Entra tenant named \`contoso.com\`. The tenant contains two groups named:
- \`ResearchReviewersGroup1\`
- \`ResearchReviewersGroup2\`

## Data Environment
Contoso has the following data environment:
- The **Sales division** uses a Microsoft Power BI Premium capacity.
- The semantic model of the Online Sales department includes a fact table named \`Orders\` that uses **import mode**. In the system of origin, the \`OrderID\` value represents the sequence in which orders are created.
- The **Research department** uses an on-premises third-party data warehousing product.
- Fabric is enabled for \`contoso.com\`.
- An Azure Data Lake Storage Gen2 storage account named \`storage1\` contains Research division data for a product line named \`Productline1\`. The data is in the **delta** format.
- A Data Lake Storage Gen2 storage account named \`storage2\` contains Research division data for a product line named \`Productline2\`. The data is in the **CSV** format.

## Planned Changes
Contoso plans to make the following changes:
- Enable support for Fabric in the Power BI Premium capacity used by the Sales division.
- Make all the data for the Sales division and the Research division available in Fabric.
- For the Research division, create two Fabric workspaces named \`Productline1ws\` and \`Productline2ws\`.
- In \`Productline1ws\`, create a lakehouse named \`Lakehouse1\`.
- In \`Lakehouse1\`, create a shortcut to \`storage1\` named \`ResearchProduct\`.

## Data Analytics Requirements
Contoso identifies the following data analytics requirements:
- All the workspaces for the Sales division and the Research division must support all Fabric experiences.
- The **Research division** workspaces must use a dedicated, on-demand capacity that has **per-minute billing**.
- The Research division workspaces must be grouped together logically to support OneLake data hub filtering based on the department name.
- For the Research division workspaces, the members of \`ResearchReviewersGroup1\` must be able to read lakehouse and warehouse data and shortcuts by using **SQL endpoints**.
- For the Research division workspaces, the members of \`ResearchReviewersGroup2\` must be able to read lakehouse data by using **Lakehouse explorer**.
- All the semantic models and reports for the Research division must use version control that supports branching.

## Data Preparation Requirements
Contoso identifies the following data preparation requirements:
- The Research division data for \`Productline2\` must be retrieved from \`Lakehouse1\` by using Fabric notebooks.
- All the Research division data in the lakehouses must be presented as **managed tables** in Lakehouse explorer.

## Semantic Model Requirements
Contoso identifies the following requirements for implementing and managing semantic models:
- The number of rows added to the \`Orders\` table during refreshes must be minimized.
- The semantic models in the Research division workspaces must use **Direct Lake** mode.

## General Requirements
Contoso identifies the following high-level requirements that must be considered for all solutions:
- Follow the principle of least privilege when applicable.
- Minimize implementation and maintenance effort when possible.
`,
  Litware: `
# Case Study: Litware, Inc.

## Overview
Litware, Inc. is a manufacturing company that has offices throughout North America. The analytics team at Litware contains data engineers, analytics engineers, data analysts, and data scientists.

## Existing Environment

### Fabric Environment
Litware has been using a Microsoft Power BI tenant for three years. Litware has NOT enabled any Fabric capacities and features.

### Available Data
Litware has data that must be analyzed as shown in the following table:

| Description | Original source | Total size |
| :--- | :--- | :--- |
| Customer data | CRM system | 50 MB |
| Product data | CRM system | 200 MB |
| Customer satisfaction surveys | SurveyMonkey | 500 GB |

The **Product data** contains a single table and the following columns:
- \`ProductID\` (Integer)
- \`ProductName\` (String)
- \`ProductCategory\` (String)
- \`ListPrice\` (Decimal)

The **customer satisfaction data** contains the following tables:
- Survey
- Question
- Response

For each survey submitted, the following occurs:
- One row is added to the Survey table.
- One row is added to the Response table for each question in the survey.

The Question table contains the text of each survey question. The third question in each survey response is an overall satisfaction score. Customers can submit a survey after each purchase.

## User Problems
- The analytics team has large volumes of data, some of which is semi-structured. The team wants to use Fabric to create a new data store.
- Product data is often classified into three pricing groups: high, medium, and low. This logic is implemented in several databases and semantic models, but the logic does NOT always match across implementations.

## Requirements

### Planned Changes
Litware plans to enable Fabric features in the existing tenant. The analytics team will create a new data store as a proof of concept (PoC). The remaining Litware users will only get access to the Fabric features once the PoC is complete. The PoC will be completed by using a Fabric trial capacity.

The following three workspaces will be created:
- **AnalyticsPOC**: Will contain the data store, semantic models, reports pipelines, dataflow, and notebooks used to populate the data store.
- **DataEngPOC**: Will contain all the pipelines, dataflows, and notebooks used to populate OneLake.
- **DataSciPOC**: Will contain all the notebooks and reports created by the data scientists.

The following will be created in the **AnalyticsPOC** workspace:
- A data store (type to be decided)
- A custom semantic model
- A default semantic model
- Interactive reports

The data engineers will create data pipelines to load data to OneLake either hourly or daily depending on the data source. The analytics engineers will create processes to ingest, transform, and load the data to the data store in the AnalyticsPOC workspace daily. Whenever possible, the data engineers will use low-code tools for data ingestion. The choice of which data cleansing and transformation tools to use will be at the data engineers’ discretion.

### Technical Requirements
The data store must support the following:
- Read access by using T-SQL or Python.
- Semi-structured and unstructured data.
- Row-level security (RLS) for users executing T-SQL queries.

**Files loaded by the data engineers to OneLake will be stored in the Parquet format and will meet Delta Lake specifications.**

Data will be loaded without transformation in one area of the AnalyticsPOC data store. The data will then be cleansed, merged, and transformed into a dimensional model.

The dimensional model must contain a date dimension. There is no existing data source for the date dimension. The Litware fiscal year matches the calendar year. The date dimension must always contain dates from 2010 through the end of the current year.

**Product Pricing Group Logic:**
The product pricing group logic must be maintained by the analytics engineers in a single location. The pricing group data must be made available in the data store for T-SQL queries and in the default semantic model.

The following logic must be used:
- List prices that are less than or equal to 50 are in the **low** pricing group.
- List prices that are greater than 50 and less than or equal to 1,000 are in the **medium** pricing group.
- List prices that are greater than 1,000 are in the **high** pricing group.

### Security Requirements
Only Fabric administrators and the analytics team must be able to see the Fabric items created as part of the PoC.

Litware identifies the following security requirements for the Fabric items in the AnalyticsPOC workspace:
- **Fabric administrators** will be the workspace administrators.
- **Data engineers** must be able to read from and write to the data store. No access must be granted to datasets or reports.
- **Analytics engineers** must be able to read from, write to, and create schemas in the data store. They also must be able to create and share semantic models with the data analysts and view and modify all reports in the workspace.
- **Data scientists** must be able to read from the data store, but not write to it. They will access the data by using a Spark notebook.
- **Data analysts** must have read access to only the dimensional model objects in the data store. They also must have access to create Power BI reports by using the semantic models created by the analytics engineers.
- The **date dimension** must be available to all users of the data store.
- The principle of least privilege must be followed.

### Report Requirements
The data analysts must create a customer satisfaction report that:
- Enables a user to select a product to filter customer survey responses to only those who have purchased that product.
- Displays the average overall satisfaction score of all the surveys submitted during the last 12 months up to a selected date.
- Shows data as soon as the data is updated in the data store.
- Ensures that the report and the semantic model only contain data from the current and previous year.
- Ensures that the report respects any table-level security specified in the source data store.
- Minimizes the execution time of report queries.
`
};
# DPW Digitization Workflow Automation

This repository contains Google Apps Script files and associated HTML templates designed to automate and streamline the Digitization Project Workflow (DPW) within Google Workspace (Google Sheets and Google Forms).

## Overview

The scripts and web apps in this project aim to reduce manual effort in data collection, processing, reporting, and visualization for the DPW. They provide tools for managing validator lists, processing validation submissions, calculating mapper performance, generating payment reports, and offering a real-time performance dashboard.

## Files

### `code.gs`

This Google Apps Script file is the core logic of the automation system. It includes functions for:

-   **Updating Validator Lists**: Automatically populates Google Form dropdowns with current validator names from a designated Google Sheet.
-   **Processing Form Submissions**: Handles data submitted through the validation form, logs it, calculates quality scores, and sends automated email notifications for any data entry errors (e.g., unrecognized mapper usernames or validator names).
-   **Calculating Daily Performance Summaries**: Aggregates daily validation data to calculate individual mapper performance, including total buildings digitized, average quality scores, and payment calculations based on predefined targets and bonuses.
-   **Generating Payment Reports**: Creates a custom menu in the Google Sheet to allow users to select a date range and generate a CSV report of mapper payments, saved directly to Google Drive.
-   **Serving Dashboard Data**: Provides the backend data for the `Dashboard.html` web application, dynamically fetching and structuring performance metrics from Google Sheets.

### `DateRangeDialog.html`

This HTML file serves as a simple user interface for selecting a start and end date. It is displayed as a modal dialog within the Google Sheet environment (triggered by `code.gs`) to facilitate the generation of payment reports for a specific period.

### `Dashboard.html`

This HTML file functions as a dynamic web-based dashboard for visualizing DPW performance. It leverages Google Charts to display key metrics, including:

-   **Buildings Digitized Over Time**: A column chart showing daily or cumulative digitization progress.
-   **Contribution by Settlement**: A pie chart illustrating the distribution of work across different geographical settlements.
-   **Overall Average Quality**: A gauge chart indicating the average quality score across all validations.
-   **Performance Leaderboard**: A table ranking mappers based on their contributions.

The dashboard fetches its data in real-time from the `getDashboardData()` function within `code.gs`, providing up-to-date insights into the project's status.

## Setup and Usage

To use these scripts, they typically need to be deployed as a Google Apps Script project bound to a Google Sheet. The `code.gs` file would be the primary script, and `DateRangeDialog.html` and `Dashboard.html` would be HTML service files within the same project.

1.  **Google Sheet Structure**: Ensure your Google Sheet contains the following sheets with appropriate data:
    -   `Official_Participant_List`: Contains details of mappers and validators, including UserIDs, FullNames, OSM Usernames, and Roles (e.g., 'Validator').
    -   `Validation_Log`: Stores detailed records of each validation submission.
    -   `Daily_Performance_Summary`: Stores aggregated daily performance metrics for mappers.
2.  **Google Form**: A Google Form linked to the Google Sheet is required for submitting validation data. Ensure it collects email addresses and has questions for "Validator's Full Name", "Mapper's OSM Username", "Task ID", and other relevant validation metrics.
3.  **Deployment**: Deploy `code.gs` as a script project. `DateRangeDialog.html` and `Dashboard.html` should be added as HTML files within the Apps Script project.
4.  **Triggers**: Set up an `onFormSubmit` trigger for the `onFormSubmit` function in `code.gs` to run automatically when the Google Form is submitted. A time-driven trigger can be set for `calculateDailySummaries` to run daily.
5.  **Accessing the Dashboard**: Deploy `Dashboard.html` as a web app (via `doGet` function in `code.gs`) to get a URL for accessing the performance dashboard.
6.  **Payment Report**: Access the "DPW Admin Tools" custom menu in the Google Sheet to generate payment reports.

## Contribution

For any issues or suggestions, please refer to the project's issue tracker or contact the maintainers.
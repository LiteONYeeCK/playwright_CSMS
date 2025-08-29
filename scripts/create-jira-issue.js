// Node script executed only on test failure
const axios = require('axios');
const fs = require('fs');

const JIRA_BASE = process.env.JIRA_BASE_URL;
const EMAIL = process.env.JIRA_USER_EMAIL;
const TOKEN = process.env.JIRA_API_TOKEN;
const PROJECT = process.env.JIRA_PROJECT;
const RUN_URL = process.env.REPORT_URL;

async function main() {
  // 1. Create Jira Task
  const body = {
    fields: {
      project: { key: PROJECT },
      summary: `Playwright tests failed (${new Date().toISOString()})`,
      description: `See GitHub run: ${RUN_URL}`,
      issuetype: { name: 'Task' },
      priority: { name: 'High' },
      labels: ['automation', 'playwright'],
      assignee: { emailAddress: 'liteonsgyeeck@gmail.com' } // change if needed
    }
  };

  const res = await axios.post(
    `${JIRA_BASE}/rest/api/3/issue`,
    body,
    {
      auth: { username: EMAIL, password: TOKEN },
      headers: { 'Content-Type': 'application/json' }
    }
  );
  const key = res.data.key;
  console.log(`Jira issue created: ${key}`);

  // 2. Write CSV with same fields
  const csv = `Summary,Description,Status,Assignee,Reporter,Priority,Labels,Due date,Time tracking,Start date,Category,Team
"Playwright tests failed (${new Date().toISOString()})","See GitHub run: ${RUN_URL}","To Do","automation@company.com","automation@company.com","High","automation;playwright",,,,,""
`;
  fs.writeFileSync('jira-task.csv', csv);
  console.log('CSV exported: jira-task.csv');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
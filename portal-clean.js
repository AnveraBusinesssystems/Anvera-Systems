(() => {
  const empty = (title, text) => `<div class="empty-state"><strong>${title}</strong><span>${text}</span></div>`;

  document.querySelectorAll('.preview strong').forEach((el) => { el.textContent = '0'; });
  document.querySelectorAll('#adminNav b, #clientNav b').forEach((el) => el.remove());

  const overview = document.querySelector('#overview');
  if (overview) {
    overview.innerHTML = `
      <div class="welcome"><div><h3>Welcome to your Anvera workspace.</h3><p>Your inquiries, projects, payments, support requests, and calendar will appear here once connected.</p></div><span class="chip">No activity yet</span></div>
      <div class="metrics">
        <article class="card"><span>Active projects</span><strong>0</strong><small>No active projects</small></article>
        <article class="card"><span>Open inquiries</span><strong>0</strong><small>No new inquiries</small></article>
        <article class="card"><span>Outstanding</span><strong>$0</strong><small>No unpaid balances</small></article>
        <article class="card"><span>Monthly recurring</span><strong>$0</strong><small>No active subscriptions</small></article>
      </div>
      <div class="grid"><article class="panel"><span class="eye">Project pipeline</span><h3>Current workload</h3>${empty('No projects yet','Accepted clients and project stages will appear here.')}</article><article class="panel"><span class="eye">Calendar</span><h3>Upcoming schedule</h3>${empty('Nothing scheduled','Meetings, deadlines, and payment dates will appear here.')}</article></div>
      <div class="grid equal"><article class="panel"><span class="eye">New business</span><h3>Recent inquiries</h3>${empty('No inquiries yet','Website inquiries and manually entered leads will appear here.')}</article><article class="panel"><span class="eye">Accounts receivable</span><h3>Upcoming payments</h3>${empty('No payments due','Upcoming and overdue balances will appear here.')}</article></div>`;
  }

  const inquiries = document.querySelector('#inquiries');
  if (inquiries) inquiries.innerHTML = '<div class="head"><div><span class="eye">Lead management</span><h3>Inquiries</h3><p>Review requests, schedule meetings, and convert accepted proposals.</p></div><button class="action">+ Add inquiry</button></div>' + empty('No inquiries yet','New website inquiries and manually added leads will appear here.');

  const projects = document.querySelector('#projects');
  if (projects) projects.innerHTML = '<div class="head"><div><span class="eye">Delivery</span><h3>Projects</h3><p>Set timelines manually and update customer-visible progress.</p></div><button class="action">+ New project</button></div>' + empty('No projects yet','Accepted proposals will become projects here.');

  const finances = document.querySelector('#finances');
  if (finances) finances.innerHTML = `<div class="head"><div><span class="eye">Financial tracking</span><h3>Payments & subscriptions</h3><p>Record payments manually and monitor due, paid, and overdue balances.</p></div><button class="action">+ Record payment</button></div><div class="metrics"><article class="card"><span>Collected this month</span><strong>$0</strong><small>No payments recorded</small></article><article class="card"><span>Outstanding</span><strong>$0</strong><small>No open balances</small></article><article class="card"><span>Overdue</span><strong>$0</strong><small>No overdue payments</small></article><article class="card"><span>Monthly recurring</span><strong>$0</strong><small>No subscriptions</small></article></div>${empty('No financial records yet','Invoices, payments, and subscriptions will appear here.')}`;

  const support = document.querySelector('#support');
  if (support) support.innerHTML = '<div class="head"><div><span class="eye">Client assistance</span><h3>Support requests</h3><p>Website problems, data issues, updates, and maintenance needs.</p></div><button class="action">+ Add ticket</button></div>' + empty('No support requests','Client assistance requests will appear here.');

  const clientHome = document.querySelector('#clientHome');
  if (clientHome) clientHome.innerHTML = '<div class="clientHero"><div><span class="eye">Client portal</span><h3>No project has been assigned yet.</h3><p>Once a project is created and connected to this customer account, progress will appear here.</p></div><span class="status warn">Not started</span></div>' + empty('No active project','Project progress, updates, upcoming milestones, and customer actions will appear here.');

  const timeline = document.querySelector('#timeline');
  if (timeline) timeline.innerHTML = '<div class="head"><div><span class="eye">Project plan</span><h3>Timeline</h3><p>Planned and actual progress across four stages.</p></div></div>' + empty('No timeline yet','Research, planning, creating, and implementing dates will appear here.');

  const files = document.querySelector('#files');
  if (files) files.innerHTML = '<div class="head"><div><span class="eye">Documents</span><h3>Project files</h3><p>Scope, invoices, deliverables, and shared files.</p></div><button class="action">Upload file</button></div>' + empty('No files yet','Project scope documents, invoices, and deliverables will appear here.');

  const payments = document.querySelector('#payments');
  if (payments) payments.innerHTML = `<div class="head"><div><span class="eye">Billing</span><h3>Payments</h3><p>Project payment schedules and monthly service plans.</p></div></div><div class="metrics"><article class="card"><span>Project value</span><strong>$0</strong><small>No project assigned</small></article><article class="card"><span>Paid</span><strong>$0</strong><small>No payments recorded</small></article><article class="card"><span>Remaining</span><strong>$0</strong><small>No balance due</small></article><article class="card"><span>Monthly plan</span><strong>$0</strong><small>No active plan</small></article></div>${empty('No payment schedule','Invoices and payment milestones will appear here.')}`;

  const help = document.querySelector('#help');
  if (help) help.innerHTML = `<div class="head"><div><span class="eye">Assistance</span><h3>Request help</h3><p>Report a problem, request an update, or ask for assistance.</p></div></div><div class="support"><form class="panel"><label>Request type</label><select><option>Website or system error</option><option>Data issue</option><option>Content update</option><option>New feature request</option></select><label>Priority</label><select><option>Normal</option><option>High — blocking work</option><option>Low — future update</option></select><label>Describe the request</label><textarea rows="7" placeholder="Tell us what happened and what you expected..."></textarea><button type="button" class="action" style="margin-top:15px;width:100%">Submit support request</button></form><article class="panel"><span class="eye">Open requests</span><h3>Support history</h3>${empty('No open requests','Submitted support requests will appear here.')}</article></div>`;

  const userName = document.querySelector('#userName');
  const userRole = document.querySelector('#userRole');
  const avatar = document.querySelector('#avatar');
  if (userName) userName.textContent = 'Portal User';
  if (userRole) userRole.textContent = 'Account not connected';
  if (avatar) avatar.textContent = 'AU';
})();
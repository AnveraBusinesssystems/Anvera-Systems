(() => {
  const STORE = 'anveraPortalPrototype';
  const data = JSON.parse(localStorage.getItem(STORE) || '{"inquiries":[],"projects":[],"payments":[],"tickets":[],"files":[]}');
  const save = () => localStorage.setItem(STORE, JSON.stringify(data));
  const esc = (value = '') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const money = value => Number(value || 0).toLocaleString('en-US', {style:'currency', currency:'USD'});
  const empty = (title, text) => `<div class="empty-state"><strong>${title}</strong><span>${text}</span></div>`;

  const style = document.createElement('style');
  style.textContent = `
    .modal-backdrop{position:fixed;inset:0;background:rgba(15,24,15,.58);backdrop-filter:blur(5px);z-index:1000;display:none;align-items:center;justify-content:center;padding:22px}
    .modal-backdrop.open{display:flex}.modal-card{width:min(720px,100%);max-height:92vh;overflow:auto;background:#f7f4ee;border-radius:22px;box-shadow:0 30px 90px rgba(0,0,0,.3);padding:28px}
    .modal-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:22px}.modal-head h3{font:600 36px 'Cormorant Garamond';margin-top:5px}.modal-head p{font-size:14px;color:#756f63;margin-top:5px;line-height:1.5}
    .modal-close{width:40px;height:40px;border:1px solid rgba(30,46,30,.14);background:#fff;border-radius:10px;font-size:22px;cursor:pointer}
    .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.form-field.full{grid-column:1/-1}.form-field label{display:block;font-size:14px;font-weight:700;margin-bottom:7px}
    .form-field input,.form-field select,.form-field textarea{width:100%;padding:14px 15px;border:1px solid rgba(30,46,30,.15);border-radius:11px;background:#fff;font-size:15px;outline:none}.form-field textarea{resize:vertical;min-height:100px}.form-field input:focus,.form-field select:focus,.form-field textarea:focus{border-color:#a88a44}
    .type-help{font-size:11px;color:#756f63;line-height:1.55;margin-top:7px}.modal-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:23px;padding-top:18px;border-top:1px solid rgba(30,46,30,.1)}
    .btn-quiet{border:1px solid rgba(30,46,30,.14);background:#fff;color:#1a1a18;border-radius:11px;padding:13px 18px;font-size:14px;font-weight:700;cursor:pointer}.row-action{border:0;background:#1e2e1e;color:#fff;border-radius:8px;padding:8px 10px;font-size:11px;font-weight:700;cursor:pointer}
    .toast{position:fixed;right:24px;bottom:24px;background:#1e2e1e;color:#fff;padding:14px 18px;border-radius:12px;z-index:1200;box-shadow:0 15px 40px rgba(0,0,0,.22);font-size:13px;opacity:0;transform:translateY(15px);transition:.2s}.toast.show{opacity:1;transform:none}
    @media(max-width:650px){.form-grid{grid-template-columns:1fr}.form-field.full{grid-column:auto}.modal-card{padding:21px}.modal-head h3{font-size:31px}}
  `;
  document.head.appendChild(style);

  document.body.insertAdjacentHTML('beforeend', `
    <div id="portalModal" class="modal-backdrop" aria-hidden="true"><div class="modal-card" role="dialog" aria-modal="true"><div class="modal-head"><div><span id="modalEye" class="eye"></span><h3 id="modalTitle"></h3><p id="modalDesc"></p></div><button id="modalClose" class="modal-close" aria-label="Close">×</button></div><form id="modalForm"><div id="modalFields" class="form-grid"></div><div class="modal-actions"><button type="button" id="modalCancel" class="btn-quiet">Cancel</button><button type="submit" id="modalSave" class="action">Save</button></div></form></div></div><div id="portalToast" class="toast"></div>`);

  const modal = document.querySelector('#portalModal');
  const modalForm = document.querySelector('#modalForm');
  let modalMode = '';
  let modalContext = null;
  const field = (name, label, type='text', options='', full=false, required=true, placeholder='') => {
    if (type === 'textarea') return `<div class="form-field ${full?'full':''}"><label>${label}</label><textarea name="${name}" ${required?'required':''} placeholder="${placeholder}"></textarea></div>`;
    if (type === 'select') return `<div class="form-field ${full?'full':''}"><label>${label}</label><select name="${name}" ${required?'required':''}>${options}</select></div>`;
    return `<div class="form-field ${full?'full':''}"><label>${label}</label><input name="${name}" type="${type}" ${required?'required':''} placeholder="${placeholder}"></div>`;
  };
  const option = (value, label=value) => `<option value="${value}">${label}</option>`;
  const showToast = text => { const toast=document.querySelector('#portalToast'); toast.textContent=text; toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'),2400); };
  const closeModal = () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); modalForm.reset(); modalMode=''; modalContext=null; };
  const openModal = (mode, config, context=null) => {
    modalMode=mode; modalContext=context;
    document.querySelector('#modalEye').textContent=config.eye;
    document.querySelector('#modalTitle').textContent=config.title;
    document.querySelector('#modalDesc').textContent=config.desc;
    document.querySelector('#modalFields').innerHTML=config.fields;
    document.querySelector('#modalSave').textContent=config.save || 'Save';
    modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
    setTimeout(()=>modal.querySelector('input,select,textarea')?.focus(),50);
  };

  const inquiryConfig = {
    eye:'Lead management', title:'Add a new inquiry', desc:'Capture a website lead or manually enter someone who contacted Anvera.', save:'Save inquiry',
    fields:
      field('name','Contact name') + field('business','Business name') +
      field('phone','Phone number','tel','',false,false,'(956) 000-0000') + field('email','Email','email') +
      field('projectType','Project type','select', option('TYPE 1 — Website only') + option('TYPE 2 — Website + backend monitoring') + option('TYPE 3 — Website + backend + forecasting / advanced calculations')) +
      field('source','Inquiry source','select', option('Website form')+option('Phone call')+option('Email')+option('Referral')+option('Social media')+option('Manually added')) +
      `<div class="form-field full"><div class="type-help"><strong>Type 1:</strong> public-facing website. <strong>Type 2:</strong> website plus database, dashboards, tracking, or monitoring. <strong>Type 3:</strong> full backend system with forecasting, advanced calculations, or decision models.</div></div>` +
      field('description','What does the customer need?','textarea','',true,true,'Describe the problem, requested features, and business goal...') +
      field('status','Initial status','select', option('New')+option('Reviewing')+option('Meeting scheduled')) + field('followUp','Follow-up date','date','',false,false)
  };
  const projectConfig = {
    eye:'Project delivery', title:'Create a project', desc:'Create the project and manually define the duration of each delivery stage.', save:'Create project',
    fields:
      field('client','Client or business') + field('projectName','Project name') +
      field('projectType','Project type','select',option('TYPE 1 — Website only')+option('TYPE 2 — Website + backend monitoring')+option('TYPE 3 — Website + backend + forecasting / advanced calculations')) + field('startDate','Planned start','date') +
      field('researchDays','Research days','number','',false,true,'5') + field('planningDays','Planning days','number','',false,true,'7') +
      field('creatingDays','Creating days','number','',false,true,'20') + field('implementingDays','Implementing days','number','',false,true,'7') +
      field('value','Project value','number','',false,false,'0') + field('deposit','Deposit received','number','',false,false,'0') +
      field('notes','Scope summary','textarea','',true,false,'Main pages, dashboards, integrations, deliverables...')
  };
  const paymentConfig = {
    eye:'Financial tracking', title:'Record a payment', desc:'Add an invoice, payment received, upcoming milestone, or monthly subscription charge.', save:'Save payment',
    fields:
      field('client','Client or business') + field('amount','Amount','number') +
      field('type','Payment type','select',option('Project deposit')+option('Project milestone')+option('Final payment')+option('Monthly subscription')+option('Additional work')) +
      field('status','Status','select',option('Paid')+option('Upcoming')+option('Due')+option('Partially paid')+option('Overdue')) +
      field('dueDate','Due date','date','',false,false) + field('paidDate','Date received','date','',false,false) +
      field('invoice','Invoice number','text','',false,false,'INV-0001') + field('method','Payment method','select',option('Bank transfer')+option('Card')+option('Check')+option('Cash')+option('Other'),false,false)
  };
  const ticketConfig = {
    eye:'Client assistance', title:'Add a support request', desc:'Log a customer issue, maintenance request, update, or website problem.', save:'Create ticket',
    fields:
      field('client','Client or business') + field('category','Request type','select',option('Website or system error')+option('Data issue')+option('Content update')+option('New feature')+option('Login problem')+option('Training request')) +
      field('priority','Priority','select',option('Normal')+option('High')+option('Low')) + field('status','Status','select',option('New')+option('Reviewing')+option('In progress')+option('Waiting on customer')+option('Resolved')) +
      field('description','Request details','textarea','',true,true,'Explain what happened and what the customer needs...')
  };
  const fileConfig = {
    eye:'Documents', title:'Add a project file', desc:'For this prototype, the file name and category are stored locally. Real uploads will be connected later.', save:'Add file',
    fields:
      field('client','Client or project') + field('title','File title') +
      field('category','File category','select',option('Project scope')+option('Proposal')+option('Invoice')+option('Contract')+option('Customer upload')+option('Deliverable')) +
      field('fileName','File name','text','',false,true,'project-scope.pdf') + field('notes','Notes','textarea','',true,false,'Optional description...')
  };
  const meetingConfig = {
    eye:'Inquiry follow-up', title:'Schedule a meeting', desc:'Choose a date and meeting method. Email and calendar automation will be connected later.', save:'Schedule meeting',
    fields:
      field('date','Meeting date','date') + field('time','Meeting time','time') +
      field('method','Meeting method','select',option('Google Meet')+option('Zoom')+option('Phone call')+option('In person')) + field('location','Meeting link or location','text','',false,false) +
      field('notes','Preparation notes','textarea','',true,false,'Questions to ask, documents needed, or meeting goals...')
  };

  document.querySelector('#modalClose').onclick = closeModal;
  document.querySelector('#modalCancel').onclick = closeModal;
  modal.addEventListener('click', e => { if(e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });

  const rows = form => Object.fromEntries(new FormData(form).entries());
  modalForm.addEventListener('submit', e => {
    e.preventDefault();
    const values = rows(modalForm);
    const now = new Date().toISOString();
    if (modalMode === 'inquiry') data.inquiries.unshift({...values,id:crypto.randomUUID(),createdAt:now});
    if (modalMode === 'project') data.projects.unshift({...values,id:crypto.randomUUID(),createdAt:now,status:'Not started',progress:0});
    if (modalMode === 'payment') data.payments.unshift({...values,id:crypto.randomUUID(),createdAt:now});
    if (modalMode === 'ticket') data.tickets.unshift({...values,id:crypto.randomUUID(),createdAt:now});
    if (modalMode === 'file') data.files.unshift({...values,id:crypto.randomUUID(),createdAt:now});
    if (modalMode === 'meeting' && modalContext) {
      const inquiry = data.inquiries.find(x => x.id === modalContext);
      if (inquiry) Object.assign(inquiry,{meeting:values,status:'Meeting scheduled'});
    }
    save(); closeModal(); renderAll(); showToast('Saved successfully');
  });

  const table = (headers, body) => `<div class="tableWrap"><table><thead><tr>${headers.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></div>`;
  const badge = value => `<span class="status ${/overdue|high|new/i.test(value)?'bad':/upcoming|reviewing|waiting|scheduled|due/i.test(value)?'warn':'ok'}">${esc(value)}</span>`;

  function renderOverview(){
    const outstanding = data.payments.filter(x=>x.status!=='Paid').reduce((s,x)=>s+Number(x.amount||0),0);
    const recurring = data.payments.filter(x=>x.type==='Monthly subscription' && x.status!=='Overdue').reduce((s,x)=>s+Number(x.amount||0),0);
    const overview=document.querySelector('#overview'); if(!overview)return;
    overview.innerHTML=`<div class="welcome"><div><h3>Welcome to your Anvera workspace.</h3><p>Your live operational overview updates as you add inquiries, projects, payments, and support requests.</p></div><span class="chip">${data.inquiries.length+data.projects.length+data.tickets.length} records</span></div><div class="metrics"><article class="card"><span>Active projects</span><strong>${data.projects.length}</strong><small>${data.projects.length?'Project records':'No active projects'}</small></article><article class="card"><span>Open inquiries</span><strong>${data.inquiries.length}</strong><small>${data.inquiries.length?'Require review':'No new inquiries'}</small></article><article class="card"><span>Outstanding</span><strong>${money(outstanding)}</strong><small>${outstanding?'Open balances':'No unpaid balances'}</small></article><article class="card"><span>Monthly recurring</span><strong>${money(recurring)}</strong><small>${recurring?'Subscription charges':'No active subscriptions'}</small></article></div><div class="grid"><article class="panel"><span class="eye">Project pipeline</span><h3>Current workload</h3>${data.projects.length?`<div class="list">${data.projects.slice(0,4).map(x=>`<div><span class="dot"></span><p><strong>${esc(x.projectName)}</strong><small>${esc(x.client)} · ${esc(x.projectType)}</small></p>${badge(x.status)}</div>`).join('')}</div>`:empty('No projects yet','Accepted clients and project stages will appear here.')}</article><article class="panel"><span class="eye">Attention needed</span><h3>Open work</h3>${data.inquiries.length||data.tickets.length?`<div class="list"><div><span class="dot"></span><p><strong>${data.inquiries.length} inquiries</strong><small>Review and schedule follow-ups</small></p></div><div><span class="dot"></span><p><strong>${data.tickets.length} support requests</strong><small>Customer assistance queue</small></p></div></div>`:empty('Nothing needs attention','New inquiries and support requests will appear here.')}</article></div>`;
  }
  function renderInquiries(){
    const el=document.querySelector('#inquiries'); if(!el)return;
    const body=data.inquiries.map(x=>`<tr><td><strong>${esc(x.business||x.name)}</strong><small>${esc(x.name)}</small></td><td>${esc(x.phone||'—')}<small>${esc(x.email||'')}</small></td><td>${esc(x.projectType)}</td><td>${badge(x.status)}</td><td><button class="row-action" data-meeting="${x.id}">${x.meeting?'Edit meeting':'Schedule meeting'}</button></td></tr>`).join('');
    el.innerHTML='<div class="head"><div><span class="eye">Lead management</span><h3>Inquiries</h3><p>Review requests, schedule meetings, and convert accepted proposals.</p></div><button class="action" data-open="inquiry">+ Add inquiry</button></div>'+(body?table(['Business','Contact','Project type','Status','Action'],body):empty('No inquiries yet','New website inquiries and manually added leads will appear here.'));
  }
  function renderProjects(){
    const el=document.querySelector('#projects'); if(!el)return;
    el.innerHTML='<div class="head"><div><span class="eye">Delivery</span><h3>Projects</h3><p>Set timelines manually and update customer-visible progress.</p></div><button class="action" data-open="project">+ New project</button></div>'+(data.projects.length?`<div class="projects">${data.projects.map(x=>`<article class="project">${badge(x.status)}<h4>${esc(x.projectName)}</h4><p>${esc(x.client)} · ${esc(x.projectType)}</p><div class="stages"><span class="now">Research</span><span>Planning</span><span>Creating</span><span>Implementing</span></div><div class="meta"><span><small>Start</small><strong>${esc(x.startDate)}</strong></span><span><small>Timeline</small><strong>${Number(x.researchDays||0)+Number(x.planningDays||0)+Number(x.creatingDays||0)+Number(x.implementingDays||0)} days</strong></span><span><small>Value</small><strong>${money(x.value)}</strong></span></div></article>`).join('')}</div>`:empty('No projects yet','Accepted proposals will become projects here.'));
  }
  function renderFinances(){
    const el=document.querySelector('#finances'); if(!el)return;
    const collected=data.payments.filter(x=>x.status==='Paid').reduce((s,x)=>s+Number(x.amount||0),0), outstanding=data.payments.filter(x=>x.status!=='Paid').reduce((s,x)=>s+Number(x.amount||0),0), overdue=data.payments.filter(x=>x.status==='Overdue').reduce((s,x)=>s+Number(x.amount||0),0), recurring=data.payments.filter(x=>x.type==='Monthly subscription').reduce((s,x)=>s+Number(x.amount||0),0);
    const body=data.payments.map(x=>`<tr><td><strong>${esc(x.client)}</strong><small>${esc(x.invoice||'No invoice')}</small></td><td>${esc(x.type)}</td><td>${money(x.amount)}</td><td>${esc(x.dueDate||x.paidDate||'—')}</td><td>${badge(x.status)}</td></tr>`).join('');
    el.innerHTML=`<div class="head"><div><span class="eye">Financial tracking</span><h3>Payments & subscriptions</h3><p>Record payments manually and monitor due, paid, and overdue balances.</p></div><button class="action" data-open="payment">+ Record payment</button></div><div class="metrics"><article class="card"><span>Collected</span><strong>${money(collected)}</strong><small>Paid records</small></article><article class="card"><span>Outstanding</span><strong>${money(outstanding)}</strong><small>Open balances</small></article><article class="card"><span>Overdue</span><strong>${money(overdue)}</strong><small>Late balances</small></article><article class="card"><span>Monthly recurring</span><strong>${money(recurring)}</strong><small>Subscription records</small></article></div>${body?table(['Client','Type','Amount','Date','Status'],body):empty('No financial records yet','Invoices, payments, and subscriptions will appear here.')}`;
  }
  function renderSupport(){
    const el=document.querySelector('#support'); if(!el)return;
    const body=data.tickets.map((x,i)=>`<tr><td>#AN-${String(i+1).padStart(4,'0')}</td><td>${esc(x.client)}</td><td>${esc(x.category)}<small>${esc(x.description)}</small></td><td>${badge(x.priority)}</td><td>${badge(x.status)}</td></tr>`).join('');
    el.innerHTML='<div class="head"><div><span class="eye">Client assistance</span><h3>Support requests</h3><p>Website problems, data issues, updates, and maintenance needs.</p></div><button class="action" data-open="ticket">+ Add ticket</button></div>'+(body?table(['Ticket','Client','Request','Priority','Status'],body):empty('No support requests','Client assistance requests will appear here.'));
  }
  function renderFiles(){
    const el=document.querySelector('#files'); if(!el)return;
    el.innerHTML='<div class="head"><div><span class="eye">Documents</span><h3>Project files</h3><p>Scope, invoices, deliverables, and shared files.</p></div><button class="action" data-open="file">Upload file</button></div>'+(data.files.length?`<div class="files">${data.files.map(x=>`<article class="file"><span class="fileIcon">FILE</span><div><strong>${esc(x.title)}</strong><small>${esc(x.client)} · ${esc(x.category)} · ${esc(x.fileName)}</small></div><button>View</button></article>`).join('')}</div>`:empty('No files yet','Project scope documents, invoices, and deliverables will appear here.'));
  }
  function renderClient(){
    const home=document.querySelector('#clientHome'), timeline=document.querySelector('#timeline'), payments=document.querySelector('#payments'), help=document.querySelector('#help');
    if(home) home.innerHTML='<div class="clientHero"><div><span class="eye">Client portal</span><h3>No project has been assigned yet.</h3><p>Once a project is connected to this customer account, progress will appear here.</p></div><span class="status warn">Not started</span></div>'+empty('No active project','Project progress, updates, milestones, and customer actions will appear here.');
    if(timeline) timeline.innerHTML='<div class="head"><div><span class="eye">Project plan</span><h3>Timeline</h3><p>Planned and actual progress across four stages.</p></div></div>'+empty('No timeline yet','Research, planning, creating, and implementing dates will appear here.');
    if(payments) payments.innerHTML='<div class="head"><div><span class="eye">Billing</span><h3>Payments</h3><p>Project payment schedules and monthly service plans.</p></div></div><div class="metrics"><article class="card"><span>Project value</span><strong>$0</strong><small>No project assigned</small></article><article class="card"><span>Paid</span><strong>$0</strong><small>No payments recorded</small></article><article class="card"><span>Remaining</span><strong>$0</strong><small>No balance due</small></article><article class="card"><span>Monthly plan</span><strong>$0</strong><small>No active plan</small></article></div>'+empty('No payment schedule','Invoices and payment milestones will appear here.');
    if(help) help.innerHTML=`<div class="head"><div><span class="eye">Assistance</span><h3>Request help</h3><p>Report a problem, request an update, or ask for assistance.</p></div></div><div class="support"><form id="customerSupportForm" class="panel"><label>Request type</label><select name="category"><option>Website or system error</option><option>Data issue</option><option>Content update</option><option>New feature request</option></select><label>Priority</label><select name="priority"><option>Normal</option><option>High</option><option>Low</option></select><label>Describe the request</label><textarea name="description" rows="7" required placeholder="Tell us what happened and what you expected..."></textarea><button class="action" style="margin-top:15px;width:100%">Submit support request</button></form><article class="panel"><span class="eye">Open requests</span><h3>Support history</h3>${empty('No open requests','Submitted support requests will appear here.')}</article></div>`;
  }
  function renderAll(){ renderOverview(); renderInquiries(); renderProjects(); renderFinances(); renderSupport(); renderFiles(); renderClient(); }

  document.addEventListener('click', e => {
    const trigger=e.target.closest('[data-open]');
    if(trigger){ const mode=trigger.dataset.open; openModal(mode,{inquiry:inquiryConfig,project:projectConfig,payment:paymentConfig,ticket:ticketConfig,file:fileConfig}[mode]); }
    const meeting=e.target.closest('[data-meeting]'); if(meeting) openModal('meeting',meetingConfig,meeting.dataset.meeting);
  });
  document.addEventListener('submit', e => {
    if(e.target.id!=='customerSupportForm') return;
    e.preventDefault(); const values=rows(e.target); data.tickets.unshift({...values,client:'Customer portal',status:'New',id:crypto.randomUUID(),createdAt:new Date().toISOString()}); save(); e.target.reset(); renderAll(); showToast('Support request submitted');
  });

  document.querySelectorAll('.preview strong').forEach(el=>el.textContent='0');
  document.querySelectorAll('#adminNav b,#clientNav b').forEach(el=>el.remove());
  const userName=document.querySelector('#userName'),userRole=document.querySelector('#userRole'),avatar=document.querySelector('#avatar');
  if(userName)userName.textContent='Portal User'; if(userRole)userRole.textContent='Prototype account'; if(avatar)avatar.textContent='AU';
  renderAll();
})();
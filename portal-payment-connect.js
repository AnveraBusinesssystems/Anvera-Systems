(() => {
  const STORE = 'anveraPortalPrototype';
  const load = () => ({inquiries:[],projects:[],payments:[],tickets:[],files:[],...(JSON.parse(localStorage.getItem(STORE) || '{}'))});
  const save = data => localStorage.setItem(STORE, JSON.stringify(data));
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const money = value => Number(value || 0).toLocaleString('en-US', {style:'currency',currency:'USD'});

  const style = document.createElement('style');
  style.textContent = `
    .payment-note{font-size:12px;color:#756f63;line-height:1.55;background:rgba(168,138,68,.1);border-radius:10px;padding:11px 13px}
    .readonly-field{background:#f0ede5!important;color:#5f5a50}
    .payment-empty{padding:18px;border:1px dashed rgba(30,46,30,.18);border-radius:12px;color:#756f63;font-size:13px;line-height:1.55;background:rgba(255,255,255,.55)}
  `;
  document.head.appendChild(style);

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.id = 'connectedPaymentModal';
  modal.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true">
      <div class="modal-head">
        <div><span class="eye">Connected financial records</span><h3>Record a payment</h3><p>Select a registered client, then choose one of that client's unpaid charges.</p></div>
        <button class="modal-close" data-close-payment aria-label="Close">×</button>
      </div>
      <form id="connectedPaymentForm">
        <div id="connectedPaymentFields" class="form-grid"></div>
        <div class="modal-actions"><button type="button" class="btn-quiet" data-close-payment>Cancel</button><button type="submit" class="action">Record payment</button></div>
      </form>
    </div>`;
  document.body.appendChild(modal);

  const fields = modal.querySelector('#connectedPaymentFields');
  const form = modal.querySelector('#connectedPaymentForm');
  const close = () => { modal.classList.remove('open'); form.reset(); };
  modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('[data-close-payment]')) close(); });

  const registeredClients = data => {
    const fromProjects = data.projects.map(x => x.client).filter(Boolean);
    const fromAccepted = data.inquiries.filter(x => ['Accepted','Proposal sent','Meeting scheduled'].includes(x.status)).map(x => x.business || x.name).filter(Boolean);
    return [...new Set([...fromProjects, ...fromAccepted])].sort((a,b) => a.localeCompare(b));
  };
  const outstandingFor = (data, client) => data.payments.filter(x => x.client === client && x.status !== 'Paid' && Number(x.amount || 0) > Number(x.amountPaid || 0));
  const balance = item => Math.max(0, Number(item.amount || 0) - Number(item.amountPaid || 0));

  const render = (selectedClient = '', selectedDue = '') => {
    const data = load();
    const clients = registeredClients(data);
    const client = selectedClient || clients[0] || '';
    const dueItems = client ? outstandingFor(data, client) : [];
    const dueId = selectedDue || dueItems[0]?.id || '';
    const due = dueItems.find(x => x.id === dueId);

    fields.innerHTML = `
      <div class="form-field full"><div class="payment-note">Client options come from registered inquiries and projects. Payment options come only from unpaid or partially paid financial records.</div></div>
      <div class="form-field"><label>Registered client</label><select id="connectedClient" name="client" ${clients.length?'required':'disabled'}>${clients.length?clients.map(x=>`<option value="${esc(x)}" ${x===client?'selected':''}>${esc(x)}</option>`).join(''):'<option>No registered clients</option>'}</select></div>
      <div class="form-field"><label>Payment currently due</label><select id="connectedDue" name="dueId" ${dueItems.length?'required':'disabled'}>${dueItems.length?dueItems.map(x=>`<option value="${x.id}" ${x.id===dueId?'selected':''}>${esc(x.type)} — ${money(balance(x))}${x.invoice?` · ${esc(x.invoice)}`:''}</option>`).join(''):'<option>No unpaid charges</option>'}</select></div>
      ${due ? `
        <div class="form-field"><label>Remaining amount due</label><input class="readonly-field" value="${money(balance(due))}" readonly></div>
        <div class="form-field"><label>Due date</label><input class="readonly-field" value="${esc(due.dueDate || 'Not set')}" readonly></div>
        <div class="form-field"><label>Amount received</label><input id="connectedAmount" name="amountReceived" type="number" min="0.01" max="${balance(due)}" step="0.01" value="${balance(due)}" required></div>
        <div class="form-field"><label>Payment date</label><input name="paidDate" type="date" value="${new Date().toISOString().slice(0,10)}" required></div>
        <div class="form-field"><label>Payment method</label><select name="method"><option>Bank transfer</option><option>Card</option><option>Check</option><option>Cash</option><option>Other</option></select></div>
        <div class="form-field"><label>Reference</label><input name="reference" placeholder="Confirmation or check number"></div>
        <div class="form-field full"><label>Internal note</label><textarea name="note" placeholder="Optional payment note..."></textarea></div>` : `<div class="form-field full"><div class="payment-empty">${clients.length?'This client currently has no unpaid charges. Add an invoice, milestone, subscription charge, or other amount due before recording a payment.':'Create or accept a client record first, then add a financial charge for that client.'}</div></div>`}`;

    fields.querySelector('#connectedClient')?.addEventListener('change', e => render(e.target.value, ''));
    fields.querySelector('#connectedDue')?.addEventListener('change', e => render(client, e.target.value));
  };

  const open = () => { render(); modal.classList.add('open'); };

  document.addEventListener('click', e => {
    const trigger = e.target.closest('[data-open="payment"]');
    if (!trigger) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    open();
  }, true);

  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = load();
    const values = Object.fromEntries(new FormData(form));
    const item = data.payments.find(x => x.id === values.dueId && x.client === values.client);
    if (!item) return;

    const remaining = balance(item);
    const received = Number(values.amountReceived || 0);
    if (received <= 0 || received > remaining) {
      alert(`Payment must be greater than $0 and cannot exceed ${money(remaining)}.`);
      return;
    }

    item.amountPaid = Number(item.amountPaid || 0) + received;
    item.paidDate = values.paidDate;
    item.method = values.method;
    item.reference = values.reference;
    item.paymentNote = values.note;
    item.lastPaymentAmount = received;
    item.status = item.amountPaid >= Number(item.amount || 0) ? 'Paid' : 'Partially paid';
    save(data);
    close();
    location.reload();
  });
})();
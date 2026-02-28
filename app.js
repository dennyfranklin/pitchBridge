// ============================================================
// PITCHBRIDGE — MAIN APP (Supabase Backend)
// ============================================================

let currentUser = null;
let currentProfile = null;
let selectedRole = '';
let selectedTag = '';
let currentIdeaId = null;

const AVATAR_COLORS = ['#7c6fff','#ff5f6d','#3ddc84','#f0c040','#ff9f43','#54a0ff'];

// ============================================================
// INIT — Check if user is already logged in
// ============================================================
window.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    currentUser = session.user;
    await loadProfile();
    enterApp();
  }
});

// ============================================================
// AUTH
// ============================================================
function showAuth(mode) {
  document.getElementById('landing').classList.remove('active');
  document.getElementById('auth').classList.add('active');
  toggleAuth(mode);
}

function toggleAuth(mode) {
  document.getElementById('signup-form').style.display = mode === 'signup' ? 'block' : 'none';
  document.getElementById('login-form').style.display = mode === 'login' ? 'block' : 'none';
}

function selectRole(el, role) {
  document.querySelectorAll('.role-card').forEach(c => c.classList.remove('sel'));
  el.classList.add('sel');
  selectedRole = role;
}

async function doSignup() {
  const name = document.getElementById('su-name').value.trim();
  const email = document.getElementById('su-email').value.trim();
  const password = document.getElementById('su-pass').value;
  const errEl = document.getElementById('signup-error');
  const btn = document.getElementById('signup-btn');

  errEl.textContent = '';
  if (!name || !email || !password) { errEl.textContent = 'Please fill in all fields.'; return; }
  if (!selectedRole) { errEl.textContent = 'Please select your role.'; return; }
  if (password.length < 6) { errEl.textContent = 'Password must be at least 6 characters.'; return; }

  btn.disabled = true;
  btn.textContent = 'Creating account...';

  // Create auth user
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) { errEl.textContent = error.message; btn.disabled = false; btn.textContent = 'Create Account →'; return; }

  currentUser = data.user;

  // Save profile to profiles table
  const { error: profileError } = await sb.from('profiles').insert({
    id: currentUser.id,
    full_name: name,
    email: email,
    role: selectedRole,
    is_admin: false,
    is_verified: false,
    avatar_color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
  });

  if (profileError) { errEl.textContent = profileError.message; btn.disabled = false; btn.textContent = 'Create Account →'; return; }

  await loadProfile();
  enterApp();
}

async function doLogin() {
  const email = document.getElementById('li-email').value.trim();
  const password = document.getElementById('li-pass').value;
  const errEl = document.getElementById('login-error');
  const btn = document.getElementById('login-btn');

  errEl.textContent = '';
  if (!email || !password) { errEl.textContent = 'Please enter your email and password.'; return; }

  btn.disabled = true;
  btn.textContent = 'Signing in...';

  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) { errEl.textContent = error.message; btn.disabled = false; btn.textContent = 'Sign In →'; return; }

  currentUser = data.user;
  await loadProfile();
  enterApp();
}

async function doLogout() {
  await sb.auth.signOut();
  currentUser = null;
  currentProfile = null;
  document.getElementById('app').classList.remove('active');
  document.getElementById('landing').classList.add('active');
  showToast('👋 Logged out. See you soon!');
}

async function loadProfile() {
  const { data } = await sb.from('profiles').select('*').eq('id', currentUser.id).single();
  currentProfile = data;
}

// ============================================================
// ENTER APP
// ============================================================
function enterApp() {
  document.getElementById('auth').classList.remove('active');
  document.getElementById('app').classList.add('active');

  const name = currentProfile?.full_name || 'User';
  const ini = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const color = currentProfile?.avatar_color || '#7c6fff';

  ['nav-avatar', 'post-avatar', 'profile-av'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = ini; el.style.background = color; }
  });

  document.getElementById('profile-name').textContent = name;
  const rm = { entrepreneur: '💡 Entrepreneur', investor: '💼 Investor', both: '⚡ Entrepreneur & Investor' };
  document.getElementById('profile-role-badge').textContent = rm[currentProfile?.role] || '';

  if (currentProfile?.is_admin) document.getElementById('admin-tab').style.display = 'inline-block';
  if (currentProfile?.role === 'investor') document.getElementById('post-box-wrap').style.display = 'none';

  renderFeed();
  renderSidebar();
  showToast('👋 Welcome back, ' + name.split(' ')[0] + '!');
}

// ============================================================
// PAGES
// ============================================================
function showPage(page, tab) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  if (tab) tab.classList.add('active');
  if (page === 'profile') renderProfile();
  if (page === 'investors') renderInvestorsPage();
  if (page === 'admin') renderAdmin();
}

// ============================================================
// FEED — Post & Load Ideas
// ============================================================
function selectTag(el, tag) {
  document.querySelectorAll('.tag-pill').forEach(t => t.classList.remove('sel'));
  el.classList.add('sel');
  selectedTag = tag;
}

async function postIdea() {
  const title = document.getElementById('post-title').value.trim();
  const body = document.getElementById('post-text').value.trim();
  const ask = document.getElementById('post-ask').value.trim() || 'TBD';

  if (!title || !body) { showToast('⚠️ Please add a title and description'); return; }

  const { error } = await sb.from('ideas').insert({
    user_id: currentUser.id,
    title,
    body,
    funding_ask: ask,
    category: selectedTag || 'Tech',
    likes: 0
  });

  if (error) { showToast('❌ Error posting: ' + error.message); return; }

  document.getElementById('post-title').value = '';
  document.getElementById('post-text').value = '';
  document.getElementById('post-ask').value = '';
  selectedTag = '';
  document.querySelectorAll('.tag-pill').forEach(t => t.classList.remove('sel'));

  showToast('🚀 Your idea is live!');
  renderFeed();
}

async function renderFeed() {
  const feedEl = document.getElementById('ideas-feed');
  feedEl.innerHTML = '<div class="loading">Loading ideas...</div>';

  const { data: ideas, error } = await sb
    .from('ideas')
    .select('*, profiles(full_name, role, avatar_color)')
    .order('created_at', { ascending: false });

  if (error) { feedEl.innerHTML = '<div class="loading">Error loading ideas.</div>'; return; }
  if (!ideas || ideas.length === 0) { feedEl.innerHTML = '<div class="empty-state">No ideas posted yet. Be the first! 🚀</div>'; return; }

  feedEl.innerHTML = ideas.map(idea => ideaCardHTML(idea)).join('');
}

function ideaCardHTML(idea) {
  const profile = idea.profiles || {};
  const name = profile.full_name || 'Anonymous';
  const role = profile.role || 'Entrepreneur';
  const color = profile.avatar_color || '#7c6fff';
  const avatar = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const bc = { AI: 'badge-ai', EV: 'badge-ev', Product: 'badge-product', Tech: 'badge-tech' }[idea.category] || 'badge-tech';
  const isInv = currentProfile && (currentProfile.role === 'investor' || currentProfile.role === 'both');
  const roleName = { entrepreneur: 'Entrepreneur', investor: 'Investor', both: 'Entrepreneur & Investor' }[role] || role;

  return `<div class="idea-card">
  <div class="card-head">
    <div class="card-avatar" style="background:${color};color:#fff;">${avatar}</div>
    <div><div class="card-name">${name}</div><div class="card-role">${roleName}</div></div>
    <div class="card-badge"><span class="badge ${bc}">${idea.category}</span></div>
  </div>
  <div class="card-title">${idea.title}</div>
  <div class="card-body">${idea.body}</div>
  <div class="card-teaser">🔒 Full pitch & financials visible after NDA agreement</div>
  <div class="card-footer">
    ${isInv ? `<button class="card-btn card-btn-invest" onclick="openInvest('${idea.id}','${idea.user_id}')">💼 Request Access</button>` : ''}
    <button class="card-btn card-btn-like" onclick="likeIdea('${idea.id}', this)">❤️ ${idea.likes || 0}</button>
    <div class="card-ask">Seeking: ${idea.funding_ask}</div>
  </div></div>`;
}

async function likeIdea(id, btn) {
  const { data } = await sb.from('ideas').select('likes').eq('id', id).single();
  const newLikes = (data?.likes || 0) + 1;
  await sb.from('ideas').update({ likes: newLikes }).eq('id', id);
  btn.textContent = '❤️ ' + newLikes;
}

// ============================================================
// INVESTORS PAGE
// ============================================================
async function renderInvestorsPage() {
  const listEl = document.getElementById('investors-list');
  listEl.innerHTML = '<div class="loading">Loading investors...</div>';

  const { data: investors } = await sb
    .from('profiles')
    .select('*')
    .in('role', ['investor', 'both'])
    .eq('is_verified', true);

  if (!investors || investors.length === 0) {
    listEl.innerHTML = '<div class="empty-state">No verified investors yet.</div>';
    return;
  }

  listEl.innerHTML = investors.map(inv => {
    const name = inv.full_name || 'Investor';
    const av = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    return `<div class="request-item">
    <div class="inv-av" style="background:${inv.avatar_color||'#7c6fff'};color:#fff;">${av}</div>
    <div style="flex:1;"><div class="req-name">${name} <span style="font-size:11px;background:rgba(61,220,132,0.15);color:var(--green);padding:2px 8px;border-radius:100px;font-weight:700;margin-left:6px;">✓ Verified</span></div><div class="req-detail">${inv.focus || 'Open to all ideas'}</div></div>
    <button class="inv-btn" onclick="sendConnect('${inv.id}','${name}')">Connect</button>
  </div>`;
  }).join('');
}

async function sendConnect(investorId, name) {
  await sb.from('connect_requests').insert({
    from_user_id: currentUser.id,
    to_user_id: investorId,
    status: 'pending'
  });
  showToast('📩 Connection request sent to ' + name + '!');
}

// ============================================================
// SIDEBAR
// ============================================================
async function renderSidebar() {
  const { data: investors } = await sb
    .from('profiles')
    .select('*')
    .in('role', ['investor', 'both'])
    .eq('is_verified', true)
    .limit(3);

  const sideEl = document.getElementById('side-investors');
  if (!investors || investors.length === 0) {
    sideEl.innerHTML = '<div style="font-size:13px;color:var(--muted);">No verified investors yet.</div>';
    return;
  }
  sideEl.innerHTML = investors.map(inv => {
    const name = inv.full_name || 'Investor';
    const av = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    return `<div class="investor-item">
    <div class="inv-av" style="background:${inv.avatar_color||'#7c6fff'};color:#fff;">${av}</div>
    <div><div class="inv-name">${name}</div><div class="inv-focus">${inv.focus || 'Various'}</div></div>
    <button class="inv-btn" onclick="sendConnect('${inv.id}','${name}')">+</button>
  </div>`;
  }).join('');
}

// ============================================================
// PROFILE
// ============================================================
async function renderProfile() {
  const { data: myIdeas } = await sb.from('ideas').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false });
  document.getElementById('ps-ideas').textContent = myIdeas?.length || 0;
  document.getElementById('my-ideas').innerHTML = myIdeas && myIdeas.length
    ? myIdeas.map(idea => {
        const fakeIdea = { ...idea, profiles: { full_name: currentProfile?.full_name, role: currentProfile?.role, avatar_color: currentProfile?.avatar_color } };
        return ideaCardHTML(fakeIdea);
      }).join('')
    : '<div class="empty-state">No ideas posted yet. Share your first idea!</div>';
}

// ============================================================
// ADMIN
// ============================================================
async function renderAdmin() {
  // Stats
  const [{ count: ideaCount }, { count: userCount }, { data: pending }, { data: requests }] = await Promise.all([
    sb.from('ideas').select('*', { count: 'exact', head: true }),
    sb.from('profiles').select('*', { count: 'exact', head: true }),
    sb.from('profiles').select('*').in('role', ['investor', 'both']).eq('is_verified', false),
    sb.from('connect_requests').select('*, from:from_user_id(full_name), to:to_user_id(full_name)').eq('status', 'pending')
  ]);

  document.getElementById('a-ideas').textContent = ideaCount || 0;
  document.getElementById('a-users').textContent = userCount || 0;
  document.getElementById('a-pending').textContent = pending?.length || 0;
  document.getElementById('a-requests').textContent = requests?.length || 0;

  // Verifications
  const vEl = document.getElementById('admin-verifications');
  vEl.innerHTML = pending && pending.length ? pending.map(p => {
    const av = (p.full_name||'?').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
    return `<div class="request-item">
    <div class="inv-av" style="background:${p.avatar_color||'#7c6fff'};color:#fff;">${av}</div>
    <div style="flex:1;"><div class="req-name">${p.full_name}</div><div class="req-detail">${p.email} · Role: ${p.role}</div></div>
    <button class="req-approve" onclick="approveInvestor('${p.id}','${p.full_name}')">Approve</button>
    <button class="req-deny" onclick="denyInvestor('${p.id}','${p.full_name}')">Deny</button>
  </div>`;
  }).join('') : '<div class="empty-state">No pending verifications.</div>';

  // Connect Requests
  const rEl = document.getElementById('admin-requests');
  rEl.innerHTML = requests && requests.length ? requests.map(r => {
    const fromName = r.from?.full_name || 'Someone';
    const toName = r.to?.full_name || 'Someone';
    return `<div class="request-item">
    <div class="inv-av" style="background:var(--accent);color:#fff;">${fromName[0]}</div>
    <div style="flex:1;"><div class="req-name">${fromName} → ${toName}</div><div class="req-detail">Investor wants to connect. Ready to schedule.</div></div>
    <button class="req-approve" onclick="scheduleCall('${r.id}','${fromName}','${toName}')">Schedule Call</button>
  </div>`;
  }).join('') : '<div class="empty-state">No pending connect requests.</div>';
}

async function approveInvestor(id, name) {
  await sb.from('profiles').update({ is_verified: true }).eq('id', id);
  showToast('✅ ' + name + ' is now verified!');
  renderAdmin();
}

async function denyInvestor(id, name) {
  showToast('❌ ' + name + '\'s request denied.');
  renderAdmin();
}

async function scheduleCall(id, from, to) {
  await sb.from('connect_requests').update({ status: 'scheduled' }).eq('id', id);
  showToast('📅 Zoom link sent to ' + from + ' and ' + to + '!');
  renderAdmin();
}

// ============================================================
// INVEST / NDA MODAL
// ============================================================
function openInvest(ideaId, ownerId) {
  if (ownerId === currentUser.id) { showToast('⚠️ This is your own idea!'); return; }
  currentIdeaId = ideaId;
  document.getElementById('nda-check').checked = false;
  document.getElementById('invest-modal').classList.add('open');
}

function closeModal(id) { document.getElementById(id).classList.remove('open'); }

async function confirmInvest() {
  if (!document.getElementById('nda-check').checked) { showToast('⚠️ Please agree to the NDA first'); return; }
  await sb.from('nda_requests').insert({
    idea_id: currentIdeaId,
    investor_id: currentUser.id,
    status: 'pending'
  });
  closeModal('invest-modal');
  showToast('✅ Request sent! Admin will schedule your call within 24h.');
}

// ============================================================
// TOAST
// ============================================================
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 3200);
}

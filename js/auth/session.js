import { supabase } from '../lib/supabase.js';

let _context = null;

export function getContext() {
  return _context;
}

function setContext(ctx) {
  _context = ctx;
  window.dispatchEvent(new CustomEvent('fogin:session', { detail: ctx }));
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function getAssignments() {
  const { data, error } = await supabase
    .from('staff_branch_assignments')
    .select(`branch_id, vendor_id, role, branches ( id, name )`);
  if (error) throw error;
  return data ?? [];
}

export async function openSession(branchId) {
  const { data, error } = await supabase
    .rpc('open_pos_session', { p_branch_id: branchId });
  if (error) throw error;
  setContext({
    sessionId : data.id,
    branchId  : data.branch_id,
    vendorId  : data.vendor_id,
    role      : data.role,
    openedAt  : data.opened_at,
  });
  return _context;
}

export async function closeSession() {
  const { error } = await supabase.rpc('close_pos_session');
  if (error) throw error;
  setContext(null);
}

export async function signOut() {
  await closeSession().catch(console.warn);
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function initAuth({ onReady, onMultiBranch, onNoBranch, onSignedOut } = {}) {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('[1] event:', event);
    if (!session || event === 'SIGNED_OUT') { setContext(null); onSignedOut?.(); return; }
    if (event !== 'SIGNED_IN') return; // ignore INITIAL_SESSION and TOKEN_REFRESHED for now

    setTimeout(async () => {
      try {
        console.log('[2] checking open session...');
        const existing = await getOpenSession();
        console.log('[3] existing:', existing);

        if (existing) {
          setContext({ sessionId: existing.id, branchId: existing.branch_id, vendorId: existing.vendor_id, role: existing.role, openedAt: existing.opened_at });
          onReady?.(_context);
          return;
        }

        const assignments = await getAssignments();
        console.log('[4] assignments:', assignments);

        if (assignments.length === 0) { onNoBranch?.(); return; }
        if (assignments.length === 1) {
          const ctx = await openSession(assignments[0].branch_id);
          console.log('[5] session opened:', ctx);
          onReady?.(ctx);
          return;
        }
        onMultiBranch?.(assignments);

      } catch (err) {
        console.error('[ERR]', err.message, err);
      }
    }, 0);
  });
}

async function getOpenSession() {
  console.log('[getOpenSession] calling supabase...');
  const { data, error } = await supabase
    .from('pos_sessions')
    .select('*')
    .is('closed_at', null)
    .maybeSingle();
  console.log('[getOpenSession] result:', data, error);
  if (error) throw error;
  return data;
}
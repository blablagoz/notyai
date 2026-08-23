import React, { useState } from 'react';
import { Users, Plus, Shield, ShieldAlert, Calendar, UserPlus, Eye, BellPlus, CheckCircle, Clock } from 'lucide-react';
import { ThemeColors } from '../theme';
import { TeamModel, TeamReminder, FriendShare, PublicProfile, TeamInvitation } from '../types';

interface TeamWorkspaceScreenProps {
  theme: ThemeColors;
  teams: TeamModel[];
  friends: FriendShare[];
  pendingInvitations: TeamInvitation[];
  onCreateTeam: (name: string, description: string) => void;
  onAddTeamReminder: (teamId: string, reminder: Omit<TeamReminder, 'id' | 'teamId' | 'createdBy' | 'createdByName'>) => void;
  onSearchUserByPublicId: (id: string) => Promise<PublicProfile | null>;
  onInviteMember: (teamId: string, publicId: string) => Promise<void>;
  onRespondInvitation: (invitationId: string, accept: boolean) => Promise<void>;
  onClose: () => void;
}

export const TeamWorkspaceScreen: React.FC<TeamWorkspaceScreenProps> = ({
  theme,
  teams,
  friends,
  pendingInvitations,
  onCreateTeam,
  onAddTeamReminder,
  onSearchUserByPublicId,
  onInviteMember,
  onRespondInvitation,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'teams' | 'friends'>('teams');
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');

  // Selected Team for broadcast task modal
  const [selectedTeamForTask, setSelectedTeamForTask] = useState<TeamModel | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [taskCategory, setTaskCategory] = useState('Hukuk');

  // Search friends
  const [friendSearch, setFriendSearch] = useState('');
  const [selectedTeamForInvite, setSelectedTeamForInvite] = useState<TeamModel | null>(null);
  const [publicIdSearch, setPublicIdSearch] = useState('');
  const [foundProfile, setFoundProfile] = useState<PublicProfile | null>(null);
  const [inviteStatus, setInviteStatus] = useState('');
  const [inviteBusy, setInviteBusy] = useState(false);

  const searchMember = async () => {
    setInviteBusy(true); setInviteStatus(''); setFoundProfile(null);
    try { const profile = await onSearchUserByPublicId(publicIdSearch); setFoundProfile(profile); if (!profile) setInviteStatus('Bu kullanıcı ID’si bulunamadı.'); }
    catch (error: any) { setInviteStatus(error.message || 'Arama tamamlanamadı.'); }
    finally { setInviteBusy(false); }
  };

  const sendInvite = async () => {
    if (!selectedTeamForInvite || !foundProfile) return;
    setInviteBusy(true);
    try { await onInviteMember(selectedTeamForInvite.id, foundProfile.publicId); setInviteStatus('Davet gönderildi. Üyelik, karşı taraf kabul ettiğinde başlayacak.'); setFoundProfile(null); }
    catch (error: any) { setInviteStatus(error.message || 'Davet gönderilemedi.'); }
    finally { setInviteBusy(false); }
  };

  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTeamName.trim()) {
      onCreateTeam(newTeamName.trim(), newTeamDesc.trim());
      setNewTeamName('');
      setNewTeamDesc('');
      setShowCreateTeamModal(false);
    }
  };

  const handleAddTeamReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTeamForTask && taskTitle.trim()) {
      const now = new Date();
      const startTime = taskTime ? new Date(taskTime).toISOString() : new Date(now.getTime() + 86400000).toISOString();
      const endTime = new Date(new Date(startTime).getTime() + 3600000).toISOString();

      onAddTeamReminder(selectedTeamForTask.id, {
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        startTime,
        endTime,
        category: taskCategory,
      });

      setTaskTitle('');
      setTaskDesc('');
      setTaskTime('');
      setSelectedTeamForTask(null);
    }
  };

  const filteredFriends = friends.filter(
    (f) =>
      f.name.toLowerCase().includes(friendSearch.toLowerCase()) ||
      f.email.toLowerCase().includes(friendSearch.toLowerCase())
  );

  return (
    <div
      className="app-fullscreen-layer fixed inset-0 z-50 overflow-y-auto flex flex-col backdrop-blur-xl animate-in fade-in duration-200"
      style={{ backgroundColor: `${theme.bg}FA` }}
    >
      {/* Top Header */}
      <div
        className="sticky top-0 z-10 px-3 sm:px-6 py-3 sm:py-4 border-b flex items-center justify-between gap-2 backdrop-blur-md"
        style={{ backgroundColor: `${theme.panel}E6`, borderColor: theme.border }}
      >
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div
            className="p-2.5 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}
          >
            <Users size={24} />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-bold tracking-tight truncate" style={{ color: theme.textPrimary }}>
              Ekip & Ortak Çalışma Alanı
            </h2>
            <p className="hidden sm:block text-xs font-medium" style={{ color: theme.textMuted }}>
              Rol tabanlı takvim koordinasyonu, ortak görevler ve arkadaş akışı
            </p>
          </div>
        </div>

        <button
          id="close-team-screen-btn"
          onClick={onClose}
          className="shrink-0 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
          style={{ backgroundColor: theme.card, color: theme.textPrimary, border: `1px solid ${theme.border}` }}
        >
          Kapat
        </button>
      </div>

      <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 flex-1 flex flex-col">
        {/* Navigation Tabs */}
        <div className="flex w-full sm:w-auto items-center gap-1 sm:gap-2 p-1.5 rounded-2xl mb-6 self-start" style={{ backgroundColor: theme.panel, border: `1px solid ${theme.border}` }}>
          <button
            id="tab-teams-btn"
            onClick={() => setActiveTab('teams')}
            className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-5 py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all"
            style={{
              backgroundColor: activeTab === 'teams' ? theme.accent : 'transparent',
              color: activeTab === 'teams' ? theme.bg : theme.textMuted,
            }}
          >
            <Shield size={15} />
            <span>Aktif Ekiplerim ({teams.length})</span>
          </button>
          <button
            id="tab-friends-btn"
            onClick={() => setActiveTab('friends')}
            className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-5 py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all"
            style={{
              backgroundColor: activeTab === 'friends' ? theme.accent : 'transparent',
              color: activeTab === 'friends' ? theme.bg : theme.textMuted,
            }}
          >
            <Eye size={15} />
            <span>Arkadaş Paylaşımı (Salt Okunur)</span>
          </button>
        </div>

        {/* Tab 1: Teams */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            {pendingInvitations.length > 0 && <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.accent }}>Bekleyen Ekip Davetleri</h3>
              {pendingInvitations.map(invite => <div key={invite.id} className="p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ backgroundColor: theme.panel, borderColor: theme.border }}>
                <div><strong className="text-sm" style={{ color: theme.textPrimary }}>{invite.teamName}</strong><p className="text-xs" style={{ color: theme.textMuted }}>{invite.inviterName} sizi bu ekibe davet etti.</p></div>
                <div className="flex gap-2"><button onClick={() => onRespondInvitation(invite.id, false)} className="px-3 py-2 rounded-xl text-xs font-bold" style={{ backgroundColor: theme.card, color: theme.textMuted }}>Reddet</button><button onClick={() => onRespondInvitation(invite.id, true)} className="px-3 py-2 rounded-xl text-xs font-bold" style={{ backgroundColor: theme.accent, color: theme.bg }}>Kabul Et</button></div>
              </div>)}
            </div>}
            {/* Create Team CTA */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border" style={{ backgroundColor: theme.panel, borderColor: theme.border }}>
              <div>
                <h3 className="text-sm font-bold" style={{ color: theme.textPrimary }}>
                  Yeni Bir Ekip Kurun
                </h3>
                <p className="text-xs" style={{ color: theme.textSubtle }}>
                  Ekip yöneticisi olarak üyeleri davet edin ve tüm ekibin ajandasına toplu görev atayın.
                </p>
              </div>
              <button
                id="open-create-team-modal-btn"
                onClick={() => setShowCreateTeamModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105 shrink-0"
                style={{ backgroundColor: theme.accent, color: theme.bg }}
              >
                <Plus size={16} />
                <span>Yeni Ekip Kur</span>
              </button>
            </div>

            {/* Teams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="p-5 rounded-2xl border flex flex-col justify-between transition-all hover:shadow-lg"
                  style={{
                    backgroundColor: theme.card,
                    borderColor: team.isAdmin ? `${theme.accent}60` : theme.border,
                  }}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-base font-bold" style={{ color: theme.textPrimary }}>
                        {team.name}
                      </h4>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                        style={{
                          backgroundColor: team.isAdmin ? `${theme.accent}20` : `${theme.panel}`,
                          color: team.isAdmin ? theme.accent : theme.textMuted,
                          border: `1px solid ${team.isAdmin ? theme.accent : theme.border}`,
                        }}
                      >
                        {team.role === 'admin' ? '👑 Yönetici (Admin)' : '👤 Üye'}
                      </span>
                    </div>

                    {team.description && (
                      <p className="text-xs mb-4 leading-relaxed" style={{ color: theme.textSubtle }}>
                        {team.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs font-semibold mb-4" style={{ color: theme.textMuted }}>
                      <span className="flex items-center gap-1.5">
                        <Users size={14} style={{ color: theme.accent }} />
                        {team.memberCount} Üye
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} style={{ color: theme.warning }} />
                        {team.reminders?.length || team.remindersCount} Aktif Görev
                      </span>
                    </div>

                    {/* Member Avatars */}
                    <div className="flex items-center gap-1.5 mb-4">
                      {team.members.slice(0, 4).map((m) => (
                        <div
                          key={m.id}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border"
                          style={{
                            backgroundColor: theme.panel,
                            color: theme.accent,
                            borderColor: theme.border,
                          }}
                          title={`${m.name} (${m.role})`}
                        >
                          {m.avatar}
                        </div>
                      ))}
                      {team.memberCount > 4 && (
                        <span className="text-xs font-bold pl-1" style={{ color: theme.textSubtle }}>
                          +{team.memberCount - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Team Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t" style={{ borderColor: theme.border }}>
                    {team.isAdmin && (
                      <><button
                        id={`team-add-member-${team.id}`}
                        onClick={() => { setSelectedTeamForInvite(team); setPublicIdSearch(''); setFoundProfile(null); setInviteStatus(''); }}
                        className="flex-1 min-w-[8rem] flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold"
                        style={{ backgroundColor: theme.panel, color: theme.textPrimary, border: `1px solid ${theme.border}` }}
                      ><UserPlus size={14}/><span>Yeni Üye Ekle</span></button><button
                        id={`team-add-task-${team.id}`}
                        onClick={() => setSelectedTeamForTask(team)}
                        className="flex-1 min-w-[8rem] flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-colors"
                        style={{
                          backgroundColor: `${theme.accent}15`,
                          color: theme.accent,
                          border: `1px solid ${theme.accent}40`,
                        }}
                      >
                        <BellPlus size={14} />
                        <span>Ekibe Görev Ata</span>
                      </button></>
                    )}
                    <button
                      id={`team-view-feed-${team.id}`}
                      onClick={() => {
                        alert(`"${team.name}" ekibinin tüm görevleri ana akışınıza otomatik yansıtılmıştır.`);
                      }}
                      className="flex-1 min-w-[8rem] flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-colors"
                      style={{
                        backgroundColor: theme.panel,
                        color: theme.textPrimary,
                        border: `1px solid ${theme.border}`,
                      }}
                    >
                      <Eye size={14} />
                      <span>Akışı Gör</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Team Reminders Broadcast Feed */}
            <div className="mt-8">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: theme.textSubtle }}>
                Ekip Ajandası & Ortak Hatırlatıcılar (Canlı Senkron)
              </h3>

              <div className="space-y-3">
                {teams.flatMap((t) => t.reminders.map((r) => ({ ...r, teamTitle: t.name }))).map((rem) => (
                  <div
                    key={rem.id}
                    className="p-4 rounded-2xl border flex items-start justify-between gap-3"
                    style={{ backgroundColor: theme.panel, borderColor: theme.border }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}>
                          👥 {rem.teamTitle}
                        </span>
                        <span className="text-xs font-mono font-semibold" style={{ color: theme.warning }}>
                          {new Date(rem.startTime).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} {new Date(rem.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[11px] font-medium" style={{ color: theme.textSubtle }}>
                          Atayan: <b>{rem.createdByName}</b>
                        </span>
                      </div>

                      <h4 className="text-sm font-bold" style={{ color: theme.textPrimary }}>
                        {rem.title}
                      </h4>
                      {rem.description && (
                        <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                          {rem.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs px-2.5 py-1 rounded-lg font-bold" style={{ backgroundColor: '#22C55E15', color: '#22C55E' }}>
                        Yayında
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Friends (Read Only) */}
        {activeTab === 'friends' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl border flex items-center gap-3" style={{ backgroundColor: theme.panel, borderColor: theme.border }}>
              <ShieldAlert size={24} style={{ color: theme.warning }} className="shrink-0" />
              <div>
                <h4 className="text-sm font-bold" style={{ color: theme.textPrimary }}>
                  Arkadaş Paylaşımı (Salt Okunur İlkesi)
                </h4>
                <p className="text-xs leading-relaxed" style={{ color: theme.textSubtle }}>
                  Arkadaşlarınızın ajandasındaki ortak etkinlikleri kısıtlı yetkiyle görebilirsiniz; silme ve düzenleme yetkisi yalnızca etkinlik sahibine aittir.
                </p>
              </div>
            </div>

            {/* Friend Search Bar */}
            <div className="relative">
              <input
                id="friend-search-input"
                type="text"
                value={friendSearch}
                onChange={(e) => setFriendSearch(e.target.value)}
                placeholder="E-posta veya NotyAI Kullanıcı Adı ile ara..."
                className="w-full px-4 py-3 pl-10 rounded-2xl text-sm font-medium outline-none border"
                style={{
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  color: theme.textPrimary,
                }}
              />
              <UserPlus size={18} className="absolute left-3.5 top-3.5" style={{ color: theme.accent }} />
            </div>

            {/* Friends List */}
            <div className="space-y-3">
              {filteredFriends.map((f) => (
                <div
                  key={f.id}
                  className="p-4 rounded-2xl border flex items-center justify-between gap-4"
                  style={{ backgroundColor: theme.card, borderColor: theme.border }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border"
                      style={{
                        backgroundColor: theme.panel,
                        color: theme.accent,
                        borderColor: theme.border,
                      }}
                    >
                      {f.avatar}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold" style={{ color: theme.textPrimary }}>
                        {f.name}
                      </h4>
                      <p className="text-xs" style={{ color: theme.textMuted }}>
                        {f.email} • {f.sharedCount} Ortak Randevu
                      </p>
                    </div>
                  </div>

                  <button
                    id={`view-friend-feed-${f.id}`}
                    onClick={() => alert(`"${f.name}" kullanıcısının paylaştığı randevular senkronize edildi.`)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
                    style={{
                      backgroundColor: theme.panel,
                      color: theme.textPrimary,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    Akışı Gör
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {selectedTeamForInvite && <div className="app-modal-layer fixed inset-0 z-60 bg-black/70 flex items-center justify-center">
        <div className="app-modal-panel w-full max-w-md p-5 rounded-3xl border shadow-2xl" style={{ backgroundColor: theme.panel, borderColor: theme.border }}>
          <h3 className="text-lg font-bold" style={{ color: theme.textPrimary }}>Yeni Üye Ekle</h3>
          <p className="text-xs mb-4" style={{ color: theme.textMuted }}>{selectedTeamForInvite.name} ekibine kullanıcının NotyAI ID’siyle davet gönderin.</p>
          <div className="flex gap-2"><input value={publicIdSearch} onChange={e => setPublicIdSearch(e.target.value.toUpperCase())} placeholder="NTY-XXXXXXXXXXXX" className="min-w-0 flex-1 p-3 rounded-xl border text-sm outline-none" style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.textPrimary }}/><button disabled={inviteBusy || !publicIdSearch.trim()} onClick={searchMember} className="px-4 rounded-xl text-xs font-bold disabled:opacity-50" style={{ backgroundColor: theme.accent, color: theme.bg }}>Bul</button></div>
          {foundProfile && <div className="mt-3 p-3 rounded-xl border" style={{ backgroundColor: theme.card, borderColor: theme.border }}><strong className="text-sm" style={{ color: theme.textPrimary }}>{foundProfile.fullName || 'NotyAI Kullanıcısı'}</strong><p className="text-xs font-mono" style={{ color: theme.accent }}>{foundProfile.publicId}</p><button disabled={inviteBusy} onClick={sendInvite} className="w-full mt-3 py-2 rounded-xl text-xs font-bold" style={{ backgroundColor: theme.accent, color: theme.bg }}>Davet Gönder</button></div>}
          {inviteStatus && <p className="mt-3 text-xs" style={{ color: theme.warning }}>{inviteStatus}</p>}
          <button onClick={() => setSelectedTeamForInvite(null)} className="w-full mt-4 py-2 rounded-xl text-xs font-bold" style={{ color: theme.textMuted }}>Kapat</button>
        </div>
      </div>}

      {showCreateTeamModal && (
        <div className="app-modal-layer fixed inset-0 z-60 bg-black/70 flex items-center justify-center">
          <div
            className="app-modal-panel w-full max-w-md p-4 sm:p-6 rounded-3xl border shadow-2xl overflow-y-auto animate-in zoom-in-95 duration-200"
            style={{ backgroundColor: theme.panel, borderColor: theme.border }}
          >
            <h3 className="text-lg font-bold mb-2" style={{ color: theme.textPrimary }}>
              Yeni Ekip Kur
            </h3>
            <p className="text-xs mb-4" style={{ color: theme.textSubtle }}>
              Bu ekibin yöneticisi siz olacaksınız. Üyeleri ekleyebilir ve tüm ekibe toplu hatırlatıcı atayabilirsiniz.
            </p>

            <form onSubmit={handleCreateTeamSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: theme.textMuted }}>
                  EKİP ADI
                </label>
                <input
                  id="create-team-name-input"
                  type="text"
                  required
                  placeholder="Örn: Hukuk Ekibi, Proje Grubu..."
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full p-3 rounded-xl border text-sm outline-none font-medium"
                  style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.textPrimary }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: theme.textMuted }}>
                  AÇIKLAMA (OPSİYONEL)
                </label>
                <textarea
                  id="create-team-desc-input"
                  rows={2}
                  placeholder="Ekibin amacı ve çalışma kapsamı..."
                  value={newTeamDesc}
                  onChange={(e) => setNewTeamDesc(e.target.value)}
                  className="w-full p-3 rounded-xl border text-sm outline-none font-medium resize-none"
                  style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.textPrimary }}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  id="cancel-create-team-btn"
                  onClick={() => setShowCreateTeamModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold"
                  style={{ color: theme.textMuted }}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  id="submit-create-team-btn"
                  className="px-5 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                  style={{ backgroundColor: theme.accent, color: theme.bg }}
                >
                  Ekibi Kur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Task Modal */}
      {selectedTeamForTask && (
        <div className="app-modal-layer fixed inset-0 z-60 bg-black/70 flex items-center justify-center">
          <div
            className="app-modal-panel w-full max-w-md p-4 sm:p-6 rounded-3xl border shadow-2xl overflow-y-auto animate-in zoom-in-95 duration-200"
            style={{ backgroundColor: theme.panel, borderColor: theme.border }}
          >
            <h3 className="text-lg font-bold mb-1" style={{ color: theme.textPrimary }}>
              Ekibe Toplu Görev Ata
            </h3>
            <p className="text-xs mb-4" style={{ color: theme.accent }}>
              👥 {selectedTeamForTask.name} ekibindeki tüm üyelere anında iletilir.
            </p>

            <form onSubmit={handleAddTeamReminderSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: theme.textMuted }}>
                  GÖREV BAŞLIĞI
                </label>
                <input
                  id="team-task-title-input"
                  type="text"
                  required
                  placeholder="Örn: Bilirkişi Raporu İtirazı..."
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full p-3 rounded-xl border text-sm outline-none font-medium"
                  style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.textPrimary }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: theme.textMuted }}>
                  TARİH & SAAT
                </label>
                <input
                  id="team-task-datetime-input"
                  type="datetime-local"
                  value={taskTime}
                  onChange={(e) => setTaskTime(e.target.value)}
                  className="w-full p-3 rounded-xl border text-sm outline-none font-medium"
                  style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.textPrimary }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: theme.textMuted }}>
                  AÇIKLAMA
                </label>
                <textarea
                  id="team-task-desc-input"
                  rows={2}
                  placeholder="Görev detayları ve talimatlar..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full p-3 rounded-xl border text-sm outline-none font-medium resize-none"
                  style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.textPrimary }}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  id="cancel-team-task-btn"
                  onClick={() => setSelectedTeamForTask(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold"
                  style={{ color: theme.textMuted }}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  id="submit-team-task-btn"
                  className="px-5 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                  style={{ backgroundColor: theme.accent, color: theme.bg }}
                >
                  Görevi Yayınla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
